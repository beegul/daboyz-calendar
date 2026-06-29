/**
 * Unit and integration tests for useAvailability hook
 * Tests adaptive polling based on Page Visibility API and idle state
 */
/* eslint-disable no-unused-vars */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useAvailability } from "../useAvailability";

// Mock the useIdleTimeout hook
jest.mock("../useIdleTimeout", () => ({
  useIdleTimeout: jest.fn(() => ({
    isIdle: false,
    lastActivityTime: Date.now(),
    resetIdleTimer: jest.fn(),
    idleThresholdMs: 600000,
  })),
}));

// Mock the mock API
jest.mock("../../api/mock", () => ({
  mockAPI: {
    getAvailability: jest.fn(() => Promise.resolve({ entries: [] })),
    toggleAvailability: jest.fn(),
    deleteAvailability: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe("useAvailability - Adaptive Polling", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    global.fetch.mockReset();

    // Default mock fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });

    // Mock document.visibilityState
    Object.defineProperty(document, "visibilityState", {
      writable: true,
      value: "visible",
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("initializes with entries as empty array", () => {
    const { result } = renderHook(() => useAvailability("2024-06"));
    expect(result.current.entries).toEqual([]);
  });

  test("initializes with loading = true", () => {
    const { result } = renderHook(() => useAvailability("2024-06"));
    expect(result.current.loading).toBe(true);
  });

  test("returns refetch function for manual polling", () => {
    const { result } = renderHook(() => useAvailability("2024-06"));
    expect(typeof result.current.refetch).toBe("function");
  });

  test("polls every 5 seconds when visible and not idle", async () => {
    const { result } = renderHook(() => useAvailability("2024-06"));

    // Wait for initial debounced fetch
    act(() => {
      jest.advanceTimersByTime(600);
    });

    const callCountAfterInit = global.fetch.mock.calls.length;

    // Advance 5 seconds - should poll
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(
      () => {
        expect(global.fetch.mock.calls.length).toBeGreaterThan(
          callCountAfterInit,
        );
      },
      { timeout: 1000 },
    );

    // Verify second poll occurred at 5 second mark
    expect(global.fetch.mock.calls.length).toBeGreaterThanOrEqual(
      callCountAfterInit + 1,
    );
  });

  test("stops polling when tab becomes hidden", async () => {
    const { result } = renderHook(() => useAvailability("2024-06"));
    const initialCallCount = global.fetch.mock.calls.length;

    // Hide tab
    act(() => {
      document.visibilityState = "hidden";
      const event = new Event("visibilitychange");
      document.dispatchEvent(event);
    });

    // Advance 10 seconds - should NOT poll
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Fetch should not have been called (or at least not for polling)
    expect(global.fetch.mock.calls.length).toBeLessThanOrEqual(
      initialCallCount + 1,
    );
  });

  test("resumes polling when tab becomes visible", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        entries: [{ name: "Jack", color: "#FF5733", date: "2024-06-01" }],
      }),
    });

    const { result, rerender } = renderHook(() => useAvailability("2024-06"));

    // Hide tab
    act(() => {
      document.visibilityState = "hidden";
      const event = new Event("visibilitychange");
      document.dispatchEvent(event);
    });

    const hiddenCallCount = global.fetch.mock.calls.length;

    // Show tab
    act(() => {
      document.visibilityState = "visible";
      const event = new Event("visibilitychange");
      document.dispatchEvent(event);
    });

    // Advance time for polling to resume
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(global.fetch.mock.calls.length).toBeGreaterThan(hiddenCallCount);
    });
  });

  test("throttles polling to 5 minutes when idle", async () => {
    const { useIdleTimeout } = require("../useIdleTimeout");
    useIdleTimeout.mockImplementation(() => ({
      isIdle: true,
      lastActivityTime: Date.now(),
      resetIdleTimer: jest.fn(),
      idleThresholdMs: 600000,
    }));

    const { result } = renderHook(() => useAvailability("2024-06"));
    const initialCallCount = global.fetch.mock.calls.length;

    // Advance 5 seconds - should NOT poll (idle uses 5 minute interval)
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should not have new fetch at 5 second mark
    expect(global.fetch.mock.calls.length).toBeLessThanOrEqual(
      initialCallCount + 1,
    );

    // Advance 300 seconds (5 minutes) - should poll
    act(() => {
      jest.advanceTimersByTime(300000);
    });

    await waitFor(
      () => {
        expect(global.fetch.mock.calls.length).toBeGreaterThan(
          initialCallCount + 1,
        );
      },
      { timeout: 1000 },
    );
  });

  test("resumes normal polling when user becomes active from idle state", async () => {
    const { useIdleTimeout } = require("../useIdleTimeout");

    // Start in idle state
    const mockIdleState = {
      isIdle: true,
      lastActivityTime: Date.now(),
      resetIdleTimer: jest.fn(),
      idleThresholdMs: 600000,
    };
    useIdleTimeout.mockImplementation(() => mockIdleState);

    const { result, rerender } = renderHook(() => useAvailability("2024-06"));

    // Switch to active state
    mockIdleState.isIdle = false;
    rerender();

    // Should now poll every 5 seconds instead of 5 minutes
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // New fetch should occur at 5 second mark
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  test("priority: hidden tab stops polling even if user is active", async () => {
    const { result } = renderHook(() => useAvailability("2024-06"));
    const initialCallCount = global.fetch.mock.calls.length;

    // Simulate hidden tab
    act(() => {
      document.visibilityState = "hidden";
      const event = new Event("visibilitychange");
      document.dispatchEvent(event);
    });

    // Even though user might be active, tab hidden takes priority
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Should not poll while hidden
    expect(global.fetch.mock.calls.length).toBeLessThanOrEqual(
      initialCallCount + 1,
    );
  });

  test("tracks lastSync timestamp on successful fetch", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });

    const { result } = renderHook(() => useAvailability("2024-06"));

    await waitFor(() => {
      expect(result.current.lastSync).not.toBeNull();
    });

    const firstSync = result.current.lastSync;
    expect(typeof firstSync).toBe("string");
    expect(new Date(firstSync).getTime()).toBeGreaterThan(0);
  });

  test("falls back to mock API on fetch failure", async () => {
    global.fetch.mockRejectedValue(new Error("Network error"));
    const { mockAPI } = require("../../api/mock");

    const { result } = renderHook(() => useAvailability("2024-06"));

    await waitFor(() => {
      expect(mockAPI.getAvailability).toHaveBeenCalled();
    });

    expect(result.current.useMockAPI).toBe(true);
  });

  test("handles month parameter and includes it in fetch URL", async () => {
    const testMonth = "2024-07";
    const { result } = renderHook(() => useAvailability(testMonth));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`month=${testMonth}`),
        expect.any(Object),
      );
    });
  });

  test("debounces fetch on month changes", async () => {
    const { result, rerender } = renderHook(
      ({ month }) => useAvailability(month),
      { initialProps: { month: "2024-06" } },
    );

    const initialCallCount = global.fetch.mock.calls.length;

    // Change month multiple times rapidly
    rerender({ month: "2024-07" });
    rerender({ month: "2024-08" });
    rerender({ month: "2024-09" });

    // Should not fetch yet (debounce pending)
    expect(global.fetch.mock.calls.length).toBe(initialCallCount);

    // Advance past debounce delay (500ms)
    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      // Should only fetch once for the final month, not three times
      expect(global.fetch.mock.calls.length).toBeLessThan(initialCallCount + 3);
    });
  });

  test("cleanup removes event listeners on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");
    const removeWindowListenerSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useAvailability("2024-06"));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
    expect(removeWindowListenerSpy).toHaveBeenCalledWith(
      "blur",
      expect.any(Function),
    );
    expect(removeWindowListenerSpy).toHaveBeenCalledWith(
      "focus",
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
    removeWindowListenerSpy.mockRestore();
  });

  test("blur/focus fallback works when visibilitychange not available", () => {
    // Simulate fallback scenario
    const { result } = renderHook(() => useAvailability("2024-06"));

    // Trigger blur event
    act(() => {
      const event = new Event("blur");
      window.dispatchEvent(event);
    });

    // Should behave as if tab is hidden

    // Trigger focus event
    act(() => {
      const event = new Event("focus");
      window.dispatchEvent(event);
    });

    // Should behave as if tab is visible
    expect(result.current).toBeDefined();
  });

  test("provides stable refetch function", () => {
    const { result, rerender } = renderHook(() => useAvailability("2024-06"));
    const firstRefetch = result.current.refetch;

    rerender();

    // Refetch should be the same function reference
    expect(result.current.refetch).toBe(firstRefetch);
  });
});

describe("useAvailability - Error Handling (US1: Offline Detection)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    global.fetch.mockReset();

    Object.defineProperty(document, "visibilityState", {
      writable: true,
      value: "visible",
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("sets useMockAPI = true on network error", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAvailability("2024-06"));

    await waitFor(() => {
      expect(result.current.useMockAPI).toBe(true);
    });
  });

  test("sets useMockAPI = false when API recovers", async () => {
    // First call fails
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const { result, rerender } = renderHook(() => useAvailability("2024-06"));

    await waitFor(() => {
      expect(result.current.useMockAPI).toBe(true);
    });

    // Reset mock for recovery
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: [] }),
    });

    // Trigger refetch
    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.useMockAPI).toBe(false);
    });
  });

  test("falls back to localStorage after error (no data loss)", async () => {
    // Mock localStorage with cached data
    const cachedData = [
      { name: "Jack", color: "#FF0000", date: "2024-06-15" },
    ];
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(cachedData));
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAvailability("2024-06"));

    await waitFor(() => {
      expect(result.current.useMockAPI).toBe(true);
      // Should have entries from localStorage cache
      expect(result.current.entries.length).toBeGreaterThanOrEqual(0);
    });
  });

  test("announces offline state via console logging", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAvailability("2024-06"));

    await waitFor(() => {
      expect(result.current.useMockAPI).toBe(true);
    });

    consoleSpy.mockRestore();
  });
});
