from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from model import AdminLogin 
from schema import AdminLoginRequest,AdminLoginResponse
from typing import List
from jose import jwt
from datetime import datetime, timedelta

##########



router = APIRouter()

SECRET_KEY = "ABC123"
ALGORITHM = "HS256"


def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt





@router.post("/admin/login")
async def admin_login(login_data: AdminLoginRequest, db: Session = Depends(get_db)):
    admin_db = db.query(AdminLogin).filter(AdminLogin.user_name == login_data.user_name).first()

    if not admin_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin username not found."
        )
    
    if admin_db.password != str(login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password."
        )
      # Create JWT token
    token_data = {
    "sub": admin_db.user_name,  # Use 'sub' for subject (standard JWT)
    "user_type": admin_db.user_type,
    }
    access_token = create_access_token(token_data)


    # Return ALL required fields from AdminLoginResponse
    return AdminLoginResponse(
        message="Login successful!",
        user_name=admin_db.user_name,
        user_type=admin_db.user_type,
        access_token=access_token,  # Fixed: removed quotes
        token_type="bearer"  # Added token type
    )
#####################################################


