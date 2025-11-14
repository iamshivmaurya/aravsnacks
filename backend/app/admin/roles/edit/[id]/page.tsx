'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/utils/axios';
import { Loader2 } from 'lucide-react';

type Role = {
  id?: number;
  name: string;
  description: string;
  path: string;
  method: string;
  allowed: boolean;
};

export default function EditRolePage() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState<Role>({
    name: '',
    description: '',
    path: '',
    method: '',
    allowed: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ✅ Fetch role by ID
  const fetchRole = async () => {
    try {
      const res = await api.get(`/admin/roles/${id}`);
      setFormData(res.data);
    } catch (err) {
      console.error('Failed to fetch role:', err);
      setMessage('❌ Failed to load role details.');
    }
  };

  useEffect(() => {
    if (id) fetchRole();
  }, [id]);

  // ✅ Handle form submit (update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.put(`/admin/roles/${id}`, formData);
      setMessage('✅ Role updated successfully!');
      setTimeout(() => router.push('/admin/roles'), 1500);
    } catch (err) {
      console.error('Failed to update role:', err);
      setMessage('❌ Failed to update role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">✏️ Edit Role</h2>

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
        {/* Role Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Role Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
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
              required
            />
          </div>
        </div>

        {/* Permissions Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Path</label>
            <input
              type="text"
              value={formData.path}
              onChange={(e) =>
                setFormData({ ...formData, path: e.target.value })
              }
              className="border p-2 rounded w-full"
              placeholder="e.g. /users"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Method</label>
            <select
              value={formData.method}
              onChange={(e) =>
                setFormData({ ...formData, method: e.target.value })
              }
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Select Method</option>
              <option value="get">GET</option>
              <option value="post">POST</option>
              <option value="put">PUT</option>
              <option value="delete">DELETE</option>
            </select>
          </div>
        </div>

        {/* Allowed Toggle */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.allowed}
              onChange={(e) =>
                setFormData({ ...formData, allowed: e.target.checked })
              }
            />
            <span>Allowed</span>
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
            {loading ? 'Saving...' : 'Update Role'}
          </button>
        </div>
      </form>
    </div>
  );
}
