from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import QuoteCreateResponse, QuoteItemCreate, QuoteAddressCreate, QuoteResponse
# Update this import
from quote_crud import create_quote,get_quote_with_items, update_quote_item_quantity, get_all_quotes, delete_quote, add_quote_item, remove_quote_item, add_quote_address, get_quote_addresses
from typing import List
from schema import QuoteItemQuantityUpdate,QuoteItemResponse # Make sure this import exists
from dependencies import get_customer_id_from_token, resolve_quote_id_by_uid
from model import Quote
router = APIRouter()


# Quote CRUD Operations
@router.post("/create_quotes", response_model=QuoteCreateResponse)
def create_quote_route(db: Session = Depends(get_db), customer_id: int = Depends(get_customer_id_from_token)):
    try:
        db_quote = create_quote(db, customer_id)
        return {
            "quote_uid": db_quote.quote_uid,
            "message": "Quote created successfully",
            #"created_at": db_quote.created_at
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail= f"Internal server error -> {e}" )


# Single quote with items
@router.get("/quotes/{quote_uid}", response_model=QuoteResponse)
def get_quote_route(quote_id: int = Depends(resolve_quote_id_by_uid), db: Session = Depends(get_db)):
    db_quote = get_quote_with_items(db, quote_id)  # Use the correct function
    if not db_quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return db_quote

# All quotes list
@router.get("/quotes", response_model=List[QuoteResponse])
def get_all_quotes_route(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    quotes = get_all_quotes(db, skip=skip, limit=limit)  # Use the correct function
    return quotes

@router.delete("/quotes/{quote_uid}")
def delete_quote_route(quote_id: int = Depends(resolve_quote_id_by_uid), db: Session = Depends(get_db)):
    success = delete_quote(db, quote_id)
    if not success:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"message": "Quote deleted successfully"}

# Quote Item Operations
@router.post("/quotes/{quote_uid}/add_items")
def add_quote_item_route(item: QuoteItemCreate, quote_id: int = Depends(resolve_quote_id_by_uid), db: Session = Depends(get_db)):
    try:
        db_item = add_quote_item(db, quote_id, item)
        return {"message": "Item added to quote successfully", "item_id": db_item.item_id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail= f"Internal server error -> {str(e)}")

@router.delete("/quotes/{quote_uid}/items/{item_id}")
def remove_quote_item_route( item_id: int, quote_id: int = Depends(resolve_quote_id_by_uid), db: Session = Depends(get_db)):
    success = remove_quote_item(db, quote_id, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found in quote")
    return {"message": "Item removed from quote successfully"}

# Quote Address Operations
@router.post("/quotes/{quote_uid}/addresses")
def add_quote_address_route(address: QuoteAddressCreate, quote_id: int = Depends(resolve_quote_id_by_uid), db: Session = Depends(get_db)):
    try:
        db_address = add_quote_address(db, quote_id, address)
        return {"message": "Address added to quote successfully", "address_id": db_address.quote_address_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/quotes/{quote_uid}/addresses")
def get_quote_addresses_route(quote_id: int = Depends(resolve_quote_id_by_uid), db: Session = Depends(get_db)):
    addresses = get_quote_addresses(db, quote_id)
    return addresses


@router.put("/quotes/{quote_uid}/items/{item_id}/quantity")
def update_item_quantity_route(
        item_id: int,
        quantity_data: QuoteItemQuantityUpdate,
        quote_id: int = Depends(resolve_quote_id_by_uid),
        db: Session = Depends(get_db)
):
    try:
        # Now you can directly access the quantity
        new_qty = quantity_data.item_qty

        if new_qty < 0:
            raise HTTPException(status_code=400, detail="Quantity must be at least 1")

        # Your update logic here
        db_item = update_quote_item_quantity(db, quote_id, item_id, new_qty)

        if not db_item:
            raise HTTPException(status_code=404, detail="Quote item not found")

        return db_item

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/customer/active-quote")
def get_active_quote(customer_id: int = Depends(get_customer_id_from_token),
    db: Session = Depends(get_db)):

    if not customer_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    active_quote = db.query(Quote).filter(
        Quote.customer_id == customer_id,
        Quote.is_active == 1
    ).first()

    if not active_quote:
        return {"quote_uid": None}

    return {
        "quote_uid": active_quote.quote_uid
    }


@router.put("/quote/assign")
def assign_quote_to_customer(
    quote_id: int = Depends(resolve_quote_id_by_uid),
    customer_id: int = Depends(get_customer_id_from_token),
    db: Session = Depends(get_db)
):
    if not customer_id:
        return {"error": "Login required"}

    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if not quote:
        return {"error": "Quote not found"}

    # Map the guest cart to this customer
    quote.customer_id = customer_id
    db.commit()
    return {"message": "Quote assigned", "quote_id": quote.quote_id, "customer_id": customer_id}




