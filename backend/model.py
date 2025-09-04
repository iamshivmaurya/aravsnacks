from database import Base
from sqlalchemy import Column, Integer, Text, Float, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship


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

    addresses = relationship("CustomerAddress", back_populates="customer")
    quotes = relationship("Quote", back_populates="customer")
    orders = relationship("Order", back_populates="customer")


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

    customer = relationship("Customer", back_populates="addresses")


class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    otp = Column(String(4), nullable=False)
    phone = Column(String(15), nullable=True)
    email = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.now)


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




class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_name = Column(String(50), nullable=False)
    products_discount = Column(Integer, nullable=True)
    percentage_discount = Column(Float, nullable=True)
    discount_start_date = Column(DateTime,nullable=True)
    discount_end_date = Column(DateTime,nullable=True)
    product_left = Column(Integer,nullable=True)
    weight_grams = Column(Float,nullable=True)
    product_price = Column(Float,nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    product_created = Column(DateTime, default=datetime.now)
    country_origen = Column(String(50),nullable=True)
    product_exp = Column(DateTime,nullable=True)
    sort_order = Column(Float, default=0.0)
    meta_keyword = Column(String(250),nullable=True)
    meta_title = Column(String(250),nullable=True)
    meta_description = Column(String(250),nullable=True)
    tax_class = Column(Integer,nullable=True)
    sku = Column(String(250),unique=True, nullable=False)
    image_url = Column(String(250),nullable=True)

    quote_items = relationship("QuoteItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")


class Quote(Base):
    __tablename__ = "quote"

    quote_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey('customers.customer_id'), nullable=True)
    email_id = Column(String(50), nullable=True)
    phone_no = Column(String(12), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    total_price = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total_tax = Column(Integer, default=0)
    items_count = Column(Integer, default=0)
    items_quantity = Column(Integer, default=0)

    customer = relationship("Customer", back_populates="quotes")
    items = relationship("QuoteItem", back_populates="quote")
    addresses = relationship("QuoteAddress", back_populates="quote")


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

    quote = relationship("Quote", back_populates="items")
    product = relationship("Product", back_populates="quote_items")



class QuoteAddress(Base):
    __tablename__ = "quote_address"

    quote_address_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    quote_id = Column(Integer, ForeignKey('quote.quote_id'), nullable=False)
    address_type = Column(String(50),nullable=False)
    street_address = Column(String(50), nullable=False)
    postal_code = Column(String(50), nullable=False)
    postal_code = Column(String(50), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(255), nullable=False)
    phone_no = Column(String(15),nullable=False)
    fast_name = Column(String(250), nullable=False)
    last_name = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    quote = relationship("Quote", back_populates="addresses")
    #addresses = relationship("QuoteAddress", back_populates="quote")

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

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    addresses = relationship("OrderAddress", back_populates="order")



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

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")



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
    fast_name = Column(String(250))
    last_name = Column(String(250))
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    order = relationship("Order", back_populates="addresses")



class DiscountCode(Base):
    __tablename__ = "coupon"

    coupon_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    coupon_code = Column(String(50))
    coupon_discription = Column(String(250))
    start_date = Column(DateTime,nullable=True)
    end_date = Column(DateTime,nullable=True)
    discount_type = Column(String(50))
    discount_amount = Column(Integer)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now)
    coupon_rule = Column(String(20))
    



