'use client';

import { useState } from 'react';
import axios from 'axios';

type Customer = {
  customer_id?: number;
  customer_name: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
};

const CUSTOMER_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`;

export default function CustomerForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState<Customer>({
    customer_name: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setLoading(true);
      await axios.post(CUSTOMER_API, formData);
      setSuccessMsg("✅ Customer added successfully!");
      setFormData({
        customer_name: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        is_active: true,
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "❌ Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-md"
    >
      {errorMsg && <div className="col-span-2 p-2 bg-red-100 text-red-600 rounded">{errorMsg}</div>}
      {successMsg && <div className="col-span-2 p-2 bg-green-100 text-green-600 rounded">{successMsg}</div>}

      <input
        type="text"
        placeholder="Customer Username"
        value={formData.customer_name}
        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
        className="border p-2 rounded"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="border p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="First Name"
        value={formData.first_name}
        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
        className="border p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="Last Name"
        value={formData.last_name}
        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        className="border p-2 rounded"
      />

      <label className="flex items-center space-x-2 col-span-2">
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        />
        <span>Active</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg col-span-2"
      >
        {loading ? "Saving..." : "Add Customer"}
      </button>
    </form>
  );
}
