'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ShippingAddressForm, { ShippingAddressData } from '../../components/ShippingAddressForm';
import SignInForm, { LoginData } from "../../components/SignInForm";
import CartItemsList from '../../components/CheckoutCartItemsList';
import AddressList from '@/components/AddressList';
import { APPLY_COUPON, PLACE_ORDER, CANCEL_COUPON } from "../../constants";
import { useCart } from '../../components/CartContext';

interface Address {
  quote_address_id?: number;
  customer_address_id?: number;
  address_type: string;
  street_address: string;
  postal_code: string;
  city: string;
  state: string;
  phone_no: string;
  first_name: string;
  last_name: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { quote } = useCart();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  const [discountCode, setDiscountCode] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");

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

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) return alert("Please login before placing order!");
    if (!selectedAddress) return alert("Please select a delivery address!");

    const quoteId = localStorage.getItem("quote_id");
    if (!quoteId) return alert("Quote not found!");

    const payload = {
      customer_id: customerId || 0,
      quote_id: Number(quoteId),
      payment_method: "cod",
      shipping_method: "standard",
      shipping_address: selectedAddress,
      billing_address: selectedAddress
    };

    try {
      const response = await axios.post(PLACE_ORDER, payload);

      if (response.status === 200 || response.status === 201) {
        const orderData = response.data;
        if (orderData?.cust_order_num) {
          sessionStorage.setItem("cust_order_num", orderData.cust_order_num);
        }
        if (orderData?.order_date) {
          sessionStorage.setItem("order_date", orderData.order_date);
        }

        router.push('/order-success');
      } else {
        alert("Failed to place order.");
      }
    } catch (error: any) {
      console.error("Error placing order:", error.response || error.message);
      alert("Something went wrong while placing the order!");
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountMessage("Please enter a code.");
      return;
    }

    try {
      const quoteId = localStorage.getItem("quote_id");
      const response = await axios.post(APPLY_COUPON, {
        coupon_code: discountCode,
        quote_id: Number(quoteId)
      });

      if (response.status === 200) {
        setDiscountMessage(`✅ Discount applied`);
      } else {
        setDiscountMessage("❌ Invalid or expired code.");
      }
    } catch {
      setDiscountMessage("❌ Error applying discount.");
    }
  };

  const handleRemoveDiscount = async () => {
    try {
      const quoteId = localStorage.getItem("quote_id");
      const response = await axios.post(CANCEL_COUPON, {
        coupon_code: quote.coupon_code,
        quote_id: Number(quoteId)
      });

      if (response.status === 200) {
        setDiscountMessage("Coupon removed.");
      } else {
        setDiscountMessage("Failed to remove coupon");
      }
    } catch {
      setDiscountMessage("Error removing coupon");
    }
  };

  return (
    <section className="mt-6 px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT COLUMN */}
      <div className="space-y-6">
        {!isLoggedIn && <SignInForm onSubmit={handleLoginSuccess} />}

        <div>
          <p className="text-md font-semibold mb-2">Choose a Delivery Address</p>

          <AddressList
            onSelectAddress={setSelectedAddress}
            selectedAddress={selectedAddress}
          />

          {showAddAddressForm ? (
            <ShippingAddressForm
              onSuccess={(newAddress) => {
                setAddresses((prev) => [...prev, newAddress]);
                setSelectedAddress(newAddress);
                setShowAddAddressForm(false);
              }}
            />
          ) : (
            <button
              onClick={() => setShowAddAddressForm(true)}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Add New Address
            </button>
          )}
        </div>

        {/* DISCOUNT CODE */}
        <div className="mt-6">
          <p className="font-medium mb-2">Discount Code</p>

          {quote?.coupon_code ? (
            <div className="flex items-center justify-between border rounded-lg px-3 py-2 bg-green-50">
              <span className="font-medium text-green-700">
                Applied: {quote.coupon_code}
              </span>
              <button
                onClick={handleRemoveDiscount}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="border rounded-lg px-3 py-2 flex-1"
              />
              <button
                onClick={handleApplyDiscount}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Apply
              </button>
            </div>
          )}

          {discountMessage && (
            <p className="mt-2 text-sm text-gray-600">{discountMessage}</p>
          )}
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
