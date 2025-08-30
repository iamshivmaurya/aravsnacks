'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from './LoginForm';
import { useCart } from '../components/CartContext';
import { ShoppingCart, User, LogOut, LogIn } from 'lucide-react';

export default function Navbar() {
  const { cartItems } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedPhone = localStorage.getItem('phone');
    const storedCustomerId = localStorage.getItem('customer_id');

    if (token) {
      setIsLoggedIn(true);
      setPhone(storedPhone);
      setCustomerId(storedCustomerId);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('phone');
    localStorage.removeItem('customer_id');
    setIsLoggedIn(false);
    router.push('/');
  };

  const handlePhoneUpdated = (newPhone: string) => {
    setPhone(newPhone);
    localStorage.setItem('phone', newPhone);
    setShowLoginForm(false);
  };

  return (
    <nav className="bg-green-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
      {/* Brand Logo */}
      <Link href="/" className="font-bold text-xl flex items-center gap-2">
        🛒 <span>Arav Snacks</span>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center space-x-6">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/products" className="hover:underline">Products</Link>

        {/* Cart with Badge */}
        <Link href="/cart" className="relative flex items-center">
          <ShoppingCart size={20} />
          <span className="ml-1">Cart</span>
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-600 text-xs px-2 py-0.5 rounded-full">
              {cartItems.reduce((sum, i) => sum + i.item_qty, 0)}
            </span>
          )}
        </Link>

        {/* User Section */}
        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 bg-green-700 px-3 py-1 rounded hover:bg-green-800"
            >
              <User size={18} /> {phone}
            </button>

            {/* Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg z-50">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLoginForm(true)}
              className="flex items-center gap-1 bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
            >
              <LogIn size={16} /> Signup
            </button>
            <Link
              href="/login"
              className="flex items-center gap-1 bg-gray-700 px-3 py-1 rounded hover:bg-gray-800"
            >
              <LogIn size={16} /> Login
            </Link>
          </div>
        )}
      </div>

      {/* Modal for Signup/Login */}
      {showLoginForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-96">
            <LoginForm
              onSubmit={(formData) => {
                console.log("Login form submitted:", formData);
                // TODO: login API call
              }}
            />
            <button
              onClick={() => setShowLoginForm(false)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
