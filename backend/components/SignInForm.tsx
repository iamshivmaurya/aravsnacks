'use client';

import { useState, useRef, useEffect } from 'react';
import api from "@/utils/axios";
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, KeyRound, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../constants";
 

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
  const [otpLength, setOtpLength] = useState(6);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
      const response = await api.post(SIGNIN_API, { phone });
      setSuccessMsg(response.data.message);
      setGeneratedOtp(response.data.otp);
      if (response.data.otp) {
        setOtpLength(response.data.otp.length);
        setOtp('');
      }
      setStep('otp');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = otp.split('');
    newOtp[index] = value;
    setOtp(newOtp.join(''));
    if (value && index < otpLength - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, otpLength);
    if (/^[0-9]+$/.test(pastedData)) {
      setOtp(pastedData);
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
    <div className="bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
              {step === 'phone' ? <Phone className="w-7 h-7 text-blue-600" /> : <KeyRound className="w-7 h-7 text-green-600" />}
              {step === 'phone' ? 'Login' : 'Verify OTP'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                ✅ {successMsg} : {generatedOtp}
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-5">
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 text-lg pl-10"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-lg rounded-xl flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin w-5 h-5" />} 
                  {loading ? 'Sending OTP...' : 'Get OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="flex justify-center gap-2">
                  {Array.from({ length: otpLength }).map((_, index) => (
                    <Input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index] || ''}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      className="w-12 h-12 text-center text-xl font-semibold rounded-lg"
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length !== otpLength}
                  className="w-full h-12 text-lg rounded-xl bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin w-5 h-5" />} 
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Didn’t get the OTP?{' '}
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-blue-600 hover:underline"
                  >
                    Change Number
                  </button>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
