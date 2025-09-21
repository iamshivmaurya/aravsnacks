'use client';

import { useEffect, useState } from 'react';
import api from "@/utils/axios";
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

type Product = {
  id: number;
  sku: string;
  name: string;
  is_active: boolean;
  product_price: number;
  special_price: number | null;
  quantity: number;
  image_url: string;
  created_at: string;
};

const PRODUCT_API = `admin/products?skip=0&limit=100`;

export default function ViewProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(PRODUCT_API);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("❌ Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Products</h2>
        <button
          onClick={() => router.push('/admin/products')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <PlusCircle size={18} />
          Add Product
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white shadow-md rounded-xl p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2">Image</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Name</th>
                <th className="p-2">Price</th>
                <th className="p-2">Special Price</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Active</th>
                <th className="p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </td>
                    <td className="p-2">{p.sku}</td>
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">₹{p.product_price}</td>
                    <td className="p-2">
                      {p.special_price ? `₹${p.special_price}` : "-"}
                    </td>
                    <td className="p-2">{p.quantity}</td>
                    <td className="p-2">{p.is_active ? "✅" : "❌"}</td>
                    <td className="p-2">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-2 text-center" colSpan={8}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
