'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Eye,
  UserCircle,
  ShoppingCart,   // ✅ Orders के लिए नया icon
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [showProductsSubmenu, setShowProductsSubmenu] = useState(false);
  const [showCustomersSubmenu, setShowCustomersSubmenu] = useState(false);
  const [showOrdersSubmenu, setShowOrdersSubmenu] = useState(false); // ✅ Orders submenu state

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
      <aside className="w-56 bg-white border-r shadow-sm fixed h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-blue-600">Admin Panel</h2>
        </div>

        <nav className="flex-1 p-2 text-sm">
          {/* Dashboard */}
          <button
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-blue-50 transition"
            onClick={() => router.push('/aravadmin/dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          {/* Products */}
          <div>
            <button
              className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-blue-50 transition"
              onClick={() => setShowProductsSubmenu(!showProductsSubmenu)}
            >
              <span className="flex items-center gap-2">
                <Package size={18} />
                <span>Products</span>
              </span>
              {showProductsSubmenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {showProductsSubmenu && (
              <div className="ml-6 mt-1 space-y-1">
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  onClick={() => router.push('/aravadmin/dashboard/products')}
                >
                  <PlusCircle size={16} />
                  <span>Add Product</span>
                </button>
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  onClick={() => router.push('/aravadmin/dashboard/products/view')}
                >
                  <Eye size={16} />
                  <span>View Products</span>
                </button>
              </div>
            )}
          </div>

          {/* Customers */}
          <div>
            <button
              className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-blue-50 transition"
              onClick={() => setShowCustomersSubmenu(!showCustomersSubmenu)}
            >
              <span className="flex items-center gap-2">
                <UserCircle size={18} />
                <span>Customers</span>
              </span>
              {showCustomersSubmenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {showCustomersSubmenu && (
              <div className="ml-6 mt-1 space-y-1">
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  onClick={() => router.push('/aravadmin/dashboard/customers/add')}
                >
                  <PlusCircle size={16} />
                  <span>Add Customer</span>
                </button>
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  onClick={() => router.push('/aravadmin/dashboard/customers')}
                >
                  <Eye size={16} />
                  <span>View Customers</span>
                </button>
              </div>
            )}
          </div>

          {/* ✅ Orders */}
          <div>
            <button
              className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-blue-50 transition"
              onClick={() => setShowOrdersSubmenu(!showOrdersSubmenu)}
            >
              <span className="flex items-center gap-2">
                <ShoppingCart size={18} />
                <span>Orders</span>
              </span>
              {showOrdersSubmenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {showOrdersSubmenu && (
              <div className="ml-6 mt-1 space-y-1">
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  onClick={() => router.push('/aravadmin/dashboard/orders/view')}
                >
                  <Eye size={16} />
                  <span>View Orders</span>
                </button>
              </div>
            )}
          </div>

          {/* Users */}
          <button
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-blue-50 transition"
            onClick={() => router.push('/aravadmin/dashboard/users')}
          >
            <Users size={18} />
            <span>Users</span>
          </button>

          {/* Settings */}
          <button
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-blue-50 transition"
            onClick={() => router.push('/aravadmin/dashboard/settings')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Logout */}
        <div className="p-2 border-t">
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-red-600 rounded-md hover:bg-red-50 transition"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Right Side */}
     {/* Right Side */}
     <main className="flex-1 flex flex-col ml-56">
        {/* ✅ Fixed Header */}
        <header className="flex justify-between items-center bg-white border-b shadow-sm px-6 py-3 fixed top-0 left-56 right-0 z-10">
          <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">
              Welcome, <span className="font-semibold text-blue-600">{userName}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        {/* ✅ Content with padding-top for fixed header */}
        <div className="p-6 flex-1 mt-16 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
