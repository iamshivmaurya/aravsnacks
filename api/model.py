from database import Base
from sqlalchemy import Column, Integer, Text, Float, String, Boolean, DateTime, ForeignKey, DECIMAL, func
from datetime import datetime
from sqlalchemy.orm import relationship

#rajesh

class AdminLogin(Base):
    __tablename__ = "admin_login"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_name = Column(String(50), nullable=True)
    password = Column(String(255), nullable=True)
    user_type = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)

 
    created_at = Column(DateTime, default=datetime.now)



class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_name = Column(String(50), nullable=True)
    email = Column(String(100), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    phone = Column(String(20), unique=True, nullable=True)
    registor_on = Column(DateTime, default=datetime.now)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    #addresses = relationship("CustomerAddress", back_populates="customer")
    quotes = relationship("Quote", back_populates="customer")
    #orders = relationship("Order", back_populates="customer")
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class CustomerAddress(Base):
    __tablename__ = "customer_address"

    address_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey('customers.customer_id'), nullable=False)
    address_type = Column(String(50),nullable=False)
    street_address = Column(String(50), nullable=False)
    postal_code = Column(String(50), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(255), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    phone_no = Column(String(15), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # customer = relationship("Customer", back_populates="addresses")


class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    otp = Column(String(4), nullable=False)
    phone = Column(String(15), nullable=True)
    email = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class Category(Base):
    __tablename__ = "category"

    category_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    parent_id = Column(Integer, default=0)
    category_name = Column(String(50), nullable=False)
    description = Column(Text,nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Float, default=0.0)
    category_created = Column(DateTime, default=datetime.now)
    url_key = Column(String(50),nullable=True)
    image_name = Column(String(250),nullable=True)
    meta_keyword = Column(String(250),nullable=True)
    meta_title = Column(String(250),nullable=True)
    meta_description = Column(String(250),nullable=True)
    category_path = Column(String(50),nullable=True)
    level = Column(String(50),nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)



class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sku = Column(String(250), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    product_price = Column(DECIMAL(10, 2), nullable=False)  # Money safe
    special_price = Column(DECIMAL(10, 2), nullable=True)   # Nullable
    special_price_start_date = Column(DateTime, nullable=True)
    special_price_end_date = Column(DateTime, nullable=True)
    quantity = Column(Integer, nullable=True)
    product_weight = Column(DECIMAL(10, 3), nullable=True)          # 3 decimal places
    tax_class_id = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)
    meta_keyword = Column(String(250), nullable=True)
    meta_title = Column(String(250), nullable=True)
    meta_description = Column(String(1000), nullable=True)
    image_url = Column(String(250), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class Quote(Base):
    __tablename__ = "quote"

    quote_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey('customers.customer_id'), nullable=True)
    coupon_code = Column(String(50), nullable=True)   # 👈 extra column for readability
    email_id = Column(String(50), nullable=True)
    phone_no = Column(String(12), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    discount = Column(Float, default=0.0)
    total_tax = Column(Integer, default=0)
    items_count = Column(Integer, default=0)
    items_quantity = Column(Integer, default=0)
    subtotal = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)

    customer = relationship("Customer", back_populates="quotes")
    items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")


class QuoteItem(Base):
    __tablename__ = "quote_item"

    item_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    quote_id = Column(Integer, ForeignKey('quote.quote_id'), nullable=False)
    item_name = Column(String(50),nullable=True)
    item_qty = Column(Integer, default=1)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    sku = Column(String(250),nullable=False)
    item_price = Column(Float, default=0.0)
    item_discount = Column(Float, default=0.0)
    item_tax = Column(Float, default=0.0)
    tax_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    product_name = Column(String(255), nullable=True)  # ← NEW: Product name
    row_total = Column(Float, default=0.0)  # ← NEW: Row total (quantity * price - discount)

    quote = relationship("Quote", back_populates="items")
    #product = relationship("Product", back_populates="quote_items")



class QuoteAddress(Base):
    __tablename__ = "quote_address"

    quote_address_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    quote_id = Column(Integer, ForeignKey('quote.quote_id'), nullable=False)
    address_type = Column(String(50),nullable=False)
    street_address = Column(String(50), nullable=False)
    postal_code = Column(String(50), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(255), nullable=False)
    phone_no = Column(String(15),nullable=False)
    first_name = Column(String(250), nullable=False)
    last_name = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    #quote = relationship("Quote", back_populates="addresses")


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey('customers.customer_id'), nullable=True)
    customer_email = Column(String(100), nullable=True)
    order_date = Column(DateTime, default=datetime.now)
    sub_total = Column(Float, default=0.0)
    shipping_amount = Column(Float, default=0.0)
    total_tax_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)
    payment_method = Column(String(50),nullable=True)
    shipping_method = Column(String(50),nullable=True)
    cust_order_num = Column(String(50),nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    addresses = relationship("OrderAddress", back_populates="order", cascade="all, delete-orphan")



class OrderItem(Base):   #############
    __tablename__ = "order_items"

    order_item_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey('orders.order_id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    sku = Column(String(250),nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    total_price = Column(Float, nullable=True)
    tax_percentage = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    product_name = Column(String(255), nullable=True)  # ← NEW: Product name
    row_total = Column(Float, default=0.0)  # ← NEW: Row total (quantity * price - discount)

    order = relationship("Order", back_populates="items")
    




class OrderAddress(Base):
    __tablename__ = "order_address"

    order_address_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey('orders.order_id'), nullable=False)
    address_type = Column(String(50))
    street_address = Column(String(50))
    postal_code = Column(String(50), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(255), nullable=False)
    phone_no = Column(String(15))
    first_name = Column(String(250))
    last_name = Column(String(250))
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    order = relationship("Order", back_populates="addresses")
    



class DiscountCode(Base):
    __tablename__ = "coupon"

    coupon_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    coupon_code = Column(String(50), unique=True)
    coupon_discription = Column(String(250))
    valid_from = Column(DateTime,nullable=True)
    valid_to = Column(DateTime,nullable=True)
    discount_type = Column(String(50))
    discount_amount = Column(Integer)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    coupon_rule = Column(String(20))


class TaxClass(Base):
    __tablename__ = "tax_classes"

    tax_class_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tax_class_name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    tax_rule = Column(String(100), nullable=True)  # ✅ ADD THIS FIELD
    tax_percentage = Column(Float, nullable=False)
    tax_type = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    country_code = Column(String(3), nullable=True)
    state_code = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)



class ProductReview(Base):
    __tablename__ = "product_reviews"

    review_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    customer_name = Column(String(100), nullable=True)
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)