from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import your route modules
from routes import (
    category_route, coupon_route, customer_route, order_route, 
    product_route, quote_route, review_route, taxclass_route, 
    tracking_route, login, order_invoice, settings, 
    dashboard_route,phonepe_routes , delivery_routes,wallet_route
)

# Import NEW RBAC route modules
from routes.admin_route import router as user_rbac_router
from routes.role_routes import router as role_rbac_router  
from routes.permission_routes import router as permission_rbac_router

# Create app instance with metadata
app = FastAPI(
    title="AravSnacks API",
    description="API for AravSnacks e-commerce platform",
    version="1.0.0"
)

# Serve media files
app.mount("/media", StaticFiles(directory="media"), name="media")

# CORS setup
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "http://localhost:3001"
]

app.add_middleware(
    CORSMiddleware,
    #allow_origins="origins",  
    allow_origins=["*"],   # You can replace with `origins` for stricter CORS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Version prefix ===
API_PREFIX = "/api/v1"

# ======== REGISTER ALL ROUTES ========

# Public routes (no authentication required)
app.include_router(login.router, prefix=API_PREFIX, tags=["Login"])

# NEW RBAC Admin Routes (with role-based permission checking)
app.include_router(user_rbac_router, prefix=f"{API_PREFIX}/admin", tags=["Admin Users"])
app.include_router(role_rbac_router, prefix=f"{API_PREFIX}/admin", tags=["Admin Roles"])
app.include_router(permission_rbac_router, prefix=f"{API_PREFIX}/admin", tags=["Admin Permissions"])

# Existing routes (keep as is for now - you can add RBAC protection later)
app.include_router(category_route.router, prefix=API_PREFIX, tags=["Categories"])
app.include_router(product_route.router, prefix=API_PREFIX, tags=["Products"])
app.include_router(customer_route.router, prefix=API_PREFIX, tags=["Customers"])
app.include_router(quote_route.router, prefix=API_PREFIX, tags=["Quotes"])
app.include_router(order_route.router, prefix=API_PREFIX, tags=["Orders"])
app.include_router(coupon_route.router, prefix=API_PREFIX, tags=["Coupons"])
app.include_router(taxclass_route.router, prefix=API_PREFIX, tags=["Tax"])
app.include_router(order_invoice.router, prefix=API_PREFIX, tags=["Order Invoice"])
# app.include_router(admin_route.router, prefix=f"{API_PREFIX}/admin", tags=["Admin"])
app.include_router(settings.router, prefix=API_PREFIX, tags=["Settings"])
app.include_router(review_route.router, prefix=API_PREFIX, tags=["Reviews"])
app.include_router(tracking_route.router, prefix=API_PREFIX, tags=["Tracking"])
app.include_router(dashboard_route.router, prefix=API_PREFIX, tags=["Admin Dashboard"])
app.include_router(phonepe_routes.router, prefix=API_PREFIX, tags=["Phonepe Routes"])


# app.include_router(role_route.router, prefix=API_PREFIX, tags=["Role Route"])
app.include_router(delivery_routes.router, prefix=API_PREFIX, tags=["Delivery Management"])
app.include_router(wallet_route.router,prefix=API_PREFIX, tags=["Wallet Management"])
# Root route
@app.get("/")
def read_root():
    return {"message": "Welcome to AravSnacks API"}