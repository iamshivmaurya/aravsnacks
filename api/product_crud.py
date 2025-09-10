from sqlalchemy.orm import Session
from datetime import datetime
from model import Product
from schema import CreateProduct
from typing import List, Optional

def create_product(db: Session, product: CreateProduct):
    """
    Create a new product in the database
    """
    new_product = Product(
        sku=product.sku,
        name=product.name,
        product_price=product.product_price,
        special_price=product.special_price,
        is_active=product.is_active,
        special_price_start_date=product.special_price_start_date,
        special_price_end_date=product.special_price_end_date,
        quantity=product.quantity,
        product_weight=product.product_weight,
        description=product.description,
        sort_order=product.sort_order,
        meta_keyword=product.meta_keyword,
        meta_title=product.meta_title,
        meta_description=product.meta_description,
        tax_class_id=product.tax_class_id,
        image_url=product.image_url,
        product_created=datetime.now()
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

def get_product(db: Session, product_id: int):
    """Get a single product by ID"""
    return db.query(Product).filter(Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    """Get multiple products with pagination"""
    return db.query(Product).offset(skip).limit(limit).all()

def update_product(db: Session, product_id: int, product_data: dict):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        for key, value in product_data.items():
            setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        return True
    return False