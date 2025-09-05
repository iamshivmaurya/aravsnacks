from sqlalchemy.orm import Session
from model import TaxClass
from schema import TaxClassCreate, TaxClassUpdate
from typing import List


def create_tax_class(db: Session, tax_class: TaxClassCreate):
    # Check if tax class name already exists
    existing_tax_class = db.query(TaxClass).filter(
        TaxClass.tax_class_name == tax_class.tax_class_name
    ).first()

    if existing_tax_class:
        raise ValueError("Tax class with this name already exists")

    db_tax_class = TaxClass(**tax_class.dict())
    db.add(db_tax_class)
    db.commit()
    db.refresh(db_tax_class)
    return db_tax_class


def get_tax_class(db: Session, tax_class_id: int):
    return db.query(TaxClass).filter(TaxClass.tax_class_id == tax_class_id).first()


def get_tax_class_by_name(db: Session, tax_class_name: str):
    return db.query(TaxClass).filter(TaxClass.tax_class_name == tax_class_name).first()


def get_all_tax_classes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(TaxClass).offset(skip).limit(limit).all()


def get_active_tax_classes(db: Session):
    return db.query(TaxClass).filter(TaxClass.is_active == True).all()


def update_tax_class(db: Session, tax_class_id: int, tax_class_data: TaxClassUpdate):
    db_tax_class = db.query(TaxClass).filter(TaxClass.tax_class_id == tax_class_id).first()
    if not db_tax_class:
        return None

    update_data = tax_class_data.dict(exclude_unset=True)

    # Check if new name conflicts with existing tax class
    if 'tax_class_name' in update_data:
        existing = db.query(TaxClass).filter(
            TaxClass.tax_class_name == update_data['tax_class_name'],
            TaxClass.tax_class_id != tax_class_id
        ).first()
        if existing:
            raise ValueError("Tax class with this name already exists")

    for key, value in update_data.items():
        setattr(db_tax_class, key, value)

    db.commit()
    db.refresh(db_tax_class)
    return db_tax_class


def delete_tax_class(db: Session, tax_class_id: int):
    db_tax_class = db.query(TaxClass).filter(TaxClass.tax_class_id == tax_class_id).first()
    if db_tax_class:
        # Check if any products are using this tax class
        if db_tax_class.products:
            raise ValueError("Cannot delete tax class: Products are using it")

        db.delete(db_tax_class)
        db.commit()
        return True
    return False


def deactivate_tax_class(db: Session, tax_class_id: int):
    db_tax_class = db.query(TaxClass).filter(TaxClass.tax_class_id == tax_class_id).first()
    if db_tax_class:
        db_tax_class.is_active = False
        db.commit()
        db.refresh(db_tax_class)
        return db_tax_class
    return None