from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import RoleBaseCreate,RoleUpdate,RoleResponse
from role_crud import create_role,update_role,delete_role,get_role_by_id,get_all_roles
from typing import List
router = APIRouter()



@router.get("/get/{role_id}", response_model=RoleResponse)
def get_role_route(role_id: int, db: Session = Depends(get_db)):
    role = get_role_by_id(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.get("/get_all_role/", response_model=List[RoleResponse])
def get_all_roles_route(db: Session = Depends(get_db)):
    roles = get_all_roles(db)
    return roles

@router.post("/create_role")
def create_role_route(roles: RoleBaseCreate, db: Session = Depends(get_db)):
    new_role = create_role(db, roles)
    return new_role



@router.put("/update/{role_id}")
def update_role_route(role_id: int, role: RoleUpdate, db: Session = Depends(get_db)):
    updated_role = update_role(db, role_id, role)
    if not updated_role:
        raise HTTPException(status_code=404, detail="Role not found")
    return updated_role



@router.delete("/delet-role/{role_id}", response_model=dict)
def delete_role_route(role_id: int, db: Session = Depends(get_db)):
    deleted_role = delete_role(db, role_id)
    if not deleted_role:
        raise HTTPException(status_code=404, detail="Role not found")
    return {"message": f"Role ID {role_id} deleted successfully"}   



   