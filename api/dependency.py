from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from model import AdminLogin
from datetime import datetime, timedelta

# (Re-use your existing in-memory admin_sessions)
# from your_admin_module import admin_sessions  
from routes.adminroute import admin_sessions

def login_required(request: Request, db: Session = Depends(get_db)):
    # Allow GET requests without login
    if request.method == "GET":
        return None  

    # For other methods, check admin login
    session_token = request.cookies.get("admin_session")
    if not session_token or session_token not in admin_sessions:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin login required."
        )

    session_data = admin_sessions[session_token]

    # Expiration check
    if datetime.now() - session_data["login_time"] > timedelta(hours=1):
        del admin_sessions[session_token]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired, please login again."
        )

    # Validate in DB
    admin = db.query(AdminLogin).filter(
        AdminLogin.id == session_data["admin_id"],
        AdminLogin.is_active == True,
        AdminLogin.user_type == "admin"
    ).first()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin not valid anymore."
        )

    return admin
