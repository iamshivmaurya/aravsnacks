"use client";
import axios from "axios";
import { useState } from "react";
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
     customer_id: "" ,
     access_token:"",
     first_name: "",
     last_name: ""
  
  });
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); // Backend error दिखाने के लिए
  const [successMsg, setSuccessMsg] = useState(""); // Backend SuccessMsg दिखाने के लिए

  // Handle phone input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg("");  
    setSuccessMsg(""); // इनपुट बदलते ही success भी हटे
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone || !form.first_name || !form.last_name) {
      alert("Please fill all required fields");
      setSuccessMsg("");
      return;
    }

    try {
      const response = await axios.post(SINGUP_API, {
        phone: form.phone,
        first_name: form.first_name,
        last_name: form.last_name
      });

      setGeneratedOtp(response.data.otp);  
      setGeneratedMessage(response.data.message);  
      setErrorMsg(""); // success आने पर error हटाओ
      // ✅ Show OTP after it's received
     // alert(`Your OTP is: ${response.data.otp}`); // In production, send via SMS
      setStep("otp");
      setErrorMsg(""); // success होने पर error साफ कर दो
    } catch (error: any) {
      console.error("Error sending OTP:", error);
     // alert("Failed to send OTP. Please try again.");
      setErrorMsg(error.response?.data?.detail);
      setSuccessMsg(""); // error आने पर success हटाओ


    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(VERIFY_OTP_API, {
        phone: form.phone,
        otp: otp,
      });

      console.log("Backend response:", response.data); // ✅ check what comes from backend

      // Example response check
      if (response.data.customer_id) {
        console.log("Customer ID:", response.data.customer_id);
      } else {
        console.warn("Customer ID missing in response!");
      }



      console.log("Access Token:", response.data.access_token);
      //console.log("Access Token:", response.data.message);
      localStorage.setItem("access_token", response.data.access_token);
      
      setSuccessMsg(response.data.message);
      setErrorMsg(""); // success पर error हटाओ
      //alert(response.data.message);
      onSubmit({
        phone: form.phone,
        customer_id: response.data.customer_id, // <-- Send customer_id
        access_token: response.data.access_token, // <-- Send customer_id
        first_name: form.first_name,
        last_name: form.last_name
        
      });
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
     // alert("Failed to send OTP. Please try again.");
      setErrorMsg(error.response?.data?.detail);
      setSuccessMsg(""); // error पर success हटाओ
     // alert("Invalid OTP. Please try again.");
    }
  };

  return (




    
    <div className="bg-white p-5 rounded-2xl shadow-md border">
   {/* Error message */}
   {errorMsg && (
          <span className="block text-red-600 font-medium mb-2">
            {errorMsg}
          </span>
        )}
      
      {/* Success/OTP message */}
      {(generatedOtp || successMsg) && (
          <span className="block text-green-600 font-medium">
            {successMsg || `${generatedMessage} and your OTP is: ${generatedOtp}`}
          </span>
        )}



      <div className="space-y-4 p-4 bg-white shadow rounded">
        <h2 className="text-lg font-semibold">Sign Up</h2>
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              name="first_name"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              className="border-2 border-blue-500 p-2 w-full rounded"
              required
            />
            <input
              name="last_name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              className="border-2 border-blue-500 p-2 w-full rounded"
              required
            />


            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="border-2 border-blue-500 p-2 w-full rounded "
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-black"
            >
              Send OTP
            </button>
          </form>
        )}





        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-black"
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Verify OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
