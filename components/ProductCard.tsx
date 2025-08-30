'use client';

import { useCart } from '../components/CartContext';
import { toast } from 'react-hot-toast';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { GET_QUOTES_API, CREATE_QUOTES_API } from '../constants';

type Product = {
  id: number;
  product_name: string;
  description: string;
  product_price: number;
  image_url: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, cartItems, increaseQty, decreaseQty } = useCart();

  console.log("cartItems", cartItems);
  // find the item from cart (if exists)
  const item = cartItems.find((ci) => ci.product_id === product.id);

  console.log("item ==> ", item);

  const handleAddToCart = async () => {
    try {
      addToCart(product);

      let quoteId = localStorage.getItem('quote_id');
      if (!quoteId || quoteId === 'undefined') {
        const response = await axios.post(CREATE_QUOTES_API);
        quoteId = response.data.quote_id;
        localStorage.setItem('quote_id', quoteId);
      }
      const payload = {
        product_id: product.id,
        item_qty: 1,
        item_id: null,
      };

      const addItemUrl = `${GET_QUOTES_API}/${quoteId}/add_items`;
      const response = await axios.post(addItemUrl, payload);

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

      {/* ✅ If item is already in cart, show qty inline */}
      {!item ? (
        <button
          onClick={handleAddToCart}
          className="bg-green-600 text-white px-4 py-1 rounded mt-2 hover:bg-green-700"
        >
          Add to Cart
        </button>
      ) : (
        <div className="flex items-center justify-between mt-2 border rounded px-2 py-1">
          <button
            onClick={() => decreaseQty(item.item_id, item.item_qty - 1)}
            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            <Minus size={16} />
          </button>
          <span className="px-3 font-medium">{item.item_qty}</span>
          <button
            onClick={() => increaseQty(item.item_id, item.item_qty + 1)}
            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            <Plus size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
