import { renderHook, act } from "@testing-library/react";
import useDarkMode from "../useDarkMode";
import {
  THEME_STORAGE_KEY,
  DARK_MODE_CLASS,
  THEME_MODES,
} from "../../utils/theme";

describe("useDarkMode Hook", () => {
  beforeEach(() => {
    // Clear localStorage and DOM before each test
    localStorage.clear();
    document.documentElement.classList.remove(DARK_MODE_CLASS);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove(DARK_MODE_CLASS);
  });

  test("should initialize with light mode when no preference stored", () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(false);
  });

  test("should initialize with stored dark mode preference", () => {
    localStorage.setItem(THEME_STORAGE_KEY, THEME_MODES.DARK);
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(true);
  });

  test("should initialize with stored light mode preference", () => {
    localStorage.setItem(THEME_STORAGE_KEY, THEME_MODES.LIGHT);
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(false);
  });

  test("should toggle dark mode", () => {
    const { result } = renderHook(() => useDarkMode());

    expect(result.current.isDarkMode).toBe(false);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.isDarkMode).toBe(true);
  });

  test("should toggle dark mode multiple times", () => {
    const { result } = renderHook(() => useDarkMode());

    expect(result.current.isDarkMode).toBe(false);

    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.isDarkMode).toBe(true);

    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.isDarkMode).toBe(false);

    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.isDarkMode).toBe(true);
  });

  test("should persist dark mode to localStorage", () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_MODES.DARK);
  });

  test("should persist light mode to localStorage", () => {
    localStorage.setItem(THEME_STORAGE_KEY, THEME_MODES.DARK);
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_MODES.LIGHT);
  });

  test("should apply dark class to document element when dark mode", () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(
      true,
    );
  });

  test("should remove dark class from document element when light mode", () => {
    localStorage.setItem(THEME_STORAGE_KEY, THEME_MODES.DARK);
    const { result } = renderHook(() => useDarkMode());

    expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(
      true,
    );

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(
      false,
    );
  });

  test("should provide preferredMode property", () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.preferredMode).toBeDefined();
    expect(typeof result.current.preferredMode).toBe("string");
  });

  test("should survive page refresh with localStorage persistence", () => {
    // First render: toggle to dark
    const { result: result1 } = renderHook(() => useDarkMode());
    act(() => {
      result1.current.toggleDarkMode();
    });
    expect(result1.current.isDarkMode).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_MODES.DARK);

    // Simulate page refresh: new hook instance
    const { result: result2 } = renderHook(() => useDarkMode());
    expect(result2.current.isDarkMode).toBe(true);
  });

  test("should respect manual preference over system preference", () => {
    // Set localStorage to dark even if system prefers light
    localStorage.setItem(THEME_STORAGE_KEY, THEME_MODES.DARK);
    const { result } = renderHook(() => useDarkMode());

    expect(result.current.isDarkMode).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_MODES.DARK);
  });

  test("should return an object with expected properties", () => {
    const { result } = renderHook(() => useDarkMode());

    expect(result.current).toHaveProperty("isDarkMode");
    expect(result.current).toHaveProperty("toggleDarkMode");
    expect(result.current).toHaveProperty("preferredMode");
  });

  test("should have isDarkMode as boolean", () => {
    const { result } = renderHook(() => useDarkMode());
    expect(typeof result.current.isDarkMode).toBe("boolean");
  });

  test("should have toggleDarkMode as function", () => {
    const { result } = renderHook(() => useDarkMode());
    expect(typeof result.current.toggleDarkMode).toBe("function");
  });
});
