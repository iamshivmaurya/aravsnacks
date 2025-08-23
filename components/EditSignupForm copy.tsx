"use client";
import { useState } from "react";

type EditSignupData = {
  phone: string;
  customer_name: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;


};

type EditSignupFormProps = {
  phone: string;
  onSubmit: (data: EditSignupData) => void;
};

export default function EditSignupForm({ phone, onSubmit }: EditSignupFormProps) {
  const [form, setForm] = useState<EditSignupData>({
    phone: phone,
    customer_name: "",
    email: "",
    password_hash: "",
    first_name: "",
    last_name: "",
   
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="space-y-4 p-4 bg-white shadow rounded">
      <h2 className="text-lg font-semibold">Complete Your Signup</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="phone"
          value={form.phone}
          disabled
          className="border p-2 w-full bg-gray-100 cursor-not-allowed"
        />

        <input
          name="customer_name"
          placeholder="First Name"
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
          name="password_hash"
          placeholder="Password"
          value={form.password_hash}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Save & Continue
        </button>
      </form>
    </div>
  );
}
