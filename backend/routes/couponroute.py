from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from crud_coupon import create_coupon,get_coupan,delete_coupon
from schema import CouponCreate, CouponResponce

router = APIRouter()

@router.post("/create_coupon/", response_model=CouponResponce)
def create_coupon_route(coupon: CouponCreate, db: Session = Depends(get_db)):
    return create_coupon(db, coupon)


@router.get("/coupon/{coupon_id}", response_model=CouponResponce)
def get_coupon_route(coupon_id: int, db: Session = Depends(get_db)):
    db_coupon = get_coupan(db, coupon_id)
    if not db_coupon:
        raise HTTPException(status_code=404, detail="coupon not found")
    return db_coupon


@router.delete("/coupon/{coupon_id}")
def delete_coupon_route(coupon_id: int, db: Session = Depends(get_db)):
    success = delete_coupon(db, coupon_id)
    if not success:
        raise HTTPException(status_code=404, detail="coupon not found")
    return {"message": "coupon deleted successfully"}


@router.get("/apply_coupon/{coupon_id}", response_model=CouponResponce)
def get_coupon_route(coupon_id: int, db: Session = Depends(get_db)):
    db_coupon = get_coupan(db, coupon_id)
    if not db_coupon:
        raise HTTPException(status_code=404, detail="coupon not found")
    return db_coupon