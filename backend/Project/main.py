from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from routes import login

app = FastAPI()

app.include_router(login.router, tags=["Login Route"])

