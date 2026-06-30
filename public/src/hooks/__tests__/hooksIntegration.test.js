import { renderHook, act } from "@testing-library/react";
import { useOfflineQueue } from "../useOfflineQueue";

describe("Offline recovery integration lanes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  test("replays orphaned queued availability actions after reconnect", async () => {
    const { result } = renderHook(() => useOfflineQueue());

    act(() => {
      Object.defineProperty(window.navigator, "onLine", { value: false });
      window.dispatchEvent(new Event("offline"));
      result.current.enqueue({
        type: "mark_available",
        personaName: "DEV",
        color: "#FF0000",
        date: "2026-07-01",
        value: true,
      });
    });

    expect(result.current.pendingCount).toBe(1);

    await act(async () => {
      Object.defineProperty(window.navigator, "onLine", { value: true });
      window.dispatchEvent(new Event("online"));
    });

    expect(global.fetch).toHaveBeenCalled();
  });

  test("survives refresh-mid-transaction via localStorage persistence", () => {
    const { result, unmount } = renderHook(() => useOfflineQueue());

    act(() => {
      result.current.enqueue({
        type: "mark_available",
        personaName: "DEV",
        color: "#FF0000",
        date: "2026-07-15",
        value: true,
      });
    });

    expect(result.current.pendingCount).toBe(1);
    unmount();

    const { result: remounted } = renderHook(() => useOfflineQueue());
    expect(remounted.current.pendingCount).toBe(1);
    expect(remounted.current.queue[0].date).toBe("2026-07-15");
  });
});
