from fastapi import FastAPI
from routes import login                       # From routes folder

app = FastAPI()

app.include_router(login.router, tags=["Login Route"])  #include_router

