from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional
# schema.py (add this)



########################                                   Login                          #########################

# Request schemas
class CustomerCreate(BaseModel):
    customer_name: str
    email: EmailStr
    password: str  # Will be hashed
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

class CustomerUpdate(BaseModel):
    customer_name: Optional[str] = None
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class CustomerLogin(BaseModel):
    email: EmailStr
    password: str

# Response schemas
class CustomerResponse(BaseModel):
    customer_id: int
    customer_name: str
    email: EmailStr
    first_name: Optional[str]
    last_name: Optional[str]
    phone: Optional[str]
    registor_on: datetime
    last_login: Optional[datetime]
    is_active: bool

    class Config:
        from_attributes = True

class CustomerWithToken(CustomerResponse):
    access_token: str

class SignupRequest(BaseModel):
    phone: Optional[str] = None
    #email: Optional[EmailStr] = None

class OTPVerifyRequest(BaseModel):
    otp: str
    phone: Optional[str] = None
    #email: Optional[str] = None

class LoginRequest(BaseModel):

    phone: Optional[str] = None
    #first_name: Optional[str] = None  # Required only for new users
    #last_name: Optional[str] = None   # Required only for new users
    #password: str
    #email: Optional[str] = None


########################                         Categories                       #########################



class CreateCategories(BaseModel):
    category_name: str
    description: str
    is_active: bool

    class Config:
        orm_mode = True



########################                          Product                              #########################





# Add these to your schema.py
class CreateProduct(BaseModel):
    product_name: str
    category_id: int
    description: str
    is_active: Optional[bool] = True

    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    id: int
    product_name: str
    category_id: int
    description: str
    is_active: bool
    product_created: datetime

    class Config:
        from_attributes = True





    #products_discount : Optional[int] = None
    #percentage_discount : Optional[float] = None
    #discount_start_date : datetime = None
    #discount_end_date : datetime = None
    #product_left : Optional[int] = None
    #weight_grams : Optional[float] = None
    #product_price : Optional[float] = None
    #Country_origen : Optional[str] = None
    #product_exp : datetime = None
    #sort_order: float = 0.0
    #meta_keyword: Optional[str] = None
    #meta_title: Optional[str] = None
    #meta_description: Optional[str] = None  # Spelling corrected
    #tax_percentage: Optional[int] = None    # Spelling corrected
    #sku: Optional[str] = None
