'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from './LoginForm';
import { useCart } from '../components/CartContext';
import { ShoppingCart, User, LogOut, LogIn, List } from 'lucide-react';

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
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 bg-green-700 px-3 py-1 rounded hover:bg-green-800"
          >
            <User size={18} /> {isLoggedIn ? phone : "Account"}
          </button>

          {/* Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded shadow-lg z-50">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full"
                  >
                    <User size={16} /> My Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full"
                  >
                    <List size={16} /> My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full"
                  >
                    <LogIn size={16} /> Login
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full"
                  >
                    <LogIn size={16} /> Signup
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

   
    </nav>
  );
}
