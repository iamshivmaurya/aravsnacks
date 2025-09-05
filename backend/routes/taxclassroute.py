from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import TaxClassCreate, TaxClassUpdate, TaxClassResponse
from taxclass_crud import (
    create_tax_class, get_tax_class, get_all_tax_classes,
    update_tax_class, delete_tax_class, get_active_tax_classes,
    deactivate_tax_class
)
from typing import List

router = APIRouter()

@router.post("/tax-classes", response_model=TaxClassResponse)
def create_tax_class_route(tax_class: TaxClassCreate, db: Session = Depends(get_db)):
    """Create a new tax class"""
    try:
        db_tax_class = create_tax_class(db, tax_class)
        return db_tax_class
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/tax-classes/{tax_class_id}", response_model=TaxClassResponse)
def get_tax_class_route(tax_class_id: int, db: Session = Depends(get_db)):
    """Get tax class by ID"""
    db_tax_class = get_tax_class(db, tax_class_id)
    if not db_tax_class:
        raise HTTPException(status_code=404, detail="Tax class not found")
    return db_tax_class

@router.get("/tax-classes", response_model=List[TaxClassResponse])
def get_all_tax_classes_route(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all tax classes"""
    tax_classes = get_all_tax_classes(db, skip=skip, limit=limit)
    return tax_classes

@router.get("/tax-classes/active", response_model=List[TaxClassResponse])
def get_active_tax_classes_route(db: Session = Depends(get_db)):
    """Get all active tax classes"""
    tax_classes = get_active_tax_classes(db)
    return tax_classes

@router.put("/tax-classes/{tax_class_id}", response_model=TaxClassResponse)
def update_tax_class_route(tax_class_id: int, tax_class: TaxClassUpdate, db: Session = Depends(get_db)):
    """Update tax class"""
    try:
        db_tax_class = update_tax_class(db, tax_class_id, tax_class)
        if not db_tax_class:
            raise HTTPException(status_code=404, detail="Tax class not found")
        return db_tax_class
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/tax-classes/{tax_class_id}")
def delete_tax_class_route(tax_class_id: int, db: Session = Depends(get_db)):
    """Delete tax class"""
    try:
        success = delete_tax_class(db, tax_class_id)
        if not success:
            raise HTTPException(status_code=404, detail="Tax class not found")
        return {"message": "Tax class deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.patch("/tax-classes/{tax_class_id}/deactivate", response_model=TaxClassResponse)
def deactivate_tax_class_route(tax_class_id: int, db: Session = Depends(get_db)):
    """Deactivate tax class"""
    db_tax_class = deactivate_tax_class(db, tax_class_id)
    if not db_tax_class:
        raise HTTPException(status_code=404, detail="Tax class not found")
    return db_tax_class