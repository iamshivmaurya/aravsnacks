'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/axios';

type Coupon = {
  coupon_id?: number;
  coupon_code: string;
  coupon_discription: string;
  discount_type: string;
  discount_amount: number;
  valid_from: string;
  valid_to: string;
  coupon_rule: string;
  created_at?: string;
  updated_at?: string;
};

const COUPONS_API = 'coupons';
const DELETE_API = 'coupon'; // adjust to your real delete endpoint if different

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ✅ Fetch all coupons
  const fetchCoupons = async () => {
    try {
      const res = await api.get(COUPONS_API);
      setCoupons(res.data);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // ✅ Handle delete
  const handleDelete = async (coupon_id?: number) => {
    if (!coupon_id) return;
    const confirmDelete = confirm('Are you sure you want to delete this coupon?');
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await api.delete(`${DELETE_API}/${coupon_id}`);
      setCoupons((prev) => prev.filter((c) => c.coupon_id !== coupon_id));
      setMessage('🗑️ Coupon deleted successfully!');
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      setMessage('❌ Failed to delete coupon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">🎟️ Coupons</h2>
        <Link href="/admin/coupons/add">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            ➕ Add Coupon
          </button>
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-2 rounded ${
            message.startsWith('🗑️')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      {/* Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">#</th>
              <th className="border p-2">Coupon Code</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Discount Type</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Valid From</th>
              <th className="border p-2">Valid To</th>
              <th className="border p-2">Rule</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length > 0 ? (
              coupons.map((coupon) => (
                <tr key={coupon.coupon_id} className="text-center hover:bg-gray-50">
                  <td className="border p-2">{coupon.coupon_id}</td>
                  <td className="border p-2 font-semibold">{coupon.coupon_code}</td>
                  <td className="border p-2">{coupon.coupon_discription}</td>
                  <td className="border p-2 capitalize">{coupon.discount_type}</td>
                  <td className="border p-2">{coupon.discount_amount}</td>
                  <td className="border p-2">
                    {new Date(coupon.valid_from).toLocaleDateString()}
                  </td>
                  <td className="border p-2">
                    {new Date(coupon.valid_to).toLocaleDateString()}
                  </td>
                  <td className="border p-2">{coupon.coupon_rule || '-'}</td>
                  <td className="border p-2 flex justify-center gap-2">
                    <Link href={`/admin/coupons/edit/${coupon.coupon_id}`}>
                      
                      <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                        ✏️ 
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(coupon.coupon_id)}
                      disabled={loading}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      🗑️ 
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="border p-2 text-gray-500 text-center">
                  No coupons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
