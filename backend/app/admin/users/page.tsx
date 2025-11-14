"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type User = {
  id: number;
  username: string;
  is_active: boolean;
  role: string;
};

export default function UsersList() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 5; // users per page
  const [totalUsers, setTotalUsers] = useState(0);

  // Filter
  const [search, setSearch] = useState("");

  const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`;

  // ✅ Fetch users
  const fetchUsers = async () => {
    if (!session?.user?.accessToken) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
        params: {
          skip: (page - 1) * limit,
          limit,
          search: search.trim() || undefined,
        },
      });

      if (Array.isArray(res.data)) {
        // if backend returns simple list
        setUsers(res.data);
        setTotalUsers(res.data.length);
      } else if (res.data.users) {
        // if backend returns paginated data
        setUsers(res.data.users);
        setTotalUsers(res.data.total ?? res.data.users.length);
      } else {
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (err: any) {
      console.error("Fetch users failed:", err);
      const msg =
        err.response?.status === 401
          ? "❌ Unauthorized. Please log in again."
          : "❌ Failed to load users.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, page, search]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / limit));

  // ✅ Loading state
  if (status === "loading" || loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-700">
        <Loader2 className="animate-spin" size={20} />
        Loading users...
      </div>
    );
  }

  // ✅ Error state
  if (errorMsg) {
    return <p className="p-6 text-red-600">{errorMsg}</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold mb-4">👥 Users</h2>

      {/* 🔍 Filter */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search username or role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded p-2 flex-1"
        />
        <button
          onClick={() => {
            setPage(1);
            fetchUsers();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* 📋 Users Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="p-2 border-b">ID</th>
              <th className="p-2 border-b">Username</th>
              <th className="p-2 border-b">Active</th>
              <th className="p-2 border-b">Role</th>
              <th className="p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{u.id}</td>
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">
                    {u.is_active ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-red-600 font-medium">Inactive</span>
                    )}
                  </td>
                  <td className="p-2 capitalize">{u.role}</td>
                  <td className="p-2">
                    <button
                      onClick={() => router.push(`/admin/users/edit/${u.id}`)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-4 text-center text-gray-500"
                  colSpan={5}
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔢 Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="bg-gray-200 px-4 py-1 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <p className="text-gray-700">
          Page {page} of {totalPages}
        </p>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="bg-gray-200 px-4 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
