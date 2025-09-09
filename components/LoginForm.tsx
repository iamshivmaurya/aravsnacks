"use client";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { VERIFY_OTP_API, LOGIN_API, SINGUP_API } from '../constants';

export type LoginData = {
  phone: string;
  customer_id: string;  
  access_token: string;  
  first_name?: string;  
  last_name?: string;   
};

type LoginProps = {
  onSubmit: (data: LoginData) => void;
};

export default function LoginForm({ onSubmit }: LoginProps) {
  const [form, setForm] = useState<LoginData>({ 
    phone: "",
    customer_id: "",
    access_token:"",
    first_name: "",
    last_name: ""
  });
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [otpLength, setOtpLength] = useState(6); // Default OTP length
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus on first OTP input when step changes
  useEffect(() => {
    if (step === 'otp' && otpInputRefs.current[0]) {
      otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  // Handle phone input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg("");  
    setSuccessMsg("");
  };

  // Handle OTP input changes
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

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone || !form.first_name || !form.last_name) {
      setErrorMsg("Please fill all required fields");
      setSuccessMsg("");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(SINGUP_API, {
        phone: form.phone,
        first_name: form.first_name,
        last_name: form.last_name
      });

      setGeneratedOtp(response.data.otp);  
      setGeneratedMessage(response.data.message);  
      setErrorMsg("");
      
      // Set OTP length based on the received OTP
      if (response.data.otp) {
        setOtpLength(response.data.otp.length);
        setOtp(''); // Reset OTP
      }
      
      setStep("otp");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      setErrorMsg(error.response?.data?.detail || "Failed to send OTP");
      setSuccessMsg("");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== otpLength) {
      setErrorMsg(`Please enter the complete ${otpLength}-digit OTP`);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(VERIFY_OTP_API, {
        phone: form.phone,
        otp: otp,
      });

      console.log("Backend response:", response.data);

      if (response.data.customer_id) {
        console.log("Customer ID:", response.data.customer_id);
      } else {
        console.warn("Customer ID missing in response!");
      }

      localStorage.setItem("access_token", response.data.access_token);
      
      setSuccessMsg(response.data.message);
      setErrorMsg("");
      
      onSubmit({
        phone: form.phone,
        customer_id: response.data.customer_id,
        access_token: response.data.access_token,
        first_name: form.first_name,
        last_name: form.last_name
      });
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      setErrorMsg(error.response?.data?.detail || "Invalid OTP");
      setSuccessMsg("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      {/* Error message */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {errorMsg}
        </div>
      )}
      
      {/* Success/OTP message */}
      {(generatedOtp || successMsg) && (
  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
    <div className="flex items-center justify-between">
      <span>{successMsg || generatedMessage}</span>
      {generatedOtp && (
        <span className="font-mono bg-green-200 px-2 py-1 rounded">
          {generatedOtp}
        </span>
      )}
    </div>
  </div>
)}

      <div className="space-y-4 p-4 bg-white rounded">
        <h2 className="text-2xl font-bold text-center text-gray-800">Sign Up</h2>
        
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              name="first_name"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 w-full rounded-lg outline-none transition"
              required
            />
            <input
              name="last_name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 w-full rounded-lg outline-none transition"
              required
            />
            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 w-full rounded-lg outline-none transition"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-4 py-3 rounded-lg w-full transition"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-gray-600">Enter the {otpLength}-digit OTP sent to your phone</p>
            </div>
            
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
                  onPaste={handlePaste}
                  ref={(el) => (otpInputRefs.current[index] = el)}
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
          </form>
        )}
      </div>
    </div>
  );
}