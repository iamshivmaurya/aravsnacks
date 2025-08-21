from database import Base
from sqlalchemy import Column, Integer,Text,Float, String, Boolean, DateTime,ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship


class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    phone = Column(String(15), unique=True, nullable=True)
    email = Column(String(50), unique=True, nullable=True)
    password = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

    # Add this relationship
    addresses = relationship("CustomerAddress", back_populates="customer")


class CustomerAddress(Base):
    __tablename__ = "customer_address"

    address_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    customer_id = Column(Integer, ForeignKey('customers.customer_id'), nullable=False)
    address_type = Column(String(50))
    street_address = Column(String(50))
    postal_code = Column(String(50), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(255), nullable=False)
    fast_name = Column(String(50))  # Assuming this is "first_name" (typo in your SQL)
    last_nmae = Column(String(50))  # Assuming this is "last_name" (typo in your SQL)
    phone_no = Column(String(15))  # Changed to String for phone numbers
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationship (optional)
    customer = relationship("Customer", back_populates="addresses")


class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    otp = Column(String(4), nullable=False)
    phone = Column(String(15), nullable=True)
    email = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.now)



class Category(Base):
    __tablename__ = "category"

    category_id = Column(Integer, primary_key=True, autoincrement=True)
    parent_id = Column(Integer, default=0)  # parent category reference
    category_name = Column(String(50), nullable=False, unique=True)
    description = Column(Text)
    is_active = Column(Boolean, default=True)  # changed from TEXT to Boolean
    sort_order = Column(Float, default=0.0)
    category_created = Column(DateTime, default=datetime.now)  # could be DateTime


class Product(Base):
    __tablename__ = "products"
    id =                    Column(Integer, primary_key=True, index=True)
    category_id =           Column(Integer)
    product_name =          Column(String(50), nullable=False, unique=True)
    products_discount =     Column(Integer, default=0.0)
    percentage_discount =   Column(Float, default=0.0)
    discount_start_date =   Column(DateTime)
    discount_end_date =     Column(DateTime)
    product_left =          Column(Integer)
    weight_grams =          Column(Float)
    product_price =         Column(Float)
    description =           Column(Text)
    is_active =             Column(Boolean, default=True)
    product_created =       Column(DateTime, default=datetime.now)
    country_origen =        Column(String(50))
    product_exp =           Column(DateTime)
    sort_order =            Column(Float , default=0.0)
    meta_keyword =          Column(String(250),nullable=True)
    meta_title =            Column(String(250),nullable=True)
    meta_description =      Column(String(250),nullable=True)
    tax_percentage =        Column(Integer,default=0.0)
    sku =                   Column(String(250),nullable=True)
    image_url =             Column(String(250),nullable=True)