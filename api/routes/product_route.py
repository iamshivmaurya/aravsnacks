from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import CreateProduct, ProductResponse
from product_crud import create_product, get_product, get_products, update_product, delete_product
from typing import List
from fastapi import FastAPI, File, UploadFile
 
import shutil
import os

router = APIRouter()  # <-- applied to ALL routes

@router.post("/products", response_model=ProductResponse)
def create_product_route(product: CreateProduct, db: Session = Depends(get_db)):
    try:
        db_product = create_product(db, product)
        return db_product
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/products/{product_id}", response_model=ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    db_product = get_product(db, product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.get("/products", response_model=List[ProductResponse])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = get_products(db, skip=skip, limit=limit)
    return products

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product_route(product_id: int, product: CreateProduct, db: Session = Depends(get_db)):
    db_product = update_product(db, product_id, product.dict(exclude_unset=True))
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.delete("/products/{product_id}")
def delete_product_route(product_id: int, db: Session = Depends(get_db)):
    success = delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

UPLOAD_DIR = "media/"

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ✅ Always return served URL
    return {"url": f"http://127.0.0.1:8000/media/{file.filename}"}