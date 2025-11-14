'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/axios';
import { Loader2 } from 'lucide-react';

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

const CATEGORIES_API = `categories`;

export default function EditCategoryPage() {
  const { category_id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<Category>({
    category_name: '',
    description: '',
    is_active: true,
    parent_id: 0,
    sort_order: 0,
    url_key: '',
    meta_keyword: '',
    meta_title: '',
    meta_description: '',
    category_path: '',
    level: '',
    image_name: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ✅ Fetch category data by ID
  useEffect(() => {
    if (!category_id) return;
    const fetchCategory = async () => {
      try {
        const res = await api.get(`${CATEGORIES_API}/${category_id}`);
        setFormData(res.data);
      } catch (err) {
        console.error('Failed to load category:', err);
      }
    };
    fetchCategory();
  }, [category_id]);

  // ✅ Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await api.put(`${CATEGORIES_API}/${category_id}`, formData);
      setMessage('✅ Category updated successfully!');
      setTimeout(() => router.push('/admin/categories'), 1500);
    } catch (err: any) {
      console.error('Failed to update category:', err);
      setMessage('❌ Failed to update category.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Upload image handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const uploadData = new FormData();
      uploadData.append('file', file);
      try {
        const res = await api.post('upload-image', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFormData({ ...formData, image_name: res.data.url });
      } catch (err) {
        console.error('Image upload failed:', err);
        alert('❌ Image upload failed.');
      }
    }
  };

  const getMediaUrl = (image_name: string) => {
    return image_name?.startsWith('http')
      ? image_name
      : `${process.env.NEXT_PUBLIC_MEDIA_URL}/media/${image_name}`;
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">
        ✏️ Edit Category
      </h2>

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
        className="bg-white p-6 rounded-xl shadow-md space-y-6 divide-y"
      >
        {/* Basic Info */}
        <section className="pt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">📋 Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category Name</label>
              <input
                type="text"
                value={formData.category_name}
                onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Key</label>
              <input
                type="text"
                value={formData.url_key}
                onChange={(e) => setFormData({ ...formData, url_key: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="pt-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border p-2 rounded w-full h-24"
          />
        </section>

        {/* Sorting / Parent */}
        <section className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Parent ID</label>
              <input
                type="number"
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: Number(e.target.value) })}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
        </section>

        {/* Image */}
        <section className="pt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">🖼️ Category Image</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border p-2 rounded w-full"
          />
          {formData.image_name && (
            <img
              src={getMediaUrl(formData.image_name)}
              alt="preview"
              className="mt-3 w-32 h-32 object-cover rounded border"
            />
          )}
        </section>

        {/* SEO Section */}
        <section className="pt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">🔍 SEO Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Meta Title</label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Keyword</label>
              <input
                type="text"
                value={formData.meta_keyword}
                onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <input
                type="text"
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="pt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <span className="text-sm">Active</span>
          </label>
        </section>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? 'Saving...' : 'Update Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
