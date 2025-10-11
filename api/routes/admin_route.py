from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import admin_schema
# import user_crud
import admin_crud
import admin_auth
from typing import List

router = APIRouter()

@router.post("/login", response_model=admin_schema.LoginResponse)
def login(login_data: admin_schema.LoginRequest, db: Session = Depends(get_db)):
    user = admin_crud.get_user_by_username(db, login_data.username)
    if not user or not admin_auth.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=401, detail="User account is disabled")
    
    # FIX: Get role name as string, not Role object
    role_name = user.role.name if user.role else "user"  # Convert Role object to string
    
    # Create access token
    token_data = {"sub": user.username, "role": role_name}  # Use string role name
    access_token = admin_auth.create_access_token(data=token_data)
    
    # Get accessible routes
    accessible_routes = admin_auth.get_user_accessible_routes(db, user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "role": role_name,  # FIX: Return string, not Role object
        "accessible_routes": accessible_routes
    }



@router.get("/users/me")
def get_current_user_info(current_user=Depends(admin_auth.get_current_user)):
    return {
        "username": current_user.username,
        "role": current_user.role.name if current_user.role else "user",  # FIX: Convert to string
        "is_active": current_user.is_active
    }


# In user creation response
@router.post("/users", response_model=admin_schema.UserResponse)
def create_user(
    user: admin_schema.UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/users", "POST"))
):
    try:
        new_user = admin_crud.create_user(db, user)
        # Convert to response format with role as string
        return {
            "id": new_user.id,
            "username": new_user.username,
            "role": new_user.role.name if new_user.role else "user",  # FIX
            "is_active": new_user.is_active,
            "created_at": new_user.created_at
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))




@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/users", "DELETE"))
):
    success = admin_crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}



@router.get("/users/{user_id}/permissions")
def get_user_permissions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/users", "GET"))
):
    permissions = admin_crud.get_user_permissions(db, user_id)
    return {"user_id": user_id, "permissions": permissions}



@router.get("/users1", response_model=List[admin_schema.UserResponse])
def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/users", "GET"))
):
    users = admin_crud.get_users(db, skip=skip, limit=limit)
    
    # FIX: Convert Role objects to strings for all users
    response_users = []
    for user in users:
        response_users.append({
            "id": user.id,
            "username": user.username,
            "role": user.role.name if user.role else "user",  # Convert to string
            "is_active": user.is_active,
            "created_at": user.created_at
        })
    
    return response_users

@router.get("/users/{user_id}", response_model=admin_schema.UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/users", "GET"))
):
    user = admin_crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # FIX: Convert Role object to string
    return {
        "id": user.id,
        "username": user.username,
        "role": user.role.name if user.role else "user",  # Convert to string
        "is_active": user.is_active,
        "created_at": user.created_at
    }

# @router.post("/users", response_model=admin_schema.UserResponse)
# def create_user(
#     user: admin_schema.UserCreate,
#     db: Session = Depends(get_db),
#     current_user=Depends(admin_auth.require_permission("/api/v1/admin/users", "POST"))
# ):
#     try:
#         new_user = user_crud.create_user(db, user)
#         # FIX: Convert Role object to string
#         return {
#             "id": new_user.id,
#             "username": new_user.username,
#             "role": new_user.role.name if new_user.role else "user",  # Convert to string
#             "is_active": new_user.is_active,
#             "created_at": new_user.created_at
#         }
#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=str(e))



@router.put("/users/{user_id}", response_model=admin_schema.UserResponse)
def update_user(
    user_id: int,
    user_update: admin_schema.UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/users", "PUT"))
):
    try:
        updated_user = admin_crud.update_user(db, user_id, user_update)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # FIX: Convert Role object to string
        return {
            "id": updated_user.id,
            "username": updated_user.username,
            "role": updated_user.role.name if updated_user.role else "user",  # Convert to string
            "is_active": updated_user.is_active,
            "created_at": updated_user.created_at
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
