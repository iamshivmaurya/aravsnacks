from pydantic import BaseModel

class PhoneNumber(BaseModel):
    phone: str


class OTPVerify(BaseModel):
    otp: str
    phone: str