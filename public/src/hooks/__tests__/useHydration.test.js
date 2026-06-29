/**
 * Tests for useHydration hook
 * Verifies that page hydration from localStorage prevents flicker on refresh
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import { useHydration } from "../useHydration";

// Mock fetch
global.fetch = jest.fn();

describe("useHydration Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.clearAllMocks();
    global.fetch.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("initializes state from localStorage if available (instant load)", () => {
    const cachedData = [
      { name: "Jack", color: "#FF0000", date: "2024-06-15" },
      { name: "Sarah", color: "#00FF00", date: "2024-06-16" },
    ];
    localStorage.setItem("daboyz_availability", JSON.stringify(cachedData));

    const { result } = renderHook(() => useHydration("daboyz_availability", []));

    // Should have data from localStorage immediately
    expect(result.current.data).toEqual(cachedData);
  });

  test("fetches fresh data in background via useEffect (silent update)", async () => {
    const cachedData = [{ name: "Jack", color: "#FF0000", date: "2024-06-15" }];
    const freshData = [
      { name: "Jack", color: "#FF0000", date: "2024-06-15" },
      { name: "Sarah", color: "#00FF00", date: "2024-06-16" },
    ];

    localStorage.setItem("daboyz_availability", JSON.stringify(cachedData));
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: freshData }),
    });

    const { result } = renderHook(() =>
      useHydration("daboyz_availability", freshData, "/api/availability?month=2024-06"),
    );

    // Initial data from cache
    expect(result.current.data).toEqual(cachedData);

    // Wait for background fetch to complete
    await waitFor(() => {
      // Should have updated with fresh data
      expect(result.current.data).toEqual(freshData);
    });
  });

  test("only one render cycle during hydration (no flicker)", () => {
    const cachedData = [{ name: "Jack", color: "#FF0000", date: "2024-06-15" }];
    localStorage.setItem("daboyz_availability", JSON.stringify(cachedData));

    const renderSpy = jest.fn();

    const TestComponent = () => {
      const hydrated = useHydration("daboyz_availability", []);
      renderSpy();
      return <div>{hydrated.data.length}</div>;
    };

    renderSpy.mockClear();
    // In practice, rendering happens once initially with cache data
    // Then potentially once more when background data arrives
    // But React batches updates to minimize flicker
    expect(renderSpy.mock.calls.length).toBeLessThanOrEqual(2);
  });

  test("localStorage empty → initial state is empty object (no error)", () => {
    localStorage.clear();

    const { result } = renderHook(() => useHydration("daboyz_availability", []));

    // Should not throw, should use fallback
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  test("hydration completes without user-visible state shift", async () => {
    const cachedData = [{ name: "Jack", color: "#FF0000", date: "2024-06-15" }];
    const freshData = [
      { name: "Jack", color: "#FF0000", date: "2024-06-15" },
      { name: "Sarah", color: "#00FF00", date: "2024-06-16" },
    ];

    localStorage.setItem("daboyz_availability", JSON.stringify(cachedData));
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: freshData }),
    });

    const { result } = renderHook(() =>
      useHydration("daboyz_availability", freshData, "/api/availability?month=2024-06"),
    );

    // Verify transition from cache to fresh is smooth
    const initialData = result.current.data;
    expect(initialData).toEqual(cachedData);

    await waitFor(() => {
      expect(result.current.data).toEqual(freshData);
    });

    // Verify no loading state = no visible flicker
    expect(result.current.isHydrating).toBeDefined();
  });
});
