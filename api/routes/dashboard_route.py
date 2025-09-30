from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date,desc,case
from datetime import date
from database import get_db
import admin_auth
from model import Order,Customer,OrderItem, Product 
from typing import List
from pydantic import BaseModel
import datetime



router = APIRouter()


@router.get("/total/revenue")
def total_revenue(db: Session = Depends(get_db),current_user=Depends(admin_auth.require_role("admin"))):
    total = db.query(func.sum(Order.grand_total).label("total_amount")).scalar()
    return {"total_revenue": total or 0}


@router.get("/order/today")
def get_todays_orders(db: Session = Depends(get_db),current_user=Depends(admin_auth.require_role("admin"))):
    today = datetime.date.today()
    
    total_orders = (
        db.query(func.count(Order.order_id))
        .filter(cast(Order.order_date, Date) == today)
        .scalar()
    )
    
    return {"date": str(today), "total_orders": total_orders or 0}


@router.get("/customer/today")
def get_todays_customers(db: Session = Depends(get_db),current_user=Depends(admin_auth.require_role("admin"))):
    today = date.today()

    # Count new customer registrations today
    total_customers = (
        db.query(func.count(Customer.customer_id))  # or Customer.id if that's your PK
        .filter(cast(Customer.created_at, Date) == today)  # adjust column name if different
        .scalar()
    )

    return {"date": str(today), "new_customers": total_customers or 0}

###################  TOP SELLING PRODUCT WITH TOTAL ORDER ################################################

# Response model
class TopProductResponse(BaseModel):
    product_id: int
    product_name: str
    total_ordered: int


@router.get("/top-selling/products/",response_model=list[TopProductResponse])
def get_top_selling_products(db: Session = Depends(get_db),current_user=Depends(admin_auth.require_role("admin"))):
   
    results = (
        db.query(
            OrderItem.product_id,
            Product.name.label("product_name"),
            func.sum(OrderItem.quantity).label("total_ordered")
        )
        .join(Product, Product.id == OrderItem.product_id)  # adjust column name if needed
        .group_by(OrderItem.product_id, Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(3)
        .all()
    )
    return [
        {
            "product_id": r.product_id,
            "product_name": r.product_name,
            "total_ordered": r.total_ordered
        }
        for r in results
    ]
###################  TOP CUSTPMER NAME BY ORDER ################################################


class TopCustomerResponse(BaseModel):
    customer_id: int
    customer_name: str
    total_orders: int


@router.get("/top-customers/by-orders", response_model=list[TopCustomerResponse])
def get_top_customers(db: Session = Depends(get_db),current_user=Depends(admin_auth.require_role("admin"))):
    results = (
        db.query(
            Order.customer_id,
            Customer.customer_name.label("customer_name"),   # use name from customers table
            func.count(Order.order_id).label("total_orders")
        )
        .join(Customer, Customer.customer_id == Order.customer_id)
        .group_by(Order.customer_id, Customer.customer_name)
        .order_by(desc("total_orders"))
        .limit(3)   # top 3 customers
        .all()
    )

    return [
        {
            "customer_id": r.customer_id,
            "customer_name": r.customer_name,
            "total_orders": r.total_orders
        }
        for r in results
    ]
#------------------------------------------ hourely order --------------------

@router.get("/orders/stats/today-by-hour") 
def get_today_orders_by_hour(db: Session = Depends(get_db),current_user=Depends(admin_auth.require_role("admin"))):
    """
    Get today's orders grouped by hour in AM/PM format
    """
    results = (
        db.query(
            func.hour(Order.order_date).label("hour"),
            func.count(Order.order_id).label("orders")
        )
        .filter(func.date(Order.order_date) == func.curdate())
        .group_by(func.hour(Order.order_date))
        .order_by(func.hour(Order.order_date))
        .all()
    )

    # Convert hour to 12-hour AM/PM format
    formatted_results = []
    for r in results:
        hour_24 = r.hour
        if hour_24 == 0:
            label = "12AM"
        elif hour_24 < 12:
            label = f"{hour_24}AM"
        elif hour_24 == 12:
            label = "12PM"
        else:
            label = f"{hour_24 - 12}PM"
        formatted_results.append({"name": label, "orders": r.orders})

    return formatted_results

########################################## mothly order###################

@router.get("/last/7/days")
def get_last_7_days_orders(db: Session = Depends(get_db),current_user=Depends(admin_auth.require_role("admin"))):
    """
    Get last 7 days orders aggregated by day name (Mon, Tue, ... Sun)
    """
    results = (
    db.query(
        func.dayname(Order.order_date).label("day_name"),
        func.count(Order.order_id).label("orders")
    )
    .filter(func.date(Order.order_date) >= func.curdate() - 6)
    .filter(func.date(Order.order_date) <= func.curdate())
    .group_by(func.dayname(Order.order_date))
    .order_by(func.field(func.dayname(Order.order_date),
                         "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"))
    .all()
)

    return [
        {"name": r.day_name[:3], "orders": r.orders}  # "Mon", "Tue", etc.
        for r in results
    ]




################################################### monthly   order #####################

@router.get("/current/month/weeks")
def get_orders_by_week_of_month(db: Session = Depends(get_db),current_user=Depends(admin_auth.require_role("admin"))):
    week_case = case(
        (func.day(Order.order_date).between(1, 7), "Week 1"),
        (func.day(Order.order_date).between(8, 14), "Week 2"),
        (func.day(Order.order_date).between(15, 21), "Week 3"),
        (func.day(Order.order_date).between(22, 31), "Week 4"),
    )

    results = (
        db.query(
            week_case.label("week_of_month"),
            func.count(Order.order_id).label("total_orders"),
        )
        .filter(func.month(Order.order_date) == func.month(func.curdate()))
        .filter(func.year(Order.order_date) == func.year(func.curdate()))
        .group_by("week_of_month")
        .order_by("week_of_month")
        .all()
    )

    return [
        {"week_of_month": r.week_of_month, "total_orders": r.total_orders}
        for r in results
    ]

################################### yearly order ########################



# @router.get("/yearly")   ##### not work
@router.get("/orders/stats/yearly")   ### working
def get_yearly_orders(db: Session = Depends(get_db),current_user=Depends(admin_auth.require_role("admin"))):
    """
    Get orders count for each month of the current year
    """
    results = (
        db.query(
            func.month(Order.order_date).label("month_number"),
            func.monthname(Order.order_date).label("month_name"),
            func.count(Order.order_id).label("orders")
        )
        .filter(func.year(Order.order_date) == func.year(func.curdate()))
        .group_by(func.month(Order.order_date), func.monthname(Order.order_date))
        .order_by(func.month(Order.order_date))
        .all()
    )

    return [
        {"name": r.month_name, "orders": r.orders}
        for r in results
    ]
