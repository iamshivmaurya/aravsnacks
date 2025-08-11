from pydantic import BaseModel, EmailStr
from typing import Optional

class SignupRequest(BaseModel):
    phone: Optional[str] = None
    #email: Optional[EmailStr] = None

class OTPVerifyRequest(BaseModel):
    otp: str
    phone: Optional[str] = None
    #email: Optional[str] = None

class LoginRequest(BaseModel):

    #first_name: Optional[str] = None  # Required only for new users
    #last_name: Optional[str] = None   # Required only for new users
    #password: str
    phone: Optional[str] = None
    #email: Optional[str] = None