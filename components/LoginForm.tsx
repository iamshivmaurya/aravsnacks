"use client";
import axios from 'axios';
import { useState } from "react";

export type LoginData = {
  phone: string;
};

type LoginProps = {
  onSubmit: (data: LoginData) => void;
};

export default function LoginForm({ onSubmit }: LoginProps) {
  const [form, setForm] = useState<LoginData>({ phone: "" });
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  // Handle phone input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1: Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone) {
      alert("Please enter your phone number");
      return;
    }

    axios.post('http://127.0.0.1:8000/signup', {
      phone: form.phone 
    }).then(response => {
        setGeneratedOtp(response.data.otp);
        console.log(response.data.message); // all posts by userId=1
    });

    alert(`Your OTP is: ${generatedOtp}`); // ✅ In real app, send via SMS
    setStep("otp");
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    axios.post('http://127.0.0.1:8000/verify-otp',{
        phone: form.phone, 
        otp: "9390"
      } 
    ).then(response => {
        console.log(response.data.access_token); // all posts by userId=1
        
        localStorage.setItem("access_token",response.data.access_token);
    });
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
            className="border p-2 w-full"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
            className="border p-2 w-full"
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
