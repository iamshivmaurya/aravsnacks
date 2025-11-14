from sqlalchemy.orm import Session
from sqlalchemy import or_
import admin_model
import admin_auth
from admin_schema import UserCreate, UserUpdate
from typing import List, Optional

def get_user_by_username(db: Session, username: str) -> Optional[admin_model.User]:
    return db.query(admin_model.User).filter(admin_model.User.username == username).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[admin_model.User]:
    return db.query(admin_model.User).filter(admin_model.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[admin_model.User]:
    return db.query(admin_model.User).offset(skip).limit(limit).all()

def create_user(db: Session, user_in: UserCreate) -> admin_model.User:
    # Check if role exists
    role = db.query(admin_model.Role).filter(admin_model.Role.name == user_in.role).first()
    if not role:
        raise ValueError(f"Role '{user_in.role}' not found")
    
    # Check if username exists
    existing_user = get_user_by_username(db, user_in.username)
    if existing_user:
        raise ValueError("Username already exists")
    
    hashed_password = admin_auth.get_password_hash(user_in.password)
    user = admin_model.User(
        username=user_in.username,
        hashed_password=hashed_password,
        role_id=role.id,
        is_active=user_in.is_active if user_in.is_active is not None else True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[admin_model.User]:
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    update_data = user_update.dict(exclude_unset=True)
    
    # Handle role update
    if 'role' in update_data:
        role = db.query(admin_model.Role).filter(admin_model.Role.name == update_data['role']).first()
        if not role:
            raise ValueError(f"Role '{update_data['role']}' not found")
        user.role_id = role.id
        del update_data['role']
    
    # Handle password update
    if 'password' in update_data:
        user.hashed_password = admin_auth.get_password_hash(update_data['password'])
        del update_data['password']
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int) -> bool:
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    
    db.delete(user)
    db.commit()
    return True

def get_user_permissions(db: Session, user_id: int) -> List[dict]:
    user = get_user_by_id(db, user_id)
    if not user or not user.role:
        return []
    
    permissions = []
    for perm in user.role.permissions:
        if perm.allowed:
            permissions.append({
                "path": perm.path,
                "method": perm.method,
                "allowed": perm.allowed
            })
    return permissions