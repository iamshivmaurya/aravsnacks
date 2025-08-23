"use client";
import { useState, useEffect } from "react";
import axios from "axios";

type EditSignupData = {
  phone: string;
  customer_name: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

type EditSignupFormProps = {
  phone: string;
  customer_id: string; // Required for editing existing user
  onSubmit: (data: EditSignupData) => void;
};

export default function EditSignupForm({ phone, customer_id, onSubmit }: EditSignupFormProps) {
  const [form, setForm] = useState<EditSignupData>({
    phone: phone,
    customer_name: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("access_token");

  // ✅ Fetch existing customer data if customer_id is present
  useEffect(() => {
    if (customer_id) {
      const fetchCustomer = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:8000/customers/${customer_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = response.data;
          setForm({
            phone: data.phone,
            customer_name: data.customer_name,
            email: data.email,
            password: "", // Password blank, user can enter new one
            first_name: data.first_name,
            last_name: data.last_name,
          });
        } catch (err) {
          console.error("Failed to fetch customer data:", err);
        }
      };

      fetchCustomer();
    }
  }, [customer_id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!customer_id) throw new Error("Customer ID is missing!");

      const response = await axios.put(
        `http://127.0.0.1:8000/customers/${customer_id}`,
        {
          customer_name: form.customer_name,
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          is_active: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Signup updated:", response.data);
      alert("Signup updated successfully!");
      onSubmit(form);
    } catch (error: any) {
      console.error("Error updating signup:", error.response?.data || error.message);
      alert(`Failed to update signup: ${JSON.stringify(error.response?.data || error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white shadow rounded">
      <h2 className="text-lg font-semibold">Edit Signup</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="phone"
          value={form.phone}
          disabled
          className="border p-2 w-full bg-gray-100 cursor-not-allowed"
        />

        <input
          name="customer_name"
          placeholder="Customer Name"
          value={form.customer_name}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

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
          value={form.email}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update & Save"}
        </button>
      </form>
    </div>
  );
}
