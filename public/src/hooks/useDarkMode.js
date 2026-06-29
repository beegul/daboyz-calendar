import { useState, useEffect } from "react";
import {
  THEME_MODES,
  getThemeFromStorage,
  saveThemeToStorage,
  applyThemeToDom,
} from "../utils/theme";

/**
 * Hook to manage dark mode state with localStorage persistence
 *
 * On mount:
 * 1. Check localStorage for manual user preference
 * 2. If not found, read system preference via prefers-color-scheme
 * 3. Apply theme to DOM
 *
 * On toggle:
 * 1. Switch theme
 * 2. Persist to localStorage
 * 3. Update DOM
 *
 * Returns: { isDarkMode, toggleDarkMode, preferredMode }
 */
export const useDarkMode = () => {
  // Get initial theme from storage/system
  const initialTheme = getThemeFromStorage();
  const [isDarkMode, setIsDarkMode] = useState(
    initialTheme === THEME_MODES.DARK,
  );

  // Apply theme to DOM on mount and when isDarkMode changes
  useEffect(() => {
    const theme = isDarkMode ? THEME_MODES.DARK : THEME_MODES.LIGHT;
    applyThemeToDom(theme);
    saveThemeToStorage(theme);
  }, [isDarkMode]);

  /**
   * Toggle dark mode and persist to storage
   */
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  /**
   * Get system preference (read-only)
   */
  const getPreferredMode = () => {
    if (typeof window === "undefined") return THEME_MODES.LIGHT;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? THEME_MODES.DARK
      : THEME_MODES.LIGHT;
  };

  return {
    isDarkMode,
    toggleDarkMode,
    preferredMode: getPreferredMode(),
  };
};

export default useDarkMode;
