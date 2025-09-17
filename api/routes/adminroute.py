from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from database import get_db
from model import AdminLogin, Product 
from schema import AdminLoginRequest, AdminLoginResponse
from typing import List, Optional
from pydantic import BaseModel
import secrets
from datetime import datetime, timedelta

router = APIRouter()

# Response model for unauthorized access
class UnauthorizedResponse(BaseModel):
    detail: str = "Admin login required"

# In-memory session storage (use Redis or database in production)
admin_sessions = {}

@router.post("/admin/login", response_model=AdminLoginResponse)
async def admin_login(
    login_data: AdminLoginRequest, 
    response: Response,
    db: Session = Depends(get_db)
):
    # Find admin in database
    admin_db = db.query(AdminLogin).filter(
        AdminLogin.user_name == login_data.user_name,
        AdminLogin.is_active == True
    ).first()

    if not admin_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin username not found or inactive."
        )
    
    # Check password
    if admin_db.password != str(login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password."
        )
    
    # Create session token
    session_token = secrets.token_urlsafe(32)
    
    # Store session data
    admin_sessions[session_token] = {
        "admin_id": admin_db.id,
        "user_name": admin_db.user_name,
        "user_type": admin_db.user_type,
        "email": admin_db.email,
        "login_time": datetime.now()
    }
    
    # Set cookies
    response.set_cookie(
        key="admin_session",
        value=session_token,
        httponly=True,
        max_age=3600,  # 1 hour expiration
        samesite="lax"
    )
    
    response.set_cookie(
        key="admin_user",
        value=admin_db.user_name,
        max_age=3600,
        samesite="lax"
    )

    return AdminLoginResponse(
        message="Login successful!",
        user_name=admin_db.user_name,
        user_type=admin_db.user_type,
        access_token=session_token,  # Still return for reference
        token_type="cookie"
    )

@router.post("/admin/logout")
async def admin_logout(response: Response, request: Request):
    session_token = request.cookies.get("admin_session")
    
    # Remove session from storage
    if session_token and session_token in admin_sessions:
        del admin_sessions[session_token]
    
    # Clear cookies
    response.delete_cookie("admin_session")
    response.delete_cookie("admin_user")
    
    return {"message": "Logout successful!"}

def get_current_admin(request: Request, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please login first.",
        headers={"WWW-Authenticate": "Cookie"},
    )
    
    # Get session token from cookie
    session_token = request.cookies.get("admin_session")
    
    if not session_token:
        raise credentials_exception
    
    # Check if session exists
    session_data = admin_sessions.get(session_token)
    if not session_data:
        raise credentials_exception
    
    # Verify session is not expired (1 hour)
    if datetime.now() - session_data["login_time"] > timedelta(hours=1):
        del admin_sessions[session_token]  # Clean up expired session
        raise credentials_exception
    
    # Verify user is still an active admin in database
    user = db.query(AdminLogin).filter(
        AdminLogin.id == session_data["admin_id"],
        AdminLogin.is_active == True,
        AdminLogin.user_type == "admin"
    ).first()
    
    if user is None:
        # Clean up invalid session
        if session_token in admin_sessions:
            del admin_sessions[session_token]
        raise credentials_exception
    
    return user

# Example of a protected product route using cookies
@router.get("/admin/products", responses={401: {"model": UnauthorizedResponse}})
def get_all_products(
    request: Request,
    db: Session = Depends(get_db),
    current_admin: AdminLogin = Depends(get_current_admin)
):
    """
    Get all products - Admin access only.
    
    Requires admin session cookie.
    """
    products = db.query(Product).all()
    
    return {
        "message": f"Welcome {current_admin.user_name}",
        "products": [{
            "id": product.id,
            "name": product.name,
            "price": float(product.product_price),
            "sku": product.sku,
            "quantity": product.quantity
        } for product in products]
    }

# Protected route for specific product
@router.get("/admin/products/{product_id}")
def get_product(
    product_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: AdminLogin = Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "message": f"Product details for ID {product_id}",
        "admin": current_admin.user_name,
        "product": {
            "id": product.id,
            "name": product.name,
            "price": float(product.product_price),
            "sku": product.sku,
            "description": product.description,
            "quantity": product.quantity,
            "image_url": product.image_url
        }
    }

# Check admin session status
# @router.get("/admin/status")
# def check_admin_status(request: Request, db: Session = Depends(get_db)):
#     try:
#         current_admin = get_current_admin(request, db)
#         return {
#             "logged_in": True,
#             "user_name": current_admin.user_name,
#             "user_type": current_admin.user_type
#         }
#     except HTTPException:
#         return {"logged_in": False, "message": "Please login first"}

# Add this endpoint to get current admin info
@router.get("/admin/me")
def get_current_admin_info(
    request: Request,
    db: Session = Depends(get_db),
    current_admin: AdminLogin = Depends(get_current_admin)
):
    """Get current admin information"""
    return {
        "admin_id": current_admin.id,
        "user_name": current_admin.user_name,
        "email": current_admin.email,
        "user_type": current_admin.user_type,
        "is_active": current_admin.is_active
    }