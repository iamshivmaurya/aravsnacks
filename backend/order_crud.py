from sqlalchemy.orm import Session, joinedload
from model import Order, OrderItem, OrderAddress, Quote, QuoteItem, Customer,QuoteAddress
from schema import OrderCreate, OrderItemCreate, OrderAddressCreate, PlaceOrderRequest
from typing import List
from datetime import datetime
from decimal import Decimal



#############################

def create_order(db: Session, order: OrderCreate):
    new_order = Order(**order.dict())
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

def get_order_by_customer_and_quote(db: Session, customer_id: int, quote_id: int):  ###31-09-25
    return db.query(Order).filter(
        Order.customer_id == customer_id,
        Order.order_id == order_id
    ).first()
#############################################
def get_order(db: Session, order_id: int):
    return db.query(Order).options(
        joinedload(Order.items),  # Eager load order items
        joinedload(Order.addresses)  # Eager load order addresses
    ).filter(Order.order_id == order_id).first()

"""def get_quote(db: Session, quote_id: int):
    return db.query(Quote).filter(Quote.quote_id == quote_id).first()"""


def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Order).offset(skip).limit(limit).all()


def update_order(db: Session, order_id: int, order_data: dict):
    db_order = db.query(Order).filter(Order.order_id == order_id).first()
    if db_order:
        for key, value in order_data.items():
            setattr(db_order, key, value)
        db.commit()
        db.refresh(db_order)
    return db_order


def delete_order(db: Session, order_id: int):
    db_order = db.query(Order).filter(Order.order_id == order_id).first()
    if db_order:
        db.delete(db_order)
        db.commit()
        return True
    return False



def place_order(db: Session, order_data: PlaceOrderRequest):
    """
    Create a complete order from customer ID and quote ID with all required details
    """

    # 1. Validate Customer
    customer = db.query(Customer).filter(Customer.customer_id == order_data.customer_id).first()
    if not customer:
        raise ValueError("Customer not found. Please sign up first.")

    # 2. Validate Quote
    quote = db.query(Quote).filter(Quote.quote_id == order_data.quote_id).first()
    if not quote:
        raise ValueError("Quote not found")

    # Attach customer info to quote
    quote.customer_id = order_data.customer_id
    quote.email_id = customer.email

    if not quote.items:
        raise ValueError("Cannot place order: Quote has no items")

    # 3. Calculate totals
    subtotal = Decimal(quote.subtotal or 0)
    discount = Decimal(quote.discount or 0)
    tax = Decimal(quote.total_tax or 0)
    grand_total = subtotal - discount + tax

    # 4. Generate next order number
    last_order = db.query(Order).order_by(Order.order_id.desc()).first()
    if last_order:
        next_order_num = f"AS{last_order.order_id + 1:05d}"  # e.g., AS00001
    else:
        next_order_num = "AS00001"

    # 5. Create new Order
    new_order = Order(
        customer_id=order_data.customer_id,
        customer_email=customer.email,
        sub_total=subtotal,
        discount_amount=discount,
        total_tax_amount=tax,
        grand_total=grand_total,
        order_date=datetime.now(),
        payment_method=order_data.payment_method,
        shipping_method=order_data.shipping_method,
        cust_order_num=next_order_num
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # 6. Transfer Quote Items → Order Items
    quote_items = db.query(QuoteItem).filter(QuoteItem.quote_id == order_data.quote_id).all()
    for quote_item in quote_items:
        order_item = OrderItem(
            order_id=new_order.order_id,
            product_id=quote_item.product_id,
            sku=quote_item.sku,
            quantity=quote_item.item_qty,
            unit_price=Decimal(quote_item.item_price or 0),
            discount_amount=Decimal(quote_item.item_discount or 0),
            total_price=Decimal(quote_item.item_price or 0) * quote_item.item_qty,
            tax_percentage=Decimal(quote_item.tax_percentage or 0),
            tax_amount=Decimal(quote_item.item_tax or 0),
        )
        db.add(order_item)

    # 7. Transfer Addresses (if any exist)
    quote_addresses = db.query(QuoteAddress).filter(QuoteAddress.quote_id == order_data.quote_id).all()

    if quote_addresses:
        for qa in quote_addresses:
            order_address = OrderAddress(
                order_id=new_order.order_id,
                address_type=qa.address_type,
                street_address=qa.street_address,
                postal_code=qa.postal_code,
                city=qa.city,
                state=qa.state,
                phone_no=qa.phone_no,
                first_name=qa.first_name,
                last_name=qa.last_name
            )
            db.add(order_address)

    # 8. Mark Quote as inactive (closed)
    quote.is_active = False

    db.commit()
    db.refresh(new_order)

    # 9. Return order info
    return {
        "order_id": new_order.order_id,
        "cust_order_num": new_order.cust_order_num,
        "grand_total": str(new_order.grand_total)
    }

def add_order_item(db: Session, order_id: int, item: OrderItemCreate):
    # Calculate total price
    total_price = (item.unit_price * item.quantity) - item.discount_amount
    tax_amount = total_price * (item.tax_percentage / 100)
    final_total = total_price + tax_amount

    new_item = OrderItem(
        order_id=order_id,
        product_id=item.product_id,
        sku=item.sku,
        quantity=item.quantity,
        unit_price=item.unit_price,
        discount_amount=item.discount_amount,
        total_price=final_total,
        tax_percentage=item.tax_percentage,
        tax_amount=tax_amount
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


def add_order_address(db: Session, order_id: int, address: OrderAddressCreate):
    new_address = OrderAddress(order_id=order_id, **address.dict())
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address


def get_order_items(db: Session, order_id: int):
    return db.query(OrderItem).filter(OrderItem.order_id == order_id).all()


def get_order_addresses(db: Session, order_id: int):
    return db.query(OrderAddress).filter(OrderAddress.order_id == order_id).all()