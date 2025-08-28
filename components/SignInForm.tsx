'use client';

import { useState } from 'react';
import axios from 'axios';

// Login response type
export type LoginData = {
  access_token: string;
  phone: string;
  customer_id: string;
};

// Props for SignInForm
interface SignInFormProps {
  onSubmit: (data: LoginData) => void;
}

const SIGNIN_API = 'http://127.0.0.1:8000/login'; // Send OTP API
const VERIFY_OTP_API = 'http://127.0.0.1:8000/verify-otp'; // OTP verify API

export default function SignInForm({ onSubmit }: SignInFormProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    try {
      setLoading(true);
      const response = await axios.post(SIGNIN_API, { phone });
      console.log('OTP sent:', response.data);
      alert(`OTP sent: ${response.data.otp}`); // Optional: show OTP for dev
      setStep('otp'); // Move to OTP input
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    try {
      setLoading(true);
      const response = await axios.post(VERIFY_OTP_API, { phone, otp });

      const data: LoginData = {
        access_token: response.data.access_token,
        phone: phone,
        customer_id: response.data.customer_id.toString(),
      };

      onSubmit(data); // Callback to parent (Navbar) to update login state
    } catch (error) {
      console.error('OTP verification failed:', error);
      alert('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80">
      {step === 'phone' ? (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <h2 className="text-xl font-bold">Login / Signup</h2>
          <input
            type="text"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border-2 border-black p-2 w-full rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <h2 className="text-xl font-bold">Enter OTP</h2>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border-2 border-black p-2 w-full rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}
    </div>
  );
}
