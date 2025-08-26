'use client';

import { useCart } from '../components/CartContext';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

type Product = {
  id: number;
  product_name: string;
  description: string;
  product_price: number;
  image_url: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.product_name} added to cart!`);
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
