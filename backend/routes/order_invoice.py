from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import httpx
from fastapi import Response
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime

router = APIRouter()

ORDERS_API_URL = "http://localhost:8004/orders"

async def fetch_order_data(order_id: int):
    """Fetch order data from the orders API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{ORDERS_API_URL}/{order_id}")
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="Order not found")
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching order data: {str(e)}")

@router.get("/invoice/{order_id}")
async def generate_invoice(order_id: int):
    # Fetch order data from the API
    order_data = await fetch_order_data(order_id)
    
    # Create PDF buffer
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    width, height = A4
    
    # Create story (content) for PDF
    story = []
    styles = getSampleStyleSheet()
    
    # Add title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=20,
        spaceAfter=30,
        alignment=1  # Center aligned
    )
    story.append(Paragraph("INVOICE", title_style))
    
    # Order information
    order_info_style = styles['BodyText']
    
    # Order details
    order_date = datetime.fromisoformat(order_data['order_date']).strftime("%B %d, %Y")
    order_info = [
        f"<b>Order ID:</b> {order_data['cust_order_num']}",
        f"<b>Order Date:</b> {order_date}",
        f"<b>Payment Method:</b> {order_data['payment_method'].upper()}",
        f"<b>Shipping Method:</b> {order_data['shipping_method'].title()}"
    ]
    
    for info in order_info:
        story.append(Paragraph(info, order_info_style))
        story.append(Spacer(1, 5))
    
    story.append(Spacer(1, 20))
    
    # Customer information
    shipping_address = next((addr for addr in order_data['addresses'] if addr['address_type'] == 'permanent'), None)
    if shipping_address:
        customer_info = [
            "<b>Shipping Address:</b>",
            f"{shipping_address['first_name']} {shipping_address['last_name']}",
            shipping_address['street_address'],
            f"{shipping_address['city']}, {shipping_address['state']} - {shipping_address['postal_code']}",
            f"Phone: {shipping_address['phone_no']}"
        ]
        
        for info in customer_info:
            story.append(Paragraph(info, order_info_style))
            story.append(Spacer(1, 3))
    
    story.append(Spacer(1, 30))
    
    # Items table
    items_data = [['Product', 'SKU', 'Qty', 'Unit Price', 'Discount', 'Total']]
    
    for item in order_data['items']:
        items_data.append([
            f"Product {item['product_id']}",
            item['sku'],
            str(item['quantity']),
            f"₹{item['unit_price']}",
            f"₹{item['discount_amount']}",
            f"₹{item['total_price']}"
        ])
    
    # Create table
    items_table = Table(items_data, colWidths=[150, 80, 50, 80, 80, 80])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(items_table)
    story.append(Spacer(1, 30))
    
    # Summary
    summary_data = [
        ['Sub Total:', f"₹{order_data['sub_total']}"],
        ['Shipping:', f"₹{order_data['shipping_amount']}"],
        ['Tax:', f"₹{order_data['total_tax_amount']}"],
        ['Discount:', f"-₹{order_data['discount_amount']}"],
        ['GRAND TOTAL:', f"₹{order_data['grand_total']}"]
    ]
    
    summary_table = Table(summary_data, colWidths=[100, 100])
    summary_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, -1), (-1, -1), 14),
        ('TEXTCOLOR', (0, -1), (-1, -1), colors.darkred),
    ]))
    
    story.append(summary_table)
    story.append(Spacer(1, 50))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Italic'],
        fontSize=10,
        alignment=1,
        textColor=colors.grey
    )
    story.append(Paragraph("Thank you for your business!", footer_style))
    story.append(Paragraph("This is a computer generated invoice.", footer_style))
    
    # Build PDF
    doc.build(story)
    
    buffer.seek(0)
    
    # Return PDF response
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{order_data['cust_order_num']}.pdf"}
    )