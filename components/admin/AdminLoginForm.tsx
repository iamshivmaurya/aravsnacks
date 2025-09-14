'use client';

import { useState } from 'react';
import axios from 'axios';

export type AdminLoginData = {
  access_token: string;
  user_name: string;
  admin_id: string;
};

interface AdminLoginFormProps {
  onSubmit: (data: AdminLoginData) => void;
}

const LOGIN_API = "http://127.0.0.1:8000/admin/login";

export default function AdminLoginForm({ onSubmit }: AdminLoginFormProps) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setLoading(true);
      const response = await axios.post(LOGIN_API, {
        user_name: userName,
        password,
      });

      onSubmit({
        access_token: response.data.access_token,
        user_name: userName,
        admin_id: response.data.admin_id?.toString() || '',
      });
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <h2 className="text-2xl font-bold text-center text-gray-800">Admin Login</h2>

        <div>
          <input
            type="text"
            placeholder="Enter username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 w-full rounded-lg outline-none transition"
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 w-full rounded-lg outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-4 py-3 rounded-lg w-full transition"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
