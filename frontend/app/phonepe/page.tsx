"use client";
import api from "@/utils/axios";
import { CREATE_PAYMENT_URL } from "@/constants";

export default function PhonePePage() {

  const startPayment = async () => {
    try {
      // ✅ Correct POST request
      const res = await api.post(CREATE_PAYMENT_URL);

      const data = res.data;
      console.log("Payment API Response:", data);

      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl; // Redirect to PhonePe
      } else {
        alert("Payment error: " + (data.error || "Unknown error"));
      }

    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Pay with PhonePe UPI</h1>
      <button 
        onClick={startPayment}
        style={{ padding: "10px 20px", background: "blue", color: "#fff" }}
      >
        Pay Now
      </button>
    </div>
  );
}
