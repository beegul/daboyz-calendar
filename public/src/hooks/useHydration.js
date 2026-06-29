import { useState, useEffect, useRef } from "react";

/**
 * useHydration Hook
 *
 * Implements hybrid hydration strategy to eliminate page flicker on refresh:
 * 1. Load state from localStorage immediately (instant render, <100ms)
 * 2. Fetch fresh data in background via API
 * 3. Silent update on response (no visible re-render flicker)
 * 4. If API fails: keep localStorage, show offline warning
 *
 * Usage:
 *   const { data, isHydrating, error } = useHydration(
 *     storageKey,           // localStorage key to hydrate from
 *     fallbackData,         // Fallback if no cache
 *     apiEndpoint,          // Optional: fetch fresh data from this endpoint
 *   )
 *
 * Returns:
 *   - data: Current data (from cache initially, then API response)
 *   - isHydrating: true while background fetch is pending
 *   - error: Error message if fetch fails
 */
export function useHydration(
  storageKey,
  fallbackData = [],
  apiEndpoint = null,
) {
  // Step 1: Initialize from localStorage immediately (instant, <100ms)
  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        console.log(`[sync] Hydrating ${storageKey} from localStorage`);
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn(`[sync] Failed to parse ${storageKey} from localStorage:`, err);
    }
    return fallbackData;
  });

  const [isHydrating, setIsHydrating] = useState(false);
  const [error, setError] = useState(null);
  const hydrationRef = useRef(false);

  // Step 2: Fetch fresh data in background (silent update on response)
  useEffect(() => {
    if (!apiEndpoint || hydrationRef.current) {
      return;
    }

    hydrationRef.current = true;

    const fetchFreshData = async () => {
      try {
        setIsHydrating(true);
        setError(null);

        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        const entries = result.entries || result.data || [];

        // Silent update: Only call setData if data actually changed
        // This prevents unnecessary re-renders and avoids flickering
        setData((prevData) => {
          const prevJSON = JSON.stringify(prevData);
          const newJSON = JSON.stringify(entries);
          if (prevJSON !== newJSON) {
            console.log(`[sync] Updated ${storageKey} from API (${entries.length} entries)`);
            return entries;
          }
          console.log(`[sync] No changes in ${storageKey}, skipping re-render`);
          return prevData;
        });
      } catch (err) {
        console.warn(`[sync] Background fetch failed for ${storageKey}:`, err);
        setError(err.message);
        // Don't clear data on error - keep localStorage fallback
      } finally {
        setIsHydrating(false);
      }
    };

    fetchFreshData();

    // Cleanup: Reset hydration ref on unmount
    return () => {
      hydrationRef.current = false;
    };
  }, [apiEndpoint, storageKey]);

  return {
    data,
    isHydrating,
    error,
  };
}
