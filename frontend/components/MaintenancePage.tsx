'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function MaintenancePage() {
  const [message, setMessage] = useState(
    'We are currently performing maintenance. Please check back later.'
  );

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/settings`)
      .then((res) => {
        if (res.data.maintenanceMessage) {
          setMessage(res.data.maintenanceMessage);
        }
      })
      .catch((err) => console.error('Failed to fetch maintenance message:', err));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
      <h1 className="text-3xl font-bold mb-4">🚧 Site Under Maintenance 🚧</h1>
      <p className="text-lg text-gray-700">{message}</p>
    </div>
  );
}
