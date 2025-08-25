"use client";
import { useState } from "react";
import axios from "axios";

type EditPhoneFormProps = {
  phone: string;
  customer_id: string;
  onPhoneUpdated: (newPhone: string) => void;
};

export default function EditPhoneForm({ phone, customer_id, onPhoneUpdated }: EditPhoneFormProps) {
  const [newPhone, setNewPhone] = useState(phone);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("access_token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!customer_id) throw new Error("Customer ID is missing!");

      // 1) Update phone number
      await axios.put(
        `http://127.0.0.1:8000/customers/${customer_id}`,
        { phone: newPhone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 2) Trigger OTP send
      await axios.post("http://127.0.0.1:8000/send-otp", { phone: newPhone });

      alert("Phone number updated. OTP sent!");
      onPhoneUpdated(newPhone);
    } catch (error: any) {
      console.error("Error updating phone:", error.response?.data || error.message);
      alert(`Failed to update phone: ${JSON.stringify(error.response?.data || error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white shadow rounded">
      <h2 className="text-lg font-semibold">Update Phone</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="phone"
          placeholder="New Phone Number"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Phone & Send OTP"}
        </button>
      </form>
    </div>
  );
}
