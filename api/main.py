from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import your route modules
from routes import (
    category_route, coupon_route, customer_route, order_route,
    product_route, quote_route, review_route, taxclass_route,
    tracking_route, login, order_invoice, admin_route, settings
)

app = FastAPI(
    title="AravSnacks API",
    description="API for AravSnacks e-commerce platform",
    version="1.0.0"
)

# Serve media files
app.mount("/media", StaticFiles(directory="media"), name="media")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Version prefix ===
API_PREFIX = "/api/v1"

# ========== IMPORT RBAC PERMISSIONS ==========
from admin_auth import require_permission, Permission

# ========== ADMIN RBAC PROTECTED ROUTES ==========
# These routes use ADMIN authentication and role-based permissions

app.include_router(
    product_route.router,
    prefix=API_PREFIX,
    tags=["Products"],
    dependencies=[Depends(require_permission(Permission.VIEW_PRODUCTS))]
)

app.include_router(
    category_route.router,
    prefix=API_PREFIX,
    tags=["Categories"],
    dependencies=[Depends(require_permission(Permission.VIEW_CATEGORIES))]
)

app.include_router(
    admin_route.router,
    prefix=f"{API_PREFIX}/admin",
    tags=["Admin"]
)

# ========== CUSTOMER PROTECTED ROUTES ==========
# These routes use CUSTOMER authentication (phone/OTP)

app.include_router(customer_route.router, prefix=API_PREFIX, tags=["Customers"])
app.include_router(quote_route.router, prefix=API_PREFIX, tags=["Quotes"])
app.include_router(order_route.router, prefix=API_PREFIX, tags=["Orders"])
app.include_router(review_route.router, prefix=API_PREFIX, tags=["Reviews"])
app.include_router(tracking_route.router, prefix=API_PREFIX, tags=["Tracking"])

# ========== PUBLIC ROUTES ==========
# No authentication required

app.include_router(login.router, prefix=API_PREFIX, tags=["Login"])
app.include_router(coupon_route.router, prefix=API_PREFIX, tags=["Coupons"])
app.include_router(taxclass_route.router, prefix=API_PREFIX, tags=["Tax"])
app.include_router(order_invoice.router, prefix=API_PREFIX, tags=["Order Invoice"])
app.include_router(settings.router, prefix=API_PREFIX, tags=["Settings"])

# Root route
@app.get("/")
def read_root():
    return {"message": "Welcome to AravSnacks API"}