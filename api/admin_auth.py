import os
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials  # ← CHANGE THIS
from database import get_db
from sqlalchemy.orm import Session
import admin_model
from dotenv import load_dotenv
from enum import Enum

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ========== CHANGE TO HTTPBearer ==========
security = HTTPBearer()  # ← USE THIS INSTEAD OF OAuth2PasswordBearer

# ========== PERMISSION SYSTEM ==========
class Permission(Enum):
    VIEW_PRODUCTS = "view_products"
    CREATE_PRODUCTS = "create_products"
    UPDATE_PRODUCTS = "update_products"
    DELETE_PRODUCTS = "delete_products"
    VIEW_CATEGORIES = "view_categories"
    MANAGE_CATEGORIES = "manage_categories"
    MANAGE_USERS = "manage_users"

ROLE_PERMISSIONS = {
    "admin": [
        Permission.VIEW_PRODUCTS, Permission.CREATE_PRODUCTS,
        Permission.UPDATE_PRODUCTS, Permission.DELETE_PRODUCTS,
        Permission.VIEW_CATEGORIES, Permission.MANAGE_CATEGORIES,
        Permission.MANAGE_USERS
    ],
    "editor": [
        Permission.VIEW_PRODUCTS, Permission.CREATE_PRODUCTS,
        Permission.UPDATE_PRODUCTS,
        Permission.VIEW_CATEGORIES, Permission.MANAGE_CATEGORIES
    ],
    "user": [
        Permission.VIEW_PRODUCTS,
        Permission.VIEW_CATEGORIES
    ]
}

# ========== UPDATE PERMISSION CHECKER ==========
def require_permission(permission: Permission):
    def permission_checker(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
        token = credentials.credentials  # ← GET TOKEN FROM BEARER
        user = get_current_user_from_token(token, db)
        user_permissions = ROLE_PERMISSIONS.get(user.role.name, [])

        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {permission.value}"
            )
        return user
    return permission_checker

# ... rest of your functions remain the same ...
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_access_token(*, data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")

def get_current_user_from_token(token: str, db: Session):
    payload = decode_token(token)
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = db.query(admin_model.User).filter(admin_model.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_role(required_role: str):
    def role_dependency(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
        token = credentials.credentials
        user = get_current_user_from_token(token, db)
        if user.role is None or user.role.name != required_role:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return user
    return role_dependency