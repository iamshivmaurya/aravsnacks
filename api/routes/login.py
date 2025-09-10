from fastapi import FastAPI, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
import random
from datetime import datetime, timedelta
from pydantic import BaseModel
from model import Customer, OTP
from database import get_db, Base, engine
from schema import SignupRequest, LoginRequest, OTPVerifyRequest, CustomerUpdate
from jose import jwt
import os
from dotenv import load_dotenv

router = APIRouter()

load_dotenv()

# JWT
SECRET_KEY = "ABC123"
ALGORITHM = "HS256"


def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def generate_otp():
    return str(random.randint(1000, 9999))


@router.post("/signup")
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    # Validate phone number
    if not request.phone or len(request.phone) != 10 or not request.phone.isdigit():
        raise HTTPException(status_code=400, detail="Valid 10-digit phone number required")

    # Check if customer already exists
    existing_customer = db.query(Customer).filter(Customer.phone == request.phone).first()

    if existing_customer:
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered. Please login to get OTP."
        )

    # Create new customer record with ONLY phone number and empty strings for required fields
    new_customer = Customer(
        phone=request.phone,
        customer_name=None,  # Empty string instead of None
        email=None,          # Empty string instead of None
        password_hash=None,  # Empty string instead of None
        first_name=None,     # Empty string instead of None
        last_name=None,      # Empty string instead of None
        is_verified=False,
        is_active=True
    )
    db.add(new_customer)

    # Generate and store OTP
    otp = generate_otp()
    otp_record = OTP(
        otp=otp,
        phone=request.phone,
        created_at=datetime.now()
    )
    db.add(otp_record)

    db.commit()

    return {
        "message": "OTP sent successfully",
        "otp": otp,
        "customer_id": new_customer.customer_id
    }


@router.post("/verify-otp")
async def verify_otp(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    # Validate input
    if not request.phone or len(request.phone) != 10 or not request.phone.isdigit():
        raise HTTPException(status_code=400, detail="Valid 10-digit phone number required")
    if not request.otp or len(request.otp) != 4 or not request.otp.isdigit():
        raise HTTPException(status_code=400, detail="Valid 4-digit OTP required")

    # Find the most recent OTP for this phone
    otp_record = db.query(OTP).filter(
        OTP.phone == request.phone,
        OTP.created_at >= datetime.now() - timedelta(minutes=5)
    ).order_by(OTP.created_at.desc()).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="OTP expired or not found")

    if otp_record.otp != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # Mark customer as verified
    customer = db.query(Customer).filter(Customer.phone == request.phone).first()
    if customer:
        customer.is_verified = True
        customer.last_login = datetime.now()
        db.commit()

        # Create JWT token
        token_data = {
            "phone": request.phone, 
            "customer_id": customer.customer_id, 
            "first_name": customer.first_name,
            "last_name": customer.last_name
            }
        access_token = create_access_token(token_data)

        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "customer_id": customer.customer_id
        }

    raise HTTPException(status_code=400, detail="Verification failed")


@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Validate phone number
    if not request.phone or len(request.phone) != 10 or not request.phone.isdigit():
        raise HTTPException(status_code=400, detail="Valid 10-digit phone number required")

    # Check if customer exists
    customer = db.query(Customer).filter(Customer.phone == request.phone).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found. Please sign up first")

    # Generate and store OTP
    otp = generate_otp()
    otp_record = OTP(
        otp=otp,
        phone=request.phone,
        created_at=datetime.now()
    )
    db.add(otp_record)
    db.commit()

    return {
        "message": "OTP sent successfully",
        "otp": otp,  # In production, send via SMS instead
        "customer_id": customer.customer_id
    }



# Create database tables
Base.metadata.create_all(bind=engine)