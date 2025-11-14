'use client';

import { useEffect, useState } from 'react';
import api from "@/utils/axios";
import Link from 'next/link';

type Customer = {
  customer_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  registor_on?: string;
  is_active: boolean;
};

const CUSTOMER_API = `customers`;

export default function CustomersPage() {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 5; // customers per page

  // Search / Filter
  const [search, setSearch] = useState('');

  // Fetch all customers once
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(CUSTOMER_API);
      setAllCustomers(res.data);
      setPage(1); // reset page
      setErrorMsg('');
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setErrorMsg('❌ Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Update displayed customers whenever allCustomers, page, or search changes
  useEffect(() => {
    let filtered = allCustomers;

    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = allCustomers.filter(
        (c) =>
          c.first_name.toLowerCase().includes(s) ||
          c.last_name.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s)
      );
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    setCustomers(filtered.slice(start, end));
  }, [allCustomers, page, search]);

  // Delete customer
  const handleDelete = async (customer_id: number | undefined) => {
    if (!customer_id) return;
    const confirmDelete = confirm("Are you sure you want to delete this customer?");
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await api.delete(`${CUSTOMER_API}/${customer_id}`);
      setMessage("🗑️ Customer deleted successfully!");
      setAllCustomers(prev => prev.filter(c => c.customer_id !== customer_id));
    } catch (err) {
      console.error('Failed to delete customer:', err);
      setMessage("❌ Failed to delete customer.");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(
    (search.trim()
      ? allCustomers.filter(
          (c) =>
            c.first_name.toLowerCase().includes(search.toLowerCase()) ||
            c.last_name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase())
        ).length
      : allCustomers.length
    ) / limit
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">👥 Customers</h2>
        <Link href="/admin/customers/add">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            ➕ Add Customer
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
          placeholder="Search by name or email"
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

      {/* Customers Table */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Registered</th>
              <th className="border p-2">Active</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">Loading...</td>
              </tr>
            ) : customers.length > 0 ? (
              customers.map((cust) => (
                <tr key={cust.customer_id} className="text-center hover:bg-gray-50">
                  <td className="border p-2">{cust.customer_id}</td>
                  <td className="border p-2">{cust.first_name || 'N/A'} {cust.last_name || ''}</td>
                  <td className="border p-2">{cust.email || 'N/A'}</td>
                  <td className="border p-2">{cust.phone || '-'}</td>
                  <td className="border p-2">{cust.registor_on ? new Date(cust.registor_on).toLocaleDateString() : '-'}</td>
                  <td className="border p-2">{cust.is_active ? '✅' : '❌'}</td>
                  <td className="border p-2 flex justify-center space-x-2">
                    <Link href={`/admin/customers/edit/${cust.customer_id}`}>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">✏️</button>
                    </Link>
                    <button
                      onClick={() => handleDelete(cust.customer_id)}
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
                <td colSpan={7} className="border p-2 text-gray-500 text-center">
                  No customers found.
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
