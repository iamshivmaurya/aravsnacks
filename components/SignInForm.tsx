'use client';

import { useState } from 'react';
import axios from 'axios';

export type LoginData = {
  access_token: string;
  phone: string;
  customer_id: string;
};

interface SignInFormProps {
  onSubmit: (data: LoginData) => void;
}

const SIGNIN_API = 'http://127.0.0.1:8000/login';
const VERIFY_OTP_API = 'http://127.0.0.1:8000/verify-otp';

export default function SignInForm({ onSubmit }: SignInFormProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    try {
      setLoading(true);
      const response = await axios.post(SIGNIN_API, { phone });
      alert(`OTP sent: ${response.data.otp}`);
      setStep('otp');
    } catch {
      alert('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    try {
      setLoading(true);
      const response = await axios.post(VERIFY_OTP_API, { phone, otp });
      onSubmit({
        access_token: response.data.access_token,
        phone,
        customer_id: response.data.customer_id.toString(),
      });
    } catch {
      alert('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="rounded-2xl p-8 w-full max-w-sm">
        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-5">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Login 
            </h2>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 w-full rounded-lg outline-none transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-4 py-3 rounded-lg w-full transition"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Enter OTP
            </h2>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg outline-none transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-4 py-3 rounded-lg w-full transition"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
