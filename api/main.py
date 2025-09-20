from fastapi import FastAPI
from routes import login,trackingroute,categoryroute, productroute, customerroute, quoteroute, orderroute,couponroute,taxclassroute, order_invoice, adminroute, reviewroute , admin_route, settings
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
app.include_router(categoryroute.router, tags=["Category Route"])
app.include_router(productroute.router, tags=["Product Route"])
app.include_router(customerroute.router, tags=["Customer Route"])
app.include_router(quoteroute.router, tags=["Quote Route"])
app.include_router(orderroute.router, tags=["Order Route"])
app.include_router(couponroute.router, tags=["Coupon Route"])
app.include_router(taxclassroute.router, tags=["Tax Route"])
app.include_router(order_invoice.router, tags=["Order Invoice"])
#app.include_router(adminroute.router, tags=["admin route"])
app.include_router(admin_route.router, prefix="/admin", tags=["Admin Routes New"])
app.include_router(settings.router,  tags=["Admin Setting"])
app.include_router(reviewroute.router, tags=["Reviews"])
app.include_router(trackingroute.router, tags=["Tracking"])


@app.get("/")
def read_root():
    return {"message": "Welcome to AravSnacks API"}



