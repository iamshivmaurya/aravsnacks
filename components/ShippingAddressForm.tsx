"use client";

import { useState } from "react";

type ShippingAddressProps = {
  onSubmit: (data: ShippingAddressData) => void;
};

export type ShippingAddressData = {
  fullName: string;
  phone: string;
  addressLine1: string;
  
};

export default function ShippingAddressForm({ onSubmit }: ShippingAddressProps) {
  const [form, setForm] = useState<ShippingAddressData>({
    fullName: "",
    phone: "",
    addressLine1: "",
   
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.phone || !form.addressLine1) {
      alert("Please fill all required fields");
      return;
    }

    // In real case, save to backend or context
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow rounded">
      <h2 className="text-lg font-semibold">Shipping Address</h2>

      <input
        name="fullName"
        placeholder="Full Name"
        value={form.fullName}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />

      <input
        name="phone"
        placeholder="Phone Number"
        value={form.phone}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />

      <input
        name="addressLine1"
        placeholder="Address Line"
        value={form.addressLine1}
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
