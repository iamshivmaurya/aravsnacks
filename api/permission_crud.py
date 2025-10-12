from sqlalchemy.orm import Session
import admin_model
from admin_schema import PermissionCreate, PermissionUpdate
from typing import List, Optional

def get_permission_by_id(db: Session, permission_id: int) -> Optional[admin_model.RolePermission]:
    return db.query(admin_model.RolePermission).filter(admin_model.RolePermission.id == permission_id).first()

def get_permissions_by_role(db: Session, permission_id: int) -> List[admin_model.RolePermission]:
    return db.query(admin_model.RolePermission).filter(admin_model.RolePermission.role_id == role_id).all()

def get_all_permissions(db: Session, skip: int = 0, limit: int = 100) -> List[admin_model.RolePermission]:
    return db.query(admin_model.RolePermission).offset(skip).limit(limit).all()

def check_permission(db: Session, role_name: str, path: str, method: str) -> bool:
    permission = db.query(admin_model.RolePermission).join(admin_model.Role).filter(
        admin_model.Role.name == role_name,
        admin_model.RolePermission.path == path,
        admin_model.RolePermission.method.in_([method, "*"]),
        admin_model.RolePermission.allowed == True
    ).first()
    
    return permission is not None

def create_permission(db: Session, permission_in: PermissionCreate) -> admin_model.RolePermission:
    # Verify role exists
    role = db.query(admin_model.Role).filter(admin_model.Role.id == permission_in.role_id).first()
    if not role:
        raise ValueError(f"Role with ID {permission_in.role_id} not found")
    
    # Check if permission already exists
    existing_permission = db.query(admin_model.RolePermission).filter(
        admin_model.RolePermission.role_id == permission_in.role_id,
        admin_model.RolePermission.path == permission_in.path,
        admin_model.RolePermission.method == permission_in.method
    ).first()
    
    if existing_permission:
        raise ValueError("Permission already exists for this role, path, and method")
    
    permission = admin_model.RolePermission(
        role_id=permission_in.role_id,
        path=permission_in.path,
        method=permission_in.method,
        allowed=permission_in.allowed
    )
    
    db.add(permission)
    db.commit()
    db.refresh(permission)
    return permission

def update_permission(db: Session, permission_id: int, permission_update: PermissionUpdate) -> Optional[admin_model.RolePermission]:
    permission = get_permission_by_id(db, permission_id)
    if not permission:
        return None
    
    update_data = permission_update.dict(exclude_unset=True)
    
    # Check for duplicate if path/method/role is being updated
    if any(field in update_data for field in ['role_id', 'path', 'method']):
        role_id = update_data.get('role_id', permission.role_id)
        path = update_data.get('path', permission.path)
        method = update_data.get('method', permission.method)
        
        existing_permission = db.query(admin_model.RolePermission).filter(
            admin_model.RolePermission.role_id == role_id,
            admin_model.RolePermission.path == path,
            admin_model.RolePermission.method == method,
            admin_model.RolePermission.id != permission_id
        ).first()
        
        if existing_permission:
            raise ValueError("Permission already exists for this role, path, and method")
    
    for field, value in update_data.items():
        setattr(permission, field, value)
    
    db.commit()
    db.refresh(permission)
    return permission

def delete_permission(db: Session, permission_id: int) -> bool:
    permission = get_permission_by_id(db, permission_id)
    if not permission:
        return False
    
    db.delete(permission)
    db.commit()
    return True

def get_role_accessible_routes(db: Session, role_name: str) -> List[dict]:
    permissions = db.query(admin_model.RolePermission).join(admin_model.Role).filter(
        admin_model.Role.name == role_name,
        admin_model.RolePermission.allowed == True
    ).all()
    
    return [{"path": perm.path, "method": perm.method} for perm in permissions]