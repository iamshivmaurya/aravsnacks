'use client';

import { useState } from 'react';
import api from "@/utils/axios";

type Category = {
  category_id?: number;
  category_name: string;
  description: string;
  is_active: boolean;
  parent_id: number | null;
  sort_order: number | null;
  url_key: string;
  meta_keyword: string;
  meta_title: string;
  meta_description: string;
  category_path: string;
  level: string;
  image_name: string; // 👈 stores uploaded image URL
};

const CATEGORIES_API = `categories`;

export default function CategoryForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState<Category>({
    category_name: '',
    description: '',
    is_active: true,
    parent_id: null,
    sort_order: null,
    url_key: '',
    meta_keyword: '',
    meta_title: '',
    meta_description: '',
    category_path: '',
    level: '',
    image_name: '',
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setLoading(true);
      await api.post(CATEGORIES_API, formData);
      setSuccessMsg("✅ Category added successfully!");

      // Reset form
      setFormData({
        category_name: '',
        description: '',
        is_active: true,
        parent_id: null,
        sort_order: null,
        url_key: '',
        meta_keyword: '',
        meta_title: '',
        meta_description: '',
        category_path: '',
        level: '',
        image_name: '',
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "❌ Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle image upload (like product)
  const handleImageUpload = async (file: File) => {
    const formDataObj = new FormData();
    formDataObj.append("file", file);
    setUploading(true);
    try {
      const res = await api.post("upload-image", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, image_name: res.data.url }));
    } catch (err) {
      console.error("Image upload failed:", err);
      setErrorMsg("❌ Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-md"
    >
      {errorMsg && <div className="col-span-2 p-2 bg-red-100 text-red-600 rounded">{errorMsg}</div>}
      {successMsg && <div className="col-span-2 p-2 bg-green-100 text-green-600 rounded">{successMsg}</div>}

      {/* Basic Info */}
      <input
        type="text"
        placeholder="Category Name"
        value={formData.category_name}
        onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
        className="border p-2 rounded"
        required
      />

      <input
        type="text"
        placeholder="URL Key"
        value={formData.url_key}
        onChange={(e) => setFormData({ ...formData, url_key: e.target.value })}
        className="border p-2 rounded"
        required
      />

      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="border p-2 rounded col-span-2"
        rows={3}
      />

      {/* Parent & Sort */}
      <input
        type="number"
        placeholder="Parent ID"
        value={formData.parent_id ?? ''}
        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
        className="border p-2 rounded"
      />

      <input
        type="number"
        placeholder="Sort Order"
        value={formData.sort_order ?? ''}
        onChange={(e) => setFormData({ ...formData, sort_order: e.target.value ? Number(e.target.value) : null })}
        className="border p-2 rounded"
      />

      {/* 🖼️ Image Upload */}
      <div className="col-span-2">
        <label className="block text-sm font-medium mb-1">Category Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
          }}
          className="border p-2 rounded w-full"
        />
        {uploading && <p className="text-blue-600 text-sm mt-1">Uploading...</p>}
        {formData.image_name && (
          <img
            src={formData.image_name}
            alt="Category preview"
            className="mt-2 w-32 h-32 object-cover rounded border"
          />
        )}
      </div>

      {/* SEO */}
      <input
        type="text"
        placeholder="Meta Title"
        value={formData.meta_title}
        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
        className="border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Meta Keyword"
        value={formData.meta_keyword}
        onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })}
        className="border p-2 rounded"
      />

      <textarea
        placeholder="Meta Description"
        value={formData.meta_description}
        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
        className="border p-2 rounded col-span-2"
        rows={2}
      />

      {/* Path & Level */}
      <input
        type="text"
        placeholder="Category Path"
        value={formData.category_path}
        onChange={(e) => setFormData({ ...formData, category_path: e.target.value })}
        className="border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Level"
        value={formData.level}
        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
        className="border p-2 rounded"
      />

      {/* Status */}
      <label className="flex items-center space-x-2 col-span-2">
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        />
        <span>Active</span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg col-span-2"
      >
        {loading ? "Saving..." : "Add Category"}
      </button>
    </form>
  );
}
