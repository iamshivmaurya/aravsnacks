"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });
    if (res?.ok) router.push("/admin");
    else alert("Login failed");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo.png" // ✅ place your logo in public/logo.png
            alt="Logo"
            width={120}
            height={120}
            className="rounded-full"
          />
        </div>

        <h1 className="text-2xl font-bold text-center mb-4">Admin Login</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 w-full rounded-md transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
