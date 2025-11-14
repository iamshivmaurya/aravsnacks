"use client";

import { useState, useEffect } from "react";
import api from "@/utils/axios";

type ShippingAddressProps = {
  initialData: {
    address_id: number;
    first_name: string;
    last_name: string;
    phone_no: string;
    city: string;
    state: string;
    postal_code: string;
    street_address: string;
    address_type: string;
  };
  onSuccess?: () => void; // Callback after successful edit
  onClose?: () => void;   // Optional close form
};

export default function ShippingAddressForm({
  initialData,
  onSuccess,
  onClose,
}: ShippingAddressProps) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_no: "",
    city: "",
    state: "",
    postal_code: "",
    street_address: "",
    address_type: "permanent",
  });

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialData }); // ✅ prefill form
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!initialData.address_id) {
      alert("Address ID missing!");
      return;
    }

    // Validation
    if (!form.first_name || !form.phone_no || !form.city) {
      alert("Please fill required fields");
      return;
    }

    try {
      const response = await api.put(`/addresses/${initialData.address_id}`,
        form
      );

      if (response.status === 200) {
        alert("Address updated successfully!");
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }
    } catch (error: any) {
      console.error("Error updating address:", error);
      alert(error.response?.data?.message || "Failed to update address");
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

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Update Address
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
