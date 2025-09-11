from sqlalchemy.orm import Session
from datetime import datetime
from model import AdminLogin
from schema import AdminCreate
from typing import List, Optional

def create_admin(db: Session, admin: AdminCreate):
    """
    Create a new admin in the database
    """
    new_admin= AdminLogin(
        id=admin.id,
        user_name=admin.user_name,
        password=admin.password,
        user_type=admin.user_type,
        is_active=admin.is_active,
        created_at=admin.created_at,
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin


def get_admin(db: Session, skip: int = 0, limit: int = 100):
    """Get multiple products with pagination"""
    return db.query(AdminLogin).offset(skip).limit(limit).all()
