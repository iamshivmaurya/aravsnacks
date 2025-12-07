from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import random
from datetime import datetime, timedelta
from model import Warehouse, DeliveryAgent, DeliveryOTP, Order, ProductTracking, OrderAddress, PostalCode
from schema import WarehouseCreate, WarehouseUpdate, DeliveryAgentCreate, DeliveryAgentUpdate
from typing import List, Optional
import admin_auth


# Warehouse CRUD

def _get_delivery_agent(db: Session, agent_id: int):
    """Safe way to get delivery agent"""
    from model import DeliveryAgent
    return db.query(DeliveryAgent).filter(DeliveryAgent.id == agent_id).first()

def _query_agents_by_order(db: Session, order_id: int):
    """Safe way to query agents by order"""
    from model import DeliveryAgent
    return db.query(DeliveryAgent).filter(DeliveryAgent.current_order_id == order_id).first()

def get_order_assignment_status(db: Session, order_id: int):
    """Check if order is already assigned to warehouse and agent"""
    tracking = db.query(ProductTracking).filter(ProductTracking.order_id == order_id).first()
    assigned_agent = db.query(DeliveryAgent).filter(DeliveryAgent.current_order_id == order_id).first()

    return {
        "is_assigned": bool(tracking and tracking.warehouse_id and assigned_agent),
        "warehouse_id": tracking.warehouse_id if tracking else None,
        "agent_id": assigned_agent.id if assigned_agent else None,
        "agent_name": assigned_agent.name if assigned_agent else None
    }


def is_agent_assigned_to_order(db: Session, agent_id: int, order_id: int):
    """Check if specific agent is assigned to this order"""
    return db.query(DeliveryAgent).filter(
        and_(
            DeliveryAgent.id == agent_id,
            DeliveryAgent.current_order_id == order_id
        )
    ).first() is not None
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
    # Check if order is already assigned
    assignment_status = get_order_assignment_status(db, order_id)
    if assignment_status["is_assigned"]:
        raise ValueError(
            f"Order already assigned to agent {assignment_status['agent_name']} and warehouse {assignment_status['warehouse_id']}")

    # Get order
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise ValueError("Order not found")

    # Get available agents
    available_agents = get_available_agents(db)
    if not available_agents:
        raise ValueError("No available delivery agents at the moment")

    # Select random warehouse from existing 3
    warehouse_ids = [1, 2, 3]
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
            OrderAddress.address_type.in_(["shipping", "permanent"])
        ).first()

        tracking = ProductTracking(
            order_id=order_id,
            customer_id=order.customer_id,
            warehouse_id=selected_warehouse_id,
            destination_postal_code=shipping_address.postal_code if shipping_address else "",
            current_status="Order Packed",
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


def generate_delivery_otp(db: Session, order_id: int, agent_id: int):
    # LAZY IMPORT inside function
    from model import DeliveryAgent, DeliveryOTP, OrderAddress, ProductTracking

    # Verify agent is assigned to this order
    agent = db.query(DeliveryAgent).filter(
        and_(
            DeliveryAgent.id == agent_id,
            DeliveryAgent.current_order_id == order_id
        )
    ).first()

    if not agent:
        raise ValueError("Agent not assigned to this order")

    # Rest of your function remains the same...
    # Get customer phone from order shipping address automatically
    shipping_address = db.query(OrderAddress).filter(
        OrderAddress.order_id == order_id,
        OrderAddress.address_type == 'shipping'
    ).first()

    if not shipping_address:
        raise ValueError("Shipping address not found for this order")

    customer_phone = shipping_address.phone_no

    # Generate 4-digit OTP
    otp_code = str(random.randint(1000, 9999))
    expires_at = datetime.now() + timedelta(minutes=5)

    # Create OTP record
    otp_record = DeliveryOTP(
        order_id=order_id,
        agent_id=agent_id,
        otp_code=otp_code,
        customer_phone=customer_phone,
        customer_email=db.query(Order).filter(Order.order_id == order_id).first().customer_email,
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
        "customer_phone": customer_phone,
        "expires_at": expires_at,
        "message": "OTP generated successfully and sent to customer"
    }


def verify_delivery_otp(db: Session, order_id: int, otp_code: str):
    # Find valid OTP record for this specific order
    otp_record = db.query(DeliveryOTP).filter(
        and_(
            DeliveryOTP.order_id == order_id,  # Specific to this order
            DeliveryOTP.otp_code == otp_code,
            DeliveryOTP.expires_at > datetime.now(),
            DeliveryOTP.verified == False
        )
    ).first()

    if not otp_record:
        raise ValueError("Invalid or expired OTP for this order")

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


def reassign_order_agent(db: Session, order_id: int, current_agent_id: int = None, initiated_by: str = "agent"):
    """
    Reassign order to a new available agent
    initiated_by: "agent" or "admin"
    """

    # Check if order exists and is assigned
    assignment_status = get_order_assignment_status(db, order_id)
    if not assignment_status["is_assigned"]:
        raise ValueError("Order is not assigned to any agent")

    # If initiated by agent, verify they are currently assigned
    if initiated_by == "agent" and current_agent_id:
        if not is_agent_assigned_to_order(db, current_agent_id, order_id):
            raise ValueError("You are not assigned to this order")

    # Get available agents (excluding current agent if any)
    available_agents = db.query(DeliveryAgent).filter(
        and_(
            DeliveryAgent.available == True,
            DeliveryAgent.is_active == True,
            DeliveryAgent.id != assignment_status["agent_id"]  # Exclude current agent
        )
    ).all()

    if not available_agents:
        raise ValueError("No other available delivery agents at the moment")

    # Get current agent
    current_agent = db.query(DeliveryAgent).filter(DeliveryAgent.id == assignment_status["agent_id"]).first()

    # Select new agent
    new_agent = available_agents[0]

    # Update tracking status to indicate reassignment
    tracking = db.query(ProductTracking).filter(ProductTracking.order_id == order_id).first()
    if tracking:
        tracking.current_status = "Reassigning Agent"

    # Free current agent
    if current_agent:
        current_agent.current_order_id = None
        current_agent.available = True

    # Assign to new agent
    new_agent.current_order_id = order_id
    new_agent.available = False

    # Update tracking status back to packed (ready for delivery)
    if tracking:
        tracking.current_status = "Order Packed"

    db.commit()

    return {
        "order_id": order_id,
        "previous_agent_id": assignment_status["agent_id"],
        "previous_agent_name": assignment_status["agent_name"],
        "new_agent_id": new_agent.id,
        "new_agent_name": new_agent.name,
        "warehouse_id": assignment_status["warehouse_id"],
        "initiated_by": initiated_by
    }