from sqlalchemy.orm import Session
from datetime import datetime
from model import DiscountCode
from schema import CouponCreate
from model import DiscountCode, Quote, QuoteItem
from datetime import datetime
from decimal import Decimal


def create_coupon(db: Session, coupon: CouponCreate):
    db_coupon = DiscountCode(
        coupon_code=coupon.coupon_code,
        discount_amount=coupon.discount_amount,
        valid_from=coupon.valid_from,
        valid_to=coupon.valid_to,
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
    # 1. Get Quote
    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if not quote:
        raise ValueError("Quote not found")

    # 2. Get Coupon
    coupon = db.query(DiscountCode).filter(DiscountCode.coupon_code == coupon_code).first()
    if not coupon:
        raise ValueError("Coupon not found")

    # 3. Validate coupon dates
    current_time = datetime.utcnow()
    if coupon.valid_from and current_time < coupon.valid_from:
        raise ValueError("Coupon not yet valid")
    if coupon.valid_to and current_time > coupon.valid_to:
        raise ValueError("Coupon has expired")

    # 4. Get Items
    quote_items = db.query(QuoteItem).filter(QuoteItem.quote_id == quote_id).all()
    if not quote_items:
        raise ValueError("Quote has no items")

    subtotal = Decimal(0)
    total_discount = Decimal(0)
    total_tax = Decimal(0)

    # 5. Apply Discounts and Recalculate Taxes
    if coupon.discount_type.lower() == "fixed":
        # Calculate total subtotal first
        for item in quote_items:
            line_price = Decimal(item.item_price) * item.item_qty
            subtotal += line_price

        # Spread fixed discount proportionally
        for item in quote_items:
            line_price = Decimal(item.item_price) * item.item_qty
            if subtotal > 0:
                item_discount = (line_price / subtotal) * Decimal(coupon.discount_amount)
            else:
                item_discount = Decimal(0)

            item.item_discount = item_discount
            total_discount += item_discount

            # ✅ RECALCULATE TAX on discounted amount
            discounted_amount = line_price - item_discount
            item.item_tax = (discounted_amount * Decimal(item.tax_percentage)) / 100
            item.row_total = discounted_amount + item.item_tax

            total_tax += item.item_tax

    elif coupon.discount_type.lower() == "percent":
        for item in quote_items:
            line_price = Decimal(item.item_price) * item.item_qty
            item_discount = (line_price * Decimal(coupon.discount_amount)) / 100
            item.item_discount = item_discount
            subtotal += line_price
            total_discount += item_discount

            # ✅ RECALCULATE TAX on discounted amount
            discounted_amount = line_price - item_discount
            item.item_tax = (discounted_amount * Decimal(item.tax_percentage)) / 100
            item.row_total = discounted_amount + item.item_tax

            total_tax += item.item_tax
    else:
        raise ValueError("Invalid discount type")

    # 6. Update Quote Totals
    quote.subtotal = subtotal
    quote.discount = total_discount
    quote.total_tax = total_tax
    quote.grand_total = subtotal - total_discount + total_tax  # ✅ Include tax
    quote.coupon_code = coupon.coupon_code

    db.commit()
    db.refresh(quote)

    return {
        "subtotal": float(subtotal),
        "discount": float(total_discount),
        "total_tax": float(total_tax),
        "grand_total": float(quote.grand_total),
        "coupon_code": coupon.coupon_code,
    }


def remove_coupon_from_quote(db: Session, quote_id: int):
    # 1. Get Quote
    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if not quote:
        raise ValueError("Quote not found")

    # 2. Get Items
    quote_items = db.query(QuoteItem).filter(QuoteItem.quote_id == quote_id).all()
    if not quote_items:
        raise ValueError("Quote has no items")

    subtotal = Decimal(0)
    total_tax = Decimal(0)

    # 3. Reset discounts and recalculate taxes on full amount
    for item in quote_items:
        line_price = Decimal(item.item_price) * item.item_qty
        item.item_discount = Decimal(0)  # ✅ clear per-item discount

        # ✅ RECALCULATE TAX on full amount (no discount)
        item.item_tax = (line_price * Decimal(item.tax_percentage)) / 100
        item.row_total = line_price + item.item_tax

        subtotal += line_price
        total_tax += item.item_tax

    # 4. Update Quote Totals (no discount)
    quote.subtotal = subtotal
    quote.discount = Decimal(0)
    quote.total_tax = total_tax
    quote.grand_total = subtotal + total_tax  # ✅ Include tax
    quote.coupon_code = None  # ✅ remove coupon reference

    db.commit()
    db.refresh(quote)

    return {
        "subtotal": float(subtotal),
        "discount": 0,
        "total_tax": float(total_tax),
        "grand_total": float(quote.grand_total),
        "coupon_code": None,
    }

