"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

export default function OrderSuccessPage() {
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState<string>("");

  useEffect(() => {
    // LocalStorage se data lo (order place hone ke baad set kiya hoga)
    const orderDate = sessionStorage.getItem("order_date");
    const custOrderNum = sessionStorage.getItem("cust_order_num");

    if (custOrderNum) {
      setOrderNumber(custOrderNum);
    }

    const date = orderDate ? new Date(orderDate) : new Date();
    date.setDate(date.getDate() + 3); // 3 din add karo

    const formatted = date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    setDeliveryDate(formatted);
  }, []);

  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-2xl p-8 text-center">
        <CheckCircle className="mx-auto text-green-500 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Thank You!
        </h2>
        <h3 className="text-lg text-gray-600 mb-4">
          Your order has been successfully placed.
        </h3>

        {orderNumber && (
          <p className="text-gray-700 font-medium mb-2">
            Order Number: <span className="font-semibold">{orderNumber}</span>
          </p>
        )}

        <p className="text-gray-500 text-sm mb-2">
          Estimated Delivery Date:
        </p>
        <p className="text-lg font-semibold text-gray-800 mb-6">
          {deliveryDate || "Calculating..."}
        </p>

        <Link
          href="/orders"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-md"
        >
          View Your Orders
        </Link>
      </div>
    </section>
  );
}
