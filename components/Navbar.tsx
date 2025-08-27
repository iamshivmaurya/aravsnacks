'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from './LoginForm';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
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
    <nav className="bg-green-600 text-white px-4 py-3 flex justify-between items-center">
      <h1 className="font-bold text-xl">🛒 Arav Snacks</h1>
      <div className="space-x-4 flex items-center">
        <Link href="/">Home</Link>
        <Link href="/products">Products</Link>
        <Link href="/cart">Cart</Link>

        {isLoggedIn ? (
          <>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowLoginForm(true)}
              className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
            >
              Signup
            </button>
            <Link href="/login">Login</Link>
          </>
        )}
      </div>

      {showLoginForm && (
  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
    <div className="bg-white p-6 rounded-lg shadow-lg relative z-50 pointer-events-auto">
      <LoginForm
        onSubmit={(formData) => {
          console.log("Login form submitted:", formData);
          // yahan aap login API call kar sakte ho
        }}
      />
      <button
        onClick={() => setShowLoginForm(false)}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
      >
        Close
      </button>
    </div>
  </div>
)}

    </nav>
  );
}
