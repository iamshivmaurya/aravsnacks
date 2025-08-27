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
      // Pehle local cart me add kare
      addToCart(product);
      toast.success(`${product.product_name} added to cart!`);

      // Phir API ke through database me bheje
      const customerId = localStorage.getItem('customer_id'); // ensure user logged in
      
      // if (!customerId) {
      //   toast.error('Please login first!');
      //   return;
      // }
 

      const payload = {
        customer_id: customerId,
        items: [
          {
            product_id: product.id,
            quantity: 1,
            quote_id : 1,
          },
        ],
        total_price: product.product_price,
      };

      const response = await axios.post(GET_QUOTES_API, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success('Product added to database successfully!');
      } else {
        toast.error('Failed to add product to database!');
      }
    } catch (error) {
      console.error('Error adding to database:', error);
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
