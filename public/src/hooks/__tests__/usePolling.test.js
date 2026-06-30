import { renderHook, act, waitFor } from "@testing-library/react";
import { usePolling } from "../usePolling";

global.fetch = jest.fn();

describe("usePolling retained regression", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("polls while online and resumes after offline event", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: [{ name: "DEV", color: "#FF0000" }] }),
    });

    const { result } = renderHook(() => usePolling("/api/users", { interval: 1000 }));

    await waitFor(() => {
      expect(result.current.data).toBeTruthy();
    });

    const callsAfterFirstPoll = global.fetch.mock.calls.length;

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(global.fetch.mock.calls.length).toBeGreaterThan(callsAfterFirstPoll);

    act(() => {
      Object.defineProperty(window.navigator, "onLine", { value: false });
      window.dispatchEvent(new Event("offline"));
      jest.advanceTimersByTime(1000);
    });

    const callsWhileOffline = global.fetch.mock.calls.length;

    act(() => {
      Object.defineProperty(window.navigator, "onLine", { value: true });
      window.dispatchEvent(new Event("online"));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
      expect(global.fetch.mock.calls.length).toBeGreaterThanOrEqual(callsWhileOffline + 1);
    });
  });
});
