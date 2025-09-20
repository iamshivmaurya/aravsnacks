"use client";

import React from "react";
import { API_BASE_URL } from "../constants";

interface DownloadInvoiceProps {
  orderId: number;
}

export default function DownloadInvoice({ orderId }: DownloadInvoiceProps) {
  const handleDownload = async (): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE_URL}/invoice/${orderId}`);

      if (!res.ok) {
        throw new Error("Failed to fetch invoice");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading invoice:", error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
    >
      Download Invoice
    </button>
  );
}
