'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Page load hone par check kare ki user logged in hai ya nahi
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('phone');
    localStorage.removeItem('customer_id');
    setIsLoggedIn(false);
    router.push('/'); // Logout ke baad homepage par bhej do
  };

  return (
    <nav className="bg-green-600 text-white px-4 py-3 flex justify-between items-center">
      <h1 className="font-bold text-xl">🛒 Arav Snacks</h1>
      <div className="space-x-4 flex items-center">
        <Link href="/">Home</Link>
        <Link href="/products">Products</Link>
        <Link href="/cart">Cart</Link>

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
