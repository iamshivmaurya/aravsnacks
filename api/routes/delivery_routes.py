from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schema import (
    WarehouseCreate, WarehouseUpdate, WarehouseResponse,
    DeliveryAgentCreate, DeliveryAgentUpdate, DeliveryAgentResponse,
    GenerateOTPRequest, VerifyOTPRequest, OTPResponse, OrderAssignmentResponse
)
from delivery_crud import (
    create_warehouse, get_warehouse, get_all_warehouses, update_warehouse, delete_warehouse,
    create_delivery_agent, get_delivery_agent, get_all_delivery_agents, update_delivery_agent, delete_delivery_agent,
    assign_order_to_warehouse_and_agent, generate_delivery_otp, verify_delivery_otp, update_agent_status
)
from typing import List

router = APIRouter()


# Warehouse Routes
@router.post("/warehouses", response_model=WarehouseResponse)
def create_warehouse_route(warehouse: WarehouseCreate, db: Session = Depends(get_db)):
    try:
        return create_warehouse(db, warehouse)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# @router.get("/warehouses2", response_model=WarehouseResponse)
# def get_warehouses_route(db: Session = Depends(get_db)):
#     return get_all_warehouses(db)



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
def generate_otp_route(order_id: int, request: GenerateOTPRequest, db: Session = Depends(get_db)):
    try:
        # In real scenario, agent_id would come from authenticated agent
        # For now, we'll get the agent assigned to this order
        agent = db.query(DeliveryAgent).filter(DeliveryAgent.current_order_id == order_id).first()
        if not agent:
            raise HTTPException(status_code=400, detail="No agent assigned to this order")

        result = generate_delivery_otp(db, order_id, agent.id, request.customer_phone)
        return OTPResponse(
            otp_code=result["otp_code"],
            message=result["message"],
            expires_at=result["expires_at"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/orders/{order_id}/verify-delivery")
def verify_delivery_route(order_id: int, request: VerifyOTPRequest, db: Session = Depends(get_db)):
    try:
        result = verify_delivery_otp(db, order_id, request.otp_code, request.customer_phone)
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