from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import ReviewCreate, ReviewUpdate, ReviewResponse, ReviewStatsResponse
from review_crud import create_review, get_review, get_product_reviews, get_review_stats, update_review, delete_review, get_customer_reviews
from typing import List

router = APIRouter()

@router.post("/", response_model=ReviewResponse)
def create_review_endpoint(review: ReviewCreate, db: Session = Depends(get_db)):
    try:
        db_review = create_review(db, review)
        return db_review
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{review_id}", response_model=ReviewResponse)
def get_review_endpoint(review_id: int, db: Session = Depends(get_db)):
    db_review = get_review(db, review_id)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    return db_review

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
def get_product_reviews_endpoint(product_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_product_reviews(db, product_id, skip, limit)

@router.get("/product/{product_id}/stats", response_model=ReviewStatsResponse)
def get_review_stats_endpoint(product_id: int, db: Session = Depends(get_db)):
    return get_review_stats(db, product_id)

@router.put("/{review_id}", response_model=ReviewResponse)
def update_review_endpoint(review_id: int, review_update: ReviewUpdate, db: Session = Depends(get_db)):
    db_review = update_review(db, review_id, review_update)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    return db_review

@router.delete("/{review_id}")
def delete_review_endpoint(review_id: int, db: Session = Depends(get_db)):
    success = delete_review(db, review_id)
    if not success:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted successfully"}

@router.get("/customer/{customer_phone}", response_model=List[ReviewResponse])
def get_customer_reviews_endpoint(customer_phone: str, db: Session = Depends(get_db)):
    return get_customer_reviews(db, customer_phone)