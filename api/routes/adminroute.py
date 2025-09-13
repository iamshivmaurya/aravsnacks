from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from model import AdminLogin 
from schema import AdminLoginRequest,AdminLoginResponse

from typing import List

router = APIRouter()


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
    
    # Return ALL required fields from AdminLoginResponse
    return AdminLoginResponse(
        message="Login successful!",
        user_name=admin_db.user_name,    # Add this
        user_type=admin_db.user_type     # Add this
        # Don't include password - it's a security risk!
    )