/**
 * Validation utilities for persona onboarding and collision detection
 * Used by PersonaOnboarding component for real-time form validation
 */

/**
 * Validates if a string is a valid hex color code
 * @param {string} color - Color string to validate (e.g., "#FF5733", "FF5733", etc.)
 * @returns {boolean} True if valid hex color, false otherwise
 */
export function isValidHexColor(color) {
  if (!color || typeof color !== "string") {
    return false;
  }
  // Match hex color with or without # prefix
  const hexColorRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
}

/**
 * Normalizes a persona name for comparison
 * Trims whitespace and converts to lowercase for case-insensitive comparison
 * @param {string} name - Raw persona name
 * @returns {string} Normalized name (trimmed, lowercase)
 */
export function normalizePersonaName(name) {
  if (!name || typeof name !== "string") {
    return "";
  }
  return name.trim().toLowerCase();
}

/**
 * Validates if a new persona (name, color) tuple is unique
 * Checks against all existing personas for collision detection
 * Uses case-insensitive name matching and whitespace trimming
 *
 * @param {string} name - Proposed persona name (will be normalized)
 * @param {string} color - Proposed persona color (must be valid hex)
 * @param {Array<{name: string, color: string}>} allPersonas - All existing personas to check against
 * @returns {{isValid: boolean, errorMessage: string|null, conflictingPersona: {name: string, color: string}|null}}
 *          - isValid: true if (name, color) is unique
 *          - errorMessage: descriptive error if collision found, null if valid
 *          - conflictingPersona: the existing persona that collides, or null
 */
export function validatePersonaUniqueness(name, color, allPersonas = []) {
  // Validate inputs
  if (!name || typeof name !== "string") {
    return {
      isValid: false,
      errorMessage: "Persona name is required",
      conflictingPersona: null,
    };
  }

  if (!color || typeof color !== "string") {
    return {
      isValid: false,
      errorMessage: "Persona color is required",
      conflictingPersona: null,
    };
  }

  if (!isValidHexColor(color)) {
    return {
      isValid: false,
      errorMessage: "Invalid color format (use hex like #FF5733)",
      conflictingPersona: null,
    };
  }

  // Normalize new persona name for comparison
  const normalizedNewName = normalizePersonaName(name);
  const normalizedNewColor = color.toUpperCase().replace("#", "");

  // Check against all existing personas
  if (Array.isArray(allPersonas) && allPersonas.length > 0) {
    for (const existingPersona of allPersonas) {
      const normalizedExistingName = normalizePersonaName(
        existingPersona.name || "",
      );
      const normalizedExistingColor = (existingPersona.color || "")
        .toUpperCase()
        .replace("#", "");

      // Collision: same name AND same color (case-insensitive, whitespace-trimmed)
      if (
        normalizedNewName === normalizedExistingName &&
        normalizedNewColor === normalizedExistingColor
      ) {
        return {
          isValid: false,
          errorMessage: `Persona "${existingPersona.name}" with this color already exists`,
          conflictingPersona: {
            name: existingPersona.name,
            color: existingPersona.color,
          },
        };
      }
    }
  }

  // No collision found
  return {
    isValid: true,
    errorMessage: null,
    conflictingPersona: null,
  };
}
