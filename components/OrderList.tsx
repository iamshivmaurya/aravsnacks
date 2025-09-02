"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface Order {
  order_id: number;
  customer_id: number;
  customer_email: string;
  order_date: string;
  sub_total: number;
  shipping_amount: number;
  total_tax_amount: number;
  discount_amount: number;
  grand_total: number;
  payment_method: string;
  shipping_method: string;
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await axios.get("http://127.0.0.1:8000/orders?skip=0&limit=100");
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">Order ID</th>
              <th className="border p-2">Customer</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Subtotal</th>
              <th className="border p-2">Discount</th>
              <th className="border p-2">Grand Total</th>
              <th className="border p-2">Payment</th>
              <th className="border p-2">Shipping</th>
              <th className="border p-2">Order Date</th>
              <th className="border p-2">View</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.order_id} className="hover:bg-gray-50">
                <td className="border p-2">{order.order_id}</td>
                <td className="border p-2">{order.customer_id}</td>
                <td className="border p-2">{order.customer_email}</td>
                <td className="border p-2">₹{order.sub_total}</td>
                <td className="border p-2">-₹{order.discount_amount}</td>
                <td className="border p-2 font-semibold">₹{order.grand_total}</td>
                <td className="border p-2">{order.payment_method}</td>
                <td className="border p-2">{order.shipping_method}</td>
                <td className="border p-2">{new Date(order.order_date).toLocaleString()}</td>
                <td className="border p-2">
                  <Link
                    href={`/order-details?orderId=${order.order_id}`}
                    className="text-blue-700 hover:underline"
                  >
                    View Order
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
