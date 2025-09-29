from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import re

# ========== ROUTE PERMISSIONS ==========
ROUTE_PERMISSIONS = {
    # ===== PUBLIC ROUTES =====
    ("POST", "/api/v1/login"): None,
    ("GET", "/"): None,
    ("GET", "/docs"): None,
    ("GET", "/openapi.json"): None,

    # ===== PRODUCT ROUTES =====
    ("POST", "/api/v1/products"): "create_products",
    ("GET", "/api/v1/products"): "view_products",
    ("GET", r"/api/v1/products/\d+"): "view_products",
    ("PUT", r"/api/v1/products/\d+"): "update_products",
    ("DELETE", r"/api/v1/products/\d+"): "delete_products",
    ("POST", "/api/v1/upload-image"): "create_products",

    # ===== CATEGORY ROUTES =====
    ("POST", "/api/v1/categories"): "manage_categories",
    ("GET", "/api/v1/categories"): "view_categories",
    ("PUT", r"/api/v1/categories/\d+"): "manage_categories",
    ("DELETE", r"/api/v1/categories/\d+"): "manage_categories",

    # ===== ADMIN ROUTES =====
    ("GET", "/api/v1/admin/users"): "manage_users",
    ("POST", "/api/v1/admin/users"): "manage_users",
    ("GET", "/api/v1/admin/products"): "view_products",
    ("GET", r"/api/v1/admin/products/\d+"): "view_products",
}

# ========== ROLE PERMISSIONS ==========
ROLE_PERMISSIONS = {
    "admin": [
        "create_products", "view_products", "update_products", "delete_products",
        "manage_categories", "view_categories",
        "manage_users"
    ],
    "editor": [
        "create_products", "view_products", "update_products",
        "manage_categories", "view_categories"
    ],
    "user": [
        "view_products", "view_categories"
    ]
}


class RBACMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Check if route is public
        required_permission = self.get_required_permission(request.method, request.url.path)

        if required_permission is None:
            return await call_next(request)

        # Check authorization header
        auth_header = request.headers.get('authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid authorization header"}
            )

        token = auth_header.replace('Bearer ', '')

        try:
            from database import get_db
            from admin_auth import get_current_user_from_token

            db_gen = get_db()
            db = next(db_gen)
            user = get_current_user_from_token(token, db)

            # Check user permissions
            user_permissions = ROLE_PERMISSIONS.get(user.role.name, [])

            if required_permission not in user_permissions:
                return JSONResponse(
                    status_code=403,
                    content={"detail": f"Insufficient permissions. Required: {required_permission}"}
                )

            # Add user to request state
            request.state.user = user
            response = await call_next(request)

            # Close database session
            try:
                next(db_gen)
            except StopIteration:
                pass

            return response

        except HTTPException as e:
            return JSONResponse(status_code=e.status_code, content={"detail": e.detail})
        except Exception:
            return JSONResponse(
                status_code=500,
                content={"detail": "Authentication failed"}
            )

    def get_required_permission(self, method: str, path: str) -> str:
        # Exact match
        key = (method, path)
        if key in ROUTE_PERMISSIONS:
            return ROUTE_PERMISSIONS[key]

        # Regex match for dynamic routes
        for (route_method, route_pattern), permission in ROUTE_PERMISSIONS.items():
            if route_method == method:
                if route_pattern.startswith('r'):
                    pattern = route_pattern[1:]
                    if re.match(pattern, path):
                        return permission
                elif path == route_pattern:
                    return permission

        # Default permission for unspecified routes
        return "view_products"


    """Role Permissions Summary:
👑 ADMIN - Full Control   ######################
Can do everything:

✅ Products: Create, View, Update, Delete

✅ Categories: Create, View, Update, Delete

✅ Users: Manage all users

✅ Access: All admin routes

✏️ EDITOR - Content Management   ############################
Can manage content but not users:

✅ Products: Create, View, Update

❌ Products: Cannot Delete

✅ Categories: Create, View, Update, Delete

❌ Users: No access to user management

❌ Access: No admin routes

👤 USER - Read Only #########################
Can only view content:

✅ Products: View only

✅ Categories: View only

❌ Products: Cannot Create, Update, Delete

❌ Categories: Cannot Manage

❌ Users: No access

❌ Access: No admin routes"""