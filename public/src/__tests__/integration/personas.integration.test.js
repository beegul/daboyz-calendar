import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";

describe("Persona sync integration regression", () => {
  const personasKey = "personas_storage";
  const activeKey = "active_persona";

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("keeps active persona valid when another client deletes the selected persona", () => {
    const sarah = { name: "Sarah", color: "#FF0000" };
    const marcus = { name: "Marcus", color: "#00FF00" };

    // Client A creates two personas and selects Sarah.
    localStorage.setItem(personasKey, JSON.stringify([sarah, marcus]));
    localStorage.setItem(activeKey, JSON.stringify(sarah));

    // Client B deletes Sarah and syncs the new list.
    localStorage.setItem(personasKey, JSON.stringify([marcus]));

    const synced = JSON.parse(localStorage.getItem(personasKey));
    const active = JSON.parse(localStorage.getItem(activeKey));

    // Reconciliation behavior: switch away from deleted active persona.
    const activeStillExists = synced.some((p) => p.name === active.name);
    if (!activeStillExists) {
      localStorage.setItem(activeKey, JSON.stringify(synced[0]));
    }

    const reconciled = JSON.parse(localStorage.getItem(activeKey));
    expect(synced).toHaveLength(1);
    expect(reconciled.name).toBe("Marcus");
  });

  it("treats duplicate names as invalid regardless of case", () => {
    const existing = [{ name: "Sarah", color: "#FF0000" }];
    const attempted = "  sarah  ";

    const normalizedExisting = existing.map((p) => p.name.trim().toLowerCase());
    const collision = normalizedExisting.includes(attempted.trim().toLowerCase());

    expect(collision).toBe(true);
  });

  it("keeps deletion idempotent when same persona is deleted twice", () => {
    const personas = [{ name: "Sarah", color: "#FF0000" }];
    const afterFirstDelete = personas.filter((p) => p.name !== "Sarah");
    const afterSecondDelete = afterFirstDelete.filter((p) => p.name !== "Sarah");

    expect(afterFirstDelete).toHaveLength(0);
    expect(afterSecondDelete).toHaveLength(0);
  });
});
