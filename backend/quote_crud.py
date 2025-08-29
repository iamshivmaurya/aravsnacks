from sqlalchemy.orm import Session
from model import Quote, QuoteItem, QuoteAddress, Product
from schema import  QuoteItemCreate, QuoteAddressCreate ###QuoteCreate,
from typing import List
import math
from sqlalchemy.orm import joinedload

def create_quote(db: Session):
    # Create a new quote instance
    new_quote = Quote()
    db.add(new_quote)
    db.commit()
    db.refresh(new_quote)  # This gets the auto-incremented ID
    return new_quote

"""
def create_quote(db: Session, quote: QuoteCreate):
    new_quote = Quote(**quote.dict())        #Quote from model.py  
    db.add(new_quote)
    db.commit()
    db.refresh(new_quote)
    return new_quote
"""
   
def get_quote(db: Session, quote_id: int):
    return db.query(Quote).filter(Quote.quote_id == quote_id).first()


# Update your get_quote function to eager load items  ### is code add for return item datail along with quote detal
def get_quotes(db: Session, quote_id: int):
    return db.query(Quote).options(joinedload(Quote.items)).filter(Quote.quote_id == quote_id).first()

# Or create a new function if you want to keep the original
def get_quote_with_items(db: Session, quote_id: int):
    return db.query(Quote).options(joinedload(Quote.items)).filter(Quote.quote_id == quote_id).first()

"""def get_quotes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Quote).offset(skip).limit(limit).all()
"""

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


def add_quote_item(db: Session, quote_id: int, item: QuoteItemCreate):
    # Check if product exists
    print("quote_id ============ >>>>>>>>>>>>>")
    print(quote_id)
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise ValueError("Product not found")

    # Calculate item price with discount
    item_price = product.product_price
    if product.percentage_discount > 0:
        item_price = item_price * (1 - product.percentage_discount / 100)
    elif product.products_discount > 0:
        item_price = item_price - product.products_discount

    # Calculate item tax
    item_tax = 0 #item_price * (product.tax_percentage / 100) * item.item_qty

    # Create quote item
    new_item = QuoteItem(
        quote_id = int(quote_id),
        product_id = int(item.product_id),
        item_name=product.product_name,
        item_qty= 1, #item.item_qty,
        sku=product.sku,
        item_price=item_price,
        #item_discount=product.products_discount if product.products_discount else product.percentage_discount,
        #item_tax=item_tax,
        #tax_percentage=product.tax_percentage
    )

    db.add(new_item)

    # Update quote totals
    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if quote:
        quote.total_price += item_price * item.item_qty
        quote.discount += (product.products_discount if product.products_discount else 0) * item.item_qty
        quote.total_tax += item_tax
        quote.items_count += 1
        quote.items_quantity += item.item_qty

        db.commit()
        db.refresh(new_item)

    return new_item


def remove_quote_item(db: Session, quote_id: int, item_id: int):
    item = db.query(QuoteItem).filter(QuoteItem.item_id == item_id, QuoteItem.quote_id == quote_id).first()
    if item:
        # Update quote totals
        quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
        if quote:
            quote.total_price -= item.item_price * item.item_qty
            quote.discount -= item.item_discount * item.item_qty
            quote.total_tax -= item.item_tax
            quote.items_count -= 1
            quote.items_quantity -= item.item_qty

        db.delete(item)
        db.commit()
        return True
    return False


def add_quote_address(db: Session, quote_id: int, address: QuoteAddressCreate):
    new_address = QuoteAddress(quote_id=quote_id, **address.dict())
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address


def get_quote_addresses(db: Session, quote_id: int):
    return db.query(QuoteAddress).filter(QuoteAddress.quote_id == quote_id).all()