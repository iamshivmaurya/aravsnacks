from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import OrderCreate, OrderItemCreate, OrderAddressCreate, OrderResponse, PlaceOrderRequest, \
    PlaceOrderResponse
from order_crud import create_order, get_order, get_orders, delete_order, place_order, add_order_item, \
    add_order_address, get_order_items, get_order_addresses
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
    """Create a new order manually"""
    try:
        db_order = create_order(db, order)
        return db_order
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# @router.get("/orders/{order_id}", response_model=OrderResponse)
# def get_order_route(order_id: int, db: Session = Depends(get_db)):
#     db_order = get_order(db, order_id)
#     if not db_order:
#         raise HTTPException(status_code=404, detail="Order not found")
#     return db_order


@router.get("/orders", response_model=List[OrderResponse])
def get_orders_route(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get list of orders"""
    orders = get_orders(db, skip=skip, limit=limit)
    return orders


@router.delete("/orders/{order_id}")
def delete_order_route(order_id: int, db: Session = Depends(get_db)):
    """Delete an order"""
    success = delete_order(db, order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}
 

# Place Order from Quote
@router.post("/place-order", response_model=PlaceOrderResponse)
def place_order_route(
        order_data: PlaceOrderRequest,
        db: Session = Depends(get_db)
):
    """
    Convert a quote to a complete order
    Automatically transfers quote items and addresses to order
    """
    try:
        result = place_order(db, order_data)
        db_order = result["order"]
        addresses_transferred = result["addresses_transferred"]
        addresses_count = result["addresses_count"]

        response_message = "Order placed successfully"
        additional_message = None

        if not addresses_transferred:
            additional_message = "Please add shipping and billing addresses to your order"
        elif addresses_count == 1:
            additional_message = "Address transferred from quote. Please review and add billing address if needed"

        return {
            "order_id": db_order.order_id,
            "cust_order_num": db_order.cust_order_num,
            "message": response_message,
            "grand_total": db_order.grand_total,
            "addresses_transferred": addresses_transferred,
            "addresses_count": addresses_count,
            "additional_message": additional_message
        }

    except ValueError as e:
        if "Customer not found" in str(e):
            raise HTTPException(status_code=404, detail="Customer not found. Please sign up first.")
        elif "Quote not found" in str(e):
            raise HTTPException(status_code=404, detail="Quote not found")
        elif "no items" in str(e):
            raise HTTPException(status_code=400, detail="Cannot place empty order")
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Order Items Operations
@router.post("/orders/{order_id}/items")
def add_order_item_route(order_id: int, item: OrderItemCreate, db: Session = Depends(get_db)):
    """Add item to existing order"""
    try:
        db_item = add_order_item(db, order_id, item)
        return {"message": "Item added to order successfully", "item_id": db_item.order_item_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/orders/{order_id}/items")
def get_order_items_route(order_id: int, db: Session = Depends(get_db)):
    """Get all items for an order"""
    items = get_order_items(db, order_id)
    return items


# Order Address Operations
@router.post("/orders/{order_id}/addresses")
def add_order_address_route(order_id: int, address: OrderAddressCreate, db: Session = Depends(get_db)):
    """Add address to existing order"""
    try:
        db_address = add_order_address(db, order_id, address)
        return {"message": "Address added to order successfully", "address_id": db_address.order_address_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/orders/{order_id}/addresses")
def get_order_addresses_route(order_id: int, db: Session = Depends(get_db)):
    """Get all addresses for an order"""
    addresses = get_order_addresses(db, order_id)
    return addresses