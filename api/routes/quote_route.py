from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import (
    QuoteCreateResponse,
    QuoteItemCreate,
    QuoteItemResponse,
    QuoteItemQuantityUpdate,
    QuoteResponse,
    QuoteAddressesCreate  # NEW SCHEMA
)
from quote_crud import (
    create_quote,
    get_quote_with_items,
    update_quote_item_quantity,
    get_all_quotes,
    delete_quote,
    add_quote_item,
    remove_quote_item,
    add_quote_addresses,  # NEW FUNCTION (plural)
    get_quote_addresses
)
from typing import List
from dependencies import get_customer_id_from_token, resolve_quote_id_by_uid
from model import Quote

router = APIRouter()


# ============================================
# QUOTE CRUD OPERATIONS
# ============================================

@router.post("/create_quotes", response_model=QuoteCreateResponse)
def create_quote_route(
        db: Session = Depends(get_db),
        customer_id: int = Depends(get_customer_id_from_token)
):
    """
    Create a new quote (shopping cart)
    - Logged-in customers: linked to customer_id
    - Guest users: creates anonymous cart
    """
    try:
        db_quote = create_quote(db, customer_id)
        return {
            "quote_uid": db_quote.quote_uid,
            "message": "Quote created successfully",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error -> {e}")


@router.get("/quotes/{quote_uid}", response_model=QuoteResponse)
def get_quote_route(
        quote_id: int = Depends(resolve_quote_id_by_uid),
        db: Session = Depends(get_db)
):
    """
    Get a single quote with all items
    """
    db_quote = get_quote_with_items(db, quote_id)
    if not db_quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return db_quote


@router.get("/quotes", response_model=List[QuoteResponse])
def get_all_quotes_route(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    """
    Get list of all quotes (admin/listing)
    """
    quotes = get_all_quotes(db, skip=skip, limit=limit)
    return quotes


@router.delete("/quotes/{quote_uid}")
def delete_quote_route(
        quote_id: int = Depends(resolve_quote_id_by_uid),
        db: Session = Depends(get_db)
):
    """
    Delete a quote
    """
    success = delete_quote(db, quote_id)
    if not success:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"message": "Quote deleted successfully"}


# ============================================
# QUOTE ITEM OPERATIONS
# ============================================

@router.post("/quotes/{quote_uid}/add_items")
def add_quote_item_route(
        item: QuoteItemCreate,
        quote_id: int = Depends(resolve_quote_id_by_uid),
        db: Session = Depends(get_db)
):
    """
    Add item to quote (shopping cart)
    """
    try:
        db_item = add_quote_item(db, quote_id, item)
        return {
            "message": "Item added to quote successfully",
            "item_id": db_item.item_id
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error -> {str(e)}")


@router.delete("/quotes/{quote_uid}/items/{item_id}")
def remove_quote_item_route(
        item_id: int,
        quote_id: int = Depends(resolve_quote_id_by_uid),
        db: Session = Depends(get_db)
):
    """
    Remove item from quote
    """
    success = remove_quote_item(db, quote_id, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found in quote")
    return {"message": "Item removed from quote successfully"}


@router.put("/quotes/{quote_uid}/items/{item_id}/quantity")
def update_item_quantity_route(
        item_id: int,
        quantity_data: QuoteItemQuantityUpdate,
        quote_id: int = Depends(resolve_quote_id_by_uid),
        db: Session = Depends(get_db)
):
    """
    Update item quantity in quote
    - Quantity 0 = remove item
    """
    try:
        new_qty = quantity_data.item_qty

        if new_qty < 0:
            raise HTTPException(status_code=400, detail="Quantity must be at least 1")

        db_item = update_quote_item_quantity(db, quote_id, item_id, new_qty)

        if not db_item:
            raise HTTPException(status_code=404, detail="Quote item not found")

        return db_item

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# ============================================
# QUOTE ADDRESS OPERATIONS (DUAL ADDRESS SYSTEM)
# ============================================

@router.post("/quotes/{quote_uid}/addresses")
def add_quote_addresses_route(
        addresses: QuoteAddressesCreate,  # NEW DUAL ADDRESS FORMAT
        quote_id: int = Depends(resolve_quote_id_by_uid),
        customer_id: int = Depends(get_customer_id_from_token),
        db: Session = Depends(get_db)
):
    """
    Add/update BOTH shipping and billing addresses for a quote

    Request Format:
    {
      "shipping_address": {
        "street_address": "123 Main St",
        "postal_code": "122001",
        "city": "Gurgaon",
        "state": "Haryana",
        "phone_no": "9988776655",
        "first_name": "Shiv",
        "last_name": "Kr"
      },
      "billing_address": { ... },  // Optional
      "use_same_for_billing": true  // Auto-copy shipping to billing
    }
    """
    try:
        # Get customer_id from quote if not provided in token
        if not customer_id:
            quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
            customer_id = quote.customer_id if quote else None

        # Use the NEW dual-address function
        result = add_quote_addresses(db, quote_id, addresses, customer_id)

        return {
            "message": "Addresses updated successfully",
            "shipping_address_id": result['shipping_address'].quote_address_id,
            "billing_address_id": result['billing_address'].quote_address_id,
            "addresses": {
                "shipping": result['shipping_address'],
                "billing": result['billing_address']
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/quotes/{quote_uid}/addresses")
def get_quote_addresses_route(
        quote_id: int = Depends(resolve_quote_id_by_uid),
        db: Session = Depends(get_db)
):
    """
    Get both shipping and billing addresses for a quote

    Returns: {
      "shipping": {address_data},
      "billing": {address_data}
    }
    """
    addresses = get_quote_addresses(db, quote_id)
    return addresses


# ============================================
# CUSTOMER-QUOTE OPERATIONS
# ============================================

@router.get("/customer/active-quote")
def get_active_quote(
        customer_id: int = Depends(get_customer_id_from_token),
        db: Session = Depends(get_db)
):
    """
    Get customer's active (open) shopping cart
    """
    if not customer_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    active_quote = db.query(Quote).filter(
        Quote.customer_id == customer_id,
        Quote.is_active == 1
    ).first()

    if not active_quote:
        return {"quote_uid": None}

    return {"quote_uid": active_quote.quote_uid}


@router.put("/quote/assign")
def assign_quote_to_customer(
        quote_id: int = Depends(resolve_quote_id_by_uid),
        customer_id: int = Depends(get_customer_id_from_token),
        db: Session = Depends(get_db)
):
    """
    Assign guest quote to logged-in customer
    (Merge guest cart with customer account)
    """
    if not customer_id:
        return {"error": "Login required"}

    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if not quote:
        return {"error": "Quote not found"}

    # Map the guest cart to this customer
    quote.customer_id = customer_id
    db.commit()

    return {
        "message": "Quote assigned",
        "quote_id": quote.quote_id,
        "customer_id": customer_id
    }