"use client";

import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { VERIFY_OTP_API, SINGUP_API } from "../constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Phone, KeyRound, Loader2, User } from "lucide-react";

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
    access_token: "",
    first_name: "",
    last_name: "",
  });
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [otpLength, setOtpLength] = useState(6);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "otp" && otpInputRefs.current[0]) {
      otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));
    if (value && index < otpLength - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, otpLength);
    if (/^\d+$/.test(pastedData)) {
      setOtp(pastedData);
      const lastIndex = Math.min(pastedData.length, otpLength) - 1;
      otpInputRefs.current[lastIndex]?.focus();
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone || !form.first_name || !form.last_name) {
      setErrorMsg("⚠️ Please fill all required fields");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(SINGUP_API, {
        phone: form.phone,
        first_name: form.first_name,
        last_name: form.last_name,
      });

      setGeneratedOtp(response.data.otp);
      setGeneratedMessage(response.data.message);
      setErrorMsg("");

      if (response.data.otp) {
        setOtpLength(response.data.otp.length);
        setOtp("");
      }
      setStep("otp");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== otpLength) {
      setErrorMsg(`⚠️ Please enter the complete ${otpLength}-digit OTP`);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(VERIFY_OTP_API, {
        phone: form.phone,
        otp: otp,
      });

      localStorage.setItem("access_token", response.data.access_token);
      setSuccessMsg(response.data.message);
      setErrorMsg("");

      onSubmit({
        phone: form.phone,
        customer_id: response.data.customer_id,
        access_token: response.data.access_token,
        first_name: form.first_name,
        last_name: form.last_name,
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
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
              {step === "phone" ? (
                <User className="w-7 h-7 text-blue-600" />
              ) : (
                <KeyRound className="w-7 h-7 text-green-600" />
              )}
              {step === "phone" ? "Sign Up" : "Verify OTP"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {errorMsg}
              </div>
            )}

            {(generatedOtp || successMsg) && (
              <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
                ✅ {successMsg || generatedMessage}{" "}
                {generatedOtp && (
                  <span className="ml-2 font-mono bg-green-200 px-2 py-0.5 rounded">
                    {generatedOtp}
                  </span>
                )}
              </div>
            )}

            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <Input
                  name="first_name"
                  placeholder="First Name"
                  value={form.first_name}
                  onChange={handleChange}
                  className="h-12 text-lg"
                />
                <Input
                  name="last_name"
                  placeholder="Last Name"
                  value={form.last_name}
                  onChange={handleChange}
                  className="h-12 text-lg"
                />
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <Input
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    className="h-12 text-lg pl-10"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-lg rounded-xl flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin w-5 h-5" />}
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="flex justify-center gap-2">
                  {Array.from({ length: otpLength }).map((_, index) => (
                    <Input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index] || ""}
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
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Wrong number?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Change
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
