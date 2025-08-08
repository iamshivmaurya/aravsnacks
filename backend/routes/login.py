from fastapi import APIRouter, HTTPException
import random
from schema import PhoneNumber,OTPVerify


router = APIRouter()

otp_storage = {}

def generate_otp():
    return str(random.randint(1000, 9999))

@router.post("/signup/")
async def signup(phone_data: PhoneNumber):
    if len(phone_data.phone) != 10 or not phone_data.phone.isdigit():
        raise HTTPException(status_code=400, detail="Phone number must be 10 digits")

    otp = generate_otp()
    otp_storage[phone_data.phone] = otp  # Store OTP (in memory)

    # In a real app, send OTP via SMS (e.g., Twilio)
    print(f"OTP for {phone_data.phone}: {otp}")  # For testing

    return {"message": "OTP sent successfully", "otp": otp}  # Return OTP for testing

@router.post("/verify-otp/")
async def verify_otp(otp_data: OTPVerify):
    stored_otp = otp_storage.get(otp_data.phone)

    if not stored_otp:
        raise HTTPException(status_code=400, detail="Phone number not found")
    if stored_otp != otp_data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")


    del otp_storage[otp_data.phone]

    return {"message": "Login successful!"}
