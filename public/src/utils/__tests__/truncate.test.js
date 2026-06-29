import {
  truncatePersonaName,
  truncateAtWordBoundary,
  getDisplayName,
  createPersonaDisplayModel,
  formatPersonaList,
} from "../truncate";

describe("Truncate Utilities", () => {
  describe("truncatePersonaName", () => {
    test("should return object with original, truncated, and isTruncated", () => {
      const result = truncatePersonaName("Test Name");
      expect(result).toHaveProperty("original");
      expect(result).toHaveProperty("truncated");
      expect(result).toHaveProperty("isTruncated");
    });

    test("should not truncate short names", () => {
      const result = truncatePersonaName("John", 25);
      expect(result.original).toBe("John");
      expect(result.truncated).toBe("John");
      expect(result.isTruncated).toBe(false);
    });

    test("should truncate long names", () => {
      const longName = "A".repeat(30);
      const result = truncatePersonaName(longName, 25);
      expect(result.isTruncated).toBe(true);
      expect(result.truncated).toContain("...");
      expect(result.truncated.length).toBeLessThanOrEqual(25);
    });

    test("should use custom maxLength", () => {
      const name = "A".repeat(20);
      const result = truncatePersonaName(name, 10);
      expect(result.isTruncated).toBe(true);
      expect(result.truncated.length).toBeLessThanOrEqual(10);
    });

    test("should handle empty string", () => {
      const result = truncatePersonaName("");
      expect(result.original).toBe("");
      expect(result.truncated).toBe("");
      expect(result.isTruncated).toBe(false);
    });

    test("should handle null", () => {
      const result = truncatePersonaName(null);
      expect(result.original).toBe("");
      expect(result.isTruncated).toBe(false);
    });

    test("should trim whitespace", () => {
      const result = truncatePersonaName("  John  ");
      expect(result.original).toBe("John");
      expect(result.truncated).toBe("John");
    });

    test("should add ellipsis correctly", () => {
      const name = "A".repeat(30);
      const result = truncatePersonaName(name, 25);
      expect(result.truncated.endsWith("...")).toBe(true);
    });

    test("should handle exactly maxLength", () => {
      const name = "A".repeat(25);
      const result = truncatePersonaName(name, 25);
      expect(result.isTruncated).toBe(false);
    });

    test("should handle maxLength + 1", () => {
      const name = "A".repeat(26);
      const result = truncatePersonaName(name, 25);
      expect(result.isTruncated).toBe(true);
    });
  });

  describe("truncateAtWordBoundary", () => {
    test("should not break mid-word", () => {
      const text = "The quick brown fox jumps";
      const result = truncateAtWordBoundary(text, 10);
      expect(result.truncated).not.toBe("The quick ...");
      expect(result.truncated.endsWith("...")).toBe(true);
    });

    test("should use custom suffix", () => {
      const text = "A".repeat(20);
      const result = truncateAtWordBoundary(text, 10, "→");
      expect(result.truncated.endsWith("→")).toBe(true);
    });

    test("should handle text shorter than maxLength", () => {
      const text = "Short";
      const result = truncateAtWordBoundary(text, 20);
      expect(result.isTruncated).toBe(false);
    });
  });

  describe("getDisplayName", () => {
    test("should return truncated name by default", () => {
      const name = "A".repeat(30);
      const display = getDisplayName(name, { maxLength: 25 });
      expect(display.length).toBeLessThanOrEqual(25);
    });

    test("should return full name when showFull is true", () => {
      const name = "A".repeat(30);
      const display = getDisplayName(name, { showFull: true });
      expect(display).toBe(name);
    });

    test("should use custom maxLength", () => {
      const name = "A".repeat(30);
      const display = getDisplayName(name, { maxLength: 15 });
      expect(display.length).toBeLessThanOrEqual(15);
    });
  });

  describe("createPersonaDisplayModel", () => {
    test("should return model with all properties", () => {
      const persona = { name: "John Doe", color: "#ff0000" };
      const model = createPersonaDisplayModel(persona);

      expect(model).toHaveProperty("name");
      expect(model).toHaveProperty("color");
      expect(model).toHaveProperty("displayName");
      expect(model).toHaveProperty("originalName");
      expect(model).toHaveProperty("isTruncated");
      expect(model).toHaveProperty("debugInfo");
    });

    test("should preserve color from persona", () => {
      const persona = { name: "John", color: "#ff0000" };
      const model = createPersonaDisplayModel(persona);
      expect(model.color).toBe("#ff0000");
    });

    test("should truncate long names", () => {
      const persona = { name: "A".repeat(30), color: "#ff0000" };
      const model = createPersonaDisplayModel(persona, { maxLength: 25 });
      expect(model.isTruncated).toBe(true);
    });

    test("should include debug info", () => {
      const persona = { name: "John Doe", color: "#ff0000" };
      const model = createPersonaDisplayModel(persona);
      expect(model.debugInfo).toHaveProperty("originalLength");
      expect(model.debugInfo).toHaveProperty("displayLength");
      expect(model.debugInfo).toHaveProperty("maxLength");
    });
  });

  describe("formatPersonaList", () => {
    test("should return empty format for no personas", () => {
      const result = formatPersonaList([]);
      expect(result.format).toBe("empty");
      expect(result.total).toBe(0);
    });

    test("should show all personas when less than maxDisplay", () => {
      const personas = [
        { name: "John", color: "#ff0000" },
        { name: "Jane", color: "#00ff00" },
      ];
      const result = formatPersonaList(personas, 2);
      expect(result.format).toBe("all");
      expect(result.remainingCount).toBe(0);
    });

    test("should abbreviate when more than maxDisplay", () => {
      const personas = [
        { name: "John", color: "#ff0000" },
        { name: "Jane", color: "#00ff00" },
        { name: "Bob", color: "#0000ff" },
        { name: "Alice", color: "#ffff00" },
      ];
      const result = formatPersonaList(personas, 2);
      expect(result.format).toBe("abbreviated");
      expect(result.remainingCount).toBe(2);
      expect(result.display).toContain("+2 more");
    });

    test("should display correct number of personas", () => {
      const personas = [
        { name: "John", color: "#ff0000" },
        { name: "Jane", color: "#00ff00" },
        { name: "Bob", color: "#0000ff" },
      ];
      const result = formatPersonaList(personas, 2);
      expect(result.displayed).toHaveLength(2);
      expect(result.remaining).toHaveLength(1);
    });

    test("should calculate correct total", () => {
      const personas = [
        { name: "John", color: "#ff0000" },
        { name: "Jane", color: "#00ff00" },
        { name: "Bob", color: "#0000ff" },
      ];
      const result = formatPersonaList(personas, 2);
      expect(result.total).toBe(3);
    });

    test("should generate display string", () => {
      const personas = [
        { name: "John", color: "#ff0000" },
        { name: "Jane", color: "#00ff00" },
      ];
      const result = formatPersonaList(personas, 2);
      expect(result.display).toContain("John");
      expect(result.display).toContain("Jane");
    });

    test("should use custom maxDisplay", () => {
      const personas = [
        { name: "John", color: "#ff0000" },
        { name: "Jane", color: "#00ff00" },
        { name: "Bob", color: "#0000ff" },
        { name: "Alice", color: "#ffff00" },
      ];
      const result = formatPersonaList(personas, 3);
      expect(result.displayed).toHaveLength(3);
      expect(result.remainingCount).toBe(1);
    });

    test("should handle null personas array", () => {
      const result = formatPersonaList(null);
      expect(result.format).toBe("empty");
      expect(result.total).toBe(0);
    });
  });
});
