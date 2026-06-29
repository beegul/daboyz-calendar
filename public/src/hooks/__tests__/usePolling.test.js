/**
 * Tests for usePolling Hook
 * Feature: 007-multi-user-sync-mobile-ux
 * Phase: 2 - Foundational Infrastructure
 */

import { renderHook, waitFor } from '@testing-library/react';
import { usePolling } from '../usePolling';

// Mock fetch
global.fetch = jest.fn();

describe('usePolling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    global.fetch.mockClear();
    // Mock navigator.onLine
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Happy Path', () => {
    test('should fetch and return data on successful poll', async () => {
      const mockData = { personas: ['DEV', 'MANAGER'] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const { result } = renderHook(() => usePolling('/api/users'));

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.lastSync).toBeGreaterThan(0);
      expect(result.current.isOnline).toBe(true);
    });

    test('should poll at regular intervals', async () => {
      const mockData = { personas: ['DEV'] };
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      renderHook(() => usePolling('/api/users'));

      // Initial poll
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Advance timer by 1 second (polling interval)
      jest.advanceTimersByTime(1000);

      expect(global.fetch).toHaveBeenCalledTimes(2);

      jest.advanceTimersByTime(1000);

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    test('should clear error on successful retry', async () => {
      const mockData = { personas: ['DEV'] };

      // First call fails
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      // Second call succeeds
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const { result } = renderHook(() => usePolling('/api/users'));

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // Manually retry
      result.current.retry();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.data).toEqual(mockData);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle fetch errors', async () => {
      const errorMsg = 'Network error';
      global.fetch.mockRejectedValueOnce(new Error(errorMsg));

      const { result } = renderHook(() => usePolling('/api/users'));

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
        expect(result.current.error.message).toContain(errorMsg);
      });
    });

    test('should handle non-2xx responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const { result } = renderHook(() => usePolling('/api/users'));

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
        expect(result.current.error.message).toContain('500');
      });
    });

    test('should handle timeout', async () => {
      global.fetch.mockImplementationOnce(
        () => new Promise(resolve => {
          // Never resolve (timeout)
          setTimeout(() => resolve({ ok: true }), 5000);
        })
      );

      const { result } = renderHook(() => usePolling('/api/users', { timeout: 500 }));

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
        expect(result.current.error.message).toContain('timeout');
      }, { timeout: 1000 });
    });
  });

  describe('Offline Detection', () => {
    test('should detect offline status', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ personas: [] })
      });

      const { result } = renderHook(() => usePolling('/api/users'));

      expect(result.current.isOnline).toBe(true);

      // Simulate offline
      Object.defineProperty(window.navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });
    });

    test('should not poll when offline', async () => {
      Object.defineProperty(window.navigator, 'onLine', { value: false });

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ personas: [] })
      });

      renderHook(() => usePolling('/api/users'));

      // Should not fetch when offline
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('should resume polling when coming online', async () => {
      Object.defineProperty(window.navigator, 'onLine', { value: false });

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ personas: ['DEV'] })
      });

      const { result } = renderHook(() => usePolling('/api/users'));

      expect(global.fetch).not.toHaveBeenCalled();

      // Simulate online
      Object.defineProperty(window.navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Retry Logic', () => {
    test('should retry failed requests with backoff', async () => {
      global.fetch
        .mockRejectedValueOnce(new Error('Failed'))
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ personas: ['DEV'] })
        });

      const { result } = renderHook(() =>
        usePolling('/api/users', {
          interval: 100,
          retryConfig: { maxRetries: 3, backoffMs: [100, 200, 300] }
        })
      );

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // First retry after 100ms
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      // Second retry after 200ms more
      jest.advanceTimersByTime(200);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(3);
      });

      // Third call should succeed
      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.data).toEqual({ personas: ['DEV'] });
      });
    });
  });

  describe('Loading State', () => {
    test('should set loading during fetch', async () => {
      global.fetch.mockImplementationOnce(
        () => new Promise(resolve => {
          // Delay resolution
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ personas: [] })
            });
          }, 100);
        })
      );

      const { result } = renderHook(() => usePolling('/api/users'));

      expect(result.current.loading).toBe(true);

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Cleanup', () => {
    test('should cleanup on unmount', () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ personas: [] })
      });

      const { unmount } = renderHook(() => usePolling('/api/users'));

      const initialFetchCount = global.fetch.mock.calls.length;

      unmount();

      // Advance timers after unmount
      jest.advanceTimersByTime(2000);

      // Fetch should not be called again
      expect(global.fetch.mock.calls.length).toBe(initialFetchCount);
    });
  });
});
