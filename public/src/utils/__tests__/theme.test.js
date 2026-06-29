import {
  BREAKPOINTS,
  MEDIA_QUERIES,
  Z_INDEX,
  THEME_MODES,
  THEME_STORAGE_KEY,
  DARK_MODE_CLASS,
  getSystemColorSchemePreference,
  getThemeFromStorage,
  saveThemeToStorage,
  applyThemeToDom,
  ColorUtils,
} from "../theme";

describe("Theme Utilities", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset DOM
    document.documentElement.classList.remove(DARK_MODE_CLASS);
  });

  describe("Constants", () => {
    test("BREAKPOINTS should define mobile-first breakpoints", () => {
      expect(BREAKPOINTS.mobile).toBe(375);
      expect(BREAKPOINTS.tablet).toBe(768);
      expect(BREAKPOINTS.desktop).toBe(1024);
    });

    test("THEME_MODES should define light and dark", () => {
      expect(THEME_MODES.LIGHT).toBe("light");
      expect(THEME_MODES.DARK).toBe("dark");
    });

    test("Z_INDEX should define layer hierarchy", () => {
      expect(Z_INDEX.modal).toBeGreaterThan(Z_INDEX.dropdown);
      expect(Z_INDEX.tooltip).toBeGreaterThan(Z_INDEX.modal);
    });

    test("MEDIA_QUERIES should contain responsive query strings", () => {
      expect(MEDIA_QUERIES.isMobile).toContain("max-width");
      expect(MEDIA_QUERIES.hasHover).toContain("hover");
      expect(MEDIA_QUERIES.prefersDarkMode).toContain("prefers-color-scheme");
    });
  });

  describe("getSystemColorSchemePreference", () => {
    test("should return boolean", () => {
      const result = getSystemColorSchemePreference();
      expect(typeof result).toBe("boolean");
    });

    test("should return false in test environment (jest.setup.js mock)", () => {
      const result = getSystemColorSchemePreference();
      expect(result).toBe(false);
    });
  });

  describe("Theme Storage", () => {
    test("getThemeFromStorage should return light when localStorage is empty", () => {
      localStorage.clear();
      const theme = getThemeFromStorage();
      expect(theme).toBe(THEME_MODES.LIGHT);
    });

    test("saveThemeToStorage should persist theme to localStorage", () => {
      saveThemeToStorage(THEME_MODES.DARK);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_MODES.DARK);
    });

    test("getThemeFromStorage should return stored value when present", () => {
      saveThemeToStorage(THEME_MODES.DARK);
      const theme = getThemeFromStorage();
      expect(theme).toBe(THEME_MODES.DARK);
    });

    test("saveThemeToStorage should overwrite previous value", () => {
      saveThemeToStorage(THEME_MODES.LIGHT);
      saveThemeToStorage(THEME_MODES.DARK);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_MODES.DARK);
    });
  });

  describe("applyThemeToDom", () => {
    test("should add dark class when mode is dark", () => {
      applyThemeToDom(THEME_MODES.DARK);
      expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(
        true,
      );
    });

    test("should remove dark class when mode is light", () => {
      document.documentElement.classList.add(DARK_MODE_CLASS);
      applyThemeToDom(THEME_MODES.LIGHT);
      expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(
        false,
      );
    });

    test("should handle multiple toggles", () => {
      applyThemeToDom(THEME_MODES.DARK);
      expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(
        true,
      );

      applyThemeToDom(THEME_MODES.LIGHT);
      expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(
        false,
      );

      applyThemeToDom(THEME_MODES.DARK);
      expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(
        true,
      );
    });
  });

  describe("ColorUtils", () => {
    describe("isValidHexColor", () => {
      test("should return true for valid 6-digit hex color", () => {
        expect(ColorUtils.isValidHexColor("#ff0000")).toBe(true);
        expect(ColorUtils.isValidHexColor("#00ff00")).toBe(true);
        expect(ColorUtils.isValidHexColor("#0000ff")).toBe(true);
      });

      test("should return true for valid 3-digit hex color", () => {
        expect(ColorUtils.isValidHexColor("#f00")).toBe(true);
        expect(ColorUtils.isValidHexColor("#0f0")).toBe(true);
      });

      test("should return true for uppercase hex colors", () => {
        expect(ColorUtils.isValidHexColor("#FF0000")).toBe(true);
        expect(ColorUtils.isValidHexColor("#FFF")).toBe(true);
      });

      test("should return false for invalid colors", () => {
        expect(ColorUtils.isValidHexColor("red")).toBe(false);
        expect(ColorUtils.isValidHexColor("#gg0000")).toBe(false);
        expect(ColorUtils.isValidHexColor("ff0000")).toBe(false); // Missing #
        expect(ColorUtils.isValidHexColor("#ff00")).toBe(false); // Wrong length
      });
    });

    describe("hexToRgb", () => {
      test("should convert 6-digit hex to RGB", () => {
        expect(ColorUtils.hexToRgb("#ff0000")).toBe("255, 0, 0");
        expect(ColorUtils.hexToRgb("#00ff00")).toBe("0, 255, 0");
        expect(ColorUtils.hexToRgb("#0000ff")).toBe("0, 0, 255");
      });

      test("should handle lowercase hex", () => {
        expect(ColorUtils.hexToRgb("#abc123")).toBe("171, 193, 35");
      });

      test("should return null for invalid hex", () => {
        expect(ColorUtils.hexToRgb("#gg0000")).toBeNull();
        expect(ColorUtils.hexToRgb("invalid")).toBeNull();
      });
    });

    describe("getSafePersonaColor", () => {
      test("should return the color as-is", () => {
        const color = "#ff0000";
        expect(ColorUtils.getSafePersonaColor(color, THEME_MODES.LIGHT)).toBe(
          color,
        );
        expect(ColorUtils.getSafePersonaColor(color, THEME_MODES.DARK)).toBe(
          color,
        );
      });
    });
  });

  describe("Integration: Theme lifecycle", () => {
    test("should complete full theme toggle cycle", () => {
      // Initial state
      expect(getThemeFromStorage()).toBe(THEME_MODES.LIGHT);
      expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(
        false,
      );

      // Switch to dark
      saveThemeToStorage(THEME_MODES.DARK);
      applyThemeToDom(THEME_MODES.DARK);

      expect(getThemeFromStorage()).toBe(THEME_MODES.DARK);
      expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(
        true,
      );

      // Switch back to light
      saveThemeToStorage(THEME_MODES.LIGHT);
      applyThemeToDom(THEME_MODES.LIGHT);

      expect(getThemeFromStorage()).toBe(THEME_MODES.LIGHT);
      expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(
        false,
      );
    });
  });
});
