from sqlalchemy.orm import Session
import admin_model, admin_schema, admin_auth
from typing import List

def get_user_by_username(db: Session, username: str):
    return db.query(admin_model.User).filter(admin_model.User.username == username).first()

def create_user(db: Session, user_in: admin_schema.UserCreate):
    role = db.query(admin_model.Role).filter(admin_model.Role.name == user_in.role).first()
    if not role:
        raise ValueError("Role not found")
    hashed = admin_auth.get_password_hash(user_in.password)
    user = admin_model.User(username=user_in.username, hashed_password=hashed, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def list_users(db: Session, skip: int = 0, limit: int = 10) -> List[admin_model.User]:
    """
    List users with pagination.

    :param db: Database session
    :param skip: Number of records to skip
    :param limit: Maximum number of records to return
    """
    
    return db.query(admin_model.User).offset(skip).limit(limit).all()

