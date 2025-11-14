'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/axios';
import { Loader2 } from 'lucide-react';

type Customer = {
  customer_id?: number;
  customer_name: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
};

const CUSTOMER_API = `customers`;

export default function EditCustomerPage() {
  const { customer_id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<Customer>({
    customer_name: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ✅ Fetch customer by ID
  useEffect(() => {
    if (!customer_id) return;
    const fetchCustomer = async () => {
      try {
        const res = await api.get(`${CUSTOMER_API}/${customer_id}`);
        setFormData(res.data);
      } catch (err) {
        console.error('Failed to load customer:', err);
      }
    };
    fetchCustomer();
  }, [customer_id]);

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await api.put(`${CUSTOMER_API}/${customer_id}`, formData);
      setMessage('✅ Customer updated successfully!');
      setTimeout(() => router.push('/admin/customers'), 1500);
    } catch (err: any) {
      console.error('Failed to update customer:', err);
      setMessage('❌ Failed to update customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">✏️ Edit Customer</h2>

      {message && (
        <div
          className={`p-3 rounded ${
            message.startsWith('✅')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) =>
                setFormData({ ...formData, customer_name: e.target.value })
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
            />
            <span>Active</span>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? 'Saving...' : 'Update Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
