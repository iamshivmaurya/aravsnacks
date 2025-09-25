'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '../../components/CartContext';
import CartItemsList from '../../components/CartItemsList';
import { useEffect, useState } from 'react';
 

export default function CartPage() {
  const router = useRouter();
  const { cartItems, cartTotal , loading } = useCart();
  const [settingValue, setSettingValue] = useState(null);

// API call to FastAPI backend
useEffect(() => {
  fetch("http://127.0.0.1:8000/api/v1/admin/settings/29")
    .then((res) => res.json())
    .then((data) => {
      setSettingValue(data.value);
    })
    .catch((err) => console.error("Error fetching setting:", err));
}, []);


  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    router.push('/checkout');
  };

  return (
    <section className="mt-8 px-4 md:px-12">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">
        My Cart   
        </h1>
        {/* 🚀 Show message if cartTotal < settingValue */}
        {settingValue !== null && cartTotal < settingValue && (
          <p className="text-right text-red-600">
            Add Rs {settingValue - cartTotal} more to get Free shipping!
          </p>
        )}

            
        {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading your cart...</p>
        </div>
      ) : cartItems.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              <CartItemsList />
            </div>

            {/* Summary Section */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Summary</h2>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              {/* Show Shipping only when cartTotal >= settingValue */}
              {settingValue !== null && cartTotal >= settingValue && (
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
              )}
              <hr className="my-3" />
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total</span>
                <span>₹{cartTotal}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Your cart is empty 🛍️</p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
