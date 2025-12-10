from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import ReviewCreate, ReviewUpdate, ReviewResponse, ReviewStatsResponse
from review_crud import create_review, get_review, get_product_reviews, get_review_stats, update_review, delete_review, get_customer_reviews
from typing import List
from .login import get_current_customer  # Import from where you defined it
from model import WalletTransaction,Customer,Wallet


router = APIRouter()


from schema import (
    WalletCreate,
    WalletResponse,
    TransactionCreate,
    TransactionResponse,
)
from wallet_crud import (
    get_wallet,
    create_wallet,
    add_wallet_transaction,
)




@router.post("/create", response_model=WalletResponse)
def wallet_create(data: WalletCreate, db: Session = Depends(get_db)):
    # Check if customer exists
    customer = db.query(Customer).filter(Customer.customer_id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Check if this customer already has a wallet
    wallet = db.query(Wallet).filter(Wallet.customer_id == data.customer_id).first()
    if wallet:
        raise HTTPException(status_code=400, detail="Wallet already exists for this customer")

    # Create wallet
    new_wallet = Wallet(customer_id=data.customer_id, balance=0)
    db.add(new_wallet)
    db.commit()
    db.refresh(new_wallet)

    return new_wallet





@router.post("/transaction", response_model=TransactionResponse)
def wallet_transaction(data: TransactionCreate, db: Session = Depends(get_db)):
    wallet = get_wallet(db, data.customer_id)

    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    try:
        return add_wallet_transaction(db, data, wallet)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{customer_id}", response_model=WalletResponse)
def wallet_details(customer_id: int, db: Session = Depends(get_db)):
    wallet = get_wallet(db, customer_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    return wallet


@router.get("/transactions/{customer_id}")
def wallet_history(customer_id: int, db: Session = Depends(get_db)):
    return (
        db.query(WalletTransaction)
        .filter(WalletTransaction.customer_id == customer_id)
        .order_by(WalletTransaction.created_at.desc())
        .all()
    )

