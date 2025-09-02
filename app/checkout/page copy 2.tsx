'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ShippingAddressForm, { ShippingAddressData } from '../../components/ShippingAddressForm';
import SignInForm, { LoginData } from "../../components/SignInForm";
import CartItemsList from '../../components/CartItemsList';
import AddressList from '@/components/AddressList';

export default function CartPage() {
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

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

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      alert("Please login before placing order!");
      return;
    }
  
    if (!selectedAddress) {
      alert("Please select a delivery address!");
      return;
    }
  
    const quoteId = localStorage.getItem("quote_id");
    if (!quoteId) {
      alert("Quote not found!");
      return;
    }
  
    // const cartItemsRaw = JSON.parse(localStorage.getItem("cartItems") || "[]");
    // if (cartItemsRaw.length === 0) {
    //   alert("Cart is empty!");
    //   return;
    // }
  
    const payload = {
      customer_id: customerId || 0,
      quote_id: Number(quoteId),
      payment_method: "cod",  // ya jo payment method chahiye
      shipping_method: "standard", // ya fast / express
      shipping_address: {
        address_type: selectedAddress.address_type,
        street_address: selectedAddress.street_address,
        postal_code: selectedAddress.postal_code,
        city: selectedAddress.city,
        state: selectedAddress.state,
        phone_no: selectedAddress.phone_no,
        fast_name: selectedAddress.fast_name,
        last_name: selectedAddress.last_name
      },
      billing_address: {
        address_type: selectedAddress.address_type,
        street_address: selectedAddress.street_address,
        postal_code: selectedAddress.postal_code,
        city: selectedAddress.city,
        state: selectedAddress.state,
        phone_no: selectedAddress.phone_no,
        fast_name: selectedAddress.fast_name,
        last_name: selectedAddress.last_name
      },
     
    };
  
    try {
      const response = await axios.post('http://localhost:8000/place-order', payload);
      if (response.status === 200 || response.status === 201) {
        alert("Order placed successfully!");
        router.push('/order-success');
      } else {
        alert("Failed to place order.");
      }
    } catch (error: any) {
      console.error("Error placing order:", error.response || error.message);
      alert("Something went wrong while placing the order!");
    }
  };
  
  return (
    <section className="mt-6 px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT COLUMN */}
      <div className="space-y-6">
        {!isLoggedIn && <SignInForm onSubmit={handleLoginSuccess} />}

        <div>
          <p className="text-md font-semibold mb-2">Choose a Delivery Address</p>
          <AddressList onSelectAddress={(address) => setSelectedAddress(address)} />
        </div>

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
      </div>

      {/* Place Order Button */}
      <div className="mt-6 md:mt-10 flex justify-end">
        <button
          onClick={handlePlaceOrder}
          className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-md transition"
        >
          Place Order
        </button>
      </div>
    </section>
  );
}
