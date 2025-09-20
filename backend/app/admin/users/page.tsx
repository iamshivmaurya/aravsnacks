"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  const limit = 3; // users per page
  const [totalUsers, setTotalUsers] = useState(0);

  // Filter
  const [search, setSearch] = useState("");

  const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`;

  const fetchUsers = async () => {
    if (!session?.user.accessToken) return;

    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
        params: { skip: (page - 1) * limit, limit, search },
      });
      // If backend sends { total, users } structure
      if (res.data.users) {
        setUsers(res.data.users);
        setTotalUsers(res.data.total);
      } else {
        // fallback for simple array response
        setUsers(res.data);
        setTotalUsers(res.data.length);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.status === 401
          ? "❌ Not authenticated. Please login."
          : "❌ Failed to load users: " + err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchUsers();
  }, [session, status, page, search]);

  if (status === "loading" || loading) return <p className="p-6">Loading...</p>;
  if (errorMsg) return <p className="p-6 text-red-600">{errorMsg}</p>;

  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Users</h2>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search username or role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded p-2 flex-1"
        />
        <button
          onClick={() => setPage(1)}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Search
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Username</th>
              <th className="p-2">Active</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
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
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">
                    <button
                      onClick={() => router.push(`/admin/users/${u.id}/edit`)}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-2 text-center" colSpan={5}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="bg-gray-200 px-4 py-1 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <p>
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
