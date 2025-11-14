'use client';

import Image from 'next/image';
import { useCart } from './CartContext';
import { Minus, Plus } from 'lucide-react';

type Review = {
  id: number;
  user: string;
  rating: number;
  comment: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  product_price: number;
  image_url: string;
};

export default function ProductDetails({ product }: { product: Product }) {
  const { addToCart, cartItems, increaseQty, decreaseQty } = useCart();

  const item = cartItems.find(
    (ci) => ci.product_id === product.id && ci.item_qty > 0
  );

  // const getImageUrl = (url: string) => {
  //   if (!url) return '/placeholder.png';
  //   if (url.startsWith('http')) return url;
  //   return '/' + url;
  // };


  const imageSrc = product.image_url.startsWith("http")
  ? product.image_url
  : `${process.env.NEXT_PUBLIC_MEDIA_URL}/media/${product.image_url}`;

  const dummyReviews: Review[] = [
    { id: 1, user: 'Rahul', rating: 5, comment: 'Product quality is amazing!' },
    { id: 2, user: 'Sneha', rating: 4, comment: 'Good value for money.' },
    { id: 3, user: 'Amit', rating: 3, comment: 'Decent, but could be better.' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      {/* Product Header */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden md:flex hover:shadow-2xl transition-shadow duration-300">
        <div className="relative md:w-1/2 h-96 md:h-auto">
          <Image
            src={imageSrc}
            alt={product.name}
            width={600}
            height={600}
            className="rounded-xl object-contain p-6"
          />
        </div>

        <div className="flex-1 p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>
          </div>

          <div className="mt-6">
            <p className="text-3xl font-bold text-green-700">₹{product.product_price}</p>

            {!item ? (
              <button
                onClick={() => addToCart(product)}
                className="mt-4 w-full md:w-auto bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-3 rounded-xl shadow-lg hover:from-green-700 hover:to-green-600 transition-all font-semibold"
              >
                🛒 Add to Cart
              </button>
            ) : (
              <div className="flex items-center gap-4 mt-4 border rounded-xl px-4 py-2 w-fit bg-gray-50 shadow-md">
                <button
                  onClick={() => decreaseQty(item.item_id, item.item_qty - 1)}
                  className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                >
                  <Minus size={18} />
                </button>
                <span className="px-4 font-medium text-lg">{item.item_qty}</span>
                <button
                  onClick={() => increaseQty(item.item_id, item.item_qty + 1)}
                  className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                >
                  <Plus size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Section - 2 Videos side by side */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-900">🎥 Product Videos</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/iBEdh870DGw"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-900">⭐ Customer Reviews</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {dummyReviews.map((review) => (
            <div
              key={review.id}
              className="border-l-4 border-green-500 p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow transform hover:-translate-y-1"
            >
              <p className="font-semibold text-gray-900 text-lg">{review.user}</p>
              <p className="text-yellow-400 mt-2 text-xl">
                {'★'.repeat(review.rating)}{' '}
                <span className="text-gray-300">{'☆'.repeat(5 - review.rating)}</span>
              </p>
              <p className="text-gray-600 mt-3">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
