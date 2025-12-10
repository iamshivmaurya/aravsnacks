"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  LogOut
} from "lucide-react";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === "loading") return <p>Loading...</p>;

  if (!session || session.user.role !== "agent") {
    router.push("/login");
    return null;
  }

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, link: "/agent" },
    { name: "Orders", icon: ShoppingCart, link: "/agent/orders" },
    { name: "Customers", icon: Users, link: "/agent/customers" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col py-6 shadow-xl">

        {/* Profile Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-white border-4 border-blue-500 flex items-center justify-center text-blue-700 font-bold text-xl">
            {session.user.username.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-3 text-lg font-semibold">
            {session.user.username}
          </h2>
          <p className="text-blue-200 text-sm mt-1">Agent Panel</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.link;

            return (
              <button
                key={item.name}
                onClick={() => router.push(item.link)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition
                  ${isActive ? "bg-blue-600 shadow-md" : "hover:bg-blue-700"}
                `}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 mt-6">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition text-sm font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
