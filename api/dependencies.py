import os
from typing import Optional
from fastapi import Depends, HTTPException, Header, Query, Depends, Path
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from model import Customer, Quote
from database import SessionLocal, get_db
from sqlalchemy.orm import Session

# Load secrets from environment
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

security = HTTPBearer()


def get_current_customer(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        customer_id = payload.get("customer_id")
        db = SessionLocal()
        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=401, detail="Invalid token")
        return customer
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_customer_id_from_token(authorization: Optional[str] = Header(None)) -> Optional[int]:
    """
    Extracts customer_id from Bearer token in Authorization header.
    Returns None if token not provided or invalid.
    """
    if not authorization:
        return None  # ✅ No token → return None

    if not authorization.startswith("Bearer "):
        return None  # ✅ Wrong format → treat as no token

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        customer_id: str = payload.get("customer_id")
        return int(customer_id) if customer_id else None
    except JWTError:
        return None  # ✅ Invalid/expired → return None


def resolve_quote_id_by_uid(
    quote_uid: str = Path(...),  # Path parameter
    db: Session = Depends(get_db)
) -> int:
    """Resolve quote_uid to quote_id"""
    quote = db.query(Quote).filter(Quote.quote_uid == quote_uid).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return quote.quote_id
