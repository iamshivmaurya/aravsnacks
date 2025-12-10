"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/utils/axios";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, KeyRound, Loader2 } from "lucide-react";
import { useAuth } from "../components/AuthContext";
import { useRouter } from "next/navigation";

export type LoginData = {
  access_token: string;
  phone: string;
  customer_id: string;
};

const SIGNIN_API = `/login`;
const VERIFY_OTP_API = `/verify-otp`;

export default function SignInForm() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [otpLength, setOtpLength] = useState(6);
  const [cooldown, setCooldown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth(); // ✅ get login from context
  const router = useRouter();

  // Autofocus OTP
  useEffect(() => {
    if (step === "otp" && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [step]);

  // Countdown for resend OTP
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setInfoMsg("");
  };

  const showInfo = (msg: string) => {
    setInfoMsg(msg);
    setErrorMsg("");
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      showError("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(SIGNIN_API, { phone });
      showInfo(response.data.message);
      setOtpLength(response.data.otp?.length || 6);
      setOtp("");
      setStep("otp");
      setCooldown(30); // 30s cooldown for resend
    } catch (error: any) {
      showError(error.response?.data?.detail || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const otpArray = otp.split("");
    otpArray[index] = value;
    const newOtp = otpArray.join("");
    setOtp(newOtp);

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
    const pasted = e.clipboardData.getData("text").slice(0, otpLength);
    if (/^\d+$/.test(pasted)) {
      setOtp(pasted);
      const lastIndex = Math.min(pasted.length, otpLength) - 1;
      otpInputRefs.current[lastIndex]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== otpLength) {
      showError(`Please enter the complete ${otpLength}-digit OTP`);
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(VERIFY_OTP_API, { phone, otp });

      login(response.data);

      // Optionally save customer_id if needed
      localStorage.setItem("customer_id", response.data.customer_id.toString());

      router.push("/"); // redirect after login
    } catch (error: any) {
      showError(error.response?.data?.detail || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const renderButton = (label: string, isLoading: boolean) => (
    <Button
      type="submit"
      disabled={isLoading}
      className="w-full h-12 text-lg rounded-xl flex items-center justify-center gap-2"
    >
      {isLoading && <Loader2 className="animate-spin w-5 h-5" />}
      {isLoading ? `${label}...` : label}
    </Button>
  );

  return (
    <div className=" from-blue-50 to-green-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
              {step === "phone" ? (
                <Phone className="w-7 h-7 text-blue-600" />
              ) : (
                <KeyRound className="w-7 h-7 text-green-600" />
              )}
              {step === "phone" ? "Login" : "Verify OTP"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{errorMsg}</div>
            )}

            {infoMsg && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                ✅ {infoMsg}
              </div>
            )}

            {step === "phone" ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-5">
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 text-lg pl-10"
                    aria-label="Phone Number"
                  />
                </div>
                {renderButton("Get OTP", loading)}
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
                      value={otp[index] || ""}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      className="w-12 h-12 text-center text-xl font-semibold rounded-lg"
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>

                {renderButton("Verify OTP", loading)}

                <p className="text-center text-sm text-gray-600">
                  Didn’t get the OTP?{" "}
                  <button
                    type="button"
                    onClick={handlePhoneSubmit}
                    disabled={cooldown > 0}
                    className={`${
                      cooldown > 0 ? "text-gray-400" : "text-blue-600 hover:underline"
                    }`}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                  </button>{" "}
                  or{" "}
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
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
