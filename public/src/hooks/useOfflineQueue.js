/**
 * useOfflineQueue Hook
 * 
 * Manages offline action queue with localStorage persistence, auto-retry, and TTL enforcement.
 * 
 * Feature: 007-multi-user-sync-mobile-ux
 * Phase: 2 - Foundational Infrastructure
 * Contract: contracts/offline-queue-interface.md
 */

import { useEffect, useState, useCallback } from 'react';
import {
  OFFLINE_QUEUE_STORAGE_KEY,
  OFFLINE_QUEUE_MAX_SIZE,
  QUEUE_ITEM_TYPES,
  getRetryBackoff,
  calculateTTL,
  isExpired,
  generateUUID
} from '../utils/syncConfig';

/**
 * @typedef {Object} OfflineQueueItem
 * @property {string} id - UUID
 * @property {string} type - 'mark_available' | 'mark_unavailable' | 'create_persona' | 'delete_persona'
 * @property {string} personaName - Target persona name
 * @property {string|null} date - YYYY-MM-DD or null for persona operations
 * @property {boolean|null} value - true/false for availability; null for persona operations
 * @property {number} timestamp - When enqueued (ms since epoch)
 * @property {number} retryCount - Current retry attempt
 * @property {number} maxRetries - Maximum retries (always 3)
 * @property {number} ttl - Expiration timestamp
 * @property {number} nextRetryTime - When to retry next
 */

/**
 * @typedef {Object} OfflineQueueResult
 * @property {OfflineQueueItem[]} queue - Current queue
 * @property {Function} enqueue - Add item to queue
 * @property {Function} dequeue - Remove item from queue
 * @property {Function} clear - Clear entire queue
 * @property {boolean} isOnline - true if network available
 * @property {number} pendingCount - Number of pending items
 */

/**
 * Custom hook for managing offline action queue
 * 
 * @returns {OfflineQueueResult} Queue state and methods
 */
export function useOfflineQueue() {
  const [queue, setQueue] = useState(() => loadQueueFromStorage());
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [pendingCount, setPendingCount] = useState(queue.length);

  /**
   * Load queue from localStorage and filter expired items
   */
  function loadQueueFromStorage() {
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY);
      if (!stored) return [];

      const items = JSON.parse(stored);

      // Filter out expired items
      const valid = items.filter(item => !isExpired(item));

      // If any items were filtered out, update localStorage
      if (valid.length !== items.length) {
        localStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(valid));
      }

      return valid;
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      return [];
    }
  }

  /**
   * Persist queue to localStorage
   */
  function persistQueueToStorage(newQueue) {
    try {
      localStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(newQueue));
    } catch (error) {
      console.error('Failed to persist offline queue:', error);
    }
  }

  /**
   * Enqueue a new action
   */
  const enqueue = useCallback((itemInput) => {
    let wasEnqueued = false;
    
    setQueue((prevQueue) => {
      // Check size limit
      if (prevQueue.length >= OFFLINE_QUEUE_MAX_SIZE) {
        console.warn('Offline queue is full');
        return prevQueue; // Return unchanged
      }

      const newItem = {
        id: generateUUID(),
        type: itemInput.type,
        personaName: itemInput.personaName,
        date: itemInput.date || null,
        value: itemInput.value !== undefined ? itemInput.value : null,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 3,
        ttl: calculateTTL(),
        nextRetryTime: Date.now() // Ready for immediate retry
      };

      const newQueue = [...prevQueue, newItem];
      persistQueueToStorage(newQueue);
      setPendingCount(newQueue.length);
      wasEnqueued = true;

      return newQueue;
    });

    return wasEnqueued;
  }, []);

  /**
   * Dequeue an item (remove after successful sync)
   */
  const dequeue = useCallback((id) => {
    setQueue((prevQueue) => {
      const newQueue = prevQueue.filter(item => item.id !== id);
      persistQueueToStorage(newQueue);
      setPendingCount(newQueue.length);
      return newQueue;
    });
  }, []);

  /**
   * Clear entire queue
   */
  const clear = useCallback(() => {
    setQueue([]);
    setPendingCount(0);
    localStorage.removeItem(OFFLINE_QUEUE_STORAGE_KEY);
  }, []);

  /**
   * Handle online event
   */
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    // Retry loop will be triggered by isOnline state change
  }, []);

  /**
   * Handle offline event
   */
  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  /**
   * Attempt to send a queued item
   */
  const sendQueueItem = useCallback(async (item) => {
    let endpoint = '';
    let method = 'POST';
    let body = null;

    try {
      switch (item.type) {
        case QUEUE_ITEM_TYPES.MARK_AVAILABLE:
        case QUEUE_ITEM_TYPES.MARK_UNAVAILABLE:
          endpoint = '/api/availability';
          body = {
            personaName: item.personaName,
            date: item.date,
            available: item.value
          };
          break;

        case QUEUE_ITEM_TYPES.CREATE_PERSONA:
          endpoint = '/api/users';
          body = {
            name: item.personaName,
            color: item.value // Color stored in value field for create_persona
          };
          break;

        case QUEUE_ITEM_TYPES.DELETE_PERSONA:
          endpoint = `/api/personas/${item.personaName}`;
          method = 'DELETE';
          break;

        default:
          throw new Error(`Unknown queue item type: ${item.type}`);
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'DELETE' ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return true; // Success
    } catch (error) {
      console.error(`Failed to send queue item ${item.id}:`, error);
      return false; // Failure
    }
  }, []);

  /**
   * Retry loop: Process pending items when online
   */
  useEffect(() => {
    if (!isOnline || queue.length === 0) {
      return;
    }

    const retryLoop = async () => {
      for (const item of queue) {
        const now = Date.now();

        // Skip if not ready to retry yet
        if (now < item.nextRetryTime) {
          continue;
        }

        // Skip if already exhausted retries
        if (item.retryCount >= item.maxRetries) {
          continue;
        }

        // Attempt to send
        const success = await sendQueueItem(item);

        if (success) {
          // Remove from queue
          dequeue(item.id);
        } else {
          // Increment retry count and schedule next retry
          setQueue((prevQueue) => {
            const updated = prevQueue.map((qItem) => {
              if (qItem.id === item.id) {
                return {
                  ...qItem,
                  retryCount: qItem.retryCount + 1,
                  nextRetryTime: now + getRetryBackoff(qItem.retryCount + 1)
                };
              }
              return qItem;
            });
            persistQueueToStorage(updated);
            return updated;
          });
        }
      }
    };

    // Run retry loop immediately
    retryLoop();

    // Also run periodically in case items are ready
    const retryInterval = setInterval(retryLoop, 1000);

    return () => clearInterval(retryInterval);
  }, [isOnline, queue, dequeue, sendQueueItem]);

  /**
   * Setup online/offline listeners
   */
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  /**
   * Update pending count when queue changes
   */
  useEffect(() => {
    setPendingCount(queue.length);
  }, [queue]);

  return {
    queue,
    enqueue,
    dequeue,
    clear,
    isOnline,
    pendingCount
  };
}

export default useOfflineQueue;
