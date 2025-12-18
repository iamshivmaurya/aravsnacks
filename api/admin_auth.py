import os
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordBearer 
from sqlalchemy.orm import Session
from database import get_db
import admin_model
import permission_crud
from dotenv import load_dotenv
from typing import List  # ADD THIS IMPORT

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")
security = HTTPBearer()  # ADD THIS LINE - THIS WAS MISSING

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

# REMOVE DUPLICATE FUNCTION - KEEP ONLY ONE
def create_access_token(data: dict, expires_delta: timedelta = None):
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

# def require_role(required_role: str):
#     def role_dependency(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
#         user = get_current_user_from_token(token, db)
#         if user.role is None or user.role.name != required_role:
#             raise HTTPException(status_code=403, detail="Not enough permissions")
#         return user
#     return role_dependency

################## update required role  16-12-25



def require_role(required_role: str):
    def role_dependency(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)
    ):
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )

        token = credentials.credentials
        
        user = get_current_user_from_token(token, db)

        if not user.role or user.role.name != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )

        return user
    return role_dependency



# NEW: Permission checking dependency using HTTPBearer
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        user = db.query(admin_model.User).filter(admin_model.User.username == username).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

# NEW: Permission checking dependency
def require_permission(path: str, method: str):
    # print(path,method,"------------------------------")
    def permission_dependency(
        user: admin_model.User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        if not user.role:
            raise HTTPException(status_code=403, detail="No role assigned")
        
        has_permission = permission_crud.check_permission(db, user.role.name, path, method)
    
        if not has_permission:
            raise HTTPException(
                status_code=403, 
                detail=f"Access denied to {method} {path} for role {user.role.name}"
            )
        return user
    return permission_dependency

# Helper function to get accessible routes for user
def get_user_accessible_routes(db: Session, user: admin_model.User) -> List[dict]:
    if not user.role:
        return []
    return permission_crud.get_role_accessible_routes(db, user.role.name)