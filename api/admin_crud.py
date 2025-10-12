from sqlalchemy.orm import Session
import admin_model, admin_schema, admin_auth
from typing import List
from fastapi import HTTPException


def get_user_by_username(db: Session, username: str):
    return db.query(admin_model.User).filter(admin_model.User.username == username).first()

def create_user(db: Session, user_in: admin_schema.UserCreate):
    role = db.query(admin_model.Role).filter(admin_model.Role.name == user_in.role).first()
    if not role:
        raise ValueError("Role not found")
    hashed = admin_auth.get_password_hash(user_in.password)
    user = admin_model.User(username=user_in.username, hashed_password=hashed, role_id=role.id,)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# ---------------------------------------------------
# CRUD: Get user by ID
# ---------------------------------------------------
def get_user_by_id(db: Session, user_id: int):
    return db.query(admin_model.User).filter(admin_model.User.id == user_id).first()

# ---------------------------------------------------
# CRUD: Get all users (with pagination)
# ---------------------------------------------------
def get_users(db: Session, skip: int = 0, limit: int = 10):
    return db.query(admin_model.User).offset(skip).limit(limit).all()

# ---------------------------------------------------
# CRUD: Update user
# ---------------------------------------------------
def update_user(db: Session, user_id: int, user_update):
    user = db.query(admin_model.User).filter(admin_model.User.id == user_id).first()
    if not user:
        return None

    # Update username if provided
    if user_update.username is not None:
        existing_user = db.query(admin_model.User).filter(
            admin_model.User.username == user_update.username,
            admin_model.User.id != user_id
        ).first()
        if existing_user:
            raise ValueError("Username already exists")
        user.username = user_update.username

    # Update role if provided
    if user_update.role is not None:
        role = db.query(admin_model.Role).filter(admin_model.Role.name == user_update.role).first()
        if not role:
            raise ValueError(f"Role '{user_update.role}' not found")
        user.role_id = role.id

    # Update is_active if provided
    if user_update.is_active is not None:
        user.is_active = user_update.is_active

    db.commit()
    db.refresh(user)
    return user

# ---------------------------------------------------
# CRUD: Delete user
# ---------------------------------------------------
def delete_user(db: Session, user_id: int):
    user = db.query(admin_model.User).filter(admin_model.User.id == user_id).first()
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True

# ---------------------------------------------------
# CRUD: Get user permissions (role-based)
# ---------------------------------------------------
def get_user_permissions(db: Session, user_id: int):
    user = db.query(admin_model.User).filter(admin_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.role:
        return []

    permissions = db.query(admin_model.RolePermission).filter(
        admin_model.RolePermission.role_id == user.role.id
    ).all()

    # Return as list of dicts
    return [
        {
            "path": perm.path,
            "method": perm.method,
            "allowed": perm.allowed
        }
        for perm in permissions
    ]
