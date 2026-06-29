/**
 * useIdleTimeout Hook
 * Tracks user activity (mousemove, keydown, touchstart) and maintains idle state
 * Used by useAvailability hook to throttle API polling when user is inactive
 *
 * Idle Definition: No user activity for 10 minutes (600000ms)
 */

import { useState, useEffect, useRef, useCallback } from "react";

const IDLE_THRESHOLD_MS = 600000; // 10 minutes in milliseconds

/**
 * Hook to track user idle state based on activity events
 *
 * @param {number} idleThresholdMs - Optional custom idle threshold (default: 600000ms = 10min)
 * @returns {{
 *   isIdle: boolean,
 *   lastActivityTime: number,
 *   resetIdleTimer: Function,
 *   idleThresholdMs: number
 * }}
 *   - isIdle: true if user has been inactive for idleThresholdMs or longer
 *   - lastActivityTime: timestamp (ms) of last detected activity
 *   - resetIdleTimer: function to manually reset the idle timer (e.g., on user interaction)
 *   - idleThresholdMs: the current idle threshold being used
 */
export function useIdleTimeout(idleThresholdMs = IDLE_THRESHOLD_MS) {
  const [isIdle, setIsIdle] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  // Use ref to track intervals and debounce timeouts (persists across renders)
  const idleCheckIntervalRef = useRef(null);
  const activityDebounceRef = useRef(null);

  // Reset idle timer function - called whenever user activity detected
  const resetIdleTimer = useCallback(() => {
    const now = Date.now();
    setLastActivityTime(now);
    setIsIdle(false);

    // Clear any pending debounce
    if (activityDebounceRef.current) {
      clearTimeout(activityDebounceRef.current);
    }
  }, []);

  // Activity event handler - debounced to avoid excessive state updates
  const handleActivityEvent = useCallback(() => {
    // Debounce: only process activity if it hasn't been called recently
    if (activityDebounceRef.current) {
      clearTimeout(activityDebounceRef.current);
    }

    activityDebounceRef.current = setTimeout(() => {
      resetIdleTimer();
      activityDebounceRef.current = null;
    }, 100); // Debounce for 100ms
  }, [resetIdleTimer]);

  // Initialize idle check interval and event listeners
  useEffect(() => {
    // Activity listeners - user moving mouse, typing, or touching screen
    const events = ["mousemove", "keydown", "touchstart"];

    events.forEach((eventName) => {
      document.addEventListener(eventName, handleActivityEvent, {
        passive: true,
      });
    });

    // Periodic check for idle state (every 1 second)
    idleCheckIntervalRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTime;
      const shouldBeIdle = timeSinceLastActivity >= idleThresholdMs;

      setIsIdle((prevIsIdle) => {
        // Only update if state changed to minimize re-renders
        if (prevIsIdle !== shouldBeIdle) {
          return shouldBeIdle;
        }
        return prevIsIdle;
      });
    }, 1000); // Check every second

    // Cleanup function - remove listeners and clear intervals
    return () => {
      // Remove event listeners
      events.forEach((eventName) => {
        document.removeEventListener(eventName, handleActivityEvent);
      });

      // Clear idle check interval
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current);
        idleCheckIntervalRef.current = null;
      }

      // Clear any pending debounce
      if (activityDebounceRef.current) {
        clearTimeout(activityDebounceRef.current);
        activityDebounceRef.current = null;
      }
    };
  }, [handleActivityEvent, lastActivityTime, idleThresholdMs]);

  return {
    isIdle,
    lastActivityTime,
    resetIdleTimer,
    idleThresholdMs,
  };
}

export default useIdleTimeout;
