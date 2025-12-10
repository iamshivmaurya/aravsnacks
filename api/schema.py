from datetime import datetime
from pydantic import BaseModel, EmailStr,Field
from typing import Optional, List , Dict
from datetime import datetime  #########################################
from typing import Literal

class AdminLoginResponse(BaseModel):
    message: str
    user_name: Optional[str] = None  # Make optional if not always needed
    user_type: Optional[str] = None  # Make optional if not always needed
    access_token: str  # Make sure this field exists
    token_type: str 
    
    class Config:
        from_attributes = True

class AdminLoginRequest(BaseModel):  #AdminLoginRequest
    user_name:str 
    password:str


class OrderFromQuoteCreate(BaseModel):
    customer_id: int
    quote_id: int


# Login Schemas
class SignupRequest(BaseModel):
    phone: Optional[str] = None

class OTPVerifyRequest(BaseModel):
    otp: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    phone: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class CustomerCreate(BaseModel):
    customer_id: Optional[int] = None  # Make customer_id optional
    customer_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: str  # Phone is required

class CustomerUpdate(BaseModel):
    customer_name: Optional[str] = None
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class CustomerResponse(BaseModel):
    customer_id: int
    customer_name: Optional[str] = None  # ✅ Make optional
    email: Optional[EmailStr] = None     # ✅ Make optional
    first_name: Optional[str] = None     # ✅ Make optional
    last_name: Optional[str] = None      # ✅ Make optional
    phone: Optional[str] = None          # ✅ Make optional
    registor_on: datetime
    last_login: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True

# Customer Address Schemas
class CustomerAddressCreate(BaseModel):
    address_type: str
    street_address: str
    postal_code: str
    city: str
    state: str
    first_name: str
    last_name: str
    phone_no: str

class CustomerAddressResponse(BaseModel):
    address_id: int
    customer_id: int
    address_type: str
    street_address: str
    postal_code: str
    city: str
    state: str
    first_name: str
    last_name: str
    phone_no: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Category Schemas
class CreateCategories(BaseModel):
    category_name: str
    description: str
    is_active: bool = True
    parent_id: Optional[int] = 0
    sort_order: Optional[float] = 0.0
    url_key: Optional[str] = None
    image_name: Optional[str] = None
    meta_keyword: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    category_path: Optional[str] = None
    level: Optional[str] = None

class CategoryResponse(BaseModel):
    category_id: int
    category_name: str
    description: str
    is_active: bool
    parent_id: int
    sort_order: float
    category_created: datetime
    url_key: Optional[str]
    image_name: Optional[str]
    meta_keyword: Optional[str]
    meta_title: Optional[str]
    meta_description: Optional[str]
    category_path: Optional[str]
    level: Optional[str]

    class Config:
        from_attributes = True

# Product Schemas
class CreateProduct(BaseModel):
    sku: Optional[str] = None
    name: str
    is_active: Optional[bool] = True
    product_price: Optional[float] = None
    special_price: Optional[float] = None
    special_price_start_date: Optional[datetime] = None
    special_price_end_date: Optional[datetime] = None
    tax_class_id: Optional[int]
    quantity: Optional[int] = None
    product_weight: Optional[float] = None
    description: str
    sort_order: Optional[float] = 0.0
    meta_keyword: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    image_url: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    sku: Optional[str]
    name: str
    is_active: bool
    product_price: Optional[float]
    special_price: Optional[float]
    special_price_start_date: Optional[datetime]
    special_price_end_date: Optional[datetime]
    tax_class_id: Optional[int]
    quantity: Optional[int]
    product_weight: Optional[float]
    description: str
    sort_order: Optional[float]
    meta_keyword: Optional[str]
    meta_title: Optional[str]
    meta_description: Optional[str]
    image_url: Optional[str]
    created_at: datetime


    class Config:
        from_attributes = True



class QuoteItemCreate(BaseModel):
    product_id: int
    item_qty: int = 1

class QuoteAddressBase(BaseModel):
    street_address: str
    postal_code: str
    city: str
    state: str
    phone_no: str
    first_name: str
    last_name: str

class QuoteAddressCreate(QuoteAddressBase):
    address_type: Literal['shipping', 'billing']  # Explicit type only

# 3. ADD THIS NEW SCHEMA for dual addresses:
class QuoteAddressesCreate(BaseModel):
    shipping_address: Optional[QuoteAddressBase] = None
    billing_address: Optional[QuoteAddressBase] = None
    use_same_for_billing: bool = True  # Auto-copy shipping to billing


# 4. OPTIONAL: Add response schema for structured address response
class QuoteAddressesResponse(BaseModel):
    shipping: Optional[QuoteAddressCreate] = None
    billing: Optional[QuoteAddressCreate] = None

    class Config:
        from_attributes = True


class QuoteCreateResponse(BaseModel):
    quote_uid: str
    message: str = "Quote created successfully"
    #created_at: datetime

    class Config:
        from_attributes = True


class QuoteItemQuantityUpdate(BaseModel):
    item_qty: int

    class Config:
        from_attributes = True


class QuoteItemResponse(BaseModel):   ###this response add
    item_id: int
    quote_id: int
    item_name: Optional[str] = None
    item_qty: int = 1
    product_id: int
    sku: str
    item_price: float = 0.0
    item_discount: float = 0.0
    item_tax: float = 0.0
    tax_percentage: float = 0.0
    created_at: datetime
    updated_at: datetime
    product_name: Optional[str] = None  # ← NEW
    row_total: Optional[float] = 0.0  # ← NEW

    class Config:
        from_attributes = True  # Allows ORM mode (formerly orm_mode)


class QuoteResponse(BaseModel):
    quote_id: int
    customer_id: Optional[int]
    coupon_code: Optional[str]
    email_id: Optional[str]
    phone_no: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    subtotal: float
    grand_total: float
    discount: float
    total_tax: int
    items_count: int
    items_quantity: int
    items: List[QuoteItemResponse] = []
    addresses: Optional[Dict[str, Optional[QuoteAddressCreate]]] = None  # NEW

    class Config:
        from_attributes = True


# Order Schemas
class OrderCreate(BaseModel):
    customer_id: Optional[int] = None
    customer_email: Optional[str] = None
    payment_method: str
    shipping_method: str


class OrderItemCreate(BaseModel):
    product_id: int
    sku: str  # ← ADD THIS REQUIRED FIELD
    quantity: int
    unit_price: float
    discount_amount: Optional[float] = 0.0
    tax_percentage: Optional[float] = 0.0

class OrderItemResponse(BaseModel):
    order_item_id: int
    order_id: int
    product_id: int
    sku: str
    quantity: int
    unit_price: float
    discount_amount: float = 0.0
    total_price: Optional[float] = None
    tax_percentage: float = 0.0
    tax_amount: float = 0.0
    product_name: Optional[str] = None  # ← NEW
    row_total: Optional[float] = 0.0  # ← NEW

    class Config:
        from_attributes = True  # Enables ORM mode

class OrderAddressCreate(BaseModel):
    address_type: str
    street_address: str
    postal_code: str
    city: str
    state: str
    phone_no: str
    first_name: str
    last_name: str


class OrderAddressUpdate(BaseModel):
    address_type: str
    street_address: str
    postal_code: str
    city: str
    state: str
    phone_no: str
    first_name: str
    last_name: str
    

class OrderAddressResponse(BaseModel):
    order_address_id: int
    order_id: int
    address_type: str
    street_address: str
    postal_code: str
    city: str
    state: str
    phone_no: str
    first_name: str
    last_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    
    order_id: int
    cust_order_num: Optional[str]= None
    customer_id: Optional[int]
    customer_email: Optional[str]
    order_date: datetime
    sub_total: float
    shipping_amount: float
    total_tax_amount: float
    discount_amount: float
    grand_total: float
    payment_method: str
    shipping_method: str
    items: List[OrderItemResponse] = []  # Add this
    addresses: List[OrderAddressResponse] = []  # Add this



    class Config:
        from_attributes = True

class PlaceOrderRequest(BaseModel):
    customer_id: str
    quote_uid: str
    payment_method: str
    shipping_method: str


class PlaceOrderResponse(BaseModel):
    order_id: int
    cust_order_num: str
    grand_total: str
    addresses_transferred: bool
    addresses_count: int
    message: str = "Order placed successfully"

    class Config:
        from_attributes = True



class DiscountOnPruduct(BaseModel):

    coupon_id:int 
    coupon_code :str
    valid_from: datetime
    valid_to: datetime
    discount_type: int
    is_avtive: Optional[bool] = True
    created_at: datetime
    updated_at: datetime
    coupon_rule: str
    coupon_discription :str
    class Config:
        from_attributes = True


class CouponCreate(BaseModel):
    
    valid_from: datetime
    discount_amount:int
    valid_to: datetime
    discount_type: str
    created_at: datetime
    updated_at: datetime
    coupon_rule: str
    coupon_code :str
    coupon_discription :str
    class Config:
        from_attributes = True




class CouponResponce(BaseModel):
    coupon_id:int 
    coupon_code :str
    valid_from: datetime
    valid_to: datetime  
    discount_amount :int
    discount_type: str

    class Config:
        from_attributes = True


class ApplyCouponRequest(BaseModel):
    coupon_code: str

class CancelCouponRequest(BaseModel):
    coupon_code: str

class QuoteItemResponseWithDiscount(BaseModel):
    item_id: int
    quote_id: int
    item_name: Optional[str] = None
    item_qty: int = 1
    product_id: int
    sku: str
    item_price: float = 0.0
    item_discount: float = 0.0
    item_tax: float = 0.0
    tax_percentage: float = 0.0
    created_at: datetime
    updated_at: datetime
    discount_amount: float = 0.0  # New field
    gross_total: float = 0.0  # New field

    class Config:
        from_attributes = True


class QuoteResponseWithDiscount(BaseModel):
    quote_id: int
    customer_id: Optional[int]
    email_id: Optional[str]
    phone_no: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    subtotal: float
    grand_total: float
    discount: float
    total_tax: int
    items_count: int
    items_quantity: int
    total_discount: float  # New field
    gross_total: float  # New field
    items: List[QuoteItemResponseWithDiscount] = []

    class Config:
        from_attributes = True

class TaxClassCreate(BaseModel):
    tax_class_name: str
    description: Optional[str] = None
    tax_percentage: float
    tax_type: str
    country_code: Optional[str] = None
    state_code: Optional[str] = None
    is_active: bool = True

class TaxClassResponse(BaseModel):
    tax_class_id: int
    tax_class_name: str
    description: Optional[str] = None
    tax_percentage: float
    tax_type: str
    country_code: Optional[str] = None
    state_code: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaxClassUpdate(BaseModel):
    tax_class_name: Optional[str] = None
    description: Optional[str] = None
    tax_percentage: Optional[float] = None
    tax_type: Optional[str] = None
    country_code: Optional[str] = None
    state_code: Optional[str] = None
    is_active: Optional[bool] = None


# Minimal schemas without any complex configurations
class ReviewCreate(BaseModel):
    product_id: int
    #customer_id: str
    rating: float
    comment: Optional[str] = None

class ReviewUpdate(BaseModel):
    rating: Optional[float] = None
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    review_id: int
    product_id: int
    customer_id: int
    rating: float
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewStatsResponse(BaseModel):
    product_id: int
    average_rating: float
    total_reviews: int

    ########################################################


class TrackingCreate(BaseModel):
    order_id: int
    warehouse_id: int

class TrackingStatusUpdate(BaseModel):
    status: str  # Order Packed, Order Shipped, On The Way, Order Arrived, Order Delivered

class TrackingStage(BaseModel):
    stage_name: str
    status: str  # completed, current, pending
    timestamp: Optional[datetime] = None
    display_time: Optional[str] = None

class TrackingResponse(BaseModel):
    tracking_id: int
    order_id: int
    customer_id: int
    warehouse_id: int
    warehouse_name: str
    destination_postal_code: str
    destination_city: str
    current_status: str
    estimated_delivery_time: Optional[datetime]
    stages: List[TrackingStage]
    distance_km: Optional[float]
    time_remaining: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True



### rajesh##


class AdminDashboard(BaseModel):
    order_id: int
    warehouse_id: int

############

# class RoleBaseCreate(BaseModel):
#     name: str = Field(..., min_length=1, max_length=50, description="Role name")
#     path: Optional[str] = None
#     # method: str = Field(..., min_length=1, max_length=100, description="HTTP methods")
#     # allowed: bool = Field(False, description="Access permission flag")

class RoleUpdate(BaseModel):
    name: str | None = None
    path: str | None = None
    method: str | None = None
    allowed: bool | None = None



class RoleResponse(BaseModel):
    name:str
    path:str
    method:str
    allowed:bool
    created_at: datetime
    updated_at: datetime
    
    
    class Config:
        from_attributes = True





#######################    Whare house Agent OTP     #################################################################

# Add to schema.py

# Warehouse Schemas
class WarehouseCreate(BaseModel):
    name: str
    location: str
    pincode: str
    manager_name: Optional[str] = None
    manager_contact: Optional[str] = None
    status: Optional[bool] = True


class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    pincode: Optional[str] = None
    manager_name: Optional[str] = None
    manager_contact: Optional[str] = None
    status: Optional[bool] = None


class WarehouseResponse(BaseModel):
    id: int
    name: str
    location: str
    pincode: str
    manager_name: Optional[str]
    manager_contact: Optional[str]
    status: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Delivery Agent Schemas
class DeliveryAgentCreate(BaseModel):
    name: str
    phone_number: str
    email: Optional[str] = None
    password: str
    vehicle_type: str
    vehicle_number: str
    is_active: Optional[bool] = True
    available: Optional[bool] = True


class DeliveryAgentUpdate(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    is_active: Optional[bool] = None
    available: Optional[bool] = None


class DeliveryAgentResponse(BaseModel):
    id: int
    name: str
    phone_number: str
    email: Optional[str]
    vehicle_type: str
    vehicle_number: str
    current_order_id: Optional[int]
    total_deliveries: int
    is_active: bool
    available: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# OTP Schemas
class GenerateOTPRequest(BaseModel):
    pass

class VerifyOTPRequest(BaseModel):
    otp_code: str
    customer_phone: str


class OTPResponse(BaseModel):
    otp_code: str
    message: str
    expires_at: datetime
    customer_phone : str

class OrderAssignmentResponse(BaseModel):
    order_id: int
    warehouse_id: int
    warehouse_name: str
    agent_id: int
    agent_name: str
    message: str


######################################################################################################

class OrderAssignmentStatus(BaseModel):
    is_assigned: bool
    warehouse_id: Optional[int] = None
    agent_id: Optional[int] = None
    agent_name: Optional[str] = None

class ReassignOrderRequest(BaseModel):
    current_agent_id: Optional[int] = None  # Required if initiated by agent

class ReassignOrderResponse(BaseModel):
    order_id: int
    previous_agent_id: int
    previous_agent_name: str
    new_agent_id: int
    new_agent_name: str
    warehouse_id: int
    initiated_by: str
    message: str
###################################wallet schemas ###############################################


class WalletResponse(BaseModel):
    wallet_id: int
    customer_id: int
    balance: float
    created_at: datetime

    class Config:
        orm_mode = True


class WalletCreate(BaseModel):
    customer_id: int


class TransactionCreate(BaseModel):
    customer_id: int
    amount: float
    type: str  # credit / debit
    reference_id: Optional[str] = None
    description: Optional[str] = None
    transaction_mode: Optional[str] = "online"


class TransactionResponse(BaseModel):
    transaction_id: int
    wallet_id: int
    customer_id: int
    type: str
    amount: float
    balance_before: float
    balance_after: float
    created_at: datetime

    class Config:
        orm_mode = True


