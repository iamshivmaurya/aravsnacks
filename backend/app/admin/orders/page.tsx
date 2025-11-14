'use client';

import { useEffect, useState } from 'react';
import api from "@/utils/axios";
import { ChevronRight } from 'lucide-react';
import { useRouter } from "next/navigation";

type OrderItem = {
  order_item_id: number;
  product_id: number;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_amount: number;
  product_name: string;
};

type OrderAddress = {
  order_address_id: number;
  address_type: string;
  street_address: string;
  postal_code: string;
  city: string;
  state: string;
  phone_no: string;
  first_name: string;
  last_name: string;
};

type Order = {
  order_id: number;
  cust_order_num: string;
  customer_id: number;
  customer_email: string | null;
  order_date: string;
  grand_total: number;
  payment_method: string;
  shipping_method: string;
  items: OrderItem[];
  addresses: OrderAddress[];
};

const ORDER_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`;

export default function ViewOrders() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5; // orders per page
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Fetch all orders once
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(ORDER_API);
      setAllOrders(res.data);
      setPage(1); // reset page
      setErrorMsg('');
    } catch (err) {
      console.error(err);
      setErrorMsg("❌ Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update displayed orders when allOrders, page, or search changes
  useEffect(() => {
    let filtered = allOrders;

    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = allOrders.filter(
        (o) =>
          o.cust_order_num.toLowerCase().includes(s) ||
          o.customer_id.toString().includes(s) ||
          (o.customer_email && o.customer_email.toLowerCase().includes(s))
      );
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    setOrders(filtered.slice(start, end));
  }, [allOrders, page, search]);

  const totalPages = Math.ceil(
    (search.trim()
      ? allOrders.filter(
          (o) =>
            o.cust_order_num.toLowerCase().includes(search.toLowerCase()) ||
            o.customer_id.toString().includes(search) ||
            (o.customer_email && o.customer_email.toLowerCase().includes(search.toLowerCase()))
        ).length
      : allOrders.length
    ) / limit
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h2 className="text-xl font-semibold">Orders</h2>

      {/* Error */}
      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>
      )}

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by Order #, Customer ID, or Email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') setPage(1); }}
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={() => setPage(1)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2">Order #</th>
                <th className="p-2">Customer ID</th>
                <th className="p-2">Email</th>
                <th className="p-2">Date</th>
                <th className="p-2">Grand Total</th>
                <th className="p-2">Payment</th>
                <th className="p-2">Shipping</th>
                <th className="p-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.order_id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-semibold">{o.cust_order_num}</td>
                    <td className="p-2">{o.customer_id}</td>
                    <td className="p-2">{o.customer_email || "N/A"}</td>
                    <td className="p-2">{new Date(o.order_date).toLocaleDateString()}</td>
                    <td className="p-2 font-semibold">₹{o.grand_total}</td>
                    <td className="p-2 uppercase">{o.payment_method}</td>
                    <td className="p-2">{o.shipping_method}</td>
                    <td className="p-2">
                      <button
                        onClick={() => router.push(`/admin/orders/view/${o.order_id}`)}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <ChevronRight size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-2 text-center">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="bg-gray-200 px-4 py-1 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <p>Page {page} of {totalPages}</p>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="bg-gray-200 px-4 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
