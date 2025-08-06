'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '../../components/CartContext';

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const router = useRouter();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: cartItems,
      total: totalPrice,
    };
    localStorage.setItem('orders', JSON.stringify([newOrder, ...orders]));
    clearCart();
    router.push('/success');
  };

  return (
    <section className="mt-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItems.map(item => (
              <li key={item.id} className="flex justify-between items-center bg-white p-4 rounded shadow">
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p>₹{item.price} × {item.quantity}</p>
                </div>
                <span className="font-bold">₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="text-right font-bold text-xl mt-4">
            Total: ₹{totalPrice}
          </div>
          <button
            onClick={handlePlaceOrder}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Place Order
          </button>
        </>
      )}
    </section>
  );
}
