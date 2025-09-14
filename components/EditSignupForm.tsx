"use client";

import { useState } from "react";
import axios from "axios";
import {API_BASE_URL} from  "../constants"

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
  const [generatedMessage, setSuccessMessage] = useState("");
  const [errorMsg, setFailedMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API_BASE_URL}/customers/${customer_id}`, form);
      setSuccessMessage("Updated profile successfully !");
      onUpdateSuccess?.();
    } catch (error: any) {
      console.error("Error updating profile:", error.response?.data || error.message);
      setFailedMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div>

        {errorMsg && (
            <div className="text-center p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {errorMsg}
            </div>
          )}
        {(generatedMessage) && (
          <div className="text-center p-3 bg-green-100 text-green-700 rounded-md text-sm">
            ✅ {generatedMessage}{" "}
          </div>
        )}


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
    </div> 
  );
}
