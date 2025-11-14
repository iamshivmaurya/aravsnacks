'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import { Loader2 } from 'lucide-react';

type Coupon = {
  coupon_code: string;
  coupon_discription: string;
  discount_type: string;
  discount_amount: number;
  valid_from: string;
  valid_to: string;
  coupon_rule: string;
};

const CREATE_COUPON_API = `create_coupon/`;

export default function AddCouponPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Coupon>({
    coupon_code: '',
    coupon_discription: '',
    discount_type: '',
    discount_amount: 0,
    valid_from: '',
    valid_to: '',
    coupon_rule: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // ✅ Basic frontend validation
    if (!formData.coupon_code || !formData.discount_type) {
      setMessage('❌ Coupon code and discount type are required.');
      return;
    }

    setLoading(true);

    try {
      // ✅ Format payload exactly as API expects
      const payload = {
        coupon_code: formData.coupon_code,
        coupon_discription: formData.coupon_discription,
        discount_type: formData.discount_type,
        discount_amount: Number(formData.discount_amount),
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_to: new Date(formData.valid_to).toISOString(),
        coupon_rule: formData.coupon_rule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const res = await api.post(CREATE_COUPON_API, payload);
      console.log('✅ Coupon created:', res.data);

      setMessage('✅ Coupon created successfully!');
      setTimeout(() => router.push('/admin/coupons'), 1500);
    } catch (err: any) {
      console.error('❌ Failed to create coupon:', err.response?.data || err.message);
      setMessage(
        `❌ Failed to create coupon. ${
          err.response?.data?.detail || 'Please check all required fields.'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">🎟️ Create New Coupon</h2>

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
        {/* Coupon Basic Info */}
        <section>
          <h3 className="text-lg font-semibold mb-3">📝 Coupon Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Coupon Code</label>
              <input
                type="text"
                value={formData.coupon_code}
                onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={formData.coupon_discription}
                onChange={(e) =>
                  setFormData({ ...formData, coupon_discription: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
        </section>

        {/* Discount Details */}
        <section>
          <h3 className="text-lg font-semibold mb-3">💰 Discount Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Select Type</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Amount</label>
              <input
                type="number"
                min="0"
                value={formData.discount_amount}
                onChange={(e) =>
                  setFormData({ ...formData, discount_amount: Number(e.target.value) })
                }
                className="border p-2 rounded w-full"
                required
              />
            </div>
          </div>
        </section>

        {/* Validity Dates */}
        <section>
          <h3 className="text-lg font-semibold mb-3">📅 Validity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valid From</label>
              <input
                type="datetime-local"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid To</label>
              <input
                type="datetime-local"
                value={formData.valid_to}
                onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
            </div>
          </div>
        </section>

        {/* Coupon Rule */}
        <section>
          <label className="block text-sm font-medium mb-1">Coupon Rule</label>
          <textarea
            value={formData.coupon_rule}
            onChange={(e) => setFormData({ ...formData, coupon_rule: e.target.value })}
            className="border p-2 rounded w-full h-24"
            placeholder="e.g. Minimum purchase ₹500"
          />
        </section>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? 'Saving...' : 'Create Coupon'}
          </button>
        </div>
      </form>
    </div>
  );
}
