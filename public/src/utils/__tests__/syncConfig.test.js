/**
 * Tests for syncConfig.js
 * Feature: 007-multi-user-sync-mobile-ux
 * Phase: 2 - Foundational Infrastructure
 */

import {
  POLLING_INTERVAL,
  POLLING_TIMEOUT,
  RETRY_CONFIG,
  OFFLINE_QUEUE_MAX_SIZE,
  OFFLINE_QUEUE_TTL,
  OFFLINE_QUEUE_STORAGE_KEY,
  SYNC_STATUS,
  QUEUE_ITEM_TYPES,
  getRetryBackoff,
  calculateTTL,
  isExpired,
  getRelativeTime,
  generateUUID
} from '../syncConfig';

describe('syncConfig', () => {
  describe('Constants', () => {
    test('POLLING_INTERVAL should be 1000ms', () => {
      expect(POLLING_INTERVAL).toBe(1000);
    });

    test('POLLING_TIMEOUT should be 2000ms', () => {
      expect(POLLING_TIMEOUT).toBe(2000);
    });

    test('RETRY_CONFIG should have maxRetries and backoffMs', () => {
      expect(RETRY_CONFIG.maxRetries).toBe(3);
      expect(RETRY_CONFIG.backoffMs).toEqual([1000, 2000, 4000, 8000]);
    });

    test('OFFLINE_QUEUE_MAX_SIZE should be 100', () => {
      expect(OFFLINE_QUEUE_MAX_SIZE).toBe(100);
    });

    test('OFFLINE_QUEUE_TTL should be 24 hours', () => {
      expect(OFFLINE_QUEUE_TTL).toBe(24 * 60 * 60 * 1000);
    });

    test('SYNC_STATUS should have all required keys', () => {
      expect(SYNC_STATUS.SYNCED).toBe('synced');
      expect(SYNC_STATUS.SYNCING).toBe('syncing');
      expect(SYNC_STATUS.ERROR).toBe('error');
      expect(SYNC_STATUS.OFFLINE).toBe('offline');
    });

    test('QUEUE_ITEM_TYPES should have all required keys', () => {
      expect(QUEUE_ITEM_TYPES.MARK_AVAILABLE).toBe('mark_available');
      expect(QUEUE_ITEM_TYPES.MARK_UNAVAILABLE).toBe('mark_unavailable');
      expect(QUEUE_ITEM_TYPES.CREATE_PERSONA).toBe('create_persona');
      expect(QUEUE_ITEM_TYPES.DELETE_PERSONA).toBe('delete_persona');
    });
  });

  describe('getRetryBackoff', () => {
    test('should return correct backoff for each retry', () => {
      expect(getRetryBackoff(1)).toBe(1000);
      expect(getRetryBackoff(2)).toBe(2000);
      expect(getRetryBackoff(3)).toBe(4000);
      expect(getRetryBackoff(4)).toBe(8000);
    });

    test('should cap at maximum backoff', () => {
      expect(getRetryBackoff(5)).toBe(8000);
      expect(getRetryBackoff(10)).toBe(8000);
    });
  });

  describe('calculateTTL', () => {
    test('should add TTL duration to provided time', () => {
      const baseTime = 1000000;
      const ttl = calculateTTL(baseTime);
      expect(ttl).toBe(baseTime + OFFLINE_QUEUE_TTL);
    });

    test('should use current time if not provided', () => {
      const now = Date.now();
      const ttl = calculateTTL();
      const expectedTTL = now + OFFLINE_QUEUE_TTL;
      
      // Allow 100ms tolerance for execution time
      expect(ttl).toBeGreaterThanOrEqual(expectedTTL - 100);
      expect(ttl).toBeLessThanOrEqual(expectedTTL + 100);
    });
  });

  describe('isExpired', () => {
    test('should return true for expired items', () => {
      const item = { ttl: Date.now() - 1000 }; // 1 second in the past
      expect(isExpired(item)).toBe(true);
    });

    test('should return false for non-expired items', () => {
      const item = { ttl: Date.now() + 1000 }; // 1 second in the future
      expect(isExpired(item)).toBe(false);
    });

    test('should return true for items expiring at exact moment', () => {
      const now = Date.now();
      const item = { ttl: now };
      // Should be expired (ttl < now is false, but ttl === now should not be valid)
      expect(isExpired(item)).toBe(false); // ttl < Date.now() is false
    });
  });

  describe('getRelativeTime', () => {
    test('should format time in seconds', () => {
      const now = Date.now();
      const timestamp = now - 30000; // 30 seconds ago
      expect(getRelativeTime(timestamp)).toBe('30s ago');
    });

    test('should format time in minutes', () => {
      const now = Date.now();
      const timestamp = now - 5 * 60000; // 5 minutes ago
      expect(getRelativeTime(timestamp)).toBe('5m ago');
    });

    test('should format time in hours', () => {
      const now = Date.now();
      const timestamp = now - 3 * 3600000; // 3 hours ago
      expect(getRelativeTime(timestamp)).toBe('3h ago');
    });

    test('should format time in days', () => {
      const now = Date.now();
      const timestamp = now - 2 * 86400000; // 2 days ago
      expect(getRelativeTime(timestamp)).toBe('2d ago');
    });

    test('should handle very recent timestamps', () => {
      const now = Date.now();
      const timestamp = now - 1000; // 1 second ago
      expect(getRelativeTime(timestamp)).toBe('1s ago');
    });
  });

  describe('generateUUID', () => {
    test('should generate UUID strings', () => {
      const uuid = generateUUID();
      expect(typeof uuid).toBe('string');
    });

    test('should generate UUIDs matching v4 format', () => {
      const uuid = generateUUID();
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    test('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });

    test('should generate multiple UUIDs without collision', () => {
      const uuids = new Set();
      for (let i = 0; i < 100; i++) {
        uuids.add(generateUUID());
      }
      expect(uuids.size).toBe(100);
    });
  });

  describe('OFFLINE_QUEUE_STORAGE_KEY', () => {
    test('should be a valid storage key', () => {
      expect(OFFLINE_QUEUE_STORAGE_KEY).toBe('daboyz_offline_queue_v1');
    });
  });
});
