from sqlalchemy.orm import Session
from model import Customer, CustomerAddress
from schema import CustomerCreate, CustomerUpdate, CustomerAddressCreate
from typing import List, Optional


# Customer CRUD Operations
def create_customer(db: Session, customer: CustomerCreate):
    # Check if customer already exists
    existing_customer = db.query(Customer).filter(
        (Customer.email == customer.email) | (Customer.phone == customer.phone)
    ).first()

    if existing_customer:
        raise ValueError("Customer with this email or phone already exists")

    # Create new customer
    new_customer = Customer(
        customer_name=customer.customer_name,
        email=customer.email,
        password_hash=customer.password,  # In production, hash the password
        first_name=customer.first_name,
        last_name=customer.last_name,
        phone=customer.phone
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer


def get_customer(db: Session, customer_id: int):
    return db.query(Customer).filter(Customer.customer_id == customer_id).first()


def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Customer).offset(skip).limit(limit).all()


def update_customer(db: Session, customer_id: int, customer_data: dict):
    db_customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if db_customer:
        for key, value in customer_data.items():
            setattr(db_customer, key, value)
        db.commit()
        db.refresh(db_customer)
    return db_customer


def delete_customer(db: Session, customer_id: int):
    db_customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if db_customer:
        db.delete(db_customer)
        db.commit()
        return True
    return False


# Customer Address CRUD Operations
def create_customer_address(db: Session, customer_id: int, address: CustomerAddressCreate):
    new_address = CustomerAddress(
        customer_id=customer_id,
        **address.dict()
    )

    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address


def get_customer_addresses(db: Session, customer_id: int):
    return db.query(CustomerAddress).filter(CustomerAddress.customer_id == customer_id).all()


def get_address(db: Session, address_id: int):
    return db.query(CustomerAddress).filter(CustomerAddress.address_id == address_id).first()


def update_address(db: Session, address_id: int, address_data: dict):
    db_address = db.query(CustomerAddress).filter(CustomerAddress.address_id == address_id).first()
    if db_address:
        for key, value in address_data.items():
            setattr(db_address, key, value)
        db.commit()
        db.refresh(db_address)
    return db_address


def delete_address(db: Session, address_id: int):
    db_address = db.query(CustomerAddress).filter(CustomerAddress.address_id == address_id).first()
    if db_address:
        db.delete(db_address)
        db.commit()
        return True
    return False