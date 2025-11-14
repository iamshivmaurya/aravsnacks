'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/utils/axios';
import { Loader2 } from 'lucide-react';

type TaxClass = {
  tax_class_id?: number;
  tax_class_name: string;
  description: string;
  tax_percentage: number;
  tax_type: string;
  country_code: string;
  state_code: string;
  is_active: boolean;
};

export default function EditTaxClassPage() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState<TaxClass>({
    tax_class_name: '',
    description: '',
    tax_percentage: 0,
    tax_type: '',
    country_code: '',
    state_code: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ✅ Fetch existing tax class by ID
  const fetchTaxClass = async () => {
    try {
      const res = await api.get(`tax-classes/${id}`);
      setFormData(res.data);
    } catch (err) {
      console.error('Failed to fetch tax class:', err);
      setMessage('❌ Failed to load tax class details.');
    }
  };

  useEffect(() => {
    if (id) fetchTaxClass();
  }, [id]);

  // ✅ Handle form submit (update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.put(`tax-classes/${id}`, formData);
      setMessage('✅ Tax class updated successfully!');
      setTimeout(() => router.push('/admin/tax'), 1500);
    } catch (err) {
      console.error('Failed to update tax class:', err);
      setMessage('❌ Failed to update tax class.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">✏️ Edit Tax Class</h2>

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
        className="bg-white p-6 rounded-lg shadow-md space-y-6"
      >
        {/* Tax Class Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tax Class Name</label>
            <input
              type="text"
              value={formData.tax_class_name}
              onChange={(e) =>
                setFormData({ ...formData, tax_class_name: e.target.value })
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Tax Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tax Percentage (%)</label>
            <input
              type="number"
              min="0"
              value={formData.tax_percentage}
              onChange={(e) =>
                setFormData({ ...formData, tax_percentage: Number(e.target.value) })
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tax Type</label>
            <input
              type="text"
              value={formData.tax_type}
              onChange={(e) =>
                setFormData({ ...formData, tax_type: e.target.value })
              }
              className="border p-2 rounded w-full"
              placeholder="e.g. GST, VAT"
            />
          </div>
        </div>

        {/* Location Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Country Code</label>
            <input
              type="text"
              value={formData.country_code}
              onChange={(e) =>
                setFormData({ ...formData, country_code: e.target.value })
              }
              className="border p-2 rounded w-full"
              placeholder="e.g. IN"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">State Code</label>
            <input
              type="text"
              value={formData.state_code}
              onChange={(e) =>
                setFormData({ ...formData, state_code: e.target.value })
              }
              className="border p-2 rounded w-full"
              placeholder="e.g. HR"
            />
          </div>
        </div>

        {/* Active Status */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
            />
            <span>Active</span>
          </label>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? 'Saving...' : 'Update Tax Class'}
          </button>
        </div>
      </form>
    </div>
  );
}
