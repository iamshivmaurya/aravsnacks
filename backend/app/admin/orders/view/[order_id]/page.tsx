"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

type OrderItem = {
  order_item_id: number;
  order_id: number;
  product_id: number;
  sku: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
  tax_percentage: number;
  tax_amount: number;
  product_name: string;
  row_total: number;
};

type OrderAddress = {
  order_address_id: number;
  order_id: number;
  address_type: string;
  street_address: string;
  postal_code: string;
  city: string;
  state: string;
  phone_no: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
};

type Order = {
  order_id: number;
  cust_order_num: string;
  customer_id: number;
  customer_email: string | null;
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
};

export default function ViewSingleOrder() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!params.order_id) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axios.get<Order>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${params.order_id}`
        );
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setErrorMsg("❌ Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.order_id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (errorMsg) return <p className="p-6 text-red-600">{errorMsg}</p>;
  if (!order) return <p className="p-6">Order not found</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <button
        className="text-blue-600 hover:underline"
        onClick={() => router.back()}
      >
        ← Back to Orders
      </button>

      {/* Order Header */}
      <div className="mt-2">
        <h2 className="text-2xl font-semibold">Order #{order.cust_order_num}</h2>
        <p className="text-gray-600 mt-1">
          Customer ID: {order.customer_id} | Email: {order.customer_email || "N/A"} | Date:{" "}
          {new Date(order.order_date).toLocaleDateString()}
        </p>
      </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
  {/* Addresses */}
  <div className="mt-6 flex flex-col">
    <h3 className="font-semibold mb-2">Addresses</h3>
    <div className="flex-1 bg-white p-4 text-sm rounded-xl shadow space-y-2">
      {order.addresses.map((addr) => (
        <div key={addr.order_address_id} className="border-b pb-2 last:border-b-0">
          <p>
            <span className="font-medium">{addr.first_name} {addr.last_name}</span> ({addr.address_type})
          </p>
          <p>{addr.street_address}</p>
          <p>{addr.city}, {addr.state} - {addr.postal_code}</p>
          <p>📞 {addr.phone_no}</p>
        </div>
      ))}
    </div>
  </div>

  {/* Payment & Shipping */}
  <div className="mt-6 flex flex-col">
    <h3 className="font-semibold mb-2">Shipping & Payment</h3>
    <div className="flex-1 bg-white p-4 text-sm rounded-xl shadow">
      <p className="uppercase font-medium mb-2">Payment Method: {order.payment_method}</p>
      <p className="mb-1">Shipping Method: {order.shipping_method}</p>
    </div>
  </div>
</div>


    {/* Items Table */}
<div className="mt-6 bg-white p-4">
  <h3 className="font-semibold mb-2">Items</h3>
  <table className="w-full border-collapse text-sm">
    <thead>
      <tr className="bg-gray-100">
        <th className="p-2 text-left">Product</th>
        <th className="p-2 text-left">SKU</th>
        <th className="p-2 text-center">Qty</th>
        <th className="p-2 text-right">Unit Price</th>
        <th className="p-2 text-right">Discount</th>
        <th className="p-2 text-right">Tax %</th>
        <th className="p-2 text-right">Tax Amt</th>
        <th className="p-2 text-right">Total</th>
        <th className="p-2 text-right">Row Total</th>
      </tr>
    </thead>
    <tbody>
      {order.items.map((item) => (
        <tr key={item.order_item_id} className="border-b">
          <td className="p-2">{item.product_name}</td>
          <td className="p-2">{item.sku}</td>
          <td className="p-2 text-center">{item.quantity}</td>
          <td className="p-2 text-right">₹{item.unit_price}</td>
          <td className="p-2 text-right">₹{item.discount_amount}</td>
          <td className="p-2 text-right">{item.tax_percentage}%</td>
          <td className="p-2 text-right">₹{item.tax_amount}</td>
          <td className="p-2 text-right">₹{item.total_price}</td>
          <td className="p-2 text-right font-semibold">₹{item.row_total}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Order Summary (Right-Aligned) */}
<div className="mt-4 flex justify-end">
  <div className="w-full md:w-1/3 p-4 bg-white text-sm">
    <div className="flex justify-between py-1">
      <span>Sub Total</span>
      <span>₹{order.sub_total}</span>
    </div>
    <div className="flex justify-between py-1">
      <span>Shipping</span>
      <span>₹{order.shipping_amount}</span>
    </div>
    <div className="flex justify-between py-1">
      <span>Tax</span>
      <span>₹{order.total_tax_amount}</span>
    </div>
    <div className="flex justify-between py-1">
      <span>Discount</span>
      <span>₹{order.discount_amount}</span>
    </div>
    <div className="flex justify-between py-2 border-t font-semibold text-lg">
      <span>Grand Total</span>
      <span>₹{order.grand_total}</span>
    </div>
  </div>
</div>



    </div>
  );
}
