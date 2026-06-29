/**
 * Text truncation utilities for persona names and other long text
 * Provides functions to truncate names while maintaining readability
 */

/**
 * Truncate a persona name for display in compact views
 * Max persona name is 50 chars per existing validation
 * Truncate to ~25 chars in compact badge view
 *
 * @param {string} name - Original persona name (max 50 chars)
 * @param {number} maxLength - Maximum display length (default: 25)
 * @returns {object} { original, truncated, isTruncated }
 */
export const truncatePersonaName = (name, maxLength = 25) => {
  if (!name || typeof name !== "string") {
    return {
      original: name || "",
      truncated: name || "",
      isTruncated: false,
    };
  }

  const trimmed = name.trim();

  if (trimmed.length <= maxLength) {
    return {
      original: trimmed,
      truncated: trimmed,
      isTruncated: false,
    };
  }

  // Truncate at maxLength-3 to leave room for ellipsis
  const truncated = trimmed.substring(0, maxLength - 3) + "...";

  return {
    original: trimmed,
    truncated,
    isTruncated: true,
  };
};

/**
 * Truncate text to a word boundary (no mid-word breaks)
 * Useful for longer descriptions or tooltips
 *
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix if truncated (default: '...')
 * @returns {object} { original, truncated, isTruncated }
 */
export const truncateAtWordBoundary = (
  text,
  maxLength = 50,
  suffix = "...",
) => {
  if (!text || typeof text !== "string") {
    return {
      original: text || "",
      truncated: text || "",
      isTruncated: false,
    };
  }

  const trimmed = text.trim();

  if (trimmed.length <= maxLength) {
    return {
      original: trimmed,
      truncated: trimmed,
      isTruncated: false,
    };
  }

  // Find last space before maxLength
  const truncatePoint = trimmed.lastIndexOf(" ", maxLength - suffix.length);
  const truncateAt =
    truncatePoint > 0 ? truncatePoint : maxLength - suffix.length;

  const truncated = trimmed.substring(0, truncateAt).trim() + suffix;

  return {
    original: trimmed,
    truncated,
    isTruncated: true,
  };
};

/**
 * Get display-friendly version of persona name
 * Used for UI rendering with proper truncation
 *
 * @param {string} name - Persona name
 * @param {object} options - Options object
 * @param {number} options.maxLength - Max display length (default: 25)
 * @param {boolean} options.showFull - If true, show original name (for debugging)
 * @returns {string} Display name or original if short
 */
export const getDisplayName = (name, options = {}) => {
  const { maxLength = 25, showFull = false } = options;

  if (showFull) {
    return name;
  }

  const result = truncatePersonaName(name, maxLength);
  return result.truncated;
};

/**
 * Persona name display model used by components
 * Encapsulates all rendering logic for a single persona
 *
 * @param {object} persona - Persona object with { name, color }
 * @param {object} options - Display options
 * @returns {object} Model with original, displayName, isTruncated, color
 */
export const createPersonaDisplayModel = (persona, options = {}) => {
  const { maxLength = 25 } = options;

  const truncation = truncatePersonaName(persona.name, maxLength);

  return {
    ...persona,
    displayName: truncation.truncated,
    originalName: truncation.original,
    isTruncated: truncation.isTruncated,
    // Color remains unchanged from source
    color: persona.color,
    // Helpful for debugging
    debugInfo: {
      originalLength: truncation.original.length,
      displayLength: truncation.truncated.length,
      maxLength,
    },
  };
};

/**
 * Format a list of personas for display
 * Shows first N personas, counts remainder
 *
 * @param {array} personas - Array of { name, color }
 * @param {number} maxDisplay - Max personas to show inline (default: 2)
 * @param {object} options - Additional options
 * @returns {object} { displayed, remaining, remainder, all, format }
 */
export const formatPersonaList = (personas, maxDisplay = 2, options = {}) => {
  if (!Array.isArray(personas) || personas.length === 0) {
    return {
      displayed: [],
      remaining: [],
      remainingCount: 0,
      total: 0,
      format: "empty",
      display: "",
    };
  }

  const total = personas.length;
  const displayed = personas
    .slice(0, maxDisplay)
    .map((p) => createPersonaDisplayModel(p, options));
  const remaining = personas.slice(maxDisplay);
  const remainingCount = remaining.length;

  let format = "all";
  let display = displayed.map((p) => p.displayName).join(", ");

  if (remainingCount > 0) {
    format = "abbreviated";
    display += ` +${remainingCount} more`;
  }

  return {
    displayed,
    remaining: remaining.map((p) => createPersonaDisplayModel(p, options)),
    remainingCount,
    total,
    format,
    display,
  };
};

export default {
  truncatePersonaName,
  truncateAtWordBoundary,
  getDisplayName,
  createPersonaDisplayModel,
  formatPersonaList,
};
