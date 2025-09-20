'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';


type Customer = {
  customer_id?: number;
  customer_name: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  registor_on?: string;
  is_active: boolean;
};

const CUSTOMER_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(CUSTOMER_API);
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Customers</h2>
        <Link href="/admin/customers/add">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            ➕ Add Customer
          </button>
        </Link>
      </div>

      <div className="bg-white p-6">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Registered</th>
              <th className="border p-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((cust) => (
                <tr key={cust.customer_id} className="text-center">
                  <td className="border p-2">{cust.customer_id}</td>
                  <td className="border p-2">{cust.first_name || 'N/A'} {cust.last_name}</td>
                  <td className="border p-2">{cust.email || 'N/A'}</td>
                  <td className="border p-2">{cust.phone}</td>
                  <td className="border p-2">{cust.registor_on ? new Date(cust.registor_on).toLocaleDateString() : '-'}</td>
                  <td className="border p-2">{cust.is_active ? "✅" : "❌"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="border p-2 text-gray-500">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
