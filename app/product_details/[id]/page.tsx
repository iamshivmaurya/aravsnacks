'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { GET_PRODUCTS_API } from '../../../constants'; // path adjust करना होगा

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id; 
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${GET_PRODUCTS_API}/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p className="p-4">Loading product...</p>;
  if (!product) return <p className="p-4">Product not found</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 relative h-80">
        <Image
  src={`/${product.image_url}`}
  alt={product.name}
  fill
  className="object-cover rounded"
/>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-gray-600 mt-2">{product.description}</p>
          <p className="text-xl font-semibold mt-4">₹{product.product_price}</p>
          <button className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
