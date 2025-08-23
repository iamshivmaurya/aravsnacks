'use client';

import { useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../components/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';
import ShippingAddressForm, { ShippingAddressData } from '../../components/ShippingAddressForm';
import LoginForm, { LoginData } from "../../components/LoginForm";
import EditSignupForm from "../../components/EditSignupForm"; // <-- Import it
 

export default function CartPage() {
  const { cartItems, increaseQty, decreaseQty, removeFromCart } = useCart();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddressData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState(""); // store phone after login
  const [customerId, setCustomerId] = useState<string | null>(null);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    router.push('/checkout');
  };


  useEffect(() => {
    // Page load hone par localStorage check
    const token = localStorage.getItem("access_token");
    const storedPhone = localStorage.getItem("phone");
    const storedCustomerId = localStorage.getItem("customer_id");
 
    if (token && storedPhone && storedCustomerId) {
      setIsLoggedIn(true);
      setPhone(storedPhone);
      setCustomerId(storedCustomerId);
    }
  }, []);



    // When login/OTP verified successfully
    const handleLoginSuccess = (data: LoginData) => {

    // Login hone par localStorage me save karna
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("phone", data.phone);
    localStorage.setItem("customer_id", data.customer_id);

      console.log("User logged in with:", data.phone);
      setPhone(data.phone); // store verified phone
      setCustomerId(data.customer_id); // store customer ID too
      setIsLoggedIn(true); // show edit form now
    };

  // const handleLoginSuccess = (data: LoginData) => {
  //   console.log("User logged in with:", data.phone);
  //   setIsLoggedIn(true);
  // };
  
  const handleAddressSubmit = (address: ShippingAddressData) => {
    console.log("Saved shipping address:", address);
    setShippingAddress(address);
  };

  return (
    <section className="mt-6 px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* LEFT COLUMN: Login + Shipping */}
      <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow">
      {isLoggedIn ? (
          <EditSignupForm
            phone={phone}
            customer_id={customerId || ""} // now this will have the proper value
            onSubmit={(data) => {
              console.log("Signup details updated:", data);
            }}
          />
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
                <p className="font-bold text-right">
                  ₹{item.price * item.quantity}
                </p>
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
      </div>
    </section>
  );
}
