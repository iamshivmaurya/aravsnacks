# from fastapi import Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer
# from jose import JWTError, jwt
# from sqlalchemy.orm import Session
# from database import get_db
# from model import AdminLogin


# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/login")

# def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#     )
    
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         username: str = payload.get("sub")
        
#         if username is None:
#             raise credentials_exception
            
#         # Verify user is still an admin in database
#         user = db.query(AdminLogin).filter(AdminLogin.user_name == username).first()
#         if user is None or user.user_type != "admin":
#             raise credentials_exception
            
#         return user
        
#     except JWTError:
#         raise credentials_exception