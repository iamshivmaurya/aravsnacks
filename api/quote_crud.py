from sqlalchemy.orm import Session
from model import Quote, QuoteItem, QuoteAddress, Product, TaxClass, DiscountCode, CustomerAddress, Customer
from schema import QuoteItemCreate, QuoteAddressCreate, QuoteAddressesCreate, QuoteAddressBase
from sqlalchemy.orm import joinedload
import uuid
from typing import Optional, Dict, Any


# ============ ADD THESE NEW HELPER FUNCTIONS ============
def get_customer_addresses(db: Session, customer_id: int) -> Dict[str, Optional[CustomerAddress]]:
    """Get customer's saved addresses, prefer shipping then billing then any"""
    addresses = db.query(CustomerAddress).filter(
        CustomerAddress.customer_id == customer_id
    ).all()

    result = {'shipping': None, 'billing': None}

    # First, look for specific address types
    for addr in addresses:
        if addr.address_type == 'shipping' and not result['shipping']:
            result['shipping'] = addr
        elif addr.address_type == 'billing' and not result['billing']:
            result['billing'] = addr

    # If no specific types found, use any address as fallback
    if addresses:
        if not result['shipping']:
            result['shipping'] = addresses[0]
        if not result['billing']:
            result['billing'] = addresses[0]

    return result


def save_address_to_customer_profile(db: Session, customer_id: int, address_data: Dict[str, Any], address_type: str):
    """Save address to customer_address table"""
    # Check if similar address already exists
    existing = db.query(CustomerAddress).filter(
        CustomerAddress.customer_id == customer_id,
        CustomerAddress.address_type == address_type,
        CustomerAddress.street_address == address_data.get('street_address'),
        CustomerAddress.postal_code == address_data.get('postal_code'),
        CustomerAddress.city == address_data.get('city')
    ).first()

    if existing:
        # Update existing address
        for key, value in address_data.items():
            setattr(existing, key, value)
        existing.address_type = address_type
    else:
        # Create new address
        new_customer_addr = CustomerAddress(
            customer_id=customer_id,
            address_type=address_type,
            **address_data
        )
        db.add(new_customer_addr)

    db.commit()


def create_or_update_quote_address(
        db: Session,
        quote_id: int,
        address_data: Dict[str, Any],
        address_type: str,
        update_existing: bool = True
) -> QuoteAddress:
    """Create or update address in quote_address table"""

    if update_existing:
        # Check if address of this type already exists for the quote
        existing = db.query(QuoteAddress).filter(
            QuoteAddress.quote_id == quote_id,
            QuoteAddress.address_type == address_type
        ).first()

        if existing:
            # Update existing address
            for key, value in address_data.items():
                setattr(existing, key, value)
            db.commit()
            db.refresh(existing)
            return existing

    # Create new address
    new_address = QuoteAddress(
        quote_id=quote_id,
        address_type=address_type,
        **address_data
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address


# ============ REPLACE THIS FUNCTION COMPLETELY ============
# DELETE your old add_quote_address function and replace with this:

def add_quote_addresses(
        db: Session,
        quote_id: int,
        addresses: QuoteAddressesCreate,
        customer_id: Optional[int] = None
):
    """
    Add/update both shipping and billing addresses for a quote
    """
    try:
        # Prepare address dictionaries
        shipping_data = None
        billing_data = None

        # Step 1: Get customer's saved addresses as defaults
        customer_defaults = {'shipping': None, 'billing': None}
        if customer_id:
            customer_defaults = get_customer_addresses(db, customer_id)

        # Step 2: Process shipping address
        if addresses.shipping_address:
            shipping_data = addresses.shipping_address.dict()
            # Save to customer profile if customer exists
            if customer_id:
                save_address_to_customer_profile(db, customer_id, shipping_data, 'shipping')
        elif customer_defaults['shipping']:
            # Use customer's saved shipping address
            shipping_data = {
                'street_address': customer_defaults['shipping'].street_address,
                'postal_code': customer_defaults['shipping'].postal_code,
                'city': customer_defaults['shipping'].city,
                'state': customer_defaults['shipping'].state,
                'phone_no': customer_defaults['shipping'].phone_no,
                'first_name': customer_defaults['shipping'].first_name,
                'last_name': customer_defaults['shipping'].last_name
            }

        # Step 3: Process billing address
        if addresses.billing_address:
            billing_data = addresses.billing_address.dict()
            # Save to customer profile if customer exists
            if customer_id:
                save_address_to_customer_profile(db, customer_id, billing_data, 'billing')
        elif customer_defaults['billing']:
            # Use customer's saved billing address
            billing_data = {
                'street_address': customer_defaults['billing'].street_address,
                'postal_code': customer_defaults['billing'].postal_code,
                'city': customer_defaults['billing'].city,
                'state': customer_defaults['billing'].state,
                'phone_no': customer_defaults['billing'].phone_no,
                'first_name': customer_defaults['billing'].first_name,
                'last_name': customer_defaults['billing'].last_name
            }
        elif shipping_data and addresses.use_same_for_billing:
            # Auto-populate billing from shipping
            billing_data = shipping_data.copy()
            # Save as billing address to customer profile
            if customer_id:
                save_address_to_customer_profile(db, customer_id, billing_data, 'billing')

        # Step 4: Validate we have at least shipping address
        if not shipping_data:
            raise ValueError("Shipping address is required")

        # If still no billing, use shipping as billing
        if not billing_data:
            billing_data = shipping_data.copy()

        # Step 5: Create/update addresses in quote_address table
        shipping_addr = create_or_update_quote_address(
            db, quote_id, shipping_data, 'shipping'
        )

        billing_addr = create_or_update_quote_address(
            db, quote_id, billing_data, 'billing'
        )

        return {
            'shipping_address': shipping_addr,
            'billing_address': billing_addr
        }
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise Exception(f"Error managing quote addresses: {str(e)}")


# ============ UPDATE THIS FUNCTION ============
# Change from list to structured dict

def get_quote_addresses(db: Session, quote_id: int):
    """Get both shipping and billing addresses for a quote (structured)"""
    addresses = db.query(QuoteAddress).filter(
        QuoteAddress.quote_id == quote_id
    ).all()

    result = {'shipping': None, 'billing': None}

    for addr in addresses:
        if addr.address_type == 'shipping':
            result['shipping'] = addr
        elif addr.address_type == 'billing':
            result['billing'] = addr

    return result


# ============ OPTIONAL: AUTO-POPULATE ON QUOTE CREATION ============
# You can add this to your create_quote function if you want

def create_quote_with_addresses(db: Session, customer_id: int | None = None):
    """Create quote with auto-populated addresses"""
    quote = create_quote(db, customer_id)

    # Auto-populate addresses if customer exists
    if customer_id:
        # Get customer's default addresses
        customer_defaults = get_customer_addresses(db, customer_id)

        if customer_defaults['shipping']:
            shipping_data = {
                'street_address': customer_defaults['shipping'].street_address,
                'postal_code': customer_defaults['shipping'].postal_code,
                'city': customer_defaults['shipping'].city,
                'state': customer_defaults['shipping'].state,
                'phone_no': customer_defaults['shipping'].phone_no,
                'first_name': customer_defaults['shipping'].first_name,
                'last_name': customer_defaults['shipping'].last_name
            }

            create_or_update_quote_address(
                db, quote.quote_id, shipping_data, 'shipping', False
            )

            # Use same for billing or get billing address
            if customer_defaults['billing'] and customer_defaults['billing'] != customer_defaults['shipping']:
                billing_data = {
                    'street_address': customer_defaults['billing'].street_address,
                    'postal_code': customer_defaults['billing'].postal_code,
                    'city': customer_defaults['billing'].city,
                    'state': customer_defaults['billing'].state,
                    'phone_no': customer_defaults['billing'].phone_no,
                    'first_name': customer_defaults['billing'].first_name,
                    'last_name': customer_defaults['billing'].last_name
                }
            else:
                billing_data = shipping_data.copy()

            create_or_update_quote_address(
                db, quote.quote_id, billing_data, 'billing', False
            )

    return quote


# ============ KEEP EVERYTHING BELOW THIS LINE UNCHANGED ============
# All your existing functions remain exactly the same:

def create_quote(db: Session, customer_id: int | None = None):
    # Create a new quote instance
    if customer_id:
        # ✅ Customer cart
        new_quote = Quote(customer_id=customer_id, quote_uid=str(uuid.uuid4()), is_active=1)
    else:
        # ✅ Guest cart with secure token
        new_quote = Quote(quote_uid=str(uuid.uuid4()), is_active=1)

    db.add(new_quote)
    db.commit()
    db.refresh(new_quote)  # This gets the auto-incremented ID
    return new_quote


# ✅ CORRECT: Get single quote by ID
def get_quote(db: Session, quote_id: int):
    return db.query(Quote).filter(Quote.quote_uid == quote_id).first()


# ✅ CORRECT: Get single quote with items eager loaded
def get_quote_with_items(db: Session, quote_id: int):
    quote = db.query(Quote).options(joinedload(Quote.items)).filter(Quote.quote_id == quote_id).first()
    if quote:
        # Get addresses for this quote
        addresses = get_quote_addresses(db, quote_id)
        # Add addresses to quote object
        quote.addresses = addresses
    return quote

# ✅ CORRECT: Get all quotes (for listing)
def get_all_quotes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Quote).offset(skip).limit(limit).all()


def calculate_item_totals(product: Product, item_qty: int) -> dict:
    """Calculate price, discount, and tax for a single item"""
    # Calculate item price with discount
    item_price = product.product_price
    return {
        'item_price': item_price,
        'item_tax': 0,
        'item_discount': 0,
        'tax_percentage': 0
    }


def update_quote(db: Session, quote_id: int, quote_data: dict):
    db_quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if db_quote:
        for key, value in quote_data.items():
            setattr(db_quote, key, value)
        db.commit()
        db.refresh(db_quote)
    return db_quote


def delete_quote(db: Session, quote_id: int):
    db_quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if db_quote:
        db.delete(db_quote)
        db.commit()
        return True
    return False


def redistribute_discounts(db: Session, quote_id: int):
    """Redistribute discount proportionally among all items in quote"""
    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if not quote or quote.discount <= 0:
        return

    items = db.query(QuoteItem).filter(QuoteItem.quote_id == quote_id).all()
    if not items:
        return

    total_subtotal = sum(item.item_price * item.item_qty for item in items)
    total_discount = quote.discount

    # Redistribute discount proportionally
    for item in items:
        item_subtotal = item.item_price * item.item_qty

        if total_subtotal > 0:
            item_discount = (item_subtotal / total_subtotal) * total_discount
        else:
            item_discount = 0

        item.item_discount = item_discount

        # ✅ CORRECTED: Calculate tax on discounted amount
        taxable_amount = item_subtotal - item_discount
        item.item_tax = (taxable_amount * item.tax_percentage) / 100
        item.row_total = taxable_amount + item.item_tax

    # Recalculate quote totals
    quote.total_tax = sum(item.item_tax for item in items)

    # ✅ CORRECTED: Grand total calculation
    quote.grand_total = (quote.subtotal - quote.discount) + quote.total_tax

    db.commit()


def add_quote_item(db: Session, quote_id: int, item: QuoteItemCreate):
    # Check if product exists
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise ValueError("Product not found")

    # Get tax percentage
    tax_percentage = 0.0
    if product.tax_class_id:
        tax_class = db.query(TaxClass).filter(TaxClass.tax_class_id == product.tax_class_id).first()
        if tax_class:
            tax_percentage = tax_class.tax_percentage

    # Calculate item values (without discount initially)
    item_price = float(product.product_price)
    item_subtotal = item_price * item.item_qty
    item_tax = (item_subtotal * tax_percentage) / 100
    row_total = item_subtotal + item_tax

    # Create quote item
    new_item = QuoteItem(
        quote_id=quote_id,
        product_id=item.product_id,
        item_name=product.name,
        item_qty=item.item_qty,
        sku=product.sku,
        item_price=item_price,
        item_discount=0.0,  # No discount initially
        item_tax=item_tax,
        tax_percentage=tax_percentage,
        product_name=product.name,
        row_total=row_total
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    # Update quote totals
    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if quote:
        quote.subtotal += item_subtotal
        quote.total_tax += item_tax
        quote.items_count += 1
        quote.items_quantity += item.item_qty

        # ✅ FIX: Add this line to recalculate grand_total properly
        quote.grand_total = quote.subtotal + quote.total_tax - quote.discount

        db.commit()
        db.refresh(quote)

    return new_item


def remove_quote_item(db: Session, quote_id: int, item_id: int):
    """
    Remove an item from quote and update totals with proper grand total calculation
    """
    try:
        # Find the item to remove
        item = db.query(QuoteItem).filter(
            QuoteItem.item_id == item_id,
            QuoteItem.quote_id == quote_id
        ).first()

        if not item:
            return False

        # Store values for quote update before deletion
        item_subtotal = item.item_price * item.item_qty
        item_tax = item.item_tax
        item_discount = item.item_discount

        # Get the quote before deleting the item
        quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
        if not quote:
            return False

        # Delete the item
        db.delete(item)
        db.commit()

        # Update quote totals after successful deletion
        quote.subtotal -= item_subtotal
        quote.total_tax -= item_tax
        quote.discount -= item_discount
        quote.items_count -= 1
        quote.items_quantity -= item.item_qty

        # Check if there are remaining items with discount to redistribute
        remaining_items = db.query(QuoteItem).filter(QuoteItem.quote_id == quote_id).count()

        if remaining_items > 0 and quote.discount > 0:
            # Redistribute discount proportionally among remaining items
            redistribute_discounts(db, quote_id)
        else:
            # No remaining items or no discount, just recalculate grand total
            quote.grand_total = quote.subtotal + quote.total_tax - quote.discount

        db.commit()
        return True

    except Exception as e:
        # Rollback in case of error
        db.rollback()
        print(f"Error removing quote item: {e}")
        return False


def update_quote_item_quantity(db: Session, quote_id: int, item_id: int, new_qty: int):
    item = db.query(QuoteItem).filter(QuoteItem.item_id == item_id, QuoteItem.quote_id == quote_id).first()
    if not item:
        return None
    # remove item from cart if 0 qty
    if new_qty <= 0 and remove_quote_item(db, quote_id, item_id):
        return {"message": "Item removed from cart."}

    # Store old values
    old_qty = item.item_qty
    old_subtotal = item.item_price * old_qty
    old_tax = item.item_tax
    old_discount = item.item_discount

    # Update quantity
    item.item_qty = new_qty
    new_subtotal = item.item_price * new_qty

    # Update quote basic totals
    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if quote:
        quote.subtotal += (new_subtotal - old_subtotal)
        quote.items_quantity += (new_qty - old_qty)

        # Redistribute discount proportionally
        if quote.discount > 0:
            redistribute_discounts(db, quote_id)
        else:
            # ✅ FIX: Calculate tax on DISCOUNTED amount (consider existing discount)
            discounted_amount = new_subtotal - item.item_discount
            new_tax = (discounted_amount * item.tax_percentage) / 100
            item.item_tax = new_tax
            item.row_total = discounted_amount + new_tax

            quote.total_tax += (new_tax - old_tax)
            quote.grand_total = quote.subtotal + quote.total_tax - quote.discount

        db.commit()
        db.refresh(item)

    return item


def apply_discount(db: Session, quote_id: int, coupon_code: str):
    quote = db.query(Quote).filter(Quote.quote_id == quote_id).first()
    if not quote:
        raise ValueError("Quote not found")

    coupon = db.query(DiscountCode).filter(DiscountCode.coupon_code == coupon_code).first()
    if not coupon:
        raise ValueError("Coupon not found")

    items = db.query(QuoteItem).filter(QuoteItem.quote_id == quote_id).all()
    if not items:
        raise ValueError("No items in quote")

    # Calculate total discount amount
    total_subtotal = quote.subtotal

    if coupon.discount_type == 'fixed':
        discount_amount = min(coupon.discount_amount, total_subtotal)
    else:
        discount_amount = (coupon.discount_amount / 100) * total_subtotal

    # Apply discount to quote
    quote.discount = discount_amount
    quote.coupon_code = coupon_code

    # Redistribute discount proportionally and recalculate taxes
    for item in items:
        item_subtotal = item.item_price * item.item_qty

        # Calculate proportional discount for this item
        if total_subtotal > 0:
            item_discount = (item_subtotal / total_subtotal) * discount_amount
        else:
            item_discount = 0

        item.item_discount = item_discount

        # ✅ CORRECTED: Calculate tax on DISCOUNTED amount (Indian GST rule)
        discounted_amount = item_subtotal - item_discount
        item.item_tax = (discounted_amount * item.tax_percentage) / 100

        # ✅ CORRECTED: Recalculate row total correctly
        item.row_total = discounted_amount + item.item_tax

    # ✅ Recalculate quote totals after all items are updated
    quote.total_tax = sum(item.item_tax for item in items)
    quote.grand_total = (quote.subtotal - quote.discount) + quote.total_tax

    db.commit()
    db.refresh(quote)

    return quote