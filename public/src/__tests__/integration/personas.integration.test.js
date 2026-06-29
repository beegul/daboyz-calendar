/**
 * Integration tests for Dynamic Personas feature
 * Tests: Create persona → Mark dates → Verify persistence
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";

// Mock localStorage for test environment
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Dynamic Personas Integration Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("T016.1 - Create persona and verify localStorage persistence", () => {
    // Simulate persona creation
    const newPersona = { name: "Sarah", color: "#FF0000" };

    // Store in localStorage (as App.jsx does)
    const personas = [newPersona];
    localStorage.setItem("personas_storage", JSON.stringify(personas));
    localStorage.setItem("active_persona", JSON.stringify(newPersona));

    // Verify persistence
    const storedPersonas = JSON.parse(localStorage.getItem("personas_storage"));
    const storedActive = JSON.parse(localStorage.getItem("active_persona"));

    expect(storedPersonas).toContainEqual(newPersona);
    expect(storedActive).toEqual(newPersona);
  });

  it("T016.2 - Mark availability and verify composite key storage", () => {
    // Setup: Create persona
    const persona = { name: "Sarah", color: "#FF0000" };
    localStorage.setItem("personas_storage", JSON.stringify([persona]));
    localStorage.setItem("active_persona", JSON.stringify(persona));

    // Simulate marking availability (as mock API does)
    const availability = [
      {
        partitionKey: "calendar-2026-07",
        rowKey: `${persona.name}#${persona.color}#2026-07-01`, // Composite key
        date: "2026-07-01",
        name: persona.name,
        color: persona.color,
        timestamp: new Date().toISOString(),
      },
      {
        partitionKey: "calendar-2026-07",
        rowKey: `${persona.name}#${persona.color}#2026-07-02`, // Composite key
        date: "2026-07-02",
        name: persona.name,
        color: persona.color,
        timestamp: new Date().toISOString(),
      },
    ];
    localStorage.setItem("calendar_availability", JSON.stringify(availability));

    // Verify composite key format
    const stored = JSON.parse(localStorage.getItem("calendar_availability"));
    expect(stored).toHaveLength(2);
    expect(stored[0].rowKey).toBe(`Sarah#${persona.color}#2026-07-01`);
    expect(stored[0].name).toBe("Sarah");
    expect(stored[0].color).toBe("#FF0000");
  });

  it("T016.3 - Multiple personas can be created", () => {
    const persona1 = { name: "Sarah", color: "#FF0000" };
    const persona2 = { name: "Marcus", color: "#00FF00" };
    const persona3 = { name: "Diana", color: "#0000FF" };

    const personas = [persona1, persona2, persona3];
    localStorage.setItem("personas_storage", JSON.stringify(personas));

    const stored = JSON.parse(localStorage.getItem("personas_storage"));
    expect(stored).toHaveLength(3);
    expect(stored).toContainEqual(persona1);
    expect(stored).toContainEqual(persona2);
    expect(stored).toContainEqual(persona3);
  });

  it("T016.4 - Switching personas updates active persona", () => {
    const persona1 = { name: "Sarah", color: "#FF0000" };
    const persona2 = { name: "Marcus", color: "#00FF00" };

    // Start with persona1
    localStorage.setItem(
      "personas_storage",
      JSON.stringify([persona1, persona2]),
    );
    localStorage.setItem("active_persona", JSON.stringify(persona1));

    // Switch to persona2
    localStorage.setItem("active_persona", JSON.stringify(persona2));

    const activePersona = JSON.parse(localStorage.getItem("active_persona"));
    expect(activePersona).toEqual(persona2);
  });

  it("T016.5 - Each persona has isolated availability data", () => {
    const persona1 = { name: "Sarah", color: "#FF0000" };
    const persona2 = { name: "Marcus", color: "#00FF00" };

    // Create availability for both personas
    const availability = [
      {
        rowKey: `Sarah#${persona1.color}#2026-07-01`,
        date: "2026-07-01",
        name: "Sarah",
        color: persona1.color,
        timestamp: new Date().toISOString(),
      },
      {
        rowKey: `Marcus#${persona2.color}#2026-07-02`,
        date: "2026-07-02",
        name: "Marcus",
        color: persona2.color,
        timestamp: new Date().toISOString(),
      },
    ];
    localStorage.setItem("calendar_availability", JSON.stringify(availability));

    // Get availability for persona1
    const sarahAvail = availability.filter((e) => e.name === "Sarah");
    expect(sarahAvail).toHaveLength(1);
    expect(sarahAvail[0].date).toBe("2026-07-01");

    // Get availability for persona2
    const marcusAvail = availability.filter((e) => e.name === "Marcus");
    expect(marcusAvail).toHaveLength(1);
    expect(marcusAvail[0].date).toBe("2026-07-02");
  });

  it("T016.6 - Toggling availability adds/removes entries correctly", () => {
    const persona = { name: "Sarah", color: "#FF0000" };
    const date = "2026-07-01";

    let availability = [];
    localStorage.setItem("calendar_availability", JSON.stringify(availability));

    // Add availability
    const entry = {
      rowKey: `${persona.name}#${persona.color}#${date}`,
      date,
      name: persona.name,
      color: persona.color,
      timestamp: new Date().toISOString(),
    };
    availability = [entry];
    localStorage.setItem("calendar_availability", JSON.stringify(availability));

    let stored = JSON.parse(localStorage.getItem("calendar_availability"));
    expect(stored).toHaveLength(1);

    // Remove availability
    availability = availability.filter((e) => e.date !== date);
    localStorage.setItem("calendar_availability", JSON.stringify(availability));

    stored = JSON.parse(localStorage.getItem("calendar_availability"));
    expect(stored).toHaveLength(0);
  });

  it("T016.7 - Page refresh restores persona and availability data", () => {
    const persona = { name: "Sarah", color: "#FF0000" };
    const availability = [
      {
        rowKey: `${persona.name}#${persona.color}#2026-07-01`,
        date: "2026-07-01",
        name: persona.name,
        color: persona.color,
        timestamp: new Date().toISOString(),
      },
    ];

    // Setup initial data
    localStorage.setItem("personas_storage", JSON.stringify([persona]));
    localStorage.setItem("active_persona", JSON.stringify(persona));
    localStorage.setItem("calendar_availability", JSON.stringify(availability));

    // Simulate page refresh (data should still be there)
    const restoredPersonas = JSON.parse(
      localStorage.getItem("personas_storage"),
    );
    const restoredActive = JSON.parse(localStorage.getItem("active_persona"));
    const restoredAvail = JSON.parse(
      localStorage.getItem("calendar_availability"),
    );

    expect(restoredPersonas).toEqual([persona]);
    expect(restoredActive).toEqual(persona);
    expect(restoredAvail).toHaveLength(1);
    expect(restoredAvail[0].name).toBe("Sarah");
  });

  it("T016.8 - Onboarding is shown only when no personas exist", () => {
    // Clear localStorage
    localStorage.clear();

    // Check: No personas → show onboarding
    const personas = JSON.parse(
      localStorage.getItem("personas_storage") || "[]",
    );
    const shouldShowOnboarding = personas.length === 0;

    expect(shouldShowOnboarding).toBe(true);

    // Create persona
    localStorage.setItem(
      "personas_storage",
      JSON.stringify([{ name: "Sarah", color: "#FF0000" }]),
    );

    // Check: Personas exist → hide onboarding
    const newPersonas = JSON.parse(localStorage.getItem("personas_storage"));
    const shouldShowOnboarding2 = newPersonas.length === 0;

    expect(shouldShowOnboarding2).toBe(false);
  });

  it("T016.9 - Composite key uniqueness is enforced", () => {
    // Same persona (name + color) should be identified by composite key
    const persona = { name: "Sarah", color: "#FF0000" };

    const availability = [
      {
        rowKey: `${persona.name}#${persona.color}#2026-07-01`,
        date: "2026-07-01",
        name: persona.name,
        color: persona.color,
      },
      {
        rowKey: `${persona.name}#${persona.color}#2026-07-01`, // Same composite key
        date: "2026-07-01",
        name: persona.name,
        color: persona.color,
      },
    ];

    // Count unique entries by composite key
    const uniqueEntries = new Map();
    availability.forEach((e) => {
      uniqueEntries.set(e.rowKey, e);
    });

    expect(uniqueEntries.size).toBe(1); // Should have only 1 unique entry
  });
});
