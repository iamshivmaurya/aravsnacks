'use client';

import { useCart } from '../components/CartContext';
import { Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Product = {
  id: number;
  name: string;
  description: string;
  product_price: number;
  image_url: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, cartItems, increaseQty, decreaseQty } = useCart();

  const item = cartItems.find((ci) => ci.product_id === product.id && ci.item_qty > 0);
  console.log("item item ==> ", item);

  const imageSrc = product.image_url.startsWith("http")
  ? product.image_url
  : `${process.env.NEXT_PUBLIC_MEDIA_URL}/media/${product.image_url}`;

  return (
    <div className="bg-white border rounded-lg shadow p-4 flex flex-col">
      {/* ✅ Image clickable */}
      <Link href={`/product_details/${product.id}`} className="w-full h-40 relative block">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover rounded"
        />
      </Link>

      {/* ✅ Name clickable */}
      <Link href={`/product_details/${product.id}`}>
        <h2 className="text-lg font-bold mt-2 hover:text-blue-600 transition">
          {product.name}
        </h2>
      </Link>

      {/* <p className="text-sm text-gray-600">{product.description}</p> */}
      <div className="mt-1 flex items-center gap-3">
        <span className="text-xl text-orange-600 font-bold">
          ₹ {product.product_price}
        </span>

        <del className="text-gray-500 text-sm opacity-70">
          ₹ {(product.product_price * 1.2).toFixed(0)}
        </del>
      </div>
      {/* ✅ If item is already in cart, show qty inline */}
      {!item ? (
        <button
          onClick={() => addToCart(product)}
          className="bg-orange-600 text-white px-4 py-1 rounded mt-2 hover:bg-orange-700"
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
