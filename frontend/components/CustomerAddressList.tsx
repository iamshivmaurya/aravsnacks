"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { Trash2, Edit } from "lucide-react";

interface Address {
  customer_address_id?: number;
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
  onSelectAddress: (address: Address | null) => void;
}

export default function AddressList({ onSelectAddress }: AddressListProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customerId = localStorage.getItem("customer_id");

    if (!customerId) {
      console.error("No customer_id found");
      setLoading(false);
      return;
    }

    fetchAddresses(customerId);
  }, []);

  const fetchAddresses = async (customerId: string) => {
    try {
      const response = await api.get(`/customers/${customerId}/addresses`);
      setAddresses(response.data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (address: Address) => {
    const id =
      address.customer_address_id?.toString() ??
      `${address.postal_code}-${address.phone_no}`;
    setSelectedId(id);
    onSelectAddress(address);
  };

  if (loading) return <p className="text-gray-600">Loading addresses...</p>;
  if (addresses.length === 0) return <p className="text-gray-600">No addresses found.</p>;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      {addresses.map((address, index) => {
        const id =
          address.customer_address_id?.toString() ??
          `addr-${index}`; // ✅ fallback key

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

            <div className="flex gap-2">
              <button
                onClick={() => alert("Delete feature coming soon")}
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
        );
      })}
    </div>
  );
}
