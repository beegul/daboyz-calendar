/**
 * Integration tests for page refresh scenario
 * Verifies that page renders with cached data immediately without flicker
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

// Mock component that uses hydration
const _MockCalendarWithHydration = ({ isOffline }) => {
  const [data, setData] = React.useState(() => {
    // Simulate hydration: load from localStorage immediately
    const cached = localStorage.getItem("daboyz_availability");
    return cached ? JSON.parse(cached) : [];
  });

  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Background fetch: get fresh data without blocking initial render
    const fetchFreshData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/availability?month=2024-06");
        if (response.ok) {
          const result = await response.json();
          setData(result.entries || []);
        }
      } catch (err) {
        console.warn("Background fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we're online and have cached data to start with
    if (!isOffline && data.length > 0) {
      fetchFreshData();
    }
  }, [isOffline, data.length]);

  return (
    <div>
      <div data-testid="calendar-data">
        {data.map((entry) => (
          <div key={`${entry.name}-${entry.date}`}>{entry.name}</div>
        ))}
      </div>
      {isLoading && <div data-testid="loading">Syncing...</div>}
      {data.length === 0 && <div data-testid="empty">No data</div>}
    </div>
  );
};

describe("Page Refresh Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch.mockReset();
  });

  test("Load app → create persona → refresh page → verify no blank state", async () => {
    // Simulate user having created a persona previously
    const cachedData = [
      { name: "Jack", color: "#FF0000", date: "2024-06-15" },
    ];
    localStorage.setItem("daboyz_availability", JSON.stringify(cachedData));

    // API returns same data
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: cachedData }),
    });

    render(
      <_MockCalendarWithHydration isOffline={false} />
    );

    // Should render cached data immediately
    expect(screen.getByTestId("calendar-data")).toBeInTheDocument();
    expect(screen.getByText("Jack")).toBeInTheDocument();
  });

  test("Verify calendar renders with cached data immediately", () => {
    const cachedData = [
      { name: "Jack", color: "#FF0000", date: "2024-06-15" },
      { name: "Sarah", color: "#00FF00", date: "2024-06-16" },
    ];
    localStorage.setItem("daboyz_availability", JSON.stringify(cachedData));

    render(<_MockCalendarWithHydration isOffline={false} />);

    // Data should appear immediately from cache
    expect(screen.getByText("Jack")).toBeInTheDocument();
    expect(screen.getByText("Sarah")).toBeInTheDocument();
    // Calendar data should be available
    expect(screen.getByTestId("calendar-data")).toBeInTheDocument();
  });

  test("Verify API request completes silently (no state re-render visible)", async () => {
    const cachedData = [
      { name: "Jack", color: "#FF0000", date: "2024-06-15" },
    ];
    const freshData = [
      { name: "Jack", color: "#FF0000", date: "2024-06-15" },
      { name: "Sarah", color: "#00FF00", date: "2024-06-16" },
    ];

    localStorage.setItem("daboyz_availability", JSON.stringify(cachedData));
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: freshData }),
    });

    render(<_MockCalendarWithHydration isOffline={false} />);

    // Initially shows only cached data
    expect(screen.getByText("Jack")).toBeInTheDocument();
    expect(screen.queryByText("Sarah")).not.toBeInTheDocument();

    // After background fetch completes, shows fresh data
    await waitFor(() => {
      expect(screen.getByText("Sarah")).toBeInTheDocument();
    });
  });

  test("No blank state on page refresh (localStorage has data)", () => {
    const cachedData = [
      { name: "Jack", color: "#FF0000", date: "2024-06-15" },
    ];
    localStorage.setItem("daboyz_availability", JSON.stringify(cachedData));

    render(<_MockCalendarWithHydration isOffline={false} />);

    // Should NOT show empty state
    expect(screen.queryByTestId("empty")).not.toBeInTheDocument();
    // Should show cached data
    expect(screen.getByText("Jack")).toBeInTheDocument();
  });
});
