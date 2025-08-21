from fastapi import FastAPI, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
import random
from typing import Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from database import get_db, Base, engine
from model import Category                      # from model.py
from schema import CreateCategories             # from schem.py


router = APIRouter()



@router.post("/Category")
def create_category(category:CreateCategories, db: Session = Depends(get_db)):
        new_category = Category(
        #category_id = category.category_id,
        # parent_id =
        category_name = category.category_name,
        description = category.description,
        is_active = True,
        category_created =  datetime.now()
)

        db.add(new_category)
        db.commit()
        return ("category add succesfully")