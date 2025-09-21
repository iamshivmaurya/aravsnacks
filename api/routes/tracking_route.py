from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import TrackingCreate, TrackingStatusUpdate, TrackingResponse
from tracking_crud import create_tracking, update_tracking_status, get_tracking_with_stages
from model import ProductTracking

router = APIRouter(prefix="/tracking", tags=["Tracking"])


@router.post("/", response_model=TrackingResponse)
def create_tracking_endpoint(tracking: TrackingCreate, db: Session = Depends(get_db)):
    try:
        db_tracking, distance, minutes = create_tracking(db, tracking)
        return get_tracking_with_stages(db, db_tracking.order_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.patch("/{order_id}/status", response_model=TrackingResponse)
def update_status_endpoint(
        order_id: int,
        status_update: TrackingStatusUpdate,
        db: Session = Depends(get_db)
):
    db_tracking = db.query(ProductTracking).filter(ProductTracking.order_id == order_id).first()
    if not db_tracking:
        raise HTTPException(status_code=404, detail="Tracking not found")

    updated_tracking = update_tracking_status(db, db_tracking.tracking_id, status_update)
    if not updated_tracking:
        raise HTTPException(status_code=400, detail="Invalid status update")

    return get_tracking_with_stages(db, order_id)


@router.get("/{order_id}", response_model=TrackingResponse)
def get_tracking_endpoint(order_id: int, db: Session = Depends(get_db)):
    tracking_data = get_tracking_with_stages(db, order_id)
    if not tracking_data:
        raise HTTPException(status_code=404, detail="Tracking not found")
    return tracking_data