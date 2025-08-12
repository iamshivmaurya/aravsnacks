"use client";

import React from "react";
import SignUp from "@/components/SignUp";

type SignUpModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // ✅ Add this
};

export default function SignUpModal({ isOpen, onClose, onSuccess }: SignUpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        {/* Pass onSuccess to SignUp form */}
        <SignUp onSuccess={onSuccess} />
        
        <button
          onClick={onClose}
          className="mt-3 bg-gray-500 text-white px-4 py-1 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
