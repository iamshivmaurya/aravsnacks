'use client';

import AddProduct from '@/components/admin/AddProduct';

export default function ProductsDashboard() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">📦 Product Management</h2>
      <AddProduct />
    </div>
  );
}
