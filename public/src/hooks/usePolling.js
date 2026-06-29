/**
 * usePolling Hook
 * 
 * Implements 1-second polling with error handling, retry logic, and online/offline detection.
 * 
 * Feature: 007-multi-user-sync-mobile-ux
 * Phase: 2 - Foundational Infrastructure
 * Contract: contracts/polling-contract.md
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { POLLING_INTERVAL, POLLING_TIMEOUT, RETRY_CONFIG, getRetryBackoff } from '../utils/syncConfig';

/**
 * @typedef {Object} PollingOptions
 * @property {number} [interval=1000] - Polling interval in milliseconds
 * @property {Object} [retryConfig] - Retry configuration
 * @property {number} [retryConfig.maxRetries=3] - Maximum retry attempts
 * @property {number[]} [retryConfig.backoffMs=[1000,2000,4000,8000]] - Backoff delays
 * @property {boolean} [onlineDetection=true] - Use navigator.onLine + timeout to detect offline
 * @property {number} [timeout=2000] - Request timeout in milliseconds
 */

/**
 * @typedef {Object} PollingResult
 * @property {any} data - Fetched data (null until first successful poll)
 * @property {boolean} loading - true if poll in progress
 * @property {Error|null} error - Error object if poll failed
 * @property {number} lastSync - Timestamp of last successful poll
 * @property {boolean} isOnline - true if network available
 * @property {Function} retry - Manual retry function
 */

/**
 * Custom hook for polling an endpoint with retry logic and offline detection
 * 
 * @param {string} endpoint - URL endpoint to poll
 * @param {PollingOptions} options - Configuration options
 * @returns {PollingResult} Polling state and methods
 */
export function usePolling(endpoint, options = {}) {
  const {
    interval = POLLING_INTERVAL,
    retryConfig = RETRY_CONFIG,
    onlineDetection = true,
    timeout = POLLING_TIMEOUT
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(0);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  const retryCountRef = useRef(0);
  const nextRetryTimeRef = useRef(0);
  const pollingIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  /**
   * Perform a fetch with timeout
   */
  const fetchWithTimeout = useCallback(async (url) => {
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortControllerRef.current.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      return json;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw err;
    }
  }, [timeout]);

  /**
   * Execute a single poll
   */
  const poll = useCallback(async () => {
    if (!isOnline) {
      return; // Don't poll when offline
    }

    setLoading(true);

    try {
      const result = await fetchWithTimeout(endpoint);
      setData(result);
      setError(null);
      setLastSync(Date.now());
      retryCountRef.current = 0;
      nextRetryTimeRef.current = 0;
    } catch (err) {
      // Check if error is a timeout or network error
      if (err.message === 'Request timeout' || err.message.includes('Failed to fetch')) {
        setIsOnline(false);
      }

      if (retryCountRef.current < retryConfig.maxRetries) {
        retryCountRef.current += 1;
        const backoff = getRetryBackoff(retryCountRef.current);
        nextRetryTimeRef.current = Date.now() + backoff;
      }

      setError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, fetchWithTimeout, retryConfig.maxRetries]);

  /**
   * Manual retry function
   */
  const retry = useCallback(() => {
    retryCountRef.current = 0;
    nextRetryTimeRef.current = 0;
    poll();
  }, [poll]);

  /**
   * Handle online event
   */
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    retryCountRef.current = 0; // Reset retry count
    nextRetryTimeRef.current = 0;
    poll(); // Immediately attempt poll
  }, [poll]);

  /**
   * Handle offline event
   */
  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  /**
   * Setup polling interval and event listeners
   */
  useEffect(() => {
    // Start first poll immediately
    poll();

    // Setup interval
    const intervalId = setInterval(async () => {
      if (isOnline) {
        if (Date.now() >= nextRetryTimeRef.current) {
          poll();
        }
      }
    }, interval);

    pollingIntervalRef.current = intervalId;

    // Setup online/offline listeners
    if (onlineDetection) {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      clearInterval(intervalId);
      if (onlineDetection) {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [interval, onlineDetection, poll, handleOnline, handleOffline]);

  return {
    data,
    loading,
    error,
    lastSync,
    isOnline,
    retry
  };
}

export default usePolling;
