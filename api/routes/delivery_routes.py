# Standard library imports first
from typing import List

# Third-party imports
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Local imports
from database import get_db
from schema import (
    WarehouseCreate, WarehouseUpdate, WarehouseResponse,
    DeliveryAgentCreate, DeliveryAgentUpdate, DeliveryAgentResponse,
    GenerateOTPRequest, OTPResponse, OrderAssignmentResponse,
    OrderAssignmentStatus, ReassignOrderRequest, ReassignOrderResponse
)
from delivery_crud import (
    create_warehouse, get_warehouse, get_all_warehouses, update_warehouse, delete_warehouse,
    create_delivery_agent, get_delivery_agent, get_all_delivery_agents, update_delivery_agent, delete_delivery_agent,
    assign_order_to_warehouse_and_agent, generate_delivery_otp, verify_delivery_otp, update_agent_status,
    get_order_assignment_status, reassign_order_agent
)

router = APIRouter()


# Warehouse Routes
@router.post("/warehouses", response_model=WarehouseResponse)
def create_warehouse_route(warehouse: WarehouseCreate, db: Session = Depends(get_db)):
    try:
        return create_warehouse(db, warehouse)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@router.get("/allwarehouses", response_model=List[WarehouseResponse])
def get_warehouses_route(db: Session = Depends(get_db)):
    return get_all_warehouses(db)



@router.get("/warehouses/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse_route(warehouse_id: int, db: Session = Depends(get_db)):
    warehouse = get_warehouse(db, warehouse_id)
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse


@router.put("/warehouses/{warehouse_id}", response_model=WarehouseResponse)
def update_warehouse_route(warehouse_id: int, warehouse: WarehouseUpdate, db: Session = Depends(get_db)):
    updated_warehouse = update_warehouse(db, warehouse_id, warehouse)
    if not updated_warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return updated_warehouse


@router.delete("/warehouses/{warehouse_id}")
def delete_warehouse_route(warehouse_id: int, db: Session = Depends(get_db)):
    success = delete_warehouse(db, warehouse_id)
    if not success:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return {"message": "Warehouse deleted successfully"}


# Delivery Agent Routes
@router.post("/delivery-agents", response_model=DeliveryAgentResponse)
def create_delivery_agent_route(agent: DeliveryAgentCreate, db: Session = Depends(get_db)):
    try:
        return create_delivery_agent(db, agent)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/delivery-agents", response_model=List[DeliveryAgentResponse])
def get_delivery_agents_route(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_all_delivery_agents(db, skip=skip, limit=limit)


@router.get("/delivery-agents/{agent_id}", response_model=DeliveryAgentResponse)
def get_delivery_agent_route(agent_id: int, db: Session = Depends(get_db)):
    agent = get_delivery_agent(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Delivery agent not found")
    return agent


@router.put("/delivery-agents/{agent_id}", response_model=DeliveryAgentResponse)
def update_delivery_agent_route(agent_id: int, agent: DeliveryAgentUpdate, db: Session = Depends(get_db)):
    updated_agent = update_delivery_agent(db, agent_id, agent)
    if not updated_agent:
        raise HTTPException(status_code=404, detail="Delivery agent not found")
    return updated_agent


@router.delete("/delivery-agents/{agent_id}")
def delete_delivery_agent_route(agent_id: int, db: Session = Depends(get_db)):
    success = delete_delivery_agent(db, agent_id)
    if not success:
        raise HTTPException(status_code=404, detail="Delivery agent not found")
    return {"message": "Delivery agent deleted successfully"}


# Order Assignment & Delivery Routes
@router.post("/orders/{order_id}/assign", response_model=OrderAssignmentResponse)
def assign_order_route(order_id: int, db: Session = Depends(get_db)):
    try:
        result = assign_order_to_warehouse_and_agent(db, order_id)
        return {
            "order_id": order_id,
            "warehouse_id": result["warehouse_id"],
            "warehouse_name": f"Warehouse {result['warehouse_id']}",
            "agent_id": result["agent_id"],
            "agent_name": result["agent_name"],
            "message": "Order assigned successfully"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/orders/{order_id}/generate-otp", response_model=OTPResponse)
def generate_otp_route(order_id: int, db: Session = Depends(get_db)):
    try:
        print(f"DEBUG: Starting OTP for order {order_id}")

        # LAZY IMPORT - Import inside the function to avoid circular imports
        from model import DeliveryAgent
        from delivery_crud import generate_delivery_otp

        print("DEBUG: After import")

        agent = db.query(DeliveryAgent).filter(DeliveryAgent.current_order_id == order_id).first()
        print(f"DEBUG: Agent query result: {agent}")

        if not agent:
            raise HTTPException(status_code=400, detail="No agent assigned to this order")

        print(f"DEBUG: Agent found: {agent.name} (ID: {agent.id})")

        result = generate_delivery_otp(db, order_id, agent.id)
        print(f"DEBUG: OTP generated: {result}")

        return OTPResponse(
            otp_code=result["otp_code"],
            message=result["message"],
            expires_at=result["expires_at"],
            customer_phone=result["customer_phone"]
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: ERROR in generate_otp_route: {e}")
        print(f"DEBUG: Error type: {type(e).__name__}")
        import traceback
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/orders/{order_id}/verify-delivery")
def verify_delivery_route(order_id: int, otp_code: str, db: Session = Depends(get_db)):
    try:
        # No phone in request - auto-validated from order
        result = verify_delivery_otp(db, order_id, otp_code)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.patch("/agents/{agent_id}/status")
def update_agent_status_route(agent_id: int, available: bool, db: Session = Depends(get_db)):
    try:
        agent = update_agent_status(db, agent_id, available)
        return {
            "message": f"Agent status updated to {'available' if available else 'unavailable'}",
            "agent_id": agent_id,
            "available": available
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Add this route to check assignment status
@router.get("/orders/{order_id}/assignment-status", response_model=OrderAssignmentStatus)
def get_order_assignment_status_route(order_id: int, db: Session = Depends(get_db)):
    try:
        status = get_order_assignment_status(db, order_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking assignment status: {str(e)}")


# Add agent-initiated reassignment
@router.post("/orders/{order_id}/reassign-agent", response_model=ReassignOrderResponse)
def agent_reassign_order_route(order_id: int, request: ReassignOrderRequest, db: Session = Depends(get_db)):
    try:
        if not request.current_agent_id:
            raise HTTPException(status_code=400, detail="current_agent_id is required for agent-initiated reassignment")

        result = reassign_order_agent(db, order_id, request.current_agent_id, "agent")
        return ReassignOrderResponse(
            **result,
            message=f"Order reassigned from {result['previous_agent_name']} to {result['new_agent_name']}"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Add admin-initiated reassignment (no agent_id required)
@router.post("/orders/{order_id}/admin-reassign", response_model=ReassignOrderResponse)
def admin_reassign_order_route(order_id: int, db: Session = Depends(get_db)):
    try:
        result = reassign_order_agent(db, order_id, None, "admin")
        return ReassignOrderResponse(
            **result,
            message=f"Order reassigned by admin from {result['previous_agent_name']} to {result['new_agent_name']}"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/debug/model-check")
def debug_model_check(db: Session = Depends(get_db)):
    try:
        # Test 1: Check if we can import DeliveryAgent
        from model import DeliveryAgent
        import_success = True
    except ImportError as e:
        return {"import_error": str(e), "error_type": "ImportError"}

    try:
        # Test 2: Check if we can query DeliveryAgent
        agents = db.query(DeliveryAgent).all()
        query_success = True
        agents_count = len(agents)
    except Exception as e:
        return {
            "import_success": True,
            "query_error": str(e),
            "error_type": type(e).__name__
        }

    try:
        # Test 3: Check table structure
        table_info = db.execute("PRAGMA table_info(delivery_agents)").fetchall()
        columns = [{"name": col[1], "type": col[2]} for col in table_info]
    except Exception as e:
        columns = f"Error getting table info: {e}"

    return {
        "import_success": import_success,
        "query_success": query_success,
        "agents_count": agents_count,
        "table_columns": columns,
        "delivery_agent_class": str(DeliveryAgent)
    }