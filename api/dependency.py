from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from model import AdminLogin
from datetime import datetime, timedelta
