from sqlalchemy.orm import Session
from datetime import datetime
from model import DiscountCode
from schema import CouponCreate
from model import DiscountCode, Quote, QuoteItem
from datetime import datetime


def create_coupon(db: Session, coupon: CouponCreate):
    db_coupon = DiscountCode(
        coupon_code=coupon.coupon_code,
        discount_amount=coupon.discount_amount,
        start_date=coupon.start_date,
        end_date=coupon.end_date,
        updated_at=coupon.updated_at,
        created_at=datetime.now(),
        coupon_discription=coupon.coupon_discription,
        discount_type=coupon.discount_type,
        coupon_rule=coupon.coupon_rule
    )
    db.add(db_coupon)
    db.commit()
    db.refresh(db_coupon)
    return db_coupon


def get_coupan(db: Session, coupon_code: str):
    return db.query(DiscountCode).filter(DiscountCode.coupon_code == coupon_code).first()



def delete_coupon(db: Session, coupon_id: int):
    db_coupon= db.query(DiscountCode).filter(DiscountCode.coupon_id == coupon_id).first()
    if db_coupon:
        db.delete(db_coupon)
        db.commit()
        return True
    return False



def apply_coupon_to_quote(db: Session, quote_id: int, coupon_code: str):
    # Check if quote exists
    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if not quote:
        raise ValueError("Quote not found")

    # Check if coupon exists and is valid
    coupon = db.query(DiscountCode).filter(DiscountCode.coupon_code == coupon_code).first()
    if not coupon:
        raise ValueError("Coupon not found")

    # Check if coupon is still valid
    current_time = datetime.now()
    if coupon.start_date and current_time < coupon.start_date:
        raise ValueError("Coupon not yet valid")
    if coupon.end_date and current_time > coupon.end_date:
        raise ValueError("Coupon has expired")

    # Get all quote items
    quote_items = db.query(QuoteItem).filter(QuoteItem.quote_id == quote_id).all()
    if not quote_items:
        raise ValueError("Quote has no items")

    total_discount = 0
    total_gross = 0

    # Apply discount to each item based on discount type
    for item in quote_items:
        if coupon.discount_type.lower() == "fixed":
            # Fixed discount: distribute equally among items
            item_discount = coupon.discount_amount / len(quote_items)
        elif coupon.discount_type.lower() == "percentage":
            # Percentage discount: apply percentage to each item
            item_discount = (item.item_price * coupon.discount_amount) / 100
        else:
            raise ValueError("Invalid discount type")

        # Update item discount
        item.item_discount = item_discount
        item_gross_total = (item.item_price * item.item_qty) - item_discount

        total_discount += item_discount
        total_gross += item_gross_total

    # Update quote totals
    quote.discount = total_discount
    quote.total_price = total_gross + total_discount  # Maintain original logic if needed

    db.commit()

    return {
        "quote": quote,
        "coupon": coupon,
        "total_discount": total_discount,
        "gross_total": total_gross
    }
