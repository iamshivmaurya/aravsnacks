from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import admin_schema
import permission_crud
import admin_auth
from typing import List

router = APIRouter()

@router.post("/permissions", response_model=admin_schema.PermissionResponse)
def create_permission(
    permission: admin_schema.PermissionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/permissions", "POST"))
):
    try:
        new_permission = permission_crud.create_permission(db, permission)
        
        # Add role_name to response
        permission_data = admin_schema.PermissionResponse.from_orm(new_permission)
        permission_data.role_name = new_permission.role.name
        
        return permission_data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/permissions")#, response_model=List[admin_schema.PermissionResponse])
def get_permissions(
    
    
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/permissions", "GET"))
):
      
    permissions = permission_crud.get_all_permissions(db)
    
    # Add role_name to each permission
    response_permissions = []
    for perm in permissions:
        perm_data = admin_schema.PermissionResponse.from_orm(perm)
        perm_data.role_name = perm.role.name
        response_permissions.append(perm_data)
    
    return response_permissions

@router.get("/permissions/{permission_id}")#, response_model=admin_schema.PermissionResponse)
def get_permission(
    permission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/permissions", "GET"))
):
    permission = permission_crud.get_permission_by_id(db, permission_id)
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    # permission_data = admin_schema.PermissionResponse.from_orm(permission)
    # permission_data.role_name = permission.role.name
    
    return permission

    

@router.put("/permissions/{permission_id}", response_model=admin_schema.PermissionResponse)
def update_permission(
    permission_id: int,
    permission_update: admin_schema.PermissionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/permissions", "PUT"))
):
    try:
        updated_permission = permission_crud.update_permission(db, permission_id, permission_update)
        if not updated_permission:
            raise HTTPException(status_code=404, detail="Permission not found")
        
        permission_data = admin_schema.PermissionResponse.from_orm(updated_permission)
        permission_data.role_name = updated_permission.role.name
        
        return permission_data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/permissions/{permission_id}")
def delete_permission(
    permission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/permissions", "DELETE"))
):
    success = permission_crud.delete_permission(db, permission_id)
    if not success:
        raise HTTPException(status_code=404, detail="Permission not found")
    return {"message": "Permission deleted successfully"}

@router.get("/roles/{role_name}/accessible-routes")
def get_role_accessible_routes(
    role_name: str,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_permission("/api/v1/admin/permissions", "GET"))
):
    accessible_routes = permission_crud.get_role_accessible_routes(db, role_name)
    return {"role_name": role_name, "accessible_routes": accessible_routes}

@router.post("/check-permission")
def check_permission(
    permission_check: admin_schema.PermissionCheck,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.get_current_user)
):
    has_permission = permission_crud.check_permission(
        db, current_user.role.name, permission_check.path, permission_check.method
    )
    return {
        "has_permission": has_permission,
        "role": current_user.role.name,
        "path": permission_check.path,
        "method": permission_check.method
    }