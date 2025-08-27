'use client';

import { useCart } from '../components/CartContext';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import axios from 'axios';
import { GET_QUOTES_API } from '../constants';

type Product = {
  id: number;
  product_name: string;
  description: string;
  product_price: number;
  image_url: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    try {
      // 1️⃣ Local cart me add kare
      addToCart(product);
      toast.success(`${product.product_name} added to cart!`);

      const customerId = localStorage.getItem('customer_id');
      if (!customerId) {
        toast.error('Please login first!');
        return;
      }

      // 2️⃣ Pehle existing quote fetch kare customer ke liye
      const quoteResponse = await axios.get(`${GET_QUOTES_API}?customer_id=${customerId}`);
      let quote = quoteResponse.data[0]; // pehla quote
      const quoteId = quote?.quote_id || null;

      const payload = {
        customer_id: customerId,
        quote_id: quoteId,
        items: [
          {
            product_id: product.id,
            quantity: 1,
          },
        ],
        total_price: (quote?.total_price || 0) + product.product_price,
        items_count: (quote?.items_count || 0) + 1,
        items_quantity: (quote?.items_quantity || 0) + 1,
      };

      // 3️⃣ POST or PUT kare existing quote ko update karne ke liye
      const response = quoteId
        ? await axios.put(`${GET_QUOTES_API}/${quoteId}`, payload) // update
        : await axios.post(GET_QUOTES_API, payload);             // create new

      if (response.status === 200 || response.status === 201) {
        toast.success('Quote updated successfully!');
      } else {
        toast.error('Failed to update quote!');
      }

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error adding to quote:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('Error adding to quote:', error.message);
      } else {
        console.error('Unknown error adding to quote:', error);
      }
      toast.error('Something went wrong!');
    }
  };

  // Fix image URL for Next.js public folder
  const imageSrc = product.image_url.startsWith('/')
    ? product.image_url
    : '/' + product.image_url;

  return (
    <div className="bg-white border rounded-lg shadow p-4 flex flex-col">
      <div className="w-full h-40 relative">
        <Image
          src={imageSrc}
          alt={product.product_name}
          fill
          className="object-cover rounded"
        />
      </div>
      <h2 className="text-lg font-bold mt-2">{product.product_name}</h2>
      <p className="text-sm text-gray-600">{product.description}</p>
      <p className="font-semibold mt-1">₹{product.product_price}</p>
      <button
        onClick={handleAddToCart}
        className="bg-green-600 text-white px-4 py-1 rounded mt-2 hover:bg-green-700"
      >
        Add to Cart
      </button>
    </div>
  );
}
