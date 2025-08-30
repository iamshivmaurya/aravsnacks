'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../components/CartContext';
import ShippingAddressForm, { ShippingAddressData } from '../../components/ShippingAddressForm';
import LoginForm, { LoginData } from "../../components/LoginForm";
import EditSignupForm from "../../components/EditSignupForm";
import CartItemsList from '../../components/CartItemsList';

export default function CartPage() {
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedPhone = localStorage.getItem("phone");
    const storedCustomerId = localStorage.getItem("customer_id");

    if (token && storedPhone && storedCustomerId) {
      setIsLoggedIn(true);
      setPhone(storedPhone);
      setCustomerId(storedCustomerId);
    }
  }, []);

  const handleLoginSuccess = (data: LoginData) => {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("phone", data.phone);
    localStorage.setItem("customer_id", data.customer_id);

    setPhone(data.phone);
    setCustomerId(data.customer_id);
    setIsLoggedIn(true);
  };

  const handleAddressSubmit = (address: ShippingAddressData) => {
    setShippingAddress(address);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      alert("Please login before checkout!");
      return;
    }
    router.push('/checkout');
  };

  return (
    <section className="mt-6 px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT COLUMN */}
      <div className="space-y-6">
        {/* Login / Phone */}

        {!isLoggedIn && <LoginForm onSubmit={handleLoginSuccess} />}
        
        {/* Shipping Address */}
        <div className="bg-white p-5 rounded-2xl shadow-md border">
          <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
          <ShippingAddressForm onSubmit={handleAddressSubmit} />
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="bg-white p-5 rounded-2xl shadow-md border flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
          <CartItemsList />
        </div>
        {/* Sticky Checkout Button for Mobile */}
        <div className="mt-6 md:mt-10 flex justify-end">
          <button
            onClick={handleCheckout}
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-md transition"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </section>
  );
}
