'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../components/CartContext';
import ShippingAddressForm, { ShippingAddressData } from '../../components/ShippingAddressForm';
import LoginForm, { LoginData } from "../../components/LoginForm";
import EditSignupForm from "../../components/EditSignupForm";
import CartItemsList from '../../components/CartItemsList';

export default function CartPage() {
  const { cartItems } = useCart();
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
      {/* LEFT COLUMN: Login + Phone Section + Shipping */}
      <div className="space-y-6">
        <div className="bg-white p-4 rounded shadow">
          {isLoggedIn ? (
            !isEditingPhone ? (
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={phone}
                  disabled
                  className="border p-2 w-full bg-gray-100 cursor-not-allowed"
                />
                <button
                  className="ml-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  onClick={() => setIsEditingPhone(true)}
                >
                  Edit
                </button>
              </div>
            ) : (
              <EditSignupForm
                phone={phone}
                customer_id={customerId || ""}
                onPhoneUpdated={(newPhone) => {
                  setPhone(newPhone);
                  setIsEditingPhone(false);
                }}
              />
            )
          ) : (
            <LoginForm onSubmit={handleLoginSuccess} />
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <ShippingAddressForm onSubmit={handleAddressSubmit} />
        </div>
      </div>

      {/* RIGHT COLUMN: Cart Items */}
      <div>
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <CartItemsList onCheckout={handleCheckout} />
      </div>
    </section>
  );
}
