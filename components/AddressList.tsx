"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Edit } from "lucide-react";

interface Address {
  id: number;
  address_type: string;
  street_address: string;
  postal_code: string;
  city: string;
  state: string;
  phone_no: string;
  fast_name: string;
  last_name: string;
}

export default function AddressList() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const quoteId = localStorage.getItem("quote_id");
    if (!quoteId) {
      console.error("Quote ID not found in localStorage");
      setLoading(false);
      return;
    }

    fetchAddresses(quoteId);
  }, []);

  const fetchAddresses = async (quoteId: string) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/quotes/${quoteId}/addresses`);
      setAddresses(response.data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId: number) => {
    const quoteId = localStorage.getItem("quote_id");
    if (!quoteId) return;

    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/quotes/${quoteId}/addresses/${addressId}`);
      setAddresses(addresses.filter(addr => addr.id !== addressId));
    } catch (error) {
      console.error("Failed to delete address:", error);
      alert("Failed to delete address.");
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading addresses...</p>;
  }

  if (addresses.length === 0) {
    return <p className="text-gray-600">No addresses found.</p>;
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      {addresses.map(address => (
        <div
          key={address.id}
          className="bg-white p-4 rounded shadow flex justify-between items-start"
        >
          <div>
            <h5 className="font-semibold">
              {address.fast_name} {address.last_name} , {address.postal_code} <span className="p-2 bg-red-100  rounded">{address.address_type}</span> 
            </h5>
            <p className="text-sm text-gray-600">{address.street_address}, {address.city}, {address.state} , {address.phone_no}</p>
 
           
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => deleteAddress(address.id)}
              className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => alert("Edit feature coming soon")}
              className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              <Edit size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
