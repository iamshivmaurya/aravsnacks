from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import CustomerCreate, CustomerResponse, CustomerUpdate, CustomerAddressCreate, CustomerAddressResponse
from customer_crud import create_or_update_customer, get_customer, get_customers, update_customer, delete_customer, create_customer_address, get_customer_addresses, get_address, update_address, delete_address
from typing import List

router = APIRouter()

# Customer CRUD Operations
@router.post("/customers", response_model=CustomerResponse)
def create_customer_route(customer: CustomerCreate, db: Session = Depends(get_db)):
    try:
        db_customer = create_or_update_customer(db, customer)
        return db_customer
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# ... keep the rest of your routes exactly the same ...
@router.get("/customers/{customer_id}", response_model=CustomerResponse)
def get_customer_route(customer_id: int, db: Session = Depends(get_db)):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@router.get("/customers", response_model=List[CustomerResponse])
def get_customers_route(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    customers = get_customers(db, skip=skip, limit=limit)
    return customers

# @router.put("/customers/{customer_id}", response_model=CustomerResponse)
# def update_customer_route(customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)):
#     db_customer = update_customer(db, customer_id, customer.dict(exclude_unset=True))
#     if not db_customer:
#         raise HTTPException(status_code=404, detail="Customer not found")
#     return db_customer


@router.put("/customers/{customer_id}")
def update_customer_route(customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)):
    result = update_customer(db, customer_id, customer.dict(exclude_unset=True))
    if not result:
        raise HTTPException(status_code=404, detail="Customer not found")

    db_customer, otp_sent, otp_length, otp = result

    return {
        "customer_id": db_customer.customer_id,
        "customer_name": db_customer.customer_name,
        "email": db_customer.email,
        "first_name": db_customer.first_name,
        "last_name": db_customer.last_name,
        "phone": db_customer.phone,
        "otp_sent": otp_sent,
        "otp_length": otp_length,
        "otp": otp,  # ✅ This is important for frontend
        "message": "OTP generated (dev mode)" if otp_sent else "Phone updated successfully"
    }



@router.delete("/customers/{customer_id}")
def delete_customer_route(customer_id: int, db: Session = Depends(get_db)):
    success = delete_customer(db, customer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}

# Customer Address CRUD Operations
@router.post("/customers/{customer_id}/addresses", response_model=CustomerAddressResponse)
def create_customer_address_route(customer_id: int, address: CustomerAddressCreate, db: Session = Depends(get_db)):
    # try:
        db_address = create_customer_address(db, customer_id, address)
        return db_address
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/customers/{customer_id}/addresses", response_model=List[CustomerAddressResponse])
def get_customer_addresses_route(customer_id: int, db: Session = Depends(get_db)):
    addresses = get_customer_addresses(db, customer_id)
    return addresses

@router.get("/addresses/{address_id}", response_model=CustomerAddressResponse)
def get_address_route(address_id: int, db: Session = Depends(get_db)):
    address = get_address(db, address_id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return address

@router.put("/addresses/{address_id}", response_model=CustomerAddressResponse)
def update_address_route(address_id: int, address: CustomerAddressCreate, db: Session = Depends(get_db)):
    db_address = update_address(db, address_id, address.dict(exclude_unset=True))
    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")
    return db_address



@router.delete("/addresses/{address_id}")
def delete_address_route(address_id: int, db: Session = Depends(get_db)):
    success = delete_address(db, address_id)
    if not success:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"message": "Address deleted successfully"}




    