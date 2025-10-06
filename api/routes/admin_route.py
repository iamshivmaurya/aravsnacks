from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from database import get_db
import admin_schema, admin_model, admin_crud, admin_auth
from model import Product 



router = APIRouter()

@router.post("/login", response_model=dict)
def login(data: dict, db: Session = Depends(get_db)):
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="username & password required")
    user = admin_crud.get_user_by_username(db, username)
    if not user or not admin_auth.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = admin_auth.create_access_token(data={"sub": user.username, "role": user.role.name})
    return {"access_token": token, "token_type": "bearer", "username": user.username, "role": user.role.name}

@router.get("/users/me")
def users_me(token: str = Depends(admin_auth.security), db: Session = Depends(get_db)):
    user = admin_auth.get_current_user_from_token(token, db)
    return {"username": user.username, "role": user.role.name}


@router.get("/users")
def get_users_with_total(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_role("admin"))
):
    total = db.query(admin_model.User).count()
    users = admin_crud.list_users(db, skip=skip, limit=limit)
    return {
        "total": total,
        "users": [
            {"id": u.id, "username": u.username, "role": u.role.name, "is_active": u.is_active}
            for u in users
        ]
    }


@router.post("/users", response_model=admin_schema.UserOut)
def create_user(user_in: admin_schema.UserCreate, db: Session = Depends(get_db), current_user=Depends(admin_auth.require_role("admin"))):
    try:
        user = admin_crud.create_user(db, user_in)
        return {"id": user.id, "username": user.username, "role": user.role.name}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    


# Protected route for specific product
@router.get("/products/{product_id}")
def get_product(
    product_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_role("admin"))
):
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "message": f"Product details for ID {product_id}",
        "admin": current_user.user_name,
        "product": {
            "id": product.id,
            "name": product.name,
            "price": float(product.product_price),
            "sku": product.sku,
            "description": product.description,
            "quantity": product.quantity,
            "image_url": product.image_url
        }
    }



# Example of a protected product route using cookies
@router.get("/products")
def get_all_products(
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(admin_auth.require_role("admin"))
):
    """
    Get all products - Admin access only.
    
    Requires admin session cookie.
    """
    products = db.query(Product).all()
    
    return {
        "message": f"Welcome {current_user.user_name}",
        "products": [{
            "id": product.id,
            "name": product.name,
            "price": float(product.product_price),
            "sku": product.sku,
            "quantity": product.quantity
        } for product in products]
    }
