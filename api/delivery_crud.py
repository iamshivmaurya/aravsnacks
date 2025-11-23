from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import random
from datetime import datetime, timedelta
from model import Warehouse, DeliveryAgent, DeliveryOTP, Order, ProductTracking, OrderAddress
from schema import WarehouseCreate, WarehouseUpdate, DeliveryAgentCreate, DeliveryAgentUpdate
from typing import List, Optional
import admin_auth


# Warehouse CRUD
def create_warehouse(db: Session, warehouse: WarehouseCreate):
    db_warehouse = Warehouse(**warehouse.dict())
    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse


def get_warehouse(db: Session, warehouse_id: int):
    return db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()


def get_all_warehouses(db: Session):
    return db.query(Warehouse).all()


def update_warehouse(db: Session, warehouse_id: int, warehouse_data: WarehouseUpdate):
    db_warehouse = get_warehouse(db, warehouse_id)
    if not db_warehouse:
        return None

    update_data = warehouse_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_warehouse, key, value)

    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse


def delete_warehouse(db: Session, warehouse_id: int):
    db_warehouse = get_warehouse(db, warehouse_id)
    if not db_warehouse:
        return False

    db.delete(db_warehouse)
    db.commit()
    return True


# Delivery Agent CRUD
def create_delivery_agent(db: Session, agent: DeliveryAgentCreate):
    # Check if phone number already exists
    existing_agent = db.query(DeliveryAgent).filter(DeliveryAgent.phone_number == agent.phone_number).first()
    if existing_agent:
        raise ValueError("Delivery agent with this phone number already exists")

    hashed_password = admin_auth.get_password_hash(agent.password)

    db_agent = DeliveryAgent(
        name=agent.name,
        phone_number=agent.phone_number,
        email=agent.email,
        password_hash=hashed_password,
        vehicle_type=agent.vehicle_type,
        vehicle_number=agent.vehicle_number,
        is_active=agent.is_active,
        available=agent.available
    )

    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent


def get_delivery_agent(db: Session, agent_id: int):
    return db.query(DeliveryAgent).filter(DeliveryAgent.id == agent_id).first()


def get_all_delivery_agents(db: Session, skip: int = 0, limit: int = 100):
    return db.query(DeliveryAgent).offset(skip).limit(limit).all()


def get_available_agents(db: Session):
    return db.query(DeliveryAgent).filter(
        and_(
            DeliveryAgent.available == True,
            DeliveryAgent.is_active == True
        )
    ).all()


def update_delivery_agent(db: Session, agent_id: int, agent_data: DeliveryAgentUpdate):
    db_agent = get_delivery_agent(db, agent_id)
    if not db_agent:
        return None

    update_data = agent_data.dict(exclude_unset=True)

    # Handle password update
    if 'password' in update_data:
        db_agent.password_hash = admin_auth.get_password_hash(update_data['password'])
        del update_data['password']

    for key, value in update_data.items():
        setattr(db_agent, key, value)

    db.commit()
    db.refresh(db_agent)
    return db_agent


def delete_delivery_agent(db: Session, agent_id: int):
    db_agent = get_delivery_agent(db, agent_id)
    if not db_agent:
        return False

    db.delete(db_agent)
    db.commit()
    return True


# Order Assignment Logic
def assign_order_to_warehouse_and_agent(db: Session, order_id: int):
    # Get order
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise ValueError("Order not found")

    # Get available agents
    available_agents = get_available_agents(db)
    if not available_agents:
        raise ValueError("No available delivery agents at the moment")

    # Select random warehouse from existing 3
    warehouse_ids = [1, 2, 3]  # From your existing WAREHOUSE_COORDINATES
    selected_warehouse_id = random.choice(warehouse_ids)

    # Select first available agent
    selected_agent = available_agents[0]

    # Update agent's current order and availability
    selected_agent.current_order_id = order_id
    selected_agent.available = False

    # Create or update tracking record
    tracking = db.query(ProductTracking).filter(ProductTracking.order_id == order_id).first()
    if not tracking:
        # Create new tracking record
        shipping_address = db.query(OrderAddress).filter(
            OrderAddress.order_id == order_id,
            OrderAddress.address_type == 'shipping'
        ).first()

        tracking = ProductTracking(
            order_id=order_id,
            customer_id=order.customer_id,
            warehouse_id=selected_warehouse_id,
            destination_postal_code=shipping_address.postal_code if shipping_address else "",
            current_status="Order Packed",  # Move to next status
            order_packed_time=datetime.now()
        )
        db.add(tracking)
    else:
        # Update existing tracking
        tracking.warehouse_id = selected_warehouse_id
        tracking.current_status = "Order Packed"
        tracking.order_packed_time = datetime.now()

    db.commit()

    return {
        "order_id": order_id,
        "warehouse_id": selected_warehouse_id,
        "agent_id": selected_agent.id,
        "agent_name": selected_agent.name
    }


# OTP Management
def generate_delivery_otp(db: Session, order_id: int, agent_id: int, customer_phone: str):
    # Verify agent is assigned to this order
    agent = db.query(DeliveryAgent).filter(
        and_(
            DeliveryAgent.id == agent_id,
            DeliveryAgent.current_order_id == order_id
        )
    ).first()

    if not agent:
        raise ValueError("Agent not assigned to this order")

    # Verify customer phone matches order
    order = db.query(Order).filter(Order.order_id == order_id).first()
    shipping_address = db.query(OrderAddress).filter(
        OrderAddress.order_id == order_id,
        OrderAddress.address_type == 'shipping'
    ).first()

    if not shipping_address or shipping_address.phone_no != customer_phone:
        raise ValueError("Customer phone does not match order details")

    # Generate 4-digit OTP
    otp_code = str(random.randint(1000, 9999))
    expires_at = datetime.now() + timedelta(minutes=5)

    # Create OTP record
    otp_record = DeliveryOTP(
        order_id=order_id,
        agent_id=agent_id,
        otp_code=otp_code,
        customer_phone=customer_phone,
        customer_email=order.customer_email,
        expires_at=expires_at
    )

    db.add(otp_record)

    # Update tracking status to "Out for Delivery"
    tracking = db.query(ProductTracking).filter(ProductTracking.order_id == order_id).first()
    if tracking:
        tracking.current_status = "Out for Delivery"
        tracking.order_shipped_time = datetime.now()

    db.commit()

    return {
        "otp_code": otp_code,
        "expires_at": expires_at,
        "message": "OTP generated successfully"
    }


def verify_delivery_otp(db: Session, order_id: int, otp_code: str, customer_phone: str):
    # Find valid OTP record
    otp_record = db.query(DeliveryOTP).filter(
        and_(
            DeliveryOTP.order_id == order_id,
            DeliveryOTP.otp_code == otp_code,
            DeliveryOTP.customer_phone == customer_phone,
            DeliveryOTP.expires_at > datetime.now(),
            DeliveryOTP.verified == False
        )
    ).first()

    if not otp_record:
        raise ValueError("Invalid or expired OTP")

    # Mark OTP as verified
    otp_record.verified = True

    # Update tracking status to "Order Delivered"
    tracking = db.query(ProductTracking).filter(ProductTracking.order_id == order_id).first()
    if tracking:
        tracking.current_status = "Order Delivered"
        tracking.order_delivered_time = datetime.now()

    # Update agent status and increment deliveries
    agent = db.query(DeliveryAgent).filter(DeliveryAgent.id == otp_record.agent_id).first()
    if agent:
        agent.current_order_id = None
        agent.available = True
        agent.total_deliveries += 1

    db.commit()

    return {
        "message": "Delivery verified successfully",
        "order_id": order_id,
        "status": "Delivered"
    }


def update_agent_status(db: Session, agent_id: int, available: bool):
    agent = get_delivery_agent(db, agent_id)
    if not agent:
        raise ValueError("Agent not found")

    agent.available = available
    db.commit()
    return agent