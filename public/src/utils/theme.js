/**
 * Theme utilities and constants for Mobile UI Enhancements feature
 * Supports dark mode, responsive breakpoints, and color management
 */

/**
 * Responsive design breakpoints
 * Aligned with TailwindCSS defaults and project requirements
 */
export const BREAKPOINTS = {
  mobile: 375, // Minimum supported width (legacy phones)
  mobileLarge: 480, // Large phones
  tablet: 768, // Tablet portrait / mobile landscape
  desktop: 1024, // Desktop minimum
  wide: 1280, // Wide desktop
};

/**
 * Media query strings for responsive design
 */
export const MEDIA_QUERIES = {
  isMobile: `(max-width: ${BREAKPOINTS.tablet - 1}px)`, // < 768px
  isTablet: `(min-width: ${BREAKPOINTS.tablet}px) and (max-width: ${BREAKPOINTS.desktop - 1}px)`, // 768-1023px
  isDesktop: `(min-width: ${BREAKPOINTS.desktop}px)`, // >= 1024px
  hasHover: "(hover: hover)", // Desktop (supports hover)
  noHover: "(hover: none)", // Mobile (no hover)
  prefersDarkMode: "(prefers-color-scheme: dark)",
  prefersLightMode: "(prefers-color-scheme: light)",
};

/**
 * Z-index hierarchy for layering components
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 500,
  tooltip: 600,
  notification: 700,
  debug: 1000,
};

/**
 * Theme mode constants
 */
export const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
};

/**
 * Theme storage key for localStorage
 */
export const THEME_STORAGE_KEY = "theme_mode";

/**
 * CSS class name for dark mode (used by TailwindCSS)
 */
export const DARK_MODE_CLASS = "dark";

/**
 * Get system preference for dark mode
 * @returns {boolean} true if system prefers dark mode
 */
export const getSystemColorSchemePreference = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * Get current theme from localStorage or system preference
 * @returns {string} 'light' or 'dark'
 */
export const getThemeFromStorage = () => {
  if (typeof window === "undefined") return THEME_MODES.LIGHT;

  const stored = window.localStorage?.getItem(THEME_STORAGE_KEY);
  if (stored) return stored;

  return getSystemColorSchemePreference()
    ? THEME_MODES.DARK
    : THEME_MODES.LIGHT;
};

/**
 * Save theme preference to localStorage
 * @param {string} mode - 'light' or 'dark'
 */
export const saveThemeToStorage = (mode) => {
  if (typeof window === "undefined") return;
  window.localStorage?.setItem(THEME_STORAGE_KEY, mode);
};

/**
 * Apply theme to DOM by updating class list
 * @param {string} mode - 'light' or 'dark'
 */
export const applyThemeToDom = (mode) => {
  if (typeof document === "undefined") return;

  const isDark = mode === THEME_MODES.DARK;
  if (isDark) {
    document.documentElement.classList.add(DARK_MODE_CLASS);
  } else {
    document.documentElement.classList.remove(DARK_MODE_CLASS);
  }
};

/**
 * Color utilities for persona display with light/dark mode support
 */
export const ColorUtils = {
  /**
   * Ensure a color is visible on both light and dark backgrounds
   * Returns adjusted color or original if already visible
   * @param {string} hexColor - Hex color code (e.g., '#ff0000')
   * @param {string} mode - 'light' or 'dark'
   * @returns {string} Safe hex color for the given mode
   */
  getSafePersonaColor: (hexColor, _mode) => {
    // In this implementation, we rely on TailwindCSS dark: classes
    // The actual color contrast is handled via CSS, not JavaScript
    // Return the color as-is for application via style props
    return hexColor;
  },

  /**
   * Verify hex color format
   * @param {string} color - Color string to validate
   * @returns {boolean} true if valid hex color
   */
  isValidHexColor: (color) => {
    return /^#(?:[0-9a-f]{3}){1,2}$/i.test(color);
  },

  /**
   * Convert hex to RGB for CSS variable use
   * @param {string} hex - Hex color code
   * @returns {string} RGB string (e.g., '255, 0, 0')
   */
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ].join(", ");
  },
};

/**
 * Text sizing utilities for responsive typography
 */
export const TextSizes = {
  /**
   * Get responsive font size class for a given screen size
   * @param {string} baseSize - Base TailwindCSS size (e.g., 'text-lg')
   * @param {string} mobileSize - Mobile override size
   * @returns {string} Responsive Tailwind class
   */
  responsive: (baseSize, mobileSize) => {
    return `${mobileSize} md:${baseSize}`;
  },
};

/**
 * Touch target utilities (minimum 44x44px on mobile)
 */
export const TouchTargets = {
  MIN_HEIGHT: "min-h-11", // 44px (11 * 4px in Tailwind)
  MIN_WIDTH: "min-w-11", // 44px
  SAFE_PADDING: "p-2", // Minimum padding around touch target
};

/**
 * Animation and transition constants
 */
export const ANIMATIONS = {
  MODAL_OPEN_DURATION: 300, // ms
  DARK_MODE_TRANSITION: 150, // ms (instant visual, but smooth in CSS)
  BOTTOM_SHEET_SLIDE: 400, // ms
};

export default {
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
  TextSizes,
  TouchTargets,
  ANIMATIONS,
};
