from sqlalchemy.orm import Session
from model import Quote, QuoteItem, QuoteAddress, Product
from schema import  QuoteItemCreate, QuoteAddressCreate,OrderAddressUpdate ###QuoteCreate,
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


def get_quote(db: Session, quote_id: int):
    return db.query(Quote).filter(Quote.quote_id == quote_id).first()


# Update your get_quote function to eager load items  ### is code add for return item datail along with quote detal
def get_quotes(db: Session, quote_id: int):
    return db.query(Quote).options(joinedload(Quote.items)).filter(Quote.quote_id == quote_id).first()



def calculate_item_totals(product: Product, item_qty: int) -> dict:
    """Calculate price, discount, and tax for a single item"""
    # Calculate item price with discount
    item_price = product.product_price
    if product.percentage_discount > 0:
        item_price = item_price * (1 - product.percentage_discount / 100)
    elif product.products_discount > 0:
        item_price = item_price - product.products_discount

    # Calculate item tax
    item_tax = item_price * (product.tax_percentage / 100) * item_qty if product.tax_percentage else 0

    # Calculate item discount total
    item_discount = 0
    if product.products_discount > 0:
        item_discount = product.products_discount * item_qty
    elif product.percentage_discount > 0:
        item_discount = (product.product_price * product.percentage_discount / 100) * item_qty

    return {
        'item_price': item_price,
        'item_tax': item_tax,
        'item_discount': item_discount,
        'tax_percentage': product.tax_percentage if product.tax_percentage else 0
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


def add_quote_item(db: Session, quote_id: int, item: QuoteItemCreate):
    # Check if product exists
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise ValueError("Product not found")

    # Calculate item totals
    item_totals = calculate_item_totals(product, item.item_qty)

    # Create quote item
    new_item = QuoteItem(
        quote_id=int(quote_id),
        product_id=int(item.product_id),
        item_name=product.product_name,
        item_qty=item.item_qty,
        sku=product.sku,
        item_price=item_totals['item_price'],
        item_discount=item_totals['item_discount'],
        item_tax=item_totals['item_tax'],
        tax_percentage=item_totals['tax_percentage']
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    # Update quote totals
    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if quote:
        # Calculate the impact of this new item
        item_total_price = item_totals['item_price'] * item.item_qty

        quote.total_price += item_total_price
        quote.discount += item_totals['item_discount']
        quote.total_tax += item_totals['item_tax']
        quote.items_count += 1
        quote.items_quantity += item.item_qty

        db.commit()
        db.refresh(quote)

    return new_item


def remove_quote_item(db: Session, quote_id: int, item_id: int):
    item = db.query(QuoteItem).filter(QuoteItem.item_id == item_id, QuoteItem.quote_id == quote_id).first()
    if item:
        # Store values before deletion for quote update
        item_total_price = item.item_price * item.item_qty

        # Update quote totals BEFORE deleting the item
        quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
        if quote:
            quote.total_price -= item_total_price
            quote.discount -= item.item_discount
            quote.total_tax -= item.item_tax
            quote.items_count -= 1
            quote.items_quantity -= item.item_qty

        # Now delete the item
        db.delete(item)
        db.commit()
        return True
    return False

"""
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
    return False"""


def add_quote_address(db: Session, quote_id: int, address: QuoteAddressCreate):
    new_address = QuoteAddress(quote_id=quote_id, **address.dict())
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address


def get_quote_addresses(db: Session, quote_id: int):
    return db.query(QuoteAddress).filter(QuoteAddress.quote_id == quote_id).all()


def update_quote_item_quantity(db: Session, quote_id: int, item_id: int, new_qty: int):
    """Update only the quantity of a quote item and adjust quote totals"""
    # Find the specific item
    item = db.query(QuoteItem).filter(
        QuoteItem.item_id == item_id,
        QuoteItem.quote_id == quote_id
    ).first()

    if not item:
        return None

    # Store old values for calculation
    old_qty = item.item_qty
    old_total_price = item.item_price * old_qty
    old_discount = item.item_discount
    old_tax = item.item_tax

    # Update only the quantity
    item.item_qty = new_qty

    # Recalculate item-level totals based on new quantity
    item.item_discount = (old_discount / old_qty) * new_qty if old_qty > 0 else 0
    item.item_tax = (old_tax / old_qty) * new_qty if old_qty > 0 else 0

    # Update quote totals
    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if quote:
        new_total_price = item.item_price * new_qty
        new_discount = item.item_discount
        new_tax = item.item_tax

        # Calculate differences
        price_diff = new_total_price - old_total_price
        discount_diff = new_discount - old_discount
        tax_diff = new_tax - old_tax
        qty_diff = new_qty - old_qty

        # Update quote totals
        quote.total_price += price_diff
        quote.discount += discount_diff
        quote.total_tax += tax_diff
        quote.items_quantity += qty_diff

    db.commit()
    db.refresh(item)
    return item

############################

# def update_order_address(db: Session, address_id: int, address_data: OrderAddressUpdate):
#     db_address = db.query(OrderAddress).filter(OrderAddress.address_id == address_id).first()
#     if not db_address:
#         return None

#     db_address.address_type = address_data.address_type
#     db_address.street_address = address_data.street_address
#     db_address.postal_code = address_data.postal_code
#     db_address.city = address_data.city
#     db_address.state = address_data.state
#     db_address.phone_no = address_data.phone_no
#     db_address.first_name = address_data.fast_name
#     db_address.last_name = address_data.last_name
    

    # db.commit()
    # db.refresh(db_address)
    # return db_address





