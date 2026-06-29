/**
 * Sync Configuration
 * 
 * Central constants for polling interval, retry logic, queue limits, and sync states.
 * Feature: 007-multi-user-sync-mobile-ux
 * Phase: 2 - Foundational Infrastructure
 */

/**
 * Polling Configuration
 */
export const POLLING_INTERVAL = 1000; // milliseconds (1 second)
export const POLLING_TIMEOUT = 2000; // milliseconds (request timeout)

/**
 * Retry Configuration
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  backoffMs: [1000, 2000, 4000, 8000] // Exponential backoff: 1s, 2s, 4s, 8s
};

/**
 * Offline Queue Configuration
 */
export const OFFLINE_QUEUE_MAX_SIZE = 100; // Maximum items in queue
export const OFFLINE_QUEUE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export const OFFLINE_QUEUE_STORAGE_KEY = 'daboyz_offline_queue_v1';

/**
 * Sync Status Constants
 */
export const SYNC_STATUS = {
  SYNCED: 'synced',
  SYNCING: 'syncing',
  ERROR: 'error',
  OFFLINE: 'offline'
};

/**
 * Offline Queue Item Types
 */
export const QUEUE_ITEM_TYPES = {
  MARK_AVAILABLE: 'mark_available',
  MARK_UNAVAILABLE: 'mark_unavailable',
  CREATE_PERSONA: 'create_persona',
  DELETE_PERSONA: 'delete_persona'
};

/**
 * Helper function: Get backoff delay for retry attempt
 * @param {number} retryCount - Current retry attempt (1, 2, 3, etc.)
 * @returns {number} Delay in milliseconds
 */
export function getRetryBackoff(retryCount) {
  const index = Math.min(retryCount - 1, RETRY_CONFIG.backoffMs.length - 1);
  return RETRY_CONFIG.backoffMs[index];
}

/**
 * Helper function: Calculate TTL expiration time
 * @param {number} baseTime - Timestamp to calculate TTL from (default: now)
 * @returns {number} Expiration timestamp in milliseconds
 */
export function calculateTTL(baseTime = Date.now()) {
  return baseTime + OFFLINE_QUEUE_TTL;
}

/**
 * Helper function: Check if item has expired
 * @param {object} item - Queue item with ttl field
 * @returns {boolean} true if expired, false if still valid
 */
export function isExpired(item) {
  return item.ttl < Date.now();
}

/**
 * Helper function: Format relative time for display
 * @param {number} timestamp - Milliseconds since epoch
 * @returns {string} Human-readable relative time (e.g., "10s ago")
 */
export function getRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
}

/**
 * Helper function: Generate UUID for queue items
 * Simple UUID v4 implementation (not cryptographically secure, but sufficient for queue IDs)
 * @returns {string} UUID string
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
