// app/maintenance/page.tsx
'use client';
import { useEffect, useState } from 'react';
import api from "@/utils/axios";

export default function MaintenancePage() {
  const [maintenanceMessage, setMaintenanceMessage] = useState('We are currently performing maintenance.');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/settings`)
      .then(res => {
        const data = res.data;
        setMaintenanceMode(data.maintenanceMode || false);
        setMaintenanceMessage(data.maintenanceMessage || 'We are currently performing maintenance.');
      })
      .catch(() => {
        setMaintenanceMode(true); // fallback: show maintenance if API fails
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl">Loading...</div>;
  }

  if (!maintenanceMode) {
    // If maintenance is OFF, redirect to homepage
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-4">
      <h1 className="text-4xl font-bold mb-4">Site Under Maintenance</h1>
      <p className="text-lg text-gray-700">{maintenanceMessage}</p>
    </div>
  );
}
