from fastapi import FastAPI
from routes import login ,categoryroute,productroute
from fastapi.middleware.cors import CORSMiddleware                      # From routes folder

app = FastAPI()

origins = [
    "http://localhost:3000",   # React/Next.js local
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # URLs that can call the API
    allow_credentials=True,         # Allow cookies/auth headers
    allow_methods=["*"],             # Allow all HTTP methods
    allow_headers=["*"],             # Allow all HTTP headers
)

app.include_router(login.router, tags=["Login Route"])  #include_router
app.include_router(categoryroute.router, tags=["Category Route"])
app.include_router(productroute.router, tags=["Product Route"])

