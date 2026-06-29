/**
 * Unit tests for validation utilities
 * Tests: isValidHexColor, normalizePersonaName, validatePersonaUniqueness
 */

import {
  isValidHexColor,
  normalizePersonaName,
  validatePersonaUniqueness,
} from "../validation";

describe("isValidHexColor", () => {
  test("validates hex color with # prefix", () => {
    expect(isValidHexColor("#FF5733")).toBe(true);
  });

  test("validates hex color without # prefix", () => {
    expect(isValidHexColor("FF5733")).toBe(true);
  });

  test("validates 3-digit hex color", () => {
    expect(isValidHexColor("#FFF")).toBe(true);
    expect(isValidHexColor("000")).toBe(true);
  });

  test("rejects invalid hex color - non-hex characters", () => {
    expect(isValidHexColor("#GGGGGG")).toBe(false);
  });

  test("rejects invalid hex color - wrong length", () => {
    expect(isValidHexColor("#FF57")).toBe(false);
    expect(isValidHexColor("#FF57335")).toBe(false);
  });

  test("rejects invalid hex color - empty string", () => {
    expect(isValidHexColor("")).toBe(false);
  });

  test("rejects invalid hex color - null or undefined", () => {
    expect(isValidHexColor(null)).toBe(false);
    expect(isValidHexColor(undefined)).toBe(false);
  });

  test("rejects invalid hex color - non-string", () => {
    expect(isValidHexColor(12345)).toBe(false);
    expect(isValidHexColor({})).toBe(false);
  });

  test("is case-insensitive for hex characters", () => {
    expect(isValidHexColor("#ff5733")).toBe(true);
    expect(isValidHexColor("#Ff5733")).toBe(true);
  });
});

describe("normalizePersonaName", () => {
  test("trims leading whitespace", () => {
    expect(normalizePersonaName("  Jack")).toBe("jack");
  });

  test("trims trailing whitespace", () => {
    expect(normalizePersonaName("Jack  ")).toBe("jack");
  });

  test("trims both leading and trailing whitespace", () => {
    expect(normalizePersonaName("  Jack  ")).toBe("jack");
  });

  test("converts to lowercase", () => {
    expect(normalizePersonaName("JACK")).toBe("jack");
    expect(normalizePersonaName("JaCk")).toBe("jack");
  });

  test("handles multiple spaces", () => {
    expect(normalizePersonaName("   Jack   ")).toBe("jack");
  });

  test("handles empty string", () => {
    expect(normalizePersonaName("")).toBe("");
  });

  test("handles null or undefined", () => {
    expect(normalizePersonaName(null)).toBe("");
    expect(normalizePersonaName(undefined)).toBe("");
  });

  test("preserves internal spaces", () => {
    expect(normalizePersonaName("Jack Smith")).toBe("jack smith");
    expect(normalizePersonaName("  Jack   Smith  ")).toBe("jack   smith");
  });
});

describe("validatePersonaUniqueness", () => {
  const existingPersonas = [
    { name: "Jack", color: "#FF5733" },
    { name: "Sarah", color: "#0000FF" },
    { name: "John", color: "#00FF00" },
  ];

  test("returns valid for completely new persona", () => {
    const result = validatePersonaUniqueness(
      "Alice",
      "#FFFF00",
      existingPersonas,
    );
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeNull();
    expect(result.conflictingPersona).toBeNull();
  });

  test("detects exact collision (same name + color)", () => {
    const result = validatePersonaUniqueness(
      "Jack",
      "#FF5733",
      existingPersonas,
    );
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("already exists");
    expect(result.conflictingPersona).toEqual({
      name: "Jack",
      color: "#FF5733",
    });
  });

  test("detects collision with case-insensitive name", () => {
    const result = validatePersonaUniqueness(
      "jack",
      "#FF5733",
      existingPersonas,
    );
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("already exists");
  });

  test("detects collision with whitespace-trimmed name", () => {
    const result = validatePersonaUniqueness(
      "  Jack  ",
      "#FF5733",
      existingPersonas,
    );
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("already exists");
  });

  test("detects collision with color case variation", () => {
    const result = validatePersonaUniqueness(
      "Jack",
      "#ff5733",
      existingPersonas,
    );
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("already exists");
  });

  test("detects collision with color without # prefix", () => {
    const result = validatePersonaUniqueness(
      "Jack",
      "FF5733",
      existingPersonas,
    );
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("already exists");
  });

  test("allows same name with different color", () => {
    const result = validatePersonaUniqueness(
      "Jack",
      "#0000FF",
      existingPersonas,
    );
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeNull();
  });

  test("allows different name with same color", () => {
    const result = validatePersonaUniqueness(
      "Mike",
      "#FF5733",
      existingPersonas,
    );
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeNull();
  });

  test("rejects empty name", () => {
    const result = validatePersonaUniqueness("", "#FF5733", existingPersonas);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("required");
  });

  test("rejects empty color", () => {
    const result = validatePersonaUniqueness("Alice", "", existingPersonas);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("required");
  });

  test("rejects invalid color format", () => {
    const result = validatePersonaUniqueness(
      "Alice",
      "#GGGGGG",
      existingPersonas,
    );
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("Invalid color format");
  });

  test("handles empty personas array", () => {
    const result = validatePersonaUniqueness("Alice", "#FFFF00", []);
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeNull();
  });

  test("handles undefined personas array", () => {
    const result = validatePersonaUniqueness("Alice", "#FFFF00", undefined);
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeNull();
  });

  test("handles personas with missing or malformed data", () => {
    const malformedPersonas = [
      { name: "Alice", color: "#FFFFFF" },
      { name: null, color: "#FF5733" },
      { color: "#0000FF" },
      {},
    ];
    const result = validatePersonaUniqueness(
      "Bob",
      "#00FF00",
      malformedPersonas,
    );
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeNull();
  });

  test("validates new persona against array with normalized existing personas", () => {
    const personas = [
      { name: "  JACK  ", color: "#FF5733" },
      { name: "sarah", color: "#0000ff" },
    ];
    const result = validatePersonaUniqueness("jack", "ff5733", personas);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("already exists");
  });

  test("provides helpful error message with conflicting persona name", () => {
    const result = validatePersonaUniqueness(
      "Jack",
      "#FF5733",
      existingPersonas,
    );
    expect(result.errorMessage).toContain("Jack");
  });
});
