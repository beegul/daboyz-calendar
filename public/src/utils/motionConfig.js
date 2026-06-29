/**
 * Motion Configuration: Design tokens for animations
 * Centralized animation parameters (durations, easing, delays) for consistency
 * 
 * Respects prefers-reduced-motion by providing instant durations when accessibility setting is active
 */

export const motionConfig = {
  // Duration tokens (milliseconds)
  durations: {
    fast: 100,      // Quick micro-interactions (button press feedback)
    base: 200,      // Standard transitions (border color on focus)
    slow: 300,      // Page transitions (modal entrance, month navigation)
    extraSlow: 400, // Complex layout transitions (FLIP, cascade animations)
  },

  // Easing functions (cubic-bezier curves)
  easing: {
    // ease-out-quart: Fast start, smooth end (preferred for entrance animations)
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    // ease-in-quart: Slow start, fast end (preferred for exit animations)
    in: 'cubic-bezier(0.7, 0, 0.84, 0)',
    // Material ease: Standard smooth easing for all transitions
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    // ease-out: Lighter easing for subtle effects
    outLight: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  // Stagger delays (milliseconds between element animations)
  delays: {
    stagger: 50,  // Delay between staggered elements (modal title→description→buttons)
    none: 0,
  },

  // Animation presets (commonly used combinations)
  presets: {
    // Modal entrance: fade in + scale up with staggered children
    modalEnter: {
      duration: 300,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // ease-out-quart
      delay: 0,
    },
    // Modal exit: fade out + scale down
    modalExit: {
      duration: 250,
      easing: 'cubic-bezier(0.7, 0, 0.84, 0)', // ease-in-quart
      delay: 0,
    },
    // Button hover: scale + shadow deepening
    buttonHover: {
      duration: 150,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // ease-out-quart
      delay: 0,
    },
    // Button press: immediate scale feedback
    buttonPress: {
      duration: 100,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // ease-out-quart
      delay: 0,
    },
    // Calendar cell fill: color transition on toggle
    cellFill: {
      duration: 200,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // material ease
      delay: 0,
    },
    // Toast slide in: from bottom with fade
    toastSlideIn: {
      duration: 200,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // ease-out-quart
      delay: 0,
    },
    // Toast slide out: to bottom with fade
    toastSlideOut: {
      duration: 200,
      easing: 'cubic-bezier(0.7, 0, 0.84, 0)', // ease-in-quart
      delay: 0,
    },
    // FLIP layout: content morph on month/layout change
    flipLayout: {
      duration: 400,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // material ease
      delay: 0,
    },
    // Delete persona: fade out + slide left
    deleteSlide: {
      duration: 300,
      easing: 'cubic-bezier(0.7, 0, 0.84, 0)', // ease-in-quart
      delay: 0,
    },
  },

  // Reduced motion safe variants (for users with prefers-reduced-motion)
  // Animation durations become 0, but structure stays same so conditional logic isn't needed
  reduced: {
    // Duration tokens (all 0 for instant transitions)
    durations: {
      fast: 0,
      base: 0,
      slow: 0,
      extraSlow: 0,
    },
    delays: {
      stagger: 0,
      none: 0,
    },
  },
}

/**
 * Get motion duration respecting prefers-reduced-motion
 * @param {string} key - Duration token key (e.g., 'fast', 'base', 'slow')
 * @param {boolean} prefersReducedMotion - User's accessibility preference
 * @returns {number} Duration in milliseconds
 */
export const getDuration = (key, prefersReducedMotion = false) => {
  const config = prefersReducedMotion ? motionConfig.reduced : motionConfig
  return config.durations[key] ?? motionConfig.durations.base
}

/**
 * Get motion easing function respecting prefers-reduced-motion
 * @param {string} key - Easing key (e.g., 'out', 'in', 'smooth')
 * @param {boolean} prefersReducedMotion - User's accessibility preference
 * @returns {string} Cubic-bezier easing function or 'linear' if reduced
 */
export const getEasing = (key, prefersReducedMotion = false) => {
  if (prefersReducedMotion) return 'linear'
  return motionConfig.easing[key] ?? motionConfig.easing.smooth
}

/**
 * Get animation preset respecting prefers-reduced-motion
 * @param {string} name - Preset name (e.g., 'modalEnter', 'buttonHover')
 * @param {boolean} prefersReducedMotion - User's accessibility preference
 * @returns {object} Animation preset (duration, easing, delay)
 */
export const getPreset = (name, prefersReducedMotion = false) => {
  const preset = motionConfig.presets[name]
  if (!preset) return motionConfig.presets.modalEnter // Default fallback

  if (prefersReducedMotion) {
    return {
      ...preset,
      duration: 0,
      delay: 0,
    }
  }

  return preset
}
