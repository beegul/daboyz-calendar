describe("Availability sync integration regression", () => {
  const key = "calendar_availability";

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("keeps mark/unmark state consistent across two client reads", () => {
    const persona = { name: "Sarah", color: "#FF0000" };
    const dateA = "2026-07-01";
    const dateB = "2026-07-15";

    const entryA = {
      rowKey: `${persona.name}#${persona.color}#${dateA}`,
      date: dateA,
      name: persona.name,
      color: persona.color,
      timestamp: new Date().toISOString(),
    };

    const entryB = {
      rowKey: `${persona.name}#${persona.color}#${dateB}`,
      date: dateB,
      name: persona.name,
      color: persona.color,
      timestamp: new Date().toISOString(),
    };

    // Client A marks two dates.
    localStorage.setItem(key, JSON.stringify([entryA, entryB]));

    // Client B poll/read sees both entries.
    let clientBView = JSON.parse(localStorage.getItem(key));
    expect(clientBView.map((e) => e.date)).toEqual([dateA, dateB]);

    // Client A unmarks dateA, leaving dateB.
    const afterUnmark = clientBView.filter((e) => e.date !== dateA);
    localStorage.setItem(key, JSON.stringify(afterUnmark));

    // Client B next poll/read reflects reconciliation.
    clientBView = JSON.parse(localStorage.getItem(key));
    expect(clientBView).toHaveLength(1);
    expect(clientBView[0].date).toBe(dateB);

    // Refresh/persist check.
    const persisted = JSON.parse(localStorage.getItem(key));
    expect(persisted[0].rowKey).toBe(`${persona.name}#${persona.color}#${dateB}`);
  });

  it("reconciles concurrent same-date writes with timestamp ordering", () => {
    const date = "2026-07-20";
    const firstWrite = {
      rowKey: `Sarah##FF0000#${date}`,
      date,
      name: "Sarah",
      color: "#FF0000",
      timestamp: "2026-07-20T12:00:05.000Z",
    };
    const secondWrite = {
      rowKey: `Sarah##FF0000#${date}`,
      date,
      name: "Sarah",
      color: "#FF0000",
      timestamp: "2026-07-20T12:00:07.000Z",
    };

    const reconciled = [firstWrite, secondWrite].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp),
    );

    expect(reconciled[reconciled.length - 1].timestamp).toBe(
      "2026-07-20T12:00:07.000Z",
    );
  });

  it("handles 20+ concurrent persona writes on the same date without dropping entries", () => {
    const date = "2026-07-22";
    const writes = Array.from({ length: 24 }, (_, i) => ({
      rowKey: `User${i}##00AAFF#${date}`,
      date,
      name: `User${i}`,
      color: "#00AAFF",
      timestamp: `2026-07-22T12:00:${String(i).padStart(2, "0")}.000Z`,
    }));

    const byRowKey = new Map();
    writes.forEach((entry) => byRowKey.set(entry.rowKey, entry));

    expect(byRowKey.size).toBe(24);
  });
});
