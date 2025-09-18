from sqlalchemy.orm import Session
from sqlalchemy import func
from model import ProductTracking, POSTAL_CODE_COORDINATES, WAREHOUSE_COORDINATES, Order, OrderAddress
from schema import TrackingCreate, TrackingStatusUpdate
from datetime import datetime, timedelta
import math


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates using Haversine formula"""
    R = 6371  # Earth radius in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c

    return distance


def get_order_postal_code(db: Session, order_id: int):
    """Get destination postal code from order address"""
    order_address = db.query(OrderAddress).filter(
        OrderAddress.order_id == order_id,
        OrderAddress.address_type == "shipping"
    ).first()

    if order_address:
        return order_address.postal_code
    return None


def calculate_delivery_time(warehouse_id, destination_postal_code):
    """Calculate delivery time based on distance (5 minutes per km)"""
    if (warehouse_id not in WAREHOUSE_COORDINATES or
            destination_postal_code not in POSTAL_CODE_COORDINATES):
        return None, None, None

    warehouse = WAREHOUSE_COORDINATES[warehouse_id]
    destination = POSTAL_CODE_COORDINATES[destination_postal_code]

    distance = calculate_distance(
        warehouse["lat"], warehouse["lon"],
        destination["lat"], destination["lon"]
    )

    # 5 minutes per kilometer
    delivery_minutes = distance * 5
    estimated_time = datetime.now() + timedelta(minutes=delivery_minutes)

    return estimated_time, distance, delivery_minutes


def create_tracking(db: Session, tracking: TrackingCreate):
    # Get destination postal code from order
    destination_postal_code = get_order_postal_code(db, tracking.order_id)
    if not destination_postal_code:
        raise ValueError("Order shipping address not found")

    # Calculate estimated delivery time
    estimated_time, distance, minutes = calculate_delivery_time(
        tracking.warehouse_id, destination_postal_code
    )

    db_tracking = ProductTracking(
        order_id=tracking.order_id,
        customer_id=db.query(Order).filter(Order.order_id == tracking.order_id).first().customer_id,
        warehouse_id=tracking.warehouse_id,
        destination_postal_code=destination_postal_code,
        current_status="Order Received",
        estimated_delivery_time=estimated_time
    )

    db.add(db_tracking)
    db.commit()
    db.refresh(db_tracking)

    return db_tracking, distance, minutes


def update_tracking_status(db: Session, tracking_id: int, status_update: TrackingStatusUpdate):
    db_tracking = db.query(ProductTracking).filter(ProductTracking.tracking_id == tracking_id).first()
    if not db_tracking:
        return None

    status_mapping = {
        "Order Packed": "order_packed_time",
        "Order Shipped": "order_shipped_time",
        "On The Way": "on_the_way_time",
        "Order Arrived": "order_arrived_time",
        "Order Delivered": "order_delivered_time"
    }

    if status_update.status in status_mapping:
        setattr(db_tracking, status_mapping[status_update.status], datetime.now())
        db_tracking.current_status = status_update.status

    db.commit()
    db.refresh(db_tracking)
    return db_tracking


def get_tracking_with_stages(db: Session, order_id: int):
    db_tracking = db.query(ProductTracking).filter(ProductTracking.order_id == order_id).first()
    if not db_tracking:
        return None

    # Define all stages
    stages = [
        {"name": "Order Received", "time_field": db_tracking.order_received_time},
        {"name": "Order Packed", "time_field": db_tracking.order_packed_time},
        {"name": "Order Shipped", "time_field": db_tracking.order_shipped_time},
        {"name": "On The Way", "time_field": db_tracking.on_the_way_time},
        {"name": "Order Arrived", "time_field": db_tracking.order_arrived_time},
        {"name": "Order Delivered", "time_field": db_tracking.order_delivered_time}
    ]

    # Prepare stage information
    stage_data = []
    current_stage_reached = False

    for stage in stages:
        status = "pending"
        display_time = None

        if stage["time_field"]:
            status = "completed"
            display_time = stage["time_field"].strftime("%b %d, %Y %I:%M %p")
        elif stage["name"] == db_tracking.current_status:
            status = "current"
            current_stage_reached = True
        elif current_stage_reached:
            status = "pending"

        stage_data.append({
            "stage_name": stage["name"],
            "status": status,
            "timestamp": stage["time_field"],
            "display_time": display_time
        })

    # Calculate time remaining
    time_remaining = None
    if db_tracking.estimated_delivery_time:
        remaining = db_tracking.estimated_delivery_time - datetime.now()
        if remaining.total_seconds() > 0:
            hours, remainder = divmod(remaining.total_seconds(), 3600)
            minutes = remainder // 60
            time_remaining = f"{int(hours)}h {int(minutes)}m"

    # Calculate distance
    distance_km = None
    if (db_tracking.warehouse_id in WAREHOUSE_COORDINATES and
            db_tracking.destination_postal_code in POSTAL_CODE_COORDINATES):
        warehouse = WAREHOUSE_COORDINATES[db_tracking.warehouse_id]
        destination = POSTAL_CODE_COORDINATES[db_tracking.destination_postal_code]
        distance_km = calculate_distance(
            warehouse["lat"], warehouse["lon"],
            destination["lat"], destination["lon"]
        )

    return {
        "tracking_id": db_tracking.tracking_id,
        "order_id": db_tracking.order_id,
        "customer_id": db_tracking.customer_id,
        "warehouse_id": db_tracking.warehouse_id,
        "warehouse_name": WAREHOUSE_COORDINATES.get(db_tracking.warehouse_id, {}).get("name", "Unknown"),
        "destination_postal_code": db_tracking.destination_postal_code,
        "destination_city": POSTAL_CODE_COORDINATES.get(db_tracking.destination_postal_code, {}).get("city", "Unknown"),
        "current_status": db_tracking.current_status,
        "estimated_delivery_time": db_tracking.estimated_delivery_time,
        "stages": stage_data,
        "distance_km": round(distance_km, 2) if distance_km else None,
        "time_remaining": time_remaining,
        "created_at": db_tracking.created_at,
        "updated_at": db_tracking.updated_at
    }