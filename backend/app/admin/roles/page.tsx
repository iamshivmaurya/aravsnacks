'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import Link from 'next/link';

type Role = {
  id?: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
};

const ROLES_API = `admin/roles`;

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 5; // items per page
  const [totalRoles, setTotalRoles] = useState(0);

  // Search
  const [search, setSearch] = useState('');

  // ✅ Fetch roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get(ROLES_API, {
        params: { skip: (page - 1) * limit, limit, search },
      });

      if (res.data.roles) {
        // In case backend returns { roles, total }
        setRoles(res.data.roles);
        setTotalRoles(res.data.total || res.data.roles.length);
      } else {
        // If backend returns a plain array
        setRoles(res.data);
        setTotalRoles(res.data.length);
      }

      setErrorMsg('');
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setErrorMsg('❌ Failed to load roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page, search]);

  // ✅ Delete a role
  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      setLoading(true);
      await api.delete(`${ROLES_API}/${id}`);
      setMessage('🗑️ Role deleted successfully!');
      setRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete role:', err);
      setMessage('❌ Failed to delete role.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalRoles / limit));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">🧩 Roles Management</h2>
        <Link href="/admin/roles/add">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            ➕ Add Role
          </button>
        </Link>
      </div>

      {/* Message / Error */}
      {message && (
        <div
          className={`p-2 rounded ${
            message.startsWith('🗑️') || message.startsWith('✅')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}
      {errorMsg && <p className="text-red-600">{errorMsg}</p>}

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by role name or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') setPage(1); }}
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={() => setPage(1)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {/* Roles Table */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">ID</th>
              <th className="border p-2">Role Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">Loading...</td>
              </tr>
            ) : roles.length > 0 ? (
              roles.map((role) => (
                <tr key={role.id} className="text-center hover:bg-gray-50">
                  <td className="border p-2">{role.id}</td>
                  <td className="border p-2">{role.name}</td>
                  <td className="border p-2">{role.description || '-'}</td>
                  <td className="border p-2 flex justify-center space-x-2">
                    <Link href={`/admin/roles/edit/${role.id}`}>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                        ✏️
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(role.id)}
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
                <td colSpan={4} className="border p-2 text-gray-500 text-center">
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="bg-gray-200 px-4 py-1 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <p>Page {page} of {totalPages}</p>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="bg-gray-200 px-4 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
