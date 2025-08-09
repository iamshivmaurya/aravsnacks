"use client";
import { useState } from "react";

type SignUpProps = {
  onSuccess: () => void;
};

export default function SignUp({ onSuccess }: SignUpProps) {
  const [phone, setPhone] = useState("");
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  
  // Dummy OTP (normally backend se aata)
  const DUMMY_OTP = "1234";

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) return;
    // Normally yaha API call hoti OTP send karne ke liye
    console.log(`Sending OTP ${DUMMY_OTP} to phone: ${phone}`);
    setIsOtpStep(true);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (otp === DUMMY_OTP) {
      // Save phone in localStorage
      localStorage.setItem("userPhone", phone);

      // Success callback
      onSuccess();
    } else {
      alert("Invalid OTP! Try again.");
    }
  };

  return (
    <div>
      {!isOtpStep ? (
        <form onSubmit={handlePhoneSubmit}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            className="border p-2 w-full"
            required
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 mt-2 rounded">
            Get OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="border p-2 w-full"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 mt-2 rounded">
            Verify OTP
          </button>
        </form>
      )}
    </div>
  );
}
