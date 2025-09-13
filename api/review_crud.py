from sqlalchemy.orm import Session
from sqlalchemy import func
from model import ProductReview
from schema import ReviewCreate, ReviewUpdate


def create_review(db: Session, review: ReviewCreate):
    existing_review = db.query(ProductReview).filter(
        ProductReview.product_id == review.product_id,
        ProductReview.customer_phone == review.customer_phone
    ).first()

    if existing_review:
        raise ValueError("You have already reviewed this product")

    db_review = ProductReview(
        product_id=review.product_id,
        customer_phone=review.customer_phone,
        rating=review.rating,
        comment=review.comment
    )

    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def get_review(db: Session, review_id: int):
    return db.query(ProductReview).filter(ProductReview.review_id == review_id).first()


def get_product_reviews(db: Session, product_id: int, skip: int = 0, limit: int = 100):
    return db.query(ProductReview).filter(
        ProductReview.product_id == product_id,

    ).offset(skip).limit(limit).all()


def get_review_stats(db: Session, product_id: int):
    avg_result = db.query(func.avg(ProductReview.rating)).filter(
        ProductReview.product_id == product_id
    ).scalar()
    avg_rating = round(avg_result, 1) if avg_result else 0.0

    total_reviews = db.query(func.count(ProductReview.review_id)).filter(
        ProductReview.product_id == product_id
    ).scalar()

    return {
        "product_id": product_id,
        "average_rating": avg_rating,
        "total_reviews": total_reviews
    }


def update_review(db: Session, review_id: int, review_update: ReviewUpdate):
    db_review = db.query(ProductReview).filter(ProductReview.review_id == review_id).first()
    if not db_review:
        return None

    if review_update.rating is not None:
        db_review.rating = review_update.rating
    if review_update.comment is not None:
        db_review.comment = review_update.comment

    db.commit()
    db.refresh(db_review)
    return db_review


def delete_review(db: Session, review_id: int):
    db_review = db.query(ProductReview).filter(ProductReview.review_id == review_id).first()
    if db_review:
        db.delete(db_review)
        db.commit()
        return True
    return False


def get_customer_reviews(db: Session, customer_phone: str):
    return db.query(ProductReview).filter(
        ProductReview.customer_phone == customer_phone
    ).all()