"use client";

import { useState, useEffect } from "react";
import api from "@/utils/axios";

type ShippingAddressProps = {
  onSuccess?: () => void; // Optional callback jab address save ho jaye
};

export type ShippingAddressData = {
  first_name: string;
  last_name: string;
  phone_no: string;
  city: string;
  state: string;
  postal_code: string;
  street_address: string;
};

export default function ShippingAddressForm({ onSuccess }: ShippingAddressProps) {
  const [form, setForm] = useState<ShippingAddressData>({
    first_name: "",
    last_name: "",
    phone_no: "",
    city: "",
    state: "",
    postal_code: "",
    street_address: "",
  });

  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [saveToCustomer, setSaveToCustomer] = useState(false); // New state

  useEffect(() => {
    setQuoteId(localStorage.getItem("quote_id"));
    setCustomerId(localStorage.getItem("customer_id")); // customer ID bhi chahiye
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
    if (!form.first_name || !form.phone_no || !form.city) {
      alert("Please fill required fields");
      return;
    }

    try {
      // Pehle quotes/:id/addresses me save karein
      const response = await api.post(
        `quotes/${quoteId}/addresses`,
        {
          address_type: "permanent",
          ...form,
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Agar checkbox tick hai to customer ke addresses me bhi save karein
        if (saveToCustomer && customerId) {
          await api.post(`customers/${customerId}/addresses`, {
            address_type: "permanent",
            ...form,
          });
        }

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
        name="first_name"
        placeholder="First Name"
        value={form.first_name}
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

      {/* Checkbox for saving to customer addresses */}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={saveToCustomer}
          onChange={(e) => setSaveToCustomer(e.target.checked)}
        />
        <span className="text-sm text-gray-700">
          Save this address to my account
        </span>
      </label>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Save Address
      </button>
    </form>
  );
}
