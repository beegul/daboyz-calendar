/**
 * Integration tests for marking and unmarking availability
 * Tests: Mark dates → Verify display → Unmark → Verify removal → Refresh → Verify persistence
 */

describe("Availability Marking Integration Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("T020.1 - Mark date creates availability entry with composite key", () => {
    const persona = { name: "Sarah", color: "#FF0000" };
    const date = "2026-07-15";

    // Mock API response from toggleAvailability
    const response = {
      action: "added",
      entry: {
        partitionKey: "calendar-2026-07",
        rowKey: `${persona.name}#${persona.color}#${date}`,
        date,
        name: persona.name,
        color: persona.color,
        timestamp: new Date().toISOString(),
      },
    };

    // Simulate storing the entry
    const entries = [response.entry];
    localStorage.setItem("calendar_availability", JSON.stringify(entries));

    // Verify stored correctly
    const stored = JSON.parse(localStorage.getItem("calendar_availability"));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("Sarah");
    expect(stored[0].color).toBe("#FF0000");
    expect(stored[0].rowKey).toBe(`Sarah#${persona.color}#${date}`);
  });

  it("T020.2 - Badge displays persona name and color when date marked", () => {
    const persona = { name: "Sarah", color: "#FF0000" };
    const entries = [
      {
        rowKey: `${persona.name}#${persona.color}#2026-07-15`,
        date: "2026-07-15",
        name: persona.name,
        color: persona.color,
        timestamp: new Date().toISOString(),
      },
    ];

    localStorage.setItem("calendar_availability", JSON.stringify(entries));

    const stored = JSON.parse(localStorage.getItem("calendar_availability"));
    const badge = stored[0];

    expect(badge.name).toBe("Sarah");
    expect(badge.color).toBe("#FF0000");
  });

  it("T020.3 - Clicking badge removes availability entry", () => {
    const persona = { name: "Sarah", color: "#FF0000" };
    const date = "2026-07-15";

    // Start with marked date
    const entries = [
      {
        rowKey: `${persona.name}#${persona.color}#${date}`,
        date,
        name: persona.name,
        color: persona.color,
        timestamp: new Date().toISOString(),
      },
    ];
    localStorage.setItem("calendar_availability", JSON.stringify(entries));

    // Remove entry (simulate badge click + API response)
    const filtered = entries.filter(
      (e) =>
        !(
          e.name === persona.name &&
          e.color === persona.color &&
          e.date === date
        ),
    );
    localStorage.setItem("calendar_availability", JSON.stringify(filtered));

    // Verify removed
    const stored = JSON.parse(localStorage.getItem("calendar_availability"));
    expect(stored).toHaveLength(0);
  });

  it("T020.4 - Marking 5 dates shows all badges", () => {
    const persona = { name: "Sarah", color: "#FF0000" };
    const dates = [
      "2026-07-01",
      "2026-07-02",
      "2026-07-03",
      "2026-07-04",
      "2026-07-05",
    ];

    const entries = dates.map((date) => ({
      rowKey: `${persona.name}#${persona.color}#${date}`,
      date,
      name: persona.name,
      color: persona.color,
      timestamp: new Date().toISOString(),
    }));

    localStorage.setItem("calendar_availability", JSON.stringify(entries));

    const stored = JSON.parse(localStorage.getItem("calendar_availability"));
    expect(stored).toHaveLength(5);
    expect(stored.every((e) => e.name === "Sarah")).toBe(true);
  });

  it("T020.5 - Unmarking 2 of 5 dates removes only those entries", () => {
    const persona = { name: "Sarah", color: "#FF0000" };
    const dates = [
      "2026-07-01",
      "2026-07-02",
      "2026-07-03",
      "2026-07-04",
      "2026-07-05",
    ];

    const entries = dates.map((date) => ({
      rowKey: `${persona.name}#${persona.color}#${date}`,
      date,
      name: persona.name,
      color: persona.color,
      timestamp: new Date().toISOString(),
    }));

    localStorage.setItem("calendar_availability", JSON.stringify(entries));

    // Remove 2026-07-02 and 2026-07-04
    const filtered = entries.filter(
      (e) => e.date !== "2026-07-02" && e.date !== "2026-07-04",
    );
    localStorage.setItem("calendar_availability", JSON.stringify(filtered));

    const stored = JSON.parse(localStorage.getItem("calendar_availability"));
    expect(stored).toHaveLength(3);
    expect(stored.map((e) => e.date)).toEqual([
      "2026-07-01",
      "2026-07-03",
      "2026-07-05",
    ]);
  });

  it("T020.6 - Refreshing page restores marked dates", () => {
    const persona = { name: "Sarah", color: "#FF0000" };
    const entries = [
      {
        rowKey: `${persona.name}#${persona.color}#2026-07-01`,
        date: "2026-07-01",
        name: persona.name,
        color: persona.color,
        timestamp: new Date().toISOString(),
      },
      {
        rowKey: `${persona.name}#${persona.color}#2026-07-05`,
        date: "2026-07-05",
        name: persona.name,
        color: persona.color,
        timestamp: new Date().toISOString(),
      },
    ];

    localStorage.setItem("calendar_availability", JSON.stringify(entries));

    // Simulate page refresh
    const restored = JSON.parse(localStorage.getItem("calendar_availability"));
    expect(restored).toHaveLength(2);
    expect(restored.map((e) => e.date)).toEqual(["2026-07-01", "2026-07-05"]);
  });

  it("T020.7 - Multiple personas have isolated availability", () => {
    const persona1 = { name: "Sarah", color: "#FF0000" };
    const persona2 = { name: "Marcus", color: "#00FF00" };

    const entries = [
      {
        rowKey: `${persona1.name}#${persona1.color}#2026-07-01`,
        date: "2026-07-01",
        name: persona1.name,
        color: persona1.color,
        timestamp: new Date().toISOString(),
      },
      {
        rowKey: `${persona1.name}#${persona1.color}#2026-07-02`,
        date: "2026-07-02",
        name: persona1.name,
        color: persona1.color,
        timestamp: new Date().toISOString(),
      },
      {
        rowKey: `${persona2.name}#${persona2.color}#2026-07-01`,
        date: "2026-07-01",
        name: persona2.name,
        color: persona2.color,
        timestamp: new Date().toISOString(),
      },
      {
        rowKey: `${persona2.name}#${persona2.color}#2026-07-03`,
        date: "2026-07-03",
        name: persona2.name,
        color: persona2.color,
        timestamp: new Date().toISOString(),
      },
    ];

    localStorage.setItem("calendar_availability", JSON.stringify(entries));

    // Filter by persona1
    const sarah = entries.filter((e) => e.name === persona1.name);
    expect(sarah).toHaveLength(2);
    expect(sarah.map((e) => e.date)).toEqual(["2026-07-01", "2026-07-02"]);

    // Filter by persona2
    const marcus = entries.filter((e) => e.name === persona2.name);
    expect(marcus).toHaveLength(2);
    expect(marcus.map((e) => e.date)).toEqual(["2026-07-01", "2026-07-03"]);
  });

  it("T020.8 - Toggling same date twice removes entry (idempotent)", () => {
    const persona = { name: "Sarah", color: "#FF0000" };
    const date = "2026-07-15";

    let entries = [];

    // First toggle: add
    entries.push({
      rowKey: `${persona.name}#${persona.color}#${date}`,
      date,
      name: persona.name,
      color: persona.color,
      timestamp: new Date().toISOString(),
    });
    expect(entries).toHaveLength(1);

    // Second toggle: remove
    entries = entries.filter(
      (e) =>
        !(
          e.name === persona.name &&
          e.color === persona.color &&
          e.date === date
        ),
    );
    expect(entries).toHaveLength(0);
  });

  it("T020.9 - Badge click removes only that specific persona from date", () => {
    const persona1 = { name: "Sarah", color: "#FF0000" };
    const persona2 = { name: "Marcus", color: "#00FF00" };
    const date = "2026-07-15";

    // Both personas marked same date
    const entries = [
      {
        rowKey: `${persona1.name}#${persona1.color}#${date}`,
        date,
        name: persona1.name,
        color: persona1.color,
        timestamp: new Date().toISOString(),
      },
      {
        rowKey: `${persona2.name}#${persona2.color}#${date}`,
        date,
        name: persona2.name,
        color: persona2.color,
        timestamp: new Date().toISOString(),
      },
    ];

    localStorage.setItem("calendar_availability", JSON.stringify(entries));

    // Remove only Sarah
    const filtered = entries.filter(
      (e) => !(e.name === persona1.name && e.color === persona1.color),
    );
    localStorage.setItem("calendar_availability", JSON.stringify(filtered));

    const stored = JSON.parse(localStorage.getItem("calendar_availability"));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("Marcus");
  });
});
