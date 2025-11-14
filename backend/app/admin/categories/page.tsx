'use client';
import { useEffect, useState } from 'react';
import api from "@/utils/axios";
import Link from 'next/link';

type Category = {
  category_id?: number;
  category_name: string;
  description: string;
  is_active: boolean;
  parent_id: number;
  sort_order: number;
  url_key: string;
  meta_keyword: string;
  meta_title: string;
  meta_description: string;
  category_path: string;
  level: string;
  image_name: string;
};

const API_BASE = "http://127.0.0.1:8000/api/v1/categories";

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_BASE);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Build full media URL
  const getMediaUrl = (image_name: string) => {
    return image_name?.startsWith("http")
      ? image_name
      : `${process.env.NEXT_PUBLIC_MEDIA_URL}/media/${image_name}`;
  };

  // 🗑️ Delete category
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await api.delete(`${API_BASE}/${id}`);
      setCategories((prev) => prev.filter((c) => c.category_id !== id));
      alert("✅ Category deleted successfully!");
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("❌ Failed to delete category");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">🗂️ Categories</h2>
        <Link href="/admin/categories/add">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            ➕ Add Category
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Sort Order</th>
              <th className="border p-2">Image</th>
              <th className="border p-2">Active</th>
              <th className="border p-2 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat.category_id} className="text-center">
                  <td className="border p-2">{cat.category_id}</td>
                  <td className="border p-2">{cat.category_name}</td>
                  <td className="border p-2">{cat.description || 'N/A'}</td>
                  <td className="border p-2">{cat.sort_order}</td>
                  <td className="border p-2">
                    {cat.image_name ? (
                      <img
                        src={getMediaUrl(cat.image_name)}
                        alt={cat.category_name}
                        className="w-12 h-12 object-cover rounded mx-auto"
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </td>
                  <td className="border p-2">
                    {cat.is_active ? "✅" : "❌"}
                  </td>
                  <td className="border p-2 flex justify-center gap-2">
                    <Link href={`/admin/categories/edit/${cat.category_id}`}>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                        ✏️  
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(cat.category_id!)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      🗑️ 
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="border p-2 text-gray-500 text-center">
                  {loading ? "Loading..." : "No categories found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
