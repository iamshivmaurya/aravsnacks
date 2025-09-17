'use client';

import { useRouter } from 'next/navigation';

export default function HeaderAdmin({ userName }: { userName: string | null }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/aravadmin/login');
  };

  return (
    <header className="flex justify-between items-center bg-white shadow px-6 py-4 rounded-lg mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">
          Welcome, <span className="font-semibold text-blue-600">{userName}</span>
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
