"use client";

import { useState, useEffect } from "react";
import axios from "axios";

type ShippingAddressProps = {
  onSuccess?: () => void; // Optional callback jab address save ho jaye
};

export type ShippingAddressData = {
  fast_name: string;
  last_name: string;
  phone_no: string;
  city: string;
  state: string;
  postal_code: string;
  street_address: string;
};

export default function ShippingAddressForm({ onSuccess }: ShippingAddressProps) {
  const [form, setForm] = useState<ShippingAddressData>({
    fast_name: "",
    last_name: "",
    phone_no: "",
    city: "",
    state: "",
    postal_code: "",
    street_address: "",
  });

  const [quoteId, setQuoteId] = useState<string | null>(null);

  useEffect(() => {
    const storedQuoteId = localStorage.getItem("quote_id");
    if (storedQuoteId) {
      setQuoteId(storedQuoteId);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quoteId) {
      alert("Quote ID not found in local storage!");
      return;
    }

    // Required field validation
    if (!form.fast_name || !form.phone_no || !form.city) {
      alert("Please fill required fields");
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/quotes/${quoteId}/addresses`,
        {
          address_type: "permanent", // Static as per your example
          ...form,
        }
      );

      if (response.status === 201 || response.status === 200) {
        alert("Address saved successfully!");
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("Error saving address:", error);
      alert(error.response?.data?.message || "Failed to save address");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white shadow rounded"
    >
      <input
        name="fast_name"
        placeholder="First Name"
        value={form.fast_name}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />

      <input
        name="last_name"
        placeholder="Last Name"
        value={form.last_name}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />

      <input
        name="street_address"
        placeholder="Street Address"
        value={form.street_address}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />

      <input
        name="postal_code"
        placeholder="Pin Code"
        value={form.postal_code}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />

      <input
        name="city"
        placeholder="City"
        value={form.city}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />

      <input
        name="state"
        placeholder="State"
        value={form.state}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />

      <input
        name="phone_no"
        placeholder="Phone Number"
        value={form.phone_no}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Save Address
      </button>
    </form>
  );
}
