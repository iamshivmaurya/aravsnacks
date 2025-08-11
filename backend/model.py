from database import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    phone = Column(String(15), unique=True, nullable=True)
    email = Column(String(50), unique=True, nullable=True)
    password = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)


class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    otp = Column(String(4), nullable=False)
    phone = Column(String(15), nullable=True)
    email = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.now)