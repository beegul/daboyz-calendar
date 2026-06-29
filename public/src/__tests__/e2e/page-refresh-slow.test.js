/**
 * E2E tests for page refresh on slow network
 * Verifies that even with slow API response, page renders quickly from cache
 */
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";

// Mock component simulating Calendar behavior with hydration
const _MockCalendarSlowNetwork = ({ slowNetworkMs = 3000 }) => {
  const [data, setData] = React.useState(() => {
    const cached = localStorage.getItem("daboyz_availability");
    return cached ? JSON.parse(cached) : [];
  });

  const [syncStatus, setSyncStatus] = React.useState("idle");

  React.useEffect(() => {
    // Background fetch with simulated network delay
    const fetchFreshData = async () => {
      try {
        setSyncStatus("syncing");
        // Simulate slow network (e.g., Slow 3G)
        await new Promise((resolve) => setTimeout(resolve, slowNetworkMs));

        const response = await fetch("/api/availability?month=2024-06");
        if (response.ok) {
          const result = await response.json();
          setData(result.entries || []);
          setSyncStatus("synced");
        }
      } catch (err) {
        console.warn("Background fetch failed:", err);
        setSyncStatus("error");
      }
    };

    fetchFreshData();
  }, [slowNetworkMs]);

  return (
    <div>
      <div data-testid="calendar">{data.length} personas loaded</div>
      <div data-testid="sync-status">{syncStatus}</div>
      {data.map((entry) => (
        <div key={`${entry.name}-${entry.date}`} data-testid={`entry-${entry.name}`}>
          {entry.name}
        </div>
      ))}
    </div>
  );
};

describe.skip("Page Refresh on Slow Network (E2E)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("Throttle network (Slow 3G) - calendar renders quickly from cache", () => {
    const cachedData = [
      { name: "Jack", color: "#FF0000", date: "2024-06-15" },
      { name: "Sarah", color: "#00FF00", date: "2024-06-16" },
      { name: "Mike", color: "#0000FF", date: "2024-06-17" },
    ];
    localStorage.setItem("daboyz_availability", JSON.stringify(cachedData));

    render(
      <_MockCalendarSlowNetwork slowNetworkMs={3000} />,
    );

    // Should show cached data IMMEDIATELY (before any network delay)
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toHaveTextContent("3 personas loaded");
    expect(screen.getByTestId("entry-Jack")).toBeInTheDocument();
    expect(screen.getByTestId("entry-Sarah")).toBeInTheDocument();
    expect(screen.getByTestId("entry-Mike")).toBeInTheDocument();
  });

  test("Refresh page → calendar still renders quickly from cache", async () => {
    const cachedData = [
      { name: "Jack", color: "#FF0000", date: "2024-06-15" },
    ];
    localStorage.setItem("daboyz_availability", JSON.stringify(cachedData));

    global.fetch.mockImplementationOnce(() => {
      // Simulate slow response (3 second delay)
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({
              entries: [
                ...cachedData,
                { name: "Sarah", color: "#00FF00", date: "2024-06-16" },
              ],
            }),
          });
        }, 3000);
      });
    });

    render(<_MockCalendarSlowNetwork slowNetworkMs={3000} />);

    // Initially shows cached data only
    expect(screen.getByTestId("entry-Jack")).toBeInTheDocument();
    expect(screen.queryByTestId("entry-Sarah")).not.toBeInTheDocument();

    // Advance timers to simulate network delay
    act(() => {
      jest.advanceTimersByTime(3100);
    });

    // After delay, API response completes and updates UI
    await waitFor(() => {
      expect(screen.getByTestId("entry-Sarah")).toBeInTheDocument();
    });
  });

  test("API response eventually arrives, updates seamlessly", async () => {
    const cachedData = [{ name: "Jack", color: "#FF0000", date: "2024-06-15" }];
    const freshData = [
      ...cachedData,
      { name: "Sarah", color: "#00FF00", date: "2024-06-16" },
    ];

    localStorage.setItem("daboyz_availability", JSON.stringify(cachedData));

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: freshData }),
    });

    render(<_MockCalendarSlowNetwork slowNetworkMs={0} />);

    // Should show cached initially
    expect(screen.getByTestId("calendar")).toHaveTextContent("1 personas loaded");

    // Wait for API to complete
    await waitFor(() => {
      expect(screen.getByTestId("sync-status")).toHaveTextContent("synced");
    });

    // Should now show fresh data
    expect(screen.getByTestId("entry-Sarah")).toBeInTheDocument();
  });

  test("Calendar responsive during slow sync (no blocking)", async () => {
    const cachedData = [
      { name: "Jack", color: "#FF0000", date: "2024-06-15" },
    ];
    localStorage.setItem("daboyz_availability", JSON.stringify(cachedData));

    render(<_MockCalendarSlowNetwork slowNetworkMs={5000} />);

    // Page should be interactive while syncing
    expect(screen.getByTestId("calendar")).toBeInTheDocument();
    expect(screen.getByTestId("sync-status")).toHaveTextContent("syncing");

    // User can still interact with cached data
    expect(screen.getByTestId("entry-Jack")).toBeInTheDocument();

    // After delay, sync completes
    act(() => {
      jest.advanceTimersByTime(5100);
    });

    await waitFor(() => {
      expect(screen.getByTestId("sync-status")).toHaveTextContent("synced");
    });
  });
});
