'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/utils/axios';
import { Loader2 } from 'lucide-react';

type User = {
  username: string;
  password: string;
  role: string;
  is_active: boolean;
};

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState<User>({
    username: '',
    password: '',
    role: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ✅ Fetch existing user
  const fetchUser = async () => {
    try {
      
      const res = await api.get(`/admin/users/${id}`);
      
      setFormData(res.data);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setMessage('❌ Failed to load user details.');
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  // ✅ Handle update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.put(`/admin/users/${id}`, formData);
      setMessage('✅ User updated successfully!');
      setTimeout(() => router.push('/admin/users'), 1500);
    } catch (err) {
      console.error('Failed to update user:', err);
      setMessage('❌ Failed to update user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">✏️ Edit User</h2>

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
        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="border p-2 rounded w-full"
            placeholder="e.g. admin, editor, viewer"
            required
          />
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
            {loading ? 'Saving...' : 'Update User'}
          </button>
        </div>
      </form>
    </div>
  );
}
