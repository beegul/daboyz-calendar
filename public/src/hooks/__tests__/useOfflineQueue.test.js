import { renderHook, act } from "@testing-library/react";
import { useOfflineQueue } from "../useOfflineQueue";
import { OFFLINE_QUEUE_STORAGE_KEY } from "../../utils/syncConfig";

global.fetch = jest.fn();

describe("useOfflineQueue retained regression", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
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

  test("persists queued actions and replays them with persona color metadata", async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    const { result } = renderHook(() => useOfflineQueue());

    act(() => {
      result.current.enqueue({
        type: "mark_available",
        personaName: "DEV",
        color: "#FF0000",
        date: "2026-07-01",
        value: true,
      });
    });

    const stored = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY));
    expect(stored).toHaveLength(1);
    expect(stored[0].color).toBe("#FF0000");

    await act(async () => {
      jest.advanceTimersByTime(1100);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/availability",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(result.current.queue).toHaveLength(0);
  });
});
