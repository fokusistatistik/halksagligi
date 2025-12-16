'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * Offline Indicator Component
 *
 * Shows a banner when the user is offline
 * Auto-hides when back online
 */
export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Online event handler
    const handleOnline = () => {
      setIsOnline(true);
      // Show "back online" message briefly
      setShowBanner(true);
      setTimeout(() => {
        setShowBanner(false);
      }, 3000);
    };

    // Offline event handler
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show banner if online and not recently reconnected
  if (isOnline && !showBanner) return null;

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-[9999]
        px-4 py-3 text-sm font-medium text-center
        transition-all duration-300 ease-in-out
        ${
          isOnline
            ? 'bg-green-600 text-white'
            : 'bg-yellow-600 text-white'
        }
        ${showBanner ? 'translate-y-0' : '-translate-y-full'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Bağlantı yeniden kuruldu</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>İnternet bağlantısı yok - Çevrimdışı modasınız</span>
          </>
        )}
      </div>
    </div>
  );
}
