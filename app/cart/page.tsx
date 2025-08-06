'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '../../components/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { cartItems, increaseQty, decreaseQty, removeFromCart } = useCart();
  const router = useRouter();

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <section className="mt-6 px-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <div
              key={item.id}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p>₹{item.price} × {item.quantity}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-2">{item.quantity}</span>
                  <button
                    onClick={() => increaseQty(item.id)}
                    className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-4 p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="font-bold text-right">₹{item.price * item.quantity}</p>
            </div>
          ))}

          <div className="text-right font-bold text-xl mt-4">
            Total: ₹{totalPrice}
          </div>

          <div className="text-right mt-6">
            <button
              onClick={handleCheckout}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
