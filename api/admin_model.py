from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum,DateTime,func
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime


class RoleEnum(str, enum.Enum):
    admin = "admin"
    editor = "editor"
    user = "user"

# class Role(Base):
#     __tablename__ = "roles"
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(Enum(RoleEnum), unique=True, nullable=False)
#     users = relationship("User", back_populates="role")

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Enum(RoleEnum), unique=True, nullable=False)       # Role name (e.g., admin/user/editor)
    path = Column(String(255), nullable=False)        # API route (max 255 chars)
    method = Column(String(100), nullable=False)      # GET, POST, PUT, *, etc.
    allowed = Column(Boolean, default=False)          # True/False access flag
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    role_id = Column(Integer, ForeignKey("roles.id"))
    role = relationship("Role", back_populates="users")
