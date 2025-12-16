import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Pull to Refresh Hook
 *
 * Implements pull-to-refresh gesture for mobile devices
 * Usage:
 *
 * const { isRefreshing } = usePullToRefresh(async () => {
 *   await fetchData();
 * });
 */

interface UsePullToRefreshOptions {
  resistance?: number; // Resistance factor (higher = harder to pull)
  threshold?: number; // Distance threshold to trigger refresh (px)
  maxPullDistance?: number; // Maximum pull distance (px)
  enabled?: boolean; // Enable/disable pull to refresh
}

export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options: UsePullToRefreshOptions = {}
) {
  const {
    resistance = 2.5,
    threshold = 80,
    maxPullDistance = 150,
    enabled = true,
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || isRefreshing) return;

      // Only start pull if at the top of the page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    },
    [enabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !isPulling.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      // Only allow pulling down
      if (diff > 0 && window.scrollY === 0) {
        // Prevent default scroll behavior
        e.preventDefault();

        // Calculate pull distance with resistance
        const distance = Math.min(
          diff / resistance,
          maxPullDistance
        );

        setPullDistance(distance);
      } else {
        isPulling.current = false;
        setPullDistance(0);
      }
    },
    [enabled, isRefreshing, resistance, maxPullDistance]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || !isPulling.current) return;

    isPulling.current = false;

    // Trigger refresh if pulled beyond threshold
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(0);

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    } else {
      // Snap back if not pulled enough
      setPullDistance(0);
    }
  }, [enabled, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isRefreshing,
    pullDistance,
    isPulling: isPulling.current,
  };
}

/**
 * Pull to Refresh Indicator Component
 *
 * Visual indicator for pull-to-refresh gesture
 * Use with usePullToRefresh hook
 */
export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  threshold = 80,
}: {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}) {
  const progress = Math.min(pullDistance / threshold, 1);
  const opacity = Math.min(progress, 0.8);

  if (!pullDistance && !isRefreshing) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 flex items-center justify-center z-50 pointer-events-none"
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
        opacity,
      }}
    >
      <div className="bg-white rounded-full shadow-lg p-3">
        {isRefreshing ? (
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            className="w-6 h-6 text-blue-600"
            style={{
              transform: `rotate(${progress * 360}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
