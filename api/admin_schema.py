from pydantic import BaseModel,Field
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserOut(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool
    
    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    password: str
    role: str  # role name
    is_active: Optional[bool] = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Role Schemas
class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    # path: Optional[str] = None
    # method:Optional[str] = None

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    path: Optional[str] = None
    method:Optional[str] = None
    allowed:Optional[bool] = None
    # updated_at:Optional[datetime]=None
    # created_at:Optional[datetime]=None


class RoleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    # created_at: datetime
    # updated_at: datetime
    
    # user_count: Optional[int] = 0
    # permission_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

# Permission Schemas
class PermissionCreate(BaseModel):
    role_id: int
    path: str
    method: str
    allowed: bool = True

class PermissionUpdate(BaseModel):
    role_id: Optional[int] = None
    path: Optional[str] = None
    method: Optional[str] = None
    allowed: Optional[bool] = None

class PermissionResponse(BaseModel):
    id: int
    role_id: int
    role_name: Optional[str] = None 
    path: str
    method: str
    allowed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Login & Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str
    accessible_routes: List[dict]

class PermissionCheck(BaseModel):
    path: str
    method: str

#############

# class RoleBaseCreate(BaseModel):
#     name: str = Field(..., min_length=1, max_length=50, description="Role name")
#     path: Optional[str] = None
#     method: str = Field(..., min_length=1, max_length=100, description="HTTP methods")
#     allowed: bool = Field(False, description="Access permission flag")
