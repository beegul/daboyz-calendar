import { renderHook, act, waitFor } from "@testing-library/react";
import { useAvailability } from "../useAvailability";

jest.mock("../useIdleTimeout", () => ({
  useIdleTimeout: jest.fn(() => ({
    isIdle: false,
    lastActivityTime: Date.now(),
    resetIdleTimer: jest.fn(),
    idleThresholdMs: 600000,
  })),
}));

jest.mock("../../api/mock", () => ({
  mockAPI: {
    getAvailability: jest.fn(() => Promise.resolve({ entries: [] })),
    toggleAvailability: jest.fn(),
    deleteAvailability: jest.fn(),
  },
}));

global.fetch = jest.fn();

describe("useAvailability sync regression", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });

    Object.defineProperty(document, "visibilityState", {
      writable: true,
      value: "visible",
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("fetches for the selected month and returns entries", async () => {
    const { result } = renderHook(() => useAvailability("2026-07"));

    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("month=2026-07"),
        expect.any(Object),
      );
    });

    expect(Array.isArray(result.current.entries)).toBe(true);
  });

  test("polls aggressively while visible and active", async () => {
    renderHook(() => useAvailability("2026-07"));

    act(() => {
      jest.advanceTimersByTime(600);
    });

    const initialCalls = global.fetch.mock.calls.length;

    act(() => {
      jest.advanceTimersByTime(2100);
    });

    await waitFor(() => {
      expect(global.fetch.mock.calls.length).toBeGreaterThan(initialCalls);
    });
  });

  test("stops polling when tab becomes hidden", async () => {
    renderHook(() => useAvailability("2026-07"));

    act(() => {
      jest.advanceTimersByTime(600);
      document.visibilityState = "hidden";
      document.dispatchEvent(new Event("visibilitychange"));
    });

    const hiddenCalls = global.fetch.mock.calls.length;

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(global.fetch.mock.calls.length).toBeLessThanOrEqual(hiddenCalls + 1);
  });

  test("falls back to mock API when fetch fails", async () => {
    const { mockAPI } = require("../../api/mock");
    global.fetch.mockRejectedValue(new Error("Network down"));

    renderHook(() => useAvailability("2026-07"));

    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(mockAPI.getAvailability).toHaveBeenCalled();
    });
  });
});
