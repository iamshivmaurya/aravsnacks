'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import Link from 'next/link';

type TaxClass = {
  tax_class_id?: number;
  tax_class_name: string;
  description: string;
  tax_percentage: number;
  tax_type: string;
  country_code: string;
  state_code: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

const TAX_CLASSES_API = `tax-classes`;

export default function TaxClassesPage() {
  const [taxClasses, setTaxClasses] = useState<TaxClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 5; // items per page
  const [totalTaxClasses, setTotalTaxClasses] = useState(0);

  // Search / Filter
  const [search, setSearch] = useState('');

  // ✅ Fetch tax classes
  const fetchTaxClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get(TAX_CLASSES_API, {
        params: { skip: (page - 1) * limit, limit, search },
      });

      if (res.data.tax_classes) {
        setTaxClasses(res.data.tax_classes);
        setTotalTaxClasses(res.data.total);
      } else {
        setTaxClasses(res.data);
        setTotalTaxClasses(res.data.length);
      }
      setErrorMsg('');
    } catch (err) {
      console.error('Failed to fetch tax classes:', err);
      setErrorMsg('❌ Failed to load tax classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxClasses();
  }, [page, search]);

  // ✅ Delete tax class
  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this tax class?')) return;

    try {
      setLoading(true);
      await api.delete(`${TAX_CLASSES_API}/${id}`);
      setMessage('🗑️ Tax class deleted successfully!');
      setTaxClasses((prev) => prev.filter((t) => t.tax_class_id !== id));
    } catch (err) {
      console.error('Failed to delete tax class:', err);
      setMessage('❌ Failed to delete tax class.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalTaxClasses / limit));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">📊 Tax Classes</h2>
        <Link href="/admin/tax/add">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            ➕ Add Tax Class
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
          placeholder="Search by name or country"
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

      {/* Tax Classes Table */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Percentage</th>
              <th className="border p-2">Country</th>
              <th className="border p-2">State</th>
              <th className="border p-2">Active</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">Loading...</td>
              </tr>
            ) : taxClasses.length > 0 ? (
              taxClasses.map((tax) => (
                <tr key={tax.tax_class_id} className="text-center hover:bg-gray-50">
                  <td className="border p-2">{tax.tax_class_id}</td>
                  <td className="border p-2">{tax.tax_class_name}</td>
                  <td className="border p-2">{tax.description || '-'}</td>
                  <td className="border p-2">{tax.tax_percentage}%</td>
                  <td className="border p-2">{tax.country_code}</td>
                  <td className="border p-2">{tax.state_code}</td>
                  <td className="border p-2">{tax.is_active ? '✅' : '❌'}</td>
                  <td className="border p-2 flex justify-center space-x-2">
                    <Link href={`/admin/tax/edit/${tax.tax_class_id}`}>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">✏️</button>
                    </Link>
                    <button
                      onClick={() => handleDelete(tax.tax_class_id)}
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
                <td colSpan={8} className="border p-2 text-gray-500 text-center">
                  No tax classes found.
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
