'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import { Loader2 } from 'lucide-react';

type Permission = {
  role_id: number;
  path: string;
  method: string;
  allowed: boolean;
};

type Role = {
  id: number;
  name: string;
};

export default function AddPermissionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Permission>({
    role_id: 0,
    path: '',
    method: '',
    allowed: true,
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ✅ Fetch roles for dropdown
  const fetchRoles = async () => {
    try {
      const res = await api.get('/admin/roles');
      setRoles(res.data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setMessage('❌ Failed to load roles.');
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // ✅ Handle submit (add permission)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/admin/permissions', formData);
      setMessage('✅ Permission added successfully!');
      setTimeout(() => router.push('/admin/permissions'), 1500);
    } catch (err) {
      console.error('Failed to add permission:', err);
      setMessage('❌ Failed to add permission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">➕ Add Permission</h2>

      {message && (
        <div
          className={`p-3 rounded ${message.startsWith('✅')
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
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Role</label>
          <select
            value={formData.role_id}
            onChange={(e) =>
              setFormData({ ...formData, role_id: Number(e.target.value) })
            }
            className="border p-2 rounded w-full"
            required
          >
            <option value={0}>-- Select Role --</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Path Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Path</label>
          <input
            type="text"
            value={formData.path}
            onChange={(e) =>
              setFormData({ ...formData, path: e.target.value })
            }
            className="border p-2 rounded w-full"
            placeholder="e.g. /api/v1/users"
            required
          />
        </div>

        {/* Method Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">HTTP Method</label>
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

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? 'Saving...' : 'Add Permission'}
          </button>
        </div>
      </form>
    </div>
  );
}
