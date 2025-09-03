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
  const [hasAddresses, setHasAddresses] = useState(false); // naya state
  const [showAddAddressForm, setShowAddAddressForm] = useState(false); // toggle state

   // === NEW DISCOUNT STATES ===
  const [discountCode, setDiscountCode] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

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
    setShowAddAddressForm(false);
    setHasAddresses(true);
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

    const payload = {
      customer_id: customerId || 0,
      quote_id: Number(quoteId),
      payment_method: "cod",
      shipping_method: "standard",
      shipping_address: selectedAddress,
      billing_address: selectedAddress
    };

    try {
      const response = await axios.post('http://localhost:8000/place-order', payload);

      // console.log("Full API Response:", response);
      // console.log("Response Data Only:", response.data);

      if (response.status === 200 || response.status === 201) {



     // API response se cust_order_num aur order_date save kar lo
      const orderData = response.data;
      if (orderData?.cust_order_num) {
        sessionStorage.setItem("cust_order_num", orderData.cust_order_num);
        
      }
      if (orderData?.order_date) {
        sessionStorage.setItem("order_date", orderData.order_date);
      }

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


  // === APPLY DISCOUNT CODE ===
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountMessage("Please enter a code.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/apply-discount", {
        code: discountCode,
        customer_id: customerId
      });

      if (response.data.success) {
        setDiscountApplied(true);
        setDiscountMessage(`✅ Discount applied: ${response.data.discount}% off`);
        // You might also want to update total price here
      } else {
        setDiscountMessage("❌ Invalid or expired code.");
      }
    } catch (err) {
      console.error(err);
      setDiscountMessage("❌ Error applying discount.");
    }
  };


  return (
    <section className="mt-6 px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT COLUMN */}
      <div className="space-y-6">
        {!isLoggedIn && <SignInForm onSubmit={handleLoginSuccess} />}

        <div>
          <p className="text-md font-semibold mb-2">Choose a Delivery Address</p>

          {!showAddAddressForm ? (
            <>
              <AddressList
                onSelectAddress={(address) => {
                  setSelectedAddress(address);
                  setHasAddresses(true);
                }}
              />
              <button
                onClick={() => setShowAddAddressForm(true)}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Add New Address
              </button>
            </>
          ) : (
            <ShippingAddressForm onSuccess={() => setShowAddAddressForm(false)} />
          )}
        </div>

            {/* DISCOUNT CODE FORM */}
          <div className="mt-6">
            <p className="font-medium mb-2">Apply Discount Code</p>
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
            {discountMessage && (
              <p className="mt-2 text-sm">{discountMessage}</p>
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
