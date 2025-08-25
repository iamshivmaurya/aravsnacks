"use client";
import { useState } from "react";
import EditSignupForm from "./EditSignupForm";

type ProfilePhoneSectionProps = {
  phone: string;
  customer_id: string;
};

export default function ProfilePhoneSection({ phone, customer_id }: ProfilePhoneSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPhone, setCurrentPhone] = useState(phone);

  return (
    <div className="space-y-4 p-4 bg-white shadow rounded">
      <h2 className="text-lg font-semibold">Phone Information</h2>

      {!isEditing ? (
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={currentPhone}
            disabled
            className="border p-2 w-full bg-gray-100 cursor-not-allowed"
          />
          <button
            className="ml-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        </div>
      ) : (
        <EditSignupForm
          phone={currentPhone}
          customer_id={customer_id}
          onPhoneUpdated={(newPhone) => {
            setCurrentPhone(newPhone);
            setIsEditing(false); // Close edit form
          }}
        />
      )}
    </div>
  );
}
