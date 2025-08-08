from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random

app = FastAPI()

# Storage format: {"OTP": "phone_number"}
otp_storage = {}


class PhoneRequest(BaseModel):
    phone: str


class OTPVerify(BaseModel):  # Now only contains OTP
    otp: str


@app.post("/request-otp/")
async def request_otp(phone_data: PhoneRequest):
    otp = str(random.randint(100000, 999999))
    otp_storage[otp] = phone_data.phone  # Store as OTP:phone
    return {"message": "OTP sent", "otp": otp}  # Demo only


@app.post("/verify-otp/")
async def verify_otp(otp_data: OTPVerify):
    # Find which phone this OTP belongs to
    phone = otp_storage.get(otp_data.otp)

    if not phone:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # Cleanup
    del otp_storage[otp_data.otp]

    return {"message": f"Login successful for {phone}!"}