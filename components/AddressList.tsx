"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Edit } from "lucide-react";
import { API_BASE_URL } from "../constants";

interface Address {
  quote_address_id?: number;
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
  onSelectAddress: (address: Address) => void;
  selectedAddress?: Address | null;
}

export default function AddressList({ onSelectAddress, selectedAddress }: AddressListProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const quoteId = localStorage.getItem("quote_id");
    const customerId = localStorage.getItem("customer_id");

    if (!quoteId && !customerId) {
      setLoading(false);
      return;
    }

    fetchAddresses(quoteId, customerId);
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      const id = selectedAddress.quote_address_id ?? selectedAddress.customer_address_id ?? null;
      setSelectedId(id);
    }
  }, [selectedAddress]);

  const fetchAddresses = async (quoteId: string | null, customerId: string | null) => {
    try {
      let response = null;
      if (quoteId) {
        response = await axios.get(`${API_BASE_URL}/quotes/${quoteId}/addresses`);
      }
      if ((!response || response.data.length === 0) && customerId) {
        response = await axios.get(`${API_BASE_URL}/customers/${customerId}/addresses`);
      }
      setAddresses(response?.data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (address: Address) => {
    const id = address.quote_address_id ?? address.customer_address_id ?? 0;
    setSelectedId(id);
    onSelectAddress(address);
  };

  if (loading) return <p>Loading addresses...</p>;
  if (addresses.length === 0) return <p>No addresses found.</p>;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      {addresses.map((address) => {
        const id = address.quote_address_id ?? address.customer_address_id ?? 0;
        return (
          <div key={id} className="bg-white p-4 rounded shadow flex justify-between items-start">
            <div className="flex items-start gap-2">
              <input type="radio" name="selectedAddress" checked={selectedId === id} onChange={() => handleSelect(address)} className="mt-1" />
              <div>
                <h5 className="font-semibold">
                  {address.first_name} {address.last_name}, {address.postal_code}{" "}
                  <span className="p-2 bg-red-100 rounded">{address.address_type}</span>
                </h5>
                <p className="text-sm text-gray-600">
                  {address.street_address}, {address.city}, {address.state}, {address.phone_no}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
