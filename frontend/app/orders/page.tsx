"use client";

import { useState, useEffect } from "react";
import api from "@/utils/axios";
import OrderList from "../../components/OrderList";
import ShippingAddressForm from "../../components/ShippingAddressForm";
import EditProfileForm from "../../components/EditSignupForm";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "editProfile" | "newAddress">("orders");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    const id = localStorage.getItem("customer_id");
    if (id) {
      setCustomerId(id);

      // Fetch customer profile data
      api.get(`/customers/${id}`)
        .then(res => {
          setInitialData({
            first_name: res.data.first_name || "",
            last_name: res.data.last_name || "",
            email: res.data.email || "",
            phone: res.data.phone || ""
          });
        })
        .catch(err => console.error("Error fetching customer:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!customerId) return <p className="p-6 text-red-600">Please login first!</p>;

  return (
    <section className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto flex gap-6">
        {/* LEFT SIDE NAVIGATION */}
        <aside className="w-64 bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">My Account</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                activeTab === "orders"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              My Orders
            </button>

            <button
              onClick={() => setActiveTab("editProfile")}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                activeTab === "editProfile"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              Edit Profile
            </button>

            <button
              onClick={() => setActiveTab("newAddress")}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                activeTab === "newAddress"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
             My Address Book
            </button>
          </nav>
        </aside>

        {/* RIGHT SIDE CONTENT */}
        <main className="flex-1 bg-white shadow rounded-xl p-6">
          {activeTab === "orders" && <OrderList />}
          {activeTab === "editProfile" && (
            <EditProfileForm
              customer_id={customerId}
              initialData={initialData}
            />
          )}
          {activeTab === "newAddress" && <ShippingAddressForm />}
        </main>
      </div>
    </section>
  );
}
