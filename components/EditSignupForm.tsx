"use client";

import { useState } from "react";
import axios from "axios";

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

export default function EditProfileForm({ customer_id, initialData, onUpdateSuccess }: EditProfileFormProps) {
  const [form, setForm] = useState({
    customer_name: initialData.customer_name || "",
    email: initialData.email || "",
    first_name: initialData.first_name || "",
    last_name: initialData.last_name || "",
    phone: initialData.phone || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`http://127.0.0.1:8000/customers/${customer_id}`, form);
      alert("Profile updated successfully!");
      onUpdateSuccess?.();
    } catch (error: any) {
      console.error("Error updating profile:", error.response?.data || error.message);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow rounded max-w-md">
      <h2 className="text-lg font-semibold">Edit Profile</h2>

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
        name="email"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />

      <input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        {loading ? "Updating..." : "Update Profile"}
      </button>
    </form>
  );
}
