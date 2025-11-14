'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/axios';
import { Loader2 } from 'lucide-react';

type Product = {
  id?: number;
  sku: string;
  name: string;
  is_active: boolean;
  product_price: number;
  special_price: number;
  special_price_start_date: string;
  special_price_end_date: string;
  tax_class_id: number;
  quantity: number;
  product_weight: number;
  description: string;
  sort_order: number;
  meta_keyword: string;
  meta_title: string;
  meta_description: string;
  image_url: string;
};

const PRODUCT_API = 'products';

export default function EditProductPage() {
  const { product_id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<Product>({
    sku: '',
    name: '',
    is_active: true,
    product_price: 0,
    special_price: 0,
    special_price_start_date: '',
    special_price_end_date: '',
    tax_class_id: 0,
    quantity: 0,
    product_weight: 0,
    description: '',
    sort_order: 0,
    meta_keyword: '',
    meta_title: '',
    meta_description: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ✅ Fetch product data by ID
  const fetchProduct = async () => {
    try {
      setFetching(true);
      const res = await api.get(`${PRODUCT_API}/${product_id}`);
      setFormData(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('❌ Failed to load product data');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (product_id) fetchProduct();
  }, [product_id]);

  // ✅ Handle Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setLoading(true);
      await api.put(`${PRODUCT_API}/${product_id}`, formData);
      setSuccessMsg('✅ Product updated successfully!');
      setTimeout(() => router.push('/admin/products'), 1500);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.detail || '❌ Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="p-6 text-center">
        <Loader2 className="animate-spin mx-auto mb-2" />
        <p>Loading product...</p>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Messages */}
      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>
      )}
      {successMsg && (
        <div className="p-3 bg-green-100 text-green-700 rounded">
          {successMsg}
        </div>
      )}

      {/* Product Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Edit Product #{product_id}
        </h2>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              value={formData.product_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  product_price: Number(e.target.value),
                })
              }
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Special Price
            </label>
            <input
              type="number"
              value={formData.special_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  special_price: Number(e.target.value),
                })
              }
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Special Price Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Special Price Start
            </label>
            <input
              type="datetime-local"
              value={formData.special_price_start_date || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  special_price_start_date: e.target.value,
                })
              }
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Special Price End
            </label>
            <input
              type="datetime-local"
              value={formData.special_price_end_date || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  special_price_end_date: e.target.value,
                })
              }
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tax Class ID</label>
            <input
              type="number"
              value={formData.tax_class_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tax_class_id: Number(e.target.value),
                })
              }
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: Number(e.target.value) })
              }
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Weight</label>
            <input
              type="number"
              value={formData.product_weight}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  product_weight: Number(e.target.value),
                })
              }
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const formDataObj = new FormData();
                formDataObj.append('file', file);
                try {
                  const res = await api.post('upload-image', formDataObj, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                  });
                  setFormData({ ...formData, image_url: res.data.url });
                } catch (err) {
                  console.error('Image upload failed:', err);
                }
              }
            }}
            className="border p-2 rounded w-full"
          />
          {formData.image_url && (
            <img
              src={formData.image_url}
              alt="preview"
              className="mt-2 w-32 h-32 object-cover rounded border"
            />
          )}
        </div>

        {/* SEO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Meta Title</label>
            <input
              type="text"
              value={formData.meta_title}
              onChange={(e) =>
                setFormData({ ...formData, meta_title: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Meta Keyword
            </label>
            <input
              type="text"
              value={formData.meta_keyword}
              onChange={(e) =>
                setFormData({ ...formData, meta_keyword: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Meta Description
            </label>
            <input
              type="text"
              value={formData.meta_description}
              onChange={(e) =>
                setFormData({ ...formData, meta_description: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border p-2 rounded w-full h-24"
          />
        </div>

        {/* Active */}
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
          />
          <span className="text-sm">Active</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-2 px-4 rounded-lg flex items-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? 'Saving...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
}
