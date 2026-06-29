/**
 * Tests for useOfflineQueue Hook
 * Feature: 007-multi-user-sync-mobile-ux
 * Phase: 2 - Foundational Infrastructure
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useOfflineQueue } from '../useOfflineQueue';
import { OFFLINE_QUEUE_STORAGE_KEY, OFFLINE_QUEUE_MAX_SIZE, OFFLINE_QUEUE_TTL } from '../../utils/syncConfig';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useOfflineQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
    global.fetch.mockClear();
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Enqueue', () => {
    test('should enqueue a new item', () => {
      const { result } = renderHook(() => useOfflineQueue());

      act(() => {
        result.current.enqueue({
          type: 'mark_available',
          personaName: 'DEV',
          date: '2026-06-15',
          value: true
        });
      });

      expect(result.current.queue).toHaveLength(1);
      expect(result.current.queue[0].personaName).toBe('DEV');
      expect(result.current.queue[0].date).toBe('2026-06-15');
      expect(result.current.pendingCount).toBe(1);
    });

    test('should reject enqueue if queue is full', () => {
      const { result } = renderHook(() => useOfflineQueue());

      // Add max items
      for (let i = 0; i < OFFLINE_QUEUE_MAX_SIZE; i++) {
        act(() => {
          result.current.enqueue({
            type: 'mark_available',
            personaName: 'DEV',
            date: `2026-06-${String(i + 1).padStart(2, '0')}`,
            value: true
          });
        });
      }

      expect(result.current.queue).toHaveLength(OFFLINE_QUEUE_MAX_SIZE);

      // Try to add one more
      let success = true;
      act(() => {
        success = result.current.enqueue({
          type: 'mark_available',
          personaName: 'DEV',
          date: '2026-07-15',
          value: true
        });
      });

      expect(success).toBe(false);
      expect(result.current.queue).toHaveLength(OFFLINE_QUEUE_MAX_SIZE);
    });

    test('should persist enqueued items to localStorage', () => {
      const { result } = renderHook(() => useOfflineQueue());

      act(() => {
        result.current.enqueue({
          type: 'mark_available',
          personaName: 'DEV',
          date: '2026-06-15',
          value: true
        });
      });

      const stored = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY));
      expect(stored).toHaveLength(1);
      expect(stored[0].personaName).toBe('DEV');
    });
  });

  describe('Dequeue', () => {
    test('should remove item from queue', () => {
      const { result } = renderHook(() => useOfflineQueue());

      let itemId;

      act(() => {
        result.current.enqueue({
          type: 'mark_available',
          personaName: 'DEV',
          date: '2026-06-15',
          value: true
        });
        itemId = result.current.queue[0].id;
      });

      expect(result.current.queue).toHaveLength(1);

      act(() => {
        result.current.dequeue(itemId);
      });

      expect(result.current.queue).toHaveLength(0);
    });

    test('should update localStorage when dequeuing', () => {
      const { result } = renderHook(() => useOfflineQueue());

      let itemId;

      act(() => {
        result.current.enqueue({
          type: 'mark_available',
          personaName: 'DEV',
          date: '2026-06-15',
          value: true
        });
        itemId = result.current.queue[0].id;
      });

      act(() => {
        result.current.dequeue(itemId);
      });

      const stored = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY));
      expect(stored).toHaveLength(0);
    });
  });

  describe('Clear', () => {
    test('should clear entire queue', () => {
      const { result } = renderHook(() => useOfflineQueue());

      act(() => {
        result.current.enqueue({
          type: 'mark_available',
          personaName: 'DEV',
          date: '2026-06-15',
          value: true
        });
        result.current.enqueue({
          type: 'mark_unavailable',
          personaName: 'DEV',
          date: '2026-06-16',
          value: false
        });
      });

      expect(result.current.queue).toHaveLength(2);

      act(() => {
        result.current.clear();
      });

      expect(result.current.queue).toHaveLength(0);
      expect(localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY)).toBeNull();
    });
  });

  describe('Persistence', () => {
    test('should load queue from localStorage on mount', () => {
      const storedQueue = [
        {
          id: 'test-id-1',
          type: 'mark_available',
          personaName: 'DEV',
          date: '2026-06-15',
          value: true,
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          ttl: Date.now() + OFFLINE_QUEUE_TTL,
          nextRetryTime: Date.now()
        }
      ];

      localStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(storedQueue));

      const { result } = renderHook(() => useOfflineQueue());

      expect(result.current.queue).toHaveLength(1);
      expect(result.current.queue[0].id).toBe('test-id-1');
    });

    test('should filter out expired items on load', () => {
      const now = Date.now();
      const expiredQueue = [
        {
          id: 'expired',
          type: 'mark_available',
          personaName: 'DEV',
          date: '2026-06-15',
          value: true,
          timestamp: now - OFFLINE_QUEUE_TTL - 1000,
          retryCount: 0,
          maxRetries: 3,
          ttl: now - 1000, // Expired
          nextRetryTime: now
        },
        {
          id: 'valid',
          type: 'mark_available',
          personaName: 'DEV',
          date: '2026-06-16',
          value: true,
          timestamp: now,
          retryCount: 0,
          maxRetries: 3,
          ttl: now + OFFLINE_QUEUE_TTL,
          nextRetryTime: now
        }
      ];

      localStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(expiredQueue));

      const { result } = renderHook(() => useOfflineQueue());

      expect(result.current.queue).toHaveLength(1);
      expect(result.current.queue[0].id).toBe('valid');
    });
  });

  describe('Online/Offline Detection', () => {
    test('should detect online status', () => {
      const { result } = renderHook(() => useOfflineQueue());

      expect(result.current.isOnline).toBe(true);

      act(() => {
        Object.defineProperty(window.navigator, 'onLine', { value: false });
        window.dispatchEvent(new Event('offline'));
      });

      expect(result.current.isOnline).toBe(false);
    });

    test('should resume online status', () => {
      Object.defineProperty(window.navigator, 'onLine', { value: false });
      const { result } = renderHook(() => useOfflineQueue());

      expect(result.current.isOnline).toBe(false);

      act(() => {
        Object.defineProperty(window.navigator, 'onLine', { value: true });
        window.dispatchEvent(new Event('online'));
      });

      expect(result.current.isOnline).toBe(true);
    });
  });

  describe('Retry Logic', () => {
    test('should retry failed items when online', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const { result } = renderHook(() => useOfflineQueue());

      act(() => {
        result.current.enqueue({
          type: 'mark_available',
          personaName: 'DEV',
          date: '2026-06-15',
          value: true
        });
      });

      expect(result.current.queue).toHaveLength(1);
      expect(result.current.queue[0].retryCount).toBe(0);

      // Simulate failure
      jest.advanceTimersByTime(100);

      expect(result.current.queue[0].retryCount).toBeGreaterThanOrEqual(0);

      // Wait for retry
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        // After retry succeeds, item should be dequeued
        expect(result.current.queue).toHaveLength(0);
      });
    });

    test('should increment retry count on failure', () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useOfflineQueue());

      act(() => {
        result.current.enqueue({
          type: 'mark_available',
          personaName: 'DEV',
          date: '2026-06-15',
          value: true
        });
      });

      const initialRetryCount = result.current.queue[0].retryCount;

      jest.advanceTimersByTime(1000);

      expect(result.current.queue[0].retryCount).toBeGreaterThan(initialRetryCount);
    });
  });

  describe('Pending Count', () => {
    test('should track pending count', () => {
      const { result } = renderHook(() => useOfflineQueue());

      expect(result.current.pendingCount).toBe(0);

      act(() => {
        result.current.enqueue({
          type: 'mark_available',
          personaName: 'DEV',
          date: '2026-06-15',
          value: true
        });
      });

      expect(result.current.pendingCount).toBe(1);

      act(() => {
        result.current.enqueue({
          type: 'mark_available',
          personaName: 'DEV',
          date: '2026-06-16',
          value: true
        });
      });

      expect(result.current.pendingCount).toBe(2);
    });
  });

  describe('Queue Item Types', () => {
    test('should enqueue different item types', () => {
      const { result } = renderHook(() => useOfflineQueue());

      const types = [
        { type: 'mark_available', personaName: 'DEV', date: '2026-06-15', value: true },
        { type: 'mark_unavailable', personaName: 'DEV', date: '2026-06-15', value: false },
        { type: 'create_persona', personaName: 'DESIGNER', value: 'blue' },
        { type: 'delete_persona', personaName: 'MANAGER' }
      ];

      act(() => {
        types.forEach(itemType => {
          result.current.enqueue(itemType);
        });
      });

      expect(result.current.queue).toHaveLength(4);
      expect(result.current.queue[0].type).toBe('mark_available');
      expect(result.current.queue[1].type).toBe('mark_unavailable');
      expect(result.current.queue[2].type).toBe('create_persona');
      expect(result.current.queue[3].type).toBe('delete_persona');
    });
  });
});
