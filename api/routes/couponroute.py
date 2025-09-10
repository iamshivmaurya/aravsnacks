from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud_coupon import create_coupon,get_coupan, delete_coupon, apply_coupon_to_quote, remove_coupon_from_quote
from schema import CouponCreate, CouponResponce, ApplyCouponRequest, CancelCouponRequest


router = APIRouter()

@router.post("/create_coupon/", response_model=CouponResponce)
def create_coupon_route(coupon: CouponCreate, db: Session = Depends(get_db)):
    return create_coupon(db, coupon)


@router.get("/coupon/{coupon_code}", response_model=CouponResponce)
def get_coupon_route(coupon_code: str, db: Session = Depends(get_db)):
    db_coupon = get_coupan(db, coupon_code)
    if not db_coupon:
        raise HTTPException(status_code=404, detail="coupon not found")
    return db_coupon


@router.delete("/coupon/{coupon_id}")
def delete_coupon_route(coupon_id: int, db: Session = Depends(get_db)):
    success = delete_coupon(db, coupon_id)
    if not success:
        raise HTTPException(status_code=404, detail="coupon not found")
    return {"message": "coupon deleted successfully"}



@router.post("/quotes/apply-coupon")
def apply_coupon_route(request: ApplyCouponRequest, db: Session = Depends(get_db)):
    """
    Apply coupon to quote and calculate discounts
    """
    response = {
        "message" : "",
        "status": ""
    }
    try:
        if(apply_coupon_to_quote(db, request.quote_id, request.coupon_code)):
          response['message'] = "Discount coupon applied sucessfully!"
          response['status'] = True
        else:
          response['message'] = "Something went wrong"
          response['status'] = False

        return response
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")



@router.post("/quotes/cancel-coupon")
def cancel_coupon_route(request: CancelCouponRequest, db: Session = Depends(get_db)):
    """
    Cancel coupon to quote and calculate discounts
    """
    response = {
        "message" : "",
        "status": ""
    }
    try:
        if(remove_coupon_from_quote(db, request.quote_id)):
          response['message'] = "Discount coupon removed sucessfully!"
          response['status'] = True
        else:
          response['message'] = "Something went wrong"
          response['status'] = False

        return response
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


