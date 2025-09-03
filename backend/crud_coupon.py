from sqlalchemy.orm import Session
from datetime import datetime
from model import DiscountCode
from schema import CouponCreate

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


def get_coupan(db: Session, coupon_id: int):
    return db.query(DiscountCode).filter(DiscountCode.coupon_id == coupon_id).first()



def delete_coupon(db: Session, coupon_id: int):
    db_coupon= db.query(DiscountCode).filter(DiscountCode.coupon_id == coupon_id).first()
    if db_coupon:
        db.delete(db_coupon)
        db.commit()
        return True
    return False
