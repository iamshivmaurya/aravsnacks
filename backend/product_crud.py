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
        product_name=product.product_name,
        category_id=product.category_id,
        description=product.description,
        is_active=product.is_active,
        products_discount=product.products_discount,
        percentage_discount=product.percentage_discount,
        discount_start_date=product.discount_start_date,
        discount_end_date=product.discount_end_date,
        product_left=product.product_left,
        weight_grams=product.weight_grams,
        product_price=product.product_price,
        country_origen=product.country_origen,
        product_exp=product.product_exp,
        sort_order=product.sort_order,
        meta_keyword=product.meta_keyword,
        meta_title=product.meta_title,
        meta_description=product.meta_description,
        tax_percentage=product.tax_percentage,
        sku=product.sku,
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