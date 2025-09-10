'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {API_BASE_URL} from  "../../constants"

export type LoginData = {
  access_token: string;
  phone: string;
  customer_id: string;
};

interface SignInFormProps {
  onSubmit: (data: LoginData) => void;
}

const SIGNIN_API = `${API_BASE_URL}/login`;
const VERIFY_OTP_API = `${API_BASE_URL}/verify-otp`;

export default function SignInForm({ onSubmit }: SignInFormProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpLength, setOtpLength] = useState(6); // Default OTP length
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus on first OTP input when step changes
  useEffect(() => {
    if (step === 'otp' && otpInputRefs.current[0]) {
      otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      setLoading(true);
      const response = await axios.post(SIGNIN_API, { phone });
      setSuccessMsg(response.data.message);
      setGeneratedOtp(response.data.otp);
      
      // Set OTP length based on the received OTP
      if (response.data.otp) {
        setOtpLength(response.data.otp.length);
        setOtp(''); // Reset OTP
      }
      
      setStep('otp');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = otp.split('');
    newOtp[index] = value;
    setOtp(newOtp.join(''));
    
    // Auto focus to next input
    if (value && index < otpLength - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move focus to previous input on backspace
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, otpLength);
    if (/^\d+$/.test(pastedData)) {
      setOtp(pastedData);
      // Focus the last input where the OTP was pasted
      const lastIndex = Math.min(pastedData.length, otpLength) - 1;
      otpInputRefs.current[lastIndex]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== otpLength) {
      setErrorMsg(`Please enter the complete ${otpLength}-digit OTP`);
      return;
    }
    
    setErrorMsg("");
    
    try {
      setLoading(true);
      const response = await axios.post(VERIFY_OTP_API, { phone, otp });
      onSubmit({
        access_token: response.data.access_token,
        phone,
        customer_id: response.data.customer_id.toString(),
      });
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
<div>
     {/* Success and Error messages */}
     {errorMsg && (
      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
        {errorMsg}
      </div>
    )}
    
    {successMsg && (
      <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
        {generatedOtp && (
          <div className="mt-2 p-2 bg-green-50 rounded-md">
            <span className="text-lg font-mono">  {successMsg} and your OTP is: {generatedOtp}</span>
          </div>
        )}
      </div>
    )}

    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="rounded-2xl p-8 w-full max-w-sm mx-auto">
        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-5">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Login 
            </h2>
            <div>
              <input
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 w-full rounded-lg outline-none transition"
              />
            </div>
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
            
            <div className="flex justify-center space-x-2 mb-4">
              {Array.from({ length: otpLength }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={otp[index] || ''}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste} ref={(el) => (otpInputRefs.current[index] = el)}
                  className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                />
              ))}
            </div>
            
            <button
              type="submit"
              disabled={loading || otp.length !== otpLength}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-4 py-3 rounded-lg w-full transition"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => {
                  setStep('phone');
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Change Phone Number
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              <p>Enter the {otpLength}-digit OTP sent to your phone</p>
            </div>
          </form>
        )}
      </div>
    </div>
    </div>
  );
}