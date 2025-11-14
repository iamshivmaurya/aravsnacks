'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/axios';
import { Loader2 } from 'lucide-react';

type Coupon = {
  coupon_id?: number;
  coupon_code: string;
  coupon_discription: string;
  discount_type: string;
  discount_amount: number;
  valid_from: string;
  valid_to: string;
  coupon_rule: string;
};

const COUPON_API = `coupon`;
 

export default function EditCouponPage() {
  const { coupon_id } = useParams();
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

  // Fetch coupon data by ID
  useEffect(() => {
    if (!coupon_id) return;

    const fetchCoupon = async () => {
      try {
        const res = await api.get(`${COUPON_API}/${coupon_id}`);
        setFormData(res.data);
      } catch (err) {
        console.error('Failed to load coupon:', err);
        setMessage('❌ Failed to load coupon.');
      }
    };

    fetchCoupon();
  }, [coupon_id]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await api.put(`${COUPON_API}/${coupon_id}`, formData);
      setMessage('✅ Coupon updated successfully!');
      setTimeout(() => router.push('/admin/coupons'), 1500);
    } catch (err) {
      console.error('Failed to update coupon:', err);
      setMessage('❌ Failed to update coupon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">✏️ Edit Coupon</h2>

      {message && (
        <div
          className={`p-3 rounded ${
            message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-6"
      >
        {/* Coupon Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Coupon Code</label>
            <input
              type="text"
              value={formData.coupon_code}
              onChange={(e) =>
                setFormData({ ...formData, coupon_code: e.target.value })
              }
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Discount Type</label>
            <select
              value={formData.discount_type}
              onChange={(e) =>
                setFormData({ ...formData, discount_type: e.target.value })
              }
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
              min={0}
              value={formData.discount_amount}
              onChange={(e) =>
                setFormData({ ...formData, discount_amount: Number(e.target.value) })
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valid From</label>
            <input
              type="datetime-local"
              value={formData.valid_from}
              onChange={(e) =>
                setFormData({ ...formData, valid_from: e.target.value })
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valid To</label>
            <input
              type="datetime-local"
              value={formData.valid_to}
              onChange={(e) =>
                setFormData({ ...formData, valid_to: e.target.value })
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Coupon Rule</label>
            <textarea
              value={formData.coupon_rule}
              onChange={(e) =>
                setFormData({ ...formData, coupon_rule: e.target.value })
              }
              className="border p-2 rounded w-full h-24"
              placeholder="e.g. Minimum purchase ₹500"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? 'Saving...' : 'Update Coupon'}
          </button>
        </div>
      </form>
    </div>
  );
}
