'use client';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Eye,
  UserCircle,
  ShoppingCart,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [showProductsSubmenu, setShowProductsSubmenu] = useState(false);
  const [showCustomersSubmenu, setShowCustomersSubmenu] = useState(false);
  const [showOrdersSubmenu, setShowOrdersSubmenu] = useState(false); // ✅ Orders submenu state

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  if (status === "loading") return <p>Loading...</p>;

  if (session?.user.role !== "admin") {
    return <p>Access Denied. You are not an admin.</p>;
  }


  const handleLogout = () => {
    localStorage.clear();
    router.push('/admin/login');
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
            onClick={() => router.push('/admin')}
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
                <span>Catalog</span>
              </span>
              {showProductsSubmenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {showProductsSubmenu && (
              <div className="ml-6 mt-1 space-y-1">
                {/* <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  onClick={() => router.push('/admin/products')}
                >
                  <PlusCircle size={16} />
                  <span>Add Product</span>
                </button> */}
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  onClick={() => router.push('/admin/products')}
                >
                  <Eye size={16} />
                  <span>Products</span>
                </button>
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  onClick={() => router.push('/admin/categories')}
                >
                  <Eye size={16} />
                  <span>Categories</span>
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
                <span>Customer</span>
              </span>
              {showCustomersSubmenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {showCustomersSubmenu && (
              <div className="ml-6 mt-1 space-y-1">
                {/* <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  onClick={() => router.push('/admin/customers/add')}
                >
                  <PlusCircle size={16} />
                  <span>Add Customer</span>
                </button> */}
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  onClick={() => router.push('/admin/customers')}
                >
                  <Eye size={16} />
                  <span>All Customer</span>
                </button>
                 <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  onClick={() => router.push('/admin/customers/customers-group')}
                >
                  <Eye size={16} />
                  <span>Customer Groups</span>
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
                <span>Sales</span>
              </span>
              {showOrdersSubmenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {showOrdersSubmenu && (
              <div className="ml-6 mt-1 space-y-1">
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  onClick={() => router.push('/admin/orders')}
                >
                  <Eye size={16} />
                  <span>Orders</span>
                </button>
                  <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  onClick={() => router.push('/admin/orders/invoices')}
                >
                  <Eye size={16} />
                  <span>Invoices</span>
                </button>
                  <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  onClick={() => router.push('/admin/orders/shipments')}
                >
                  <Eye size={16} />
                  <span>Shipments</span>
                </button>
              </div>
            )}
          </div>

          {/* Users */}
          <button
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-blue-50 transition"
            onClick={() => router.push('/admin/users')}
          >
            <Users size={18} />
            <span>Users</span>
          </button>

          {/* Settings */}
          <button
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-blue-50 transition"
            onClick={() => router.push('/admin/settings')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      {/* Right Side */}
     {/* Right Side */}
     <main className="flex-1 flex flex-col ml-56">
        {/* ✅ Fixed Header */}
        <header className="flex justify-between items-center bg-white border-b shadow-sm px-6 py-3 fixed top-0 left-56 right-0 z-10">
          <h1 className="text-xl font-semibold text-gray-800"></h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">
              <p>Welcome, {session.user.username} (Role: {session.user.role})</p>
            </span>
              <button
              className="bg-red-500 text-white p-2 mt-4"
              onClick={() => signOut()}
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
