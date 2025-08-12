"use client";

import { useState } from "react";

type SignUpModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // ✅ Add this
};

// interface SignUpModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.match(/^\d{10}$/)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    alert(`Phone number ${phone} submitted successfully!`);
    setPhone("");
    onClose();
  };

  if (!isOpen) return null; // Modal hidden

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", justifyContent: "center", alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          width: "300px",
        }}
      >
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="tel"
            placeholder="Enter Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          <button
            type="submit"
            style={{ padding: "10px", backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: "5px" }}
          >
            Submit
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "10px", backgroundColor: "#ccc", border: "none", borderRadius: "5px" }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
