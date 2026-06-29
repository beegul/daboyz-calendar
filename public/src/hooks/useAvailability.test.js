import { renderHook, waitFor } from "@testing-library/react";
import { useAvailability } from "./useAvailability";

describe("useAvailability Hook", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with loading state", () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ entries: [] }),
    });

    const { result } = renderHook(() => useAvailability("2026-07"));

    expect(result.current.loading).toBe(true);
  });

  it("handles successful data fetch", async () => {
    const mockEntries = [
      {
        rowKey: "Sarah#0000ff#2026-07-15",
        date: "2026-07-15",
        name: "Sarah",
        color: "#0000ff",
        timestamp: new Date().toISOString(),
      },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ entries: mockEntries }),
    });

    const { result } = renderHook(() => useAvailability("2026-07"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it("handles server error and falls back to mock API", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ error: "Internal server error" }),
    });

    const { result } = renderHook(() => useAvailability("2026-07"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.useMockAPI).toBe(true);
    expect(result.current.entries).toBeDefined();
  });

  it("handles network error and falls back to mock API", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAvailability("2026-07"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.useMockAPI).toBe(true);
  });
});
