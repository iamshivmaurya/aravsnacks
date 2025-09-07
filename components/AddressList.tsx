"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Edit } from "lucide-react";

interface Address {
  quote_address_id?: number; // Quote address ke liye
  customer_address_id?: number; // Customer address ke liye
  address_type: string;
  street_address: string;
  postal_code: string;
  city: string;
  state: string;
  phone_no: string;
  first_name: string;
  last_name: string;
}

interface AddressListProps {
  onSelectAddress: (address: Address) => void;
}

export default function AddressList({ onSelectAddress }: AddressListProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const quoteId = localStorage.getItem("quote_id");
    const customerId = localStorage.getItem("customer_id");

    if (!quoteId && !customerId) {
      console.error("No quote_id or customer_id found");
      setLoading(false);
      return;
    }

    fetchAddresses(quoteId, customerId);
  }, []);

  const fetchAddresses = async (quoteId: string | null, customerId: string | null) => {
    try {
      let response = null;

      // Pehle quote addresses fetch karna
      if (quoteId) {
        response = await axios.get(`http://127.0.0.1:8000/quotes/${quoteId}/addresses`);
      }

      // Agar quote addresses empty hain aur customerId available hai, to fallback
      if ((!response || response.data.length === 0) && customerId) {
        response = await axios.get(`http://127.0.0.1:8000/customers/${customerId}/addresses`);
      }

      setAddresses(response?.data || []);
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
      setAddresses(addresses.filter(addr => addr.quote_address_id !== addressId));

      if (selectedId === addressId) {
        setSelectedId(null);
        onSelectAddress(null as any);
      }
    } catch (error) {
      console.error("Failed to delete address:", error);
      alert("Failed to delete address.");
    }
  };

  const handleSelect = (address: Address) => {
    const id = address.quote_address_id ?? address.customer_address_id ?? 0;
    setSelectedId(id);
    onSelectAddress(address);
  };

  if (loading) return <p className="text-gray-600">Loading addresses...</p>;
  if (addresses.length === 0) return <p className="text-gray-600">No addresses found.</p>;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      {addresses.map(address => {
        const id = address.quote_address_id ?? address.customer_address_id ?? 0;

        return (
          <div
            key={id}
            className="bg-white p-4 rounded shadow flex justify-between items-start"
          >
            <div className="flex items-start gap-2">
              <input
                type="radio"
                name="selectedAddress"
                checked={selectedId === id}
                onChange={() => handleSelect(address)}
                className="mt-1"
              />
              <div>
                <h5 className="font-semibold">
                  {address.first_name} {address.last_name} , {address.postal_code}{" "}
                  <span className="p-2 bg-red-100 rounded">{address.address_type}</span>
                </h5>
                <p className="text-sm text-gray-600">
                  {address.street_address}, {address.city}, {address.state} , {address.phone_no}
                </p>
              </div>
            </div>

            {address.quote_address_id && (
              <div className="flex gap-2">
                <button
                  onClick={() => deleteAddress(address.quote_address_id!)}
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
            )}
          </div>
        );
      })}
    </div>
  );
}
