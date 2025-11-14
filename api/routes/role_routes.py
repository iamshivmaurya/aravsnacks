from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import admin_schema
import role_crud
import admin_auth
from typing import List

router = APIRouter()

@router.get("/roles", response_model=List[admin_schema.RoleResponse])
def get_roles(
   
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/roles", "GET"))
):
    roles = role_crud.get_all_roles(db)
    
    # FIX: Add user count and permission count
    response_roles = []
    for role in roles:
        response_roles.append({
            "id": role.id,
            "name": role.name,
            "description": role.description,
            "created_at": role.created_at,
            "user_count": len(role.users),
            "permission_count": len(role.permissions)
        })
    
    return response_roles

@router.get("/roles/{role_id}", response_model=admin_schema.RoleResponse)
def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/roles", "GET"))
):
    role = role_crud.get_role_by_id(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # FIX: Return proper response format
    return {
        "id": role.id,
        "name": role.name,
        "description": role.description,
        "created_at": role.created_at,
        "user_count": len(role.users),
        "permission_count": len(role.permissions)
    }

@router.post("/roles", response_model=admin_schema.RoleResponse)
def create_role(
    role: admin_schema.RoleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/roles", "POST"))
):
    try:
        new_role = role_crud.create_role(db, role)
        # FIX: Return proper response format
        return {
            "id": new_role.id,
            "name": new_role.name,
            "description": new_role.description,
            # "created_at": new_role.created_at,
       
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))



@router.put("/roles/{role_id}", response_model=admin_schema.RoleResponse)
def update_role(
    role_id: int,
    role_update: admin_schema.RoleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/roles", "PUT"))
):
    try:
        updated_role = role_crud.update_role(db, role_id, role_update)
        if not updated_role:
            raise HTTPException(status_code=404, detail="Role not found")
        return updated_role
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/roles/{role_id}")
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/roles", "DELETE"))
):
    try:
        success = role_crud.delete_role(db, role_id)
        if not success:
            raise HTTPException(status_code=404, detail="Role not found")
        return {"message": "Role deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))