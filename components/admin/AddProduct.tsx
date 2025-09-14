'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

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

const PRODUCT_API = "http://127.0.0.1:8000/products"; // ✅ apna API URL yahan daalo

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Product>({
    sku: '',
    name: '',
    is_active: true,
    product_price: '' as any,   // ✅ empty rakho
    special_price: '' as any,
    special_price_start_date: '',
    special_price_end_date: '',
    tax_class_id: '' as any,
    quantity: '' as any,
    product_weight: '' as any,
    description: '',
    sort_order: '' as any,
    meta_keyword: '',
    meta_title: '',
    meta_description: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch products (GET API)
  const fetchProducts = async () => {
    try {
      const res = await axios.get(PRODUCT_API);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
  
    const payload = {
      sku: formData.sku,
      name: formData.name,
      is_active: formData.is_active,
      product_price: formData.product_price,
      special_price: formData.special_price,
      special_price_start_date: formData.special_price_start_date,
      special_price_end_date: formData.special_price_end_date,
      tax_class_id: formData.tax_class_id,
      quantity: formData.quantity,
      product_weight: formData.product_weight,
      description: formData.description,
      sort_order: formData.sort_order,
      meta_keyword: formData.meta_keyword,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      image_url: formData.image_url,
    };
  
    try {
      setLoading(true);
      await axios.post(PRODUCT_API, payload); // ✅ clean payload
      setSuccessMsg('✅ Product added successfully!');
      setFormData({
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
      fetchProducts();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || '❌ Failed to add product');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">📦 Product Management</h1>

      {/* Messages */}
      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>
      )}
      {successMsg && (
        <div className="p-3 bg-green-100 text-green-700 rounded">{successMsg}</div>
      )}

      {/* Product Form */}
      <form
  onSubmit={handleSubmit}
  className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-md"
>
  <input
    type="text"
    placeholder="Enter Product SKU"
    value={formData.sku}
    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
    className="border p-2 rounded"
  />
  <input
    type="text"
    placeholder="Enter Product Name"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    className="border p-2 rounded"
  />
  <input
    type="number"
    placeholder="Enter Product Price"
    value={formData.product_price}
    onChange={(e) =>
      setFormData({ ...formData, product_price: Number(e.target.value) })
    }
    className="border p-2 rounded"
  />
  <input
    type="number"
    placeholder="Enter Special Price (if any)"
    value={formData.special_price}
    onChange={(e) =>
      setFormData({ ...formData, special_price: Number(e.target.value) })
    }
    className="border p-2 rounded"
  />
  <input
    type="datetime-local"
    placeholder="Special Price Start Date"
    value={formData.special_price_start_date}
    onChange={(e) =>
      setFormData({ ...formData, special_price_start_date: e.target.value })
    }
    className="border p-2 rounded"
  />
  <input
    type="datetime-local"
    placeholder="Special Price End Date"
    value={formData.special_price_end_date}
    onChange={(e) =>
      setFormData({ ...formData, special_price_end_date: e.target.value })
    }
    className="border p-2 rounded"
  />
  <input
    type="number"
    placeholder="Enter Tax Class ID"
    value={formData.tax_class_id}
    onChange={(e) =>
      setFormData({ ...formData, tax_class_id: Number(e.target.value) })
    }
    className="border p-2 rounded"
  />
  <input
    type="number"
    placeholder="Enter Quantity"
    value={formData.quantity}
    onChange={(e) =>
      setFormData({ ...formData, quantity: Number(e.target.value) })
    }
    className="border p-2 rounded"
  />
  <input
    type="number"
    placeholder="Enter Product Weight"
    value={formData.product_weight}
    onChange={(e) =>
      setFormData({ ...formData, product_weight: Number(e.target.value) })
    }
    className="border p-2 rounded"
  />
  <input
    type="number"
    placeholder="Enter Sort Order"
    value={formData.sort_order}
    onChange={(e) =>
      setFormData({ ...formData, sort_order: Number(e.target.value) })
    }
    className="border p-2 rounded"
  />
  <input
    type="text"
    placeholder="Enter Meta Title"
    value={formData.meta_title}
    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
    className="border p-2 rounded"
  />
  <input
    type="text"
    placeholder="Enter Meta Keyword"
    value={formData.meta_keyword}
    onChange={(e) =>
      setFormData({ ...formData, meta_keyword: e.target.value })
    }
    className="border p-2 rounded"
  />
  <input
    type="text"
    placeholder="Enter Meta Description"
    value={formData.meta_description}
    onChange={(e) =>
      setFormData({ ...formData, meta_description: e.target.value })
    }
    className="border p-2 rounded"
  />
  {/* <input
    type="text"
    placeholder="Enter Image URL"
    value={formData.image_url}
    onChange={(e) =>
      setFormData({ ...formData, image_url: e.target.value })
    }
    className="border p-2 rounded"
  /> */}
<input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const formDataObj = new FormData();
      formDataObj.append("file", file);

      try {
        const res = await axios.post("http://127.0.0.1:8000/upload-image", formDataObj, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // ✅ Backend se mila hua image URL set kar do
        setFormData({ ...formData, image_url: res.data.url });
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    }
  }}
  className="border p-2 rounded"
/>

{/* Agar image_url set hai to preview dikhao */}
{formData.image_url && (
  <img src={formData.image_url} alt="preview" className="mt-2 w-32 h-32 object-cover rounded" />
)}





  <textarea
    placeholder="Enter Product Description"
    value={formData.description}
    onChange={(e) =>
      setFormData({ ...formData, description: e.target.value })
    }
    className="border p-2 rounded col-span-2"
  />

  <label className="flex items-center space-x-2 col-span-2">
    <input
      type="checkbox"
      checked={formData.is_active}
      onChange={(e) =>
        setFormData({ ...formData, is_active: e.target.checked })
      }
    />
    <span>Active</span>
  </label>

  <button
    type="submit"
    disabled={loading}
    className="bg-blue-600 text-white py-2 px-4 rounded-lg col-span-2"
  >
    {loading ? 'Saving...' : 'Add Product'}
  </button>
</form>


      {/* Products Table */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">📋 Product List</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">SKU</th>
              <th className="p-2">Name</th>
              <th className="p-2">Price</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-2">{p.sku}</td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">${p.product_price}</td>
                  <td className="p-2">{p.quantity}</td>
                  <td className="p-2">{p.is_active ? '✅' : '❌'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-2 text-center" colSpan={5}>
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
