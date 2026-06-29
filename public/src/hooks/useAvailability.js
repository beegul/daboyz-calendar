import { useState, useEffect, useCallback, useRef } from "react";
import { mockAPI } from "../api/mock";
import { useIdleTimeout } from "./useIdleTimeout";

const API_BASE = "/api";
const DEBOUNCE_DELAY = 500; // 500ms debounce for month changes
const API_TIMEOUT = 3000; // 3 second timeout before falling back to mock

/**
 * Detect conflicts between old and new entries
 * A conflict occurs when the same persona (name, color)/date exists with different timestamps
 */
function detectConflicts(oldEntries = [], newEntries = []) {
  const conflicts = [];

  for (const newEntry of newEntries) {
    const oldEntry = oldEntries.find(
      (e) =>
        e.name === newEntry.name &&
        e.color === newEntry.color &&
        e.date === newEntry.date,
    );

    if (
      oldEntry &&
      oldEntry.timestamp &&
      newEntry.timestamp &&
      oldEntry.timestamp !== newEntry.timestamp
    ) {
      conflicts.push({
        name: newEntry.name,
        color: newEntry.color,
        date: newEntry.date,
        oldTimestamp: oldEntry.timestamp,
        newTimestamp: newEntry.timestamp,
        conflictTime: new Date().toISOString(),
      });
    }
  }

  return conflicts;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = API_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Custom hook for managing availability data
 * Handles fetching, polling, and state management
 * Falls back to mock API if real API is unavailable
 *
 * Cost Protection Features:
 * - Stops polling when tab is hidden (Page Visibility API)
 * - Throttles polling to 5 minutes when idle for 10+ minutes
 * - Resumes normal polling (5s) when tab becomes visible or user becomes active
 *
 * @param {string} month - Month string in format YYYY-MM (e.g., "2024-06")
 * @returns {{
 *   entries: Array,
 *   loading: boolean,
 *   error: string|null,
 *   lastSync: string|null,
 *   conflicts: Array,
 *   useMockAPI: boolean,
 *   toggleAvailability: Function,
 *   deleteAvailability: Function,
 *   refetch: Function
 * }}
 */
export function useAvailability(month) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [useMockAPI, setUseMockAPI] = useState(false);
  const [visibility, setVisibility] = useState(
    document.visibilityState || "visible",
  );

  const debounceTimerRef = useRef(null);
  const lastFetchRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const visibilityListenerRef = useRef(null);
  const blurListenerRef = useRef(null);
  const focusListenerRef = useRef(null);

  // Use idle tracking from useIdleTimeout hook
  const { isIdle } = useIdleTimeout();

  const fetchAvailability = useCallback(async () => {
    if (!month) return;

    try {
      setLoading(true);
      setError(null);
      setConflicts([]);

      let data;
      try {
        const response = await fetchWithTimeout(
          `${API_BASE}/availability?month=${month}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch availability: ${response.status}`);
        }
        data = await response.json();
        setUseMockAPI(false);
      } catch (err) {
        console.warn(
          "Real API unavailable, falling back to mock:",
          err.message,
        );
        data = await mockAPI.getAvailability(month);
        setUseMockAPI(true);
      }

      // Detect conflicts: entries with same userId/date but different timestamps
      const conflicts = detectConflicts(
        lastFetchRef.current || [],
        data.entries || [],
      );
      if (conflicts.length > 0) {
        setConflicts(conflicts);
      }

      setEntries(data.entries || []);
      lastFetchRef.current = data.entries || [];
      setLastSync(new Date().toISOString());
    } catch (err) {
      setError(err.message);
      console.error("Error fetching availability:", err);
    } finally {
      setLoading(false);
    }
  }, [month]);

  // Debounced fetch on month change
  useEffect(() => {
    clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      fetchAvailability();
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(debounceTimerRef.current);
  }, [month, fetchAvailability]);

  // Adaptive polling with Page Visibility API and Idle tracking
  // Polling frequency:
  // - 0 (stopped) when tab is hidden
  // - 5 minutes (300000ms) when user idle for 10+ minutes
  // - 5 seconds (5000ms) when visible and active
  useEffect(() => {
    // Handle Page Visibility API
    const handleVisibilityChange = () => {
      setVisibility(document.visibilityState);
    };

    // Handle blur/focus events as fallback for older browsers
    const handleBlur = () => {
      setVisibility("hidden");
    };

    const handleFocus = () => {
      setVisibility("visible");
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    // Store references for cleanup
    visibilityListenerRef.current = handleVisibilityChange;
    blurListenerRef.current = handleBlur;
    focusListenerRef.current = handleFocus;

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Polling interval management - updates frequency based on visibility and idle state
  useEffect(() => {
    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Determine polling frequency based on visibility and idle state
    let pollingFrequency;

    if (visibility === "hidden") {
      // Tab is hidden: stop polling (frequency = 0)
      pollingFrequency = 0;
    } else if (isIdle) {
      // Tab visible but user idle: throttle to 5 minutes
      pollingFrequency = 300000; // 5 minutes
    } else {
      // Tab visible and user active: normal polling
      pollingFrequency = 5000; // 5 seconds
    }

    // Set new interval if frequency is greater than 0
    if (pollingFrequency > 0) {
      pollingIntervalRef.current = setInterval(() => {
        fetchAvailability();
      }, pollingFrequency);
    }

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [visibility, isIdle, fetchAvailability]);

  const toggleAvailability = useCallback(
    async (name, color, date) => {
      try {
        let data;
        try {
          const response = await fetchWithTimeout(`${API_BASE}/availability`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, color, date }),
          });

          if (!response.ok) {
            throw new Error(
              `Failed to toggle availability: ${response.status}`,
            );
          }

          data = await response.json();
          setUseMockAPI(false);
        } catch (err) {
          console.warn(
            "Real API unavailable, falling back to mock:",
            err.message,
          );
          data = await mockAPI.toggleAvailability(name, color, date);
          setUseMockAPI(true);
        }

        // Update local state optimistically
        if (data.action === "added") {
          setEntries([...entries, data.entry]);
        } else if (data.action === "removed") {
          setEntries(
            entries.filter(
              (e) => !(e.name === name && e.color === color && e.date === date),
            ),
          );
        }

        setLastSync(new Date().toISOString());
        return data;
      } catch (err) {
        setError(err.message);
        console.error("Error toggling availability:", err);
        throw err;
      }
    },
    [entries],
  );

  const deleteAvailability = useCallback(
    async (name, color, date) => {
      try {
        try {
          const response = await fetchWithTimeout(
            `${API_BASE}/availability?name=${encodeURIComponent(name)}&color=${encodeURIComponent(color)}&date=${date}`,
            {
              method: "DELETE",
            },
          );

          if (!response.ok && response.status !== 204) {
            throw new Error(
              `Failed to delete availability: ${response.status}`,
            );
          }

          setUseMockAPI(false);
        } catch (err) {
          console.warn(
            "Real API unavailable, falling back to mock:",
            err.message,
          );
          await mockAPI.deleteAvailability(name, color, date);
          setUseMockAPI(true);
        }

        // Update local state
        setEntries(
          entries.filter(
            (e) => !(e.name === name && e.color === color && e.date === date),
          ),
        );
        setLastSync(new Date().toISOString());
      } catch (err) {
        setError(err.message);
        console.error("Error deleting availability:", err);
        throw err;
      }
    },
    [entries],
  );

  return {
    entries,
    loading,
    error,
    lastSync,
    conflicts,
    useMockAPI,
    toggleAvailability,
    deleteAvailability,
    refetch: fetchAvailability,
  };
}
