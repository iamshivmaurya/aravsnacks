'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function NetworkStatusBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null; // Only show when offline

  return (
    <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-2 z-50 font-medium shadow-md animate-pulse">
      Network connection lost. Attempting to reconnect…
    </div>
  );
}
