from sqlalchemy.orm import Session
from model import Quote, QuoteItem, QuoteAddress, Product,TaxClass ,DiscountCode
from schema import  QuoteItemCreate, QuoteAddressCreate,OrderAddressUpdate ###QuoteCreate,
from typing import List
import math
from sqlalchemy.orm import joinedload
from decimal import Decimal

def create_quote(db: Session):
    # Create a new quote instance
    new_quote = Quote()
    db.add(new_quote)
    db.commit()
    db.refresh(new_quote)  # This gets the auto-incremented ID
    return new_quote


# ✅ CORRECT: Get single quote by ID
def get_quote(db: Session, quote_id: int):
    return db.query(Quote).filter(Quote.quote_id == quote_id).first()

# ✅ CORRECT: Get single quote with items eager loaded
def get_quote_with_items(db: Session, quote_id: int):
    return db.query(Quote).options(joinedload(Quote.items)).filter(Quote.quote_id == quote_id).first()

# ✅ CORRECT: Get all quotes (for listing)
def get_all_quotes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Quote).offset(skip).limit(limit).all()



def calculate_item_totals(product: Product, item_qty: int) -> dict:
    """Calculate price, discount, and tax for a single item"""
    # Calculate item price with discount
    item_price = product.product_price
 

    return {
        'item_price': item_price,
        'item_tax': 0,
        'item_discount': 0,
        'tax_percentage': 0
    }


def update_quote(db: Session, quote_id: int, quote_data: dict):
    db_quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if db_quote:
        for key, value in quote_data.items():
            setattr(db_quote, key, value)
        db.commit()
        db.refresh(db_quote)
    return db_quote


def delete_quote(db: Session, quote_id: int):
    db_quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if db_quote:
        db.delete(db_quote)
        db.commit()
        return True
    return False


def redistribute_discounts(db: Session, quote_id: int):
    """Redistribute discount proportionally among all items in quote"""
    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if not quote or quote.discount <= 0:
        return

    items = db.query(QuoteItem).filter(QuoteItem.quote_id == quote_id).all()
    if not items:
        return

    total_subtotal = sum(item.item_price * item.item_qty for item in items)
    total_discount = quote.discount

    # Redistribute discount proportionally
    for item in items:
        item_subtotal = item.item_price * item.item_qty

        if total_subtotal > 0:
            item_discount = (item_subtotal / total_subtotal) * total_discount
        else:
            item_discount = 0

        item.item_discount = item_discount

        # ✅ CORRECTED: Calculate tax on discounted amount
        taxable_amount = item_subtotal - item_discount
        item.item_tax = (taxable_amount * item.tax_percentage) / 100
        item.row_total = taxable_amount + item.item_tax

    # Recalculate quote totals
    quote.total_tax = sum(item.item_tax for item in items)

    # ✅ CORRECTED: Grand total calculation
    quote.grand_total = (quote.subtotal - quote.discount) + quote.total_tax

    db.commit()


def add_quote_item(db: Session, quote_id: int, item: QuoteItemCreate):
    # Check if product exists
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise ValueError("Product not found")

    # Get tax percentage
    tax_percentage = 0.0
    if product.tax_class_id:
        tax_class = db.query(TaxClass).filter(TaxClass.tax_class_id == product.tax_class_id).first()
        if tax_class:
            tax_percentage = tax_class.tax_percentage

    # Calculate item values (without discount initially)
    item_price = float(product.product_price)
    item_subtotal = item_price * item.item_qty
    item_tax = (item_subtotal * tax_percentage) / 100
    row_total = item_subtotal + item_tax

    # Create quote item
    new_item = QuoteItem(
        quote_id=quote_id,
        product_id=item.product_id,
        item_name=product.name,
        item_qty=item.item_qty,
        sku=product.sku,
        item_price=item_price,
        item_discount=0.0,  # No discount initially
        item_tax=item_tax,
        tax_percentage=tax_percentage,
        product_name=product.name,
        row_total=row_total
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    # Update quote totals
    # Update quote totals
    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if quote:
        quote.subtotal += item_subtotal
        quote.total_tax += item_tax
        quote.items_count += 1
        quote.items_quantity += item.item_qty

        # ✅ FIX: Add this line to recalculate grand_total properly
        quote.grand_total = quote.subtotal + quote.total_tax - quote.discount

        db.commit()
        db.refresh(quote)

    return new_item


def remove_quote_item(db: Session, quote_id: int, item_id: int):
    """
    Remove an item from quote and update totals with proper grand total calculation
    """
    try:
        # Find the item to remove
        item = db.query(QuoteItem).filter(
            QuoteItem.item_id == item_id,
            QuoteItem.quote_id == quote_id
        ).first()

        if not item:
            return False

        # Store values for quote update before deletion
        item_subtotal = item.item_price * item.item_qty
        item_tax = item.item_tax
        item_discount = item.item_discount

        # Get the quote before deleting the item
        quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
        if not quote:
            return False

        # Delete the item
        db.delete(item)
        db.commit()

        # Update quote totals after successful deletion
        quote.subtotal -= item_subtotal
        quote.total_tax -= item_tax
        quote.discount -= item_discount
        quote.items_count -= 1
        quote.items_quantity -= item.item_qty

        # Check if there are remaining items with discount to redistribute
        remaining_items = db.query(QuoteItem).filter(QuoteItem.quote_id == quote_id).count()

        if remaining_items > 0 and quote.discount > 0:
            # Redistribute discount proportionally among remaining items
            redistribute_discounts(db, quote_id)
        else:
            # No remaining items or no discount, just recalculate grand total
            quote.grand_total = quote.subtotal + quote.total_tax - quote.discount

        db.commit()
        return True

    except Exception as e:
        # Rollback in case of error
        db.rollback()
        print(f"Error removing quote item: {e}")
        return False



def add_quote_address(db: Session, quote_id: int, address: QuoteAddressCreate):
    new_address = QuoteAddress(quote_id=quote_id, **address.dict())
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address


def get_quote_addresses(db: Session, quote_id: int):
    return db.query(QuoteAddress).filter(QuoteAddress.quote_id == quote_id).all()


def update_quote_item_quantity(db: Session, quote_id: int, item_id: int, new_qty: int):
    item = db.query(QuoteItem).filter(QuoteItem.item_id == item_id, QuoteItem.quote_id == quote_id).first()
    if not item:
        return None
    # remove item from cart if 0 qty 
    if new_qty <= 0 and remove_quote_item(db, quote_id, item_id):
        return {"message":"Item removed from cart."}
        

    # Store old values
    old_qty = item.item_qty
    old_subtotal = item.item_price * old_qty
    old_tax = item.item_tax
    old_discount = item.item_discount

    # Update quantity
    item.item_qty = new_qty
    new_subtotal = item.item_price * new_qty

    # Update quote basic totals
    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if quote:
        quote.subtotal += (new_subtotal - old_subtotal)
        quote.items_quantity += (new_qty - old_qty)

        # Redistribute discount proportionally
        if quote.discount > 0:
            redistribute_discounts(db, quote_id)
        else:
            # ✅ FIX: Calculate tax on DISCOUNTED amount (consider existing discount)
            discounted_amount = new_subtotal - item.item_discount
            new_tax = (discounted_amount * item.tax_percentage) / 100
            item.item_tax = new_tax
            item.row_total = discounted_amount + new_tax

            quote.total_tax += (new_tax - old_tax)
            quote.grand_total = quote.subtotal + quote.total_tax - quote.discount

        db.commit()
        db.refresh(item)

    return item


def apply_discount(db: Session, quote_id: int, coupon_code: str):
    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if not quote:
        raise ValueError("Quote not found")

    coupon = db.query(DiscountCode).filter(DiscountCode.coupon_code == coupon_code).first()
    if not coupon:
        raise ValueError("Coupon not found")

    items = db.query(QuoteItem).filter(QuoteItem.quote_id == quote_id).all()
    if not items:
        raise ValueError("No items in quote")

    # Calculate total discount amount
    total_subtotal = quote.subtotal

    if coupon.discount_type == 'fixed':
        discount_amount = min(coupon.discount_amount, total_subtotal)
    else:
        discount_amount = (coupon.discount_amount / 100) * total_subtotal

    # Apply discount to quote
    quote.discount = discount_amount
    quote.coupon_code = coupon_code

    # Redistribute discount proportionally and recalculate taxes
    for item in items:
        item_subtotal = item.item_price * item.item_qty

        # Calculate proportional discount for this item
        if total_subtotal > 0:
            item_discount = (item_subtotal / total_subtotal) * discount_amount
        else:
            item_discount = 0

        item.item_discount = item_discount

        # ✅ CORRECTED: Calculate tax on DISCOUNTED amount (Indian GST rule)
        discounted_amount = item_subtotal - item_discount
        item.item_tax = (discounted_amount * item.tax_percentage) / 100

        # ✅ CORRECTED: Recalculate row total correctly
        item.row_total = discounted_amount + item.item_tax

    # ✅ Recalculate quote totals after all items are updated
    quote.total_tax = sum(item.item_tax for item in items)
    quote.grand_total = (quote.subtotal - quote.discount) + quote.total_tax

    db.commit()
    db.refresh(quote)

    return quote
