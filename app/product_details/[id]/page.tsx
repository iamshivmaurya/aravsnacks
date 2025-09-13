'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { GET_PRODUCTS_API } from '../../../constants';
import ProductDetails from '../../../components/ProductDetails';

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-lg text-gray-600 animate-pulse">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-lg text-red-500 font-medium">Product not found ❌</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ProductDetails product={product} />
    </div>
  );
}
