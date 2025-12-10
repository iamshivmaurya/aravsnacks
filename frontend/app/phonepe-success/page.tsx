"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/utils/axios";
 
import { useCart } from "@/components/CartContext";
import { PLACE_ORDER, PAYMENT_STATUS_URL } from "@/constants";
export default function PhonePeSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const txnId = searchParams.get("txnId");
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!txnId) return;

    const checkAndPlaceOrder = async () => {
      try {
        // 1️⃣ Check Payment State
       // const res = await fetch(`http://localhost:8000/api/v1/payment-status/${txnId}`);
       
       const res = await api.get(`${PAYMENT_STATUS_URL}/${txnId}`);
        const statusData = res.data;

        console.log("PAYMENT STATUS:", statusData);

        if (statusData.data?.state !== "COMPLETED") {
          alert("Payment failed or pending!");
          setLoading(false);
          return;
        }

        const quoteUid = localStorage.getItem("quote_uid");
        const customer_id = localStorage.getItem("customer_id");

        if (!quoteUid) {
          alert("Quote missing! Order cannot be placed.");
          setLoading(false);
          return;
        }

        // 2️⃣ Load Address (Fix)
        const lastAddress = localStorage.getItem("last_address");
        if (!lastAddress) {
          alert("Shipping Address Missing! Cannot Place Order.");
          setLoading(false);
          return;
        }

        const parsedAddress = JSON.parse(lastAddress);

        const orderPayload = {
          customer_id: customer_id,
          quote_uid: quoteUid,
          payment_method: "phonepe",
          shipping_method: "free",
          shipping_address: parsedAddress,
          billing_address: parsedAddress,
        };

        console.log("ORDER PAYLOAD:", orderPayload);

        // 3️⃣ Place Order
        const orderRes = await api.post(PLACE_ORDER, orderPayload);

        console.log("ORDER RESPONSE:", orderRes.data);

        if (orderRes.status === 200 || orderRes.status === 201) {
          clearCart();
          router.push("/order-success");
        } else {
          alert("Order failed after payment!");
        }

      } catch (err) {
        console.error(err);
        alert("Something went wrong!");
      } finally {
        setLoading(false);
      }
    };

    checkAndPlaceOrder();
  }, [txnId]);

  return (
    <div className="flex justify-center items-center min-h-screen text-xl font-semibold">
      {loading ? "Processing your order, please wait..." : "Something went wrong"}
    </div>
  );
}
