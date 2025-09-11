from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import AdminCreate,AdminResponse
from admin_crud import create_admin,get_admin
from typing import List

router = APIRouter()


@router.post("/admin", response_model=AdminResponse)
def create_admin_route(admin: AdminCreate, db: Session = Depends(get_db)):
    """Create a new order manually"""
    try:
        db_admin= create_admin(db, admin)
        return db_admin
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")




@router.get("/admin", response_model=List[AdminResponse])
def get_admin_route(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get list of orders"""
    admin = get_admin(db, skip=skip, limit=limit)
    return admin

