from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import OrderCreate, OrderItemCreate, OrderAddressCreate, OrderResponse,OrderFromQuoteCreate
from order_crud import create_order, get_order, get_orders, delete_order, convert_quote_to_order, add_order_item, add_order_address, get_order_by_customer_and_quote
from typing import List

router = APIRouter()



@router.get("/get_orders1/{customer_id}/{order_id}", response_model=OrderResponse)  ##################
def get_order_by_customer_and_quote(customer_id: int, order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(
        Order.customer_id == customer_id,
        Order.order_id == order_id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found for this customer and quote")

    return {
        "order_id": order.order_id,
        "customer_id": order.customer_id,
        "quote_id": order.quote_id,
        "grand_total": order.grand_total,
        "order_date": order.order_date,
        "payment_method": order.payment_method,
        "shipping_method": order.shipping_method
    }








# Order CRUD Operations
@router.post("/orders", response_model=OrderResponse)
def create_order_route(order: OrderCreate, db: Session = Depends(get_db)):
    try:
        db_order = create_order(db, order)
        return db_order
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# @router.get("/orders/{order_id}", response_model=OrderResponse)
# def get_order_route(order_id: int, db: Session = Depends(get_db)):
#     db_order = get_order(db, order_id)
#     if not db_order:
#         raise HTTPException(status_code=404, detail="Order not found")
#     return db_order

@router.get("/orders", response_model=List[OrderResponse])
def get_orders_route(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = get_orders(db, skip=skip, limit=limit)
    return orders

@router.delete("/orders/{order_id}")
def delete_order_route(order_id: int, db: Session = Depends(get_db)):
    success = delete_order(db, order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}

@router.post("/quotes/{quote_id}/convert-to-order")
def convert_quote_to_order_route(quote_id: int, db: Session = Depends(get_db)):
    try:
        db_order = convert_quote_to_order(db, quote_id)
        return {"message": "Order created successfully from quote", "order_id": db_order.order_id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/orders/{order_id}/items")     #############
def add_order_item_route(order_id: int, item: OrderItemCreate, db: Session = Depends(get_db)):
    try:
        db_item = add_order_item(db, order_id, item)
        return {"message": "Item added to order successfully", "item_id": db_item.order_item_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/orders/{order_id}/addresses")
def add_order_address_route(order_id: int, address: OrderAddressCreate, db: Session = Depends(get_db)):
    try:
        db_address = add_order_address(db, order_id, address)
        return {"message": "Address added to order successfully", "address_id": db_address.order_address_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")