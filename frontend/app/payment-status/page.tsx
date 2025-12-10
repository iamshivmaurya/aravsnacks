"use client";

import { useEffect, useState } from "react";

export default function PaymentStatusPage() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txnId = params.get("txnId");

    if (!txnId) return;

    const checkStatus = async () => {
      const res = await fetch(`http://localhost:8000/api/v1/payment-status/${txnId}`);
      const data = await res.json();
      setResult(data);
    };

    checkStatus();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Checking Payment Status...</h2>
      <pre>{result ? JSON.stringify(result, null, 2) : "Loading..."}</pre>
    </div>
  );
}
