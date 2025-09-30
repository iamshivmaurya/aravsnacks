"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/utils/axios";
import { Pencil } from "lucide-react";
import { VERIFY_OTP_API } from "../constants";

type EditProfileFormProps = {
  customer_id: string;
  initialData: {
    customer_name?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  onUpdateSuccess?: () => void;
};

export default function EditProfileForm({
  customer_id,
  initialData,
  onUpdateSuccess,
}: EditProfileFormProps) {
  const [form, setForm] = useState({
    customer_name: initialData.customer_name || "",
    email: initialData.email || "",
    first_name: initialData.first_name || "",
    last_name: initialData.last_name || "",
    phone: initialData.phone || "",
  });

  const [originalPhone] = useState(initialData.phone || "");
  const [phoneEditable, setPhoneEditable] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLength, setOtpLength] = useState(4);
  const [verified, setVerified] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (otpSent && otpRefs.current[0]) otpRefs.current[0].focus();
  }, [otpSent]);

  // 🔤 Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg("");
    setSuccessMsg("");

    if (e.target.name === "phone") {
      setVerified(false);
      setOtpSent(false);
    }
  };

  // 🔢 OTP input handler
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));
    if (value && index < otpLength - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  // 📤 Send OTP (by updating phone field)
  const handleSendOtp = async () => {
    try {
      const res = await api.put(`/customers/${customer_id}`, { phone: form.phone });
      
      if (res.data.otp_sent) {
        setOtpSent(true);
        setOtp(""); 
        setOtpLength(res.data.otp_length || 4);
  
        // Show OTP in dev mode
        console.log("DEV OTP:", res.data.otp);
        alert(`DEV OTP: ${res.data.otp}`);
  
        setSuccessMsg(res.data.message);
      } else {
        setVerified(true);
        setSuccessMsg(res.data.message);
      }
    } catch (err: any) {
      console.error("Send OTP error:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to generate OTP");
    }
  };
  

  // ✅ Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== otpLength)
      return setErrorMsg(`Enter ${otpLength}-digit OTP`);

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await api.post(VERIFY_OTP_API, {
        phone: form.phone,
        otp,
      });

      setVerified(true);
      setSuccessMsg(res.data.message || "Phone verified ✅");
    } catch (err: any) {
      console.error("OTP Verify Error:", err);
      setErrorMsg(err.response?.data?.detail || "Invalid OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  // 📝 Submit final profile update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Require OTP verification for changed phone
    if (form.phone !== originalPhone && !verified) {
      return setErrorMsg("Please verify new phone number before updating");
    }

    try {
      setLoading(true);
      await api.put(`/customers/${customer_id}`, form);
      setSuccessMsg("Profile updated successfully ✅");
      onUpdateSuccess?.();
    } catch (err: any) {
      console.error("Update Error:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to update profile ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md bg-white p-6 rounded-xl shadow">
      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-2">{errorMsg}</div>
      )}
      {successMsg && (
        <div className="p-3 bg-green-100 text-green-700 rounded mb-2">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold">Edit Profile</h2>

        <input
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />

        {/* 📱 Phone */}
        <div className="relative flex items-center">
          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            readOnly={!phoneEditable}
            className={`border p-2 w-full rounded ${
              phoneEditable ? "bg-white" : "bg-gray-100 cursor-not-allowed"
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setPhoneEditable(!phoneEditable)}
            className="absolute right-2 text-gray-500 hover:text-gray-700"
          >
            <Pencil size={16} />
          </button>
        </div>

        {/* OTP Section */}
        {form.phone !== originalPhone && (
          <>
            {!otpSent && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="bg-yellow-500 text-white px-4 py-2 rounded w-full"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            )}

            {otpSent && !verified && (
              <div className="space-y-3">
                <div className="flex justify-center gap-2">
                  {Array.from({ length: otpLength }).map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={otp[i] || ""}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      ref={(el) => (otpRefs.current[i] = el)}
                      className="w-10 h-10 text-center border rounded"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded w-full"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
