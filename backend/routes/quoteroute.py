from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import QuoteCreate, QuoteItemCreate, QuoteAddressCreate, QuoteResponse
from quote_crud import create_quote, get_quote, get_quotes, delete_quote, add_quote_item, remove_quote_item, add_quote_address, get_quote_addresses
from typing import List

router = APIRouter()

# Quote CRUD Operations
@router.post("/quotes", response_model=QuoteResponse)
def create_quote_route(quote: QuoteCreate, db: Session = Depends(get_db)):
    try:
        db_quote = create_quote(db, quote)
        return db_quote
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/quotes/{quote_id}", response_model=QuoteResponse)
def get_quote_route(quote_id: int, db: Session = Depends(get_db)):
    db_quote = get_quote(db, quote_id)
    if not db_quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return db_quote

@router.get("/quotes", response_model=List[QuoteResponse])
def get_quotes_route(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    quotes = get_quotes(db, skip=skip, limit=limit)
    return quotes

@router.delete("/quotes/{quote_id}")
def delete_quote_route(quote_id: int, db: Session = Depends(get_db)):
    success = delete_quote(db, quote_id)
    if not success:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"message": "Quote deleted successfully"}

# Quote Item Operations
@router.post("/quotes/{quote_id}/items")
def add_quote_item_route(quote_id: int, item: QuoteItemCreate, db: Session = Depends(get_db)):
    try:
        db_item = add_quote_item(db, quote_id, item)
        return {"message": "Item added to quote successfully", "item_id": db_item.item_id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/quotes/{quote_id}/items/{item_id}")
def remove_quote_item_route(quote_id: int, item_id: int, db: Session = Depends(get_db)):
    success = remove_quote_item(db, quote_id, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found in quote")
    return {"message": "Item removed from quote successfully"}

# Quote Address Operations
@router.post("/quotes/{quote_id}/addresses")
def add_quote_address_route(quote_id: int, address: QuoteAddressCreate, db: Session = Depends(get_db)):
    try:
        db_address = add_quote_address(db, quote_id, address)
        return {"message": "Address added to quote successfully", "address_id": db_address.quote_address_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/quotes/{quote_id}/addresses")
def get_quote_addresses_route(quote_id: int, db: Session = Depends(get_db)):
    addresses = get_quote_addresses(db, quote_id)
    return addresses