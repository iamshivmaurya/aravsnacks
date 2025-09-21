from fastapi import FastAPI
from routes import category_route, coupon_route, customer_route, order_route, product_route, quote_route, review_route, taxclass_route, tracking_route
from routes import login,order_invoice, admin_route, settings
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/media", StaticFiles(directory="media"), name="media")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "http://localhost:3001" 
]

app.add_middleware(
    CORSMiddleware,
    #allow_origins=origins,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(login.router, tags=["Login Route"])
app.include_router(category_route.router, tags=["Category Route"])
app.include_router(product_route.router, tags=["Product Route"])
app.include_router(customer_route.router, tags=["Customer Route"])
app.include_router(quote_route.router, tags=["Quote Route"])
app.include_router(order_route.router, tags=["Order Route"])
app.include_router(coupon_route.router, tags=["Coupon Route"])
app.include_router(taxclass_route.router, tags=["Tax Route"])
app.include_router(order_invoice.router, tags=["Order Invoice"])
app.include_router(admin_route.router, prefix="/admin", tags=["Admin Routes New"])
app.include_router(settings.router,  tags=["Admin Setting"])
app.include_router(review_route.router, tags=["Reviews"])
app.include_router(tracking_route.router, tags=["Tracking"])


@app.get("/")
def read_root():
    return {"message": "Welcome to AravSnacks API"}



