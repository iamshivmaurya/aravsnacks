"use client";
import axios from "axios";
import { useState } from "react";

import { SINGUP_API } from '../constants';
import { VERIFY_OTP_API } from '../constants';


export type LoginData = {
  phone: string;
  customer_id: string; // <-- Add this
  access_token: string; // <-- Add this
};

type LoginProps = {
  onSubmit: (data: LoginData) => void;
};

export default function LoginForm({ onSubmit }: LoginProps) {
  const [form, setForm] = useState<LoginData>({ phone: "", customer_id: "" ,access_token:""});
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  // Handle phone input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone) {
      alert("Please enter your phone number");
      return;
    }

    try {
      const response = await axios.post(SINGUP_API, {
        phone: form.phone,
      });

      setGeneratedOtp(response.data.otp);

      // ✅ Show OTP after it's received
      alert(`Your OTP is: ${response.data.otp}`); // In production, send via SMS

      setStep("otp");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please try again.");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(VERIFY_OTP_API, {
        phone: form.phone,
        otp: otp,
      });

      console.log("Backend response:", response.data); // ✅ check what comes from backend

      // Example response check
      if (response.data.customer_id) {
        console.log("Customer ID:", response.data.customer_id);
      } else {
        console.warn("Customer ID missing in response!");
      }



      console.log("Access Token:", response.data.access_token);

      localStorage.setItem("access_token", response.data.access_token);

      alert("OTP verified successfully!");
      onSubmit({
        phone: form.phone,
        customer_id: response.data.customer_id, // <-- Send customer_id
        access_token: response.data.access_token, // <-- Send customer_id
        
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white shadow rounded">
      <h2 className="text-lg font-semibold">Login</h2>

      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="border-2 border-blue-500 p-2 w-full rounded "
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-black"
          >
            Send OTP
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-black"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Verify OTP
          </button>
        </form>
      )}
    </div>
  );
}
