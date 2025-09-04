from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud_coupon import create_coupon,get_coupan,delete_coupon
from schema import CouponCreate, CouponResponce
from quote_crud import apply_discount

# Add to your coupon_route.py or existing route file
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import ApplyCouponRequest, QuoteResponseWithDiscount
from crud_coupon import apply_coupon_to_quote
from model import DiscountCode, Quote, QuoteItem




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



@router.post("/quotes/apply-coupon11", response_model=QuoteResponseWithDiscount)
def apply_coupon_route(request: ApplyCouponRequest, db: Session = Depends(get_db)):
    """
    Apply coupon to quote and calculate discounts
    """
    try:
        result = apply_coupon_to_quote(db, request.quote_id, request.coupon_code)

        # Prepare response with discount details
        response_data = {
            "quote_id": result["quote"].quote_id,
            "customer_id": result["quote"].customer_id,
            "email_id": result["quote"].email_id,
            "phone_no": result["quote"].phone_no,
            "is_active": result["quote"].is_active,
            "created_at": result["quote"].created_at,
            "updated_at": result["quote"].updated_at,
            "total_price": result["quote"].total_price,
            "discount": result["quote"].discount,
            "total_tax": result["quote"].total_tax,
            "items_count": result["quote"].items_count,
            "items_quantity": result["quote"].items_quantity,
            "total_discount": result["total_discount"],
            "gross_total": result["gross_total"],
            "items": []
        }

        # Add items with discount details
        quote_items = db.query(QuoteItem).filter(QuoteItem.quote_id == request.quote_id).all()
        for item in quote_items:
            item_data = {
                "item_id": item.item_id,
                "quote_id": item.quote_id,
                "item_name": item.item_name,
                "item_qty": item.item_qty,
                "product_id": item.product_id,
                "sku": item.sku,
                "item_price": item.item_price,
                "item_discount": item.item_discount,
                "item_tax": item.item_tax,
                "tax_percentage": item.tax_percentage,
                "created_at": item.created_at,
                "updated_at": item.updated_at,
                "discount_amount": item.item_discount,
                "gross_total": (item.item_price * item.item_qty) - item.item_discount
            }
            response_data["items"].append(item_data)

        return response_data

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

