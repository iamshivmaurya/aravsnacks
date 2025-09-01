"use client";

import OrderList from "../../components/OrderList";

export default function OrdersPage() {
  return (
    <section className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <OrderList />
      </div>
    </section>
  );
}
