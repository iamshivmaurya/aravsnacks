"use client";
import { useState, useEffect } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast"; // ✅ add toast for user feedback

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [filter, setFilter] = useState("today");
  const [ordersToday, setOrdersToday] = useState<number | null>(null);
  const [revenue, setRevenue] = useState<number | null>(null);
  const [newCustomers, setNewCustomers] = useState<number | null>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [ordersTodayData, setOrdersTodayData] = useState<any[]>([]);
  const [orders7DaysData, setOrders7DaysData] = useState<any[]>([]);
  const [ordersMonthData, setOrdersMonthData] = useState<any[]>([]);
  const [ordersYearlyData, setOrdersYearlyData] = useState<any[]>([]);

  // 🧠 Fetch all data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log("Fetching dashboard data...");

        const [revRes, orderRes, custRes, prodRes, topCustRes,todayStatsRes,last7DaysRes,monthStatsRes,yearlyStatsRes] =
          await Promise.all([
            api.get("/total/revenue"),
            api.get("/order/today"),
            api.get("/customer/today"),
            api.get("/top-selling/products/"),
            api.get("/top-customers/by-orders"),
            api.get("/orders/stats/today-by-hour"), // ✅ today chart
            api.get("/last/7/days"), // ✅ last 7 days chart
            api.get("/current/month/weeks"),  
            api.get("/orders/stats/yearly"),  
          ]);

        // ✅ Set state from responses
        setRevenue(revRes.data?.total_revenue ?? 0);
        setOrdersToday(orderRes.data?.total_orders ?? 0);
        setNewCustomers(custRes.data?.new_customers ?? 0);
        setTopProducts(prodRes.data || []);
        setTopCustomers(topCustRes.data || []);
        setOrdersTodayData(todayStatsRes.data || []);
        setOrders7DaysData(last7DaysRes.data || []);
        setOrdersMonthData(monthStatsRes.data || []);
        setOrdersYearlyData(yearlyStatsRes.data || []);
     
        console.log("Dashboard data loaded ✅");
      } catch (err: any) {
        console.error("Dashboard data fetch error:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

   
  const ordersDataset: Record<string, any[]> = {
    "today": ordersTodayData,
    "last-7-days": orders7DaysData,
    "month": ordersMonthData,
    "year": ordersYearlyData,
    };

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm text-gray-500">Total Revenue</h3>
          <p className="text-xl font-bold">
            {revenue !== null ? `₹${revenue.toLocaleString()}` : "—"}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm text-gray-500">Orders Today</h3>
          <p className="text-xl font-bold">{ordersToday !== null ? ordersToday : "—"}</p> 
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm text-gray-500">New Customers</h3>
           <p className="text-xl font-bold">{newCustomers !== null ? newCustomers : "—"}</p>  
        </div>
      </div>

      {/* Top Products & Customers & Orders Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          {topProducts.length > 0 ? (
          <ul className="divide-y">
           {topProducts.map((p) => (
              <li key={p.product_id} className="flex justify-between py-2">
              <span>{p.product_name}</span>
              <span className="font-semibold">{p.total_ordered} sold</span>
            </li>
            ))}
          </ul>  
            ) : (
              <p className="text-gray-500 text-sm">No data</p>
            )}
        </div>

        {/* Top Customers */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Top Customers by Orders</h2>
          {topCustomers.length > 0 ? (
           <ul className="divide-y">
              {topCustomers.map((c) => (
                <li key={c.customer_id} className="flex justify-between py-2">
                  <span>{c.customer_name}</span>
                  <span className="font-semibold">{c.total_orders} orders</span>
                </li>
              ))}
            </ul>
           ) : (
            <p className="text-gray-500 text-sm">No data</p>
          )}
        </div>  

        {/* Orders Overview */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Orders Overview</h2>
            <select
              className="border rounded-lg p-2 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="last-7-days">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersDataset[filter]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>  
        </div>
      </div>
    </div>
  );
}
