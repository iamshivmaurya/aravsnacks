'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from "@/utils/axios";
import ShippingAddressForm, { ShippingAddressData } from '@/components/ShippingAddressForm';
import SignInForm, { LoginData } from "@/components/SignInForm";
import CartItemsList from '@/components/CheckoutCartItemsList';
import AddressList, { Address } from '@/components/AddressList';
import { APPLY_COUPON, PLACE_ORDER, CANCEL_COUPON } from "@/constants";
import { useCart } from '@/components/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { quote, cartItems } = useCart();

  // --- Login / User State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [phone, setPhone] = useState<string>("");

  // --- Shipping / Address State ---
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  // --- Discount / Coupon State ---
  const [discountCode, setDiscountCode] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  // Redirect if cart empty
  // useEffect(() => {
  //   if (!cartItems.length) router.push("/cart");
  // }, [cartItems, router]);

  useEffect(() => {
  const fetchCart = async () => {
    const quoteUid = localStorage.getItem("quote_uid");
    if (!quoteUid) {
      router.push("/cart");
      return;
    }
  };

  fetchCart();
}, []);


  // Load user from localStorage
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedCustomerId = localStorage.getItem("customer_id");

    if (token && storedCustomerId) {
      setIsLoggedIn(true);
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
    setSelectedAddress(address);
    setShowAddAddressForm(false);
  };

  // --- Place Order ---
  const handlePlaceOrder = async () => {
    if (!isLoggedIn) return alert("Please login before placing order!");
    if (!selectedAddress) return alert("Please select a delivery address!");

    const quoteUid = localStorage.getItem("quote_uid");
    if (!quoteUid) return alert("Quote not found!");

    const payload = {
      customer_id: customerId || 0,
      quote_uid: quoteUid,
      payment_method: "cod",
      shipping_method: "standard",
      shipping_address: selectedAddress,
      billing_address: selectedAddress,
    };

    try {
      const res = await api.post(PLACE_ORDER, payload);

      if (res.status === 200 || res.status === 201) {
        const { cust_order_num, order_date } = res.data;
        if (cust_order_num) sessionStorage.setItem("cust_order_num", cust_order_num);
        if (order_date) sessionStorage.setItem("order_date", order_date);

        router.push("/order-success");
      } else {
        alert("Failed to place order.");
      }
    } catch (err: any) {
      console.error("Order error:", err.response || err.message);
      alert("Something went wrong while placing the order.");
    }
  };

  // --- Apply / Remove Discount ---
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return setDiscountMessage("Please enter a code.");

    try {
      const quoteUid = localStorage.getItem("quote_uid");
      const res = await api.post(APPLY_COUPON, { coupon_code: discountCode, quote_uid: quoteUid });

      if (res.status === 200) {
        setDiscountApplied(true);
        setDiscountMessage("✅ Discount applied");
      } else {
        setDiscountMessage("❌ Invalid or expired code");
      }
    } catch (err) {
      console.error(err);
      setDiscountMessage("❌ Error applying discount");
    }
  };

  const handleRemoveDiscount = async () => {
    try {
      const quoteUid = localStorage.getItem("quote_uid");
      if (!quote?.coupon_code) return;
      const res = await api.post(CANCEL_COUPON, { coupon_code: quote.coupon_code, quote_uid: quoteUid });

      if (res.status === 200) {
        setDiscountApplied(false);
        setDiscountMessage("Coupon removed.");
        setDiscountCode("");
      } else {
        setDiscountMessage("Failed to remove coupon");
      }
    } catch (err) {
      console.error(err);
      setDiscountMessage("Error removing coupon");
    }
  };

  return (
    <section className="mt-6 px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* --- Left Column --- */}
      <div className="space-y-6">
        {!isLoggedIn && <SignInForm onSubmit={handleLoginSuccess} />}

        <div>
          <p className="text-md font-semibold mb-2">Choose a Delivery Address</p>

          {!showAddAddressForm ? (
            <>
              <AddressList onSelectAddress={setSelectedAddress} />
              <button
                onClick={() => setShowAddAddressForm(true)}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Add New Address
              </button>
            </>
          ) : (
            <ShippingAddressForm onSuccess={handleAddressSubmit} />
          )}
        </div>

        {/* --- Discount Code --- */}
        <div className="mt-6">
          <p className="font-medium mb-2">Discount Code</p>

          {quote?.coupon_code ? (
            <div className="flex items-center justify-between border rounded-lg px-3 py-2 bg-green-50">
              <span className="font-medium text-green-700">Applied: {quote.coupon_code}</span>
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

          {discountMessage && <p className="mt-2 text-sm text-gray-600">{discountMessage}</p>}
        </div>
      </div>

      {/* --- Right Column: Cart --- */}
      <div className="bg-white p-5 rounded-2xl shadow-md border flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
          <CartItemsList />
        </div>
      </div>

      {/* --- Place Order Button --- */}
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
