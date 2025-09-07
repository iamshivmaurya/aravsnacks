interface OrderItem {
  order_item_id: number;
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount: number;
}

interface OrderAddress {
  address_type: string;
  street_address: string;
  postal_code: string;
  city: string;
  state: string;
  phone_no: string;
  first_name: string;
  last_name: string;
}

interface OrderData {
  order_id: number;
  cust_order_num: string;
  customer_email: string;
  order_date: string;
  sub_total: number;
  shipping_amount: number;
  total_tax_amount: number;
  discount_amount: number;
  grand_total: number;
  payment_method: string;
  shipping_method: string;
  items: OrderItem[];
  addresses: OrderAddress[];
}

export default function OrderDetails({ order }: { order: OrderData }) {
  const shippingAddress = order.addresses[0];

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      {/* Order Summary */}
      <div>
        <h2 className="text-xl font-semibold">Order Summary</h2>
        <p>Order #: {order.cust_order_num}</p>
        <p>Order Date: {new Date(order.order_date).toLocaleDateString()}</p>
        <p>Payment: {order.payment_method}</p>
        <p>Shipping: {order.shipping_method}</p>
      </div>

      {/* Items */}
      <div>
        <h3 className="font-semibold mb-2">Items</h3>
        <table className="w-full text-left border">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2">Product</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Unit Price</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.order_item_id} className="border-b">
                <td className="p-2">{item.name || item.sku}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">₹{item.unit_price}</td>
                <td className="p-2">₹{item.total_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shipping Address */}
      {shippingAddress && (
        <div>
          <h3 className="font-semibold mb-2">Shipping Address</h3>
          <p>
            {shippingAddress.first_name} {shippingAddress.last_name} <br />
            {shippingAddress.street_address}, {shippingAddress.city},{" "}
            {shippingAddress.state} - {shippingAddress.postal_code} <br />
            Phone: {shippingAddress.phone_no}
          </p>
        </div>
      )}

      {/* Totals */}
      <div className="pt-4 border-t text-right space-y-1">
        <p>Subtotal: ₹{order.sub_total}</p>
        <p>Discount: -₹{order.discount_amount}</p>
        <p>Shipping: ₹{order.shipping_amount}</p>
        <p>Tax: ₹{order.total_tax_amount}</p>
        <p className="font-bold text-lg">Grand Total: ₹{order.grand_total}</p>
      </div>
    </div>
  );
}
