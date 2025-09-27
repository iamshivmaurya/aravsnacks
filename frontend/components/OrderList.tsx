"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/axios";

interface Order {
  order_id: number;
  cust_order_num: string;
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

  // ✅ Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // records per page
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    const skip = (page - 1) * limit;

    try {
      const response = await api.get(`/orders?skip=${skip}&limit=${limit}`);
      // ⚠️ Backend should return total count, adjust if needed
      setOrders(response.data.orders || response.data || []);
      setTotalOrders(response.data.total || 100); // fallback
    } catch (err) {
      setError("Failed to fetch orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalOrders / limit);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border p-2">Order ID</th>
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
                  <td className="border p-2">{order.cust_order_num}</td>
                  <td className="border p-2">₹{order.sub_total}</td>
                  <td className="border p-2">-₹{order.discount_amount}</td>
                  <td className="border p-2 font-semibold">₹{order.grand_total}</td>
                  <td className="border p-2">{order.payment_method}</td>
                  <td className="border p-2">{order.shipping_method}</td>
                  <td className="border p-2">
                    {new Date(order.order_date).toLocaleString()}
                  </td>
                  <td className="border p-2">
                    <Link
                      href={`/order-details?orderId=${order.order_id}`}
                      className="text-blue-700 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
