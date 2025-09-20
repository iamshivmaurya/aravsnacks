"use client";
import { useState } from "react";
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

  // Mock stats
  const stats = {
    revenue: 125000,
    ordersToday: 87,
    newCustomers: 12,
    topProducts: [
      { id: 1, name: "iPhone 15", sales: 320 },
      { id: 2, name: "MacBook Pro", sales: 280 },
      { id: 3, name: "AirPods Pro", sales: 210 },
    ],
    topCustomers: [
      { id: 1, name: "John Doe", orders: 45 },
      { id: 2, name: "Jane Smith", orders: 32 },
    ],
  };

  // Orders datasets for dropdown
  const ordersDataset = {
    today: [
      { name: "9AM", orders: 12 },
      { name: "12PM", orders: 18 },
      { name: "3PM", orders: 22 },
      { name: "6PM", orders: 15 },
    ],
    "last-7-days": [
      { name: "Mon", orders: 45 },
      { name: "Tue", orders: 32 },
      { name: "Wed", orders: 60 },
      { name: "Thu", orders: 40 },
      { name: "Fri", orders: 75 },
      { name: "Sat", orders: 90 },
      { name: "Sun", orders: 55 },
    ],
    month: [
      { name: "Week 1", orders: 200 },
      { name: "Week 2", orders: 320 },
      { name: "Week 3", orders: 280 },
      { name: "Week 4", orders: 350 },
    ],
    year: [
      { name: "Jan", orders: 800 },
      { name: "Feb", orders: 950 },
      { name: "Mar", orders: 1100 },
      { name: "Apr", orders: 900 },
      { name: "May", orders: 1250 },
      { name: "Jun", orders: 1500 },
      { name: "Jul", orders: 1320 },
      { name: "Aug", orders: 1400 },
      { name: "Sep", orders: 1700 },
      { name: "Oct", orders: 1600 },
      { name: "Nov", orders: 1750 },
      { name: "Dec", orders: 1900 },
    ],
  };

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm text-gray-500">Total Revenue</h3>
          <p className="text-xl font-bold">₹{stats.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm text-gray-500">Orders Today</h3>
          <p className="text-xl font-bold">{stats.ordersToday}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm text-gray-500">New Customers</h3>
          <p className="text-xl font-bold">{stats.newCustomers}</p>
        </div>
      </div>

      {/* Top Products & Customers & Orders Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          <ul className="divide-y">
            {stats.topProducts.map((p) => (
              <li key={p.id} className="flex justify-between py-2">
                <span>{p.name}</span>
                <span className="font-semibold">{p.sales} sold</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Customers */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Top Customers by Orders</h2>
          <ul className="divide-y">
            {stats.topCustomers.map((c) => (
              <li key={c.id} className="flex justify-between py-2">
                <span>{c.name}</span>
                <span className="font-semibold">{c.orders} orders</span>
              </li>
            ))}
          </ul>
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
