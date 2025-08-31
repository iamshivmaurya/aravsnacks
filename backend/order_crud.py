from sqlalchemy.orm import Session
from model import Order, OrderItem, OrderAddress, Quote, QuoteItem, Customer,QuoteAddress
from schema import OrderCreate, OrderItemCreate, OrderAddressCreate, PlaceOrderRequest
from typing import List
from datetime import datetime


def create_order(db: Session, order: OrderCreate):
    new_order = Order(**order.dict())
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order


def get_order(db: Session, order_id: int):
    return db.query(Order).filter(Order.order_id == order_id).first()


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
    # Check if customer exists
    customer = db.query(Customer).filter(Customer.customer_id == order_data.customer_id).first()
    if not customer:
        raise ValueError("Customer not found. Please sign up first.")

    # Check if quote exists
    quote = db.query(Quote).filter(Quote.quote_id == order_data.quote_id).first()
    if not quote:
        raise ValueError("Quote not found")

    # Update the quote with customer_id
    quote.customer_id = order_data.customer_id
    quote.email_id = customer.email

    if not quote.items:
        raise ValueError("Cannot place order: Quote has no items")

    # Calculate grand total
    grand_total = quote.total_price - quote.discount + (quote.total_tax or 0)

    # Create a new order
    new_order = Order(
        customer_id=order_data.customer_id,
        customer_email=customer.email,
        sub_total=quote.total_price,
        discount_amount=quote.discount,
        total_tax_amount=quote.total_tax,
        grand_total=grand_total,
        order_date=datetime.now(),
        payment_method=order_data.payment_method,
        shipping_method=order_data.shipping_method
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Add order items from quote items (AUTO TRANSFER)
    quote_items = db.query(QuoteItem).filter(QuoteItem.quote_id == order_data.quote_id).all()
    for quote_item in quote_items:
        order_item = OrderItem(
            order_id=new_order.order_id,
            product_id=quote_item.product_id,
            sku=quote_item.sku,
            quantity=quote_item.item_qty,
            unit_price=quote_item.item_price,
            discount_amount=quote_item.item_discount,
            total_price=quote_item.item_price * quote_item.item_qty,
            tax_percentage=quote_item.tax_percentage,
            tax_amount=quote_item.item_tax
        )
        db.add(order_item)

    # AUTO TRANSFER: Add order addresses from quote addresses (if any exist)
    quote_addresses = db.query(QuoteAddress).filter(QuoteAddress.quote_id == order_data.quote_id).all()
    addresses_transferred = False

    if quote_addresses:
        addresses_transferred = True
        for quote_address in quote_addresses:
            order_address = OrderAddress(
                order_id=new_order.order_id,
                address_type=quote_address.address_type,
                street_address=quote_address.street_address,
                postal_code=quote_address.postal_code,
                city=quote_address.city,
                state=quote_address.state,
                phone_no=quote_address.phone_no,
                fast_name=quote_address.fast_name,
                last_name=quote_address.last_name
            )
            db.add(order_address)

    # Deactivate the quote
    quote.is_active = False

    db.commit()

    # Return both order and address status
    return {
        "order": new_order,
        "addresses_transferred": addresses_transferred,
        "addresses_count": len(quote_addresses) if quote_addresses else 0
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