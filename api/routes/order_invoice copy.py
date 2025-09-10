from fastapi import APIRouter
from sqlalchemy.orm import Session
from database import get_db


from fastapi import Response
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO

router = APIRouter()

@router.get("/invoice/{order_id}")
def generate_invoice(order_id: int):
    print(order_id)
    buffer = BytesIO()

    # Create PDF
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 20)
    c.drawString(200, height - 100, "Invoice")

    c.setFont("Helvetica", 12)
    c.drawString(50, height - 150, f"Order ID: {order_id}")
    c.drawString(50, height - 170, "Customer: John Doe")
    c.drawString(50, height - 190, "Email: john@example.com")

    # Example items
    items = [
        {"name": "Chips", "qty": 2, "price": 50},
        {"name": "Cookies", "qty": 1, "price": 80},
    ]

    y = height - 230
    total = 0
    for item in items:
        line = f"{item['name']} - Qty: {item['qty']} - Price: ₹{item['price']}"
        c.drawString(50, y, line)
        y -= 20
        total += item['qty'] * item['price']

    c.drawString(50, y - 20, f"Total: ₹{total}")

    c.showPage()
    c.save()

    buffer.seek(0)
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{order_id}.pdf"}
    )
