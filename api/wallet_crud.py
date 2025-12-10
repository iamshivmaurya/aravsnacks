from sqlalchemy.orm import Session
from model import Wallet, WalletTransaction


def get_wallet(db: Session, customer_id: int):
    return db.query(Wallet).filter(Wallet.customer_id == customer_id).first()


def create_wallet(db: Session, customer_id: int):
    wallet = Wallet(customer_id=customer_id, balance=0)
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    return wallet


def add_wallet_transaction(db: Session, data, wallet):
    balance_before = float(wallet.balance)

    if data.type == "credit":
        balance_after = balance_before + data.amount
    elif data.type == "debit":
        if balance_before < data.amount:
            raise Exception("Insufficient balance")
        balance_after = balance_before - data.amount
    else:
        raise Exception("Invalid type")

    wallet.balance = balance_after
    db.add(wallet)

    transaction = WalletTransaction(
        wallet_id=wallet.wallet_id,
        customer_id=data.customer_id,
        type=data.type,
        amount=data.amount,
        balance_before=balance_before,
        balance_after=balance_after,
        reference_id=data.reference_id,
        description=data.description,
        transaction_mode=data.transaction_mode
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction
