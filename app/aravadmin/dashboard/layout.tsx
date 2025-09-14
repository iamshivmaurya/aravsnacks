'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUserName = localStorage.getItem('user_name');

    if (!token) {
      router.push('/aravadmin/login');
    } else {
      setUserName(storedUserName);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/aravadmin/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-8">Admin Panel</h2>
        <nav className="space-y-4">
          <button
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 transition"
            onClick={() => router.push('/aravadmin/dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 transition"
            onClick={() => router.push('/aravadmin/dashboard/products')}
          >
            📦 Products
          </button>
          <button
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 transition"
            onClick={() => router.push('/aravadmin/dashboard/users')}
          >
            👥 Users
          </button>
          <button
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 transition"
            onClick={() => router.push('/aravadmin/dashboard/settings')}
          >
            ⚙️ Settings
          </button>
          <button
            className="block w-full text-left px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 transition"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* Right Side Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="text-gray-600">
            Welcome, <span className="font-semibold text-blue-600">{userName}</span>
          </div>
        </header>

        <div>{children}</div>
      </main>
    </div>
  );
}
