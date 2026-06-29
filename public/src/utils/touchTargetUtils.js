/**
 * Touch Target Utilities: Validation for WCAG 2.5.5 AAA compliance
 * All interactive elements must have touch targets ≥44×44px
 * 
 * Reference: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
 */

// WCAG 2.5.5 AAA minimum touch target size (pixels)
export const MIN_TOUCH_TARGET_SIZE = 44

/**
 * Validate that an element meets WCAG AAA touch target requirements
 * @param {HTMLElement} element - DOM element to validate
 * @returns {object} Validation result with size info
 */
export const validateTouchTarget = (element) => {
  if (!element) {
    return {
      isValid: false,
      width: 0,
      height: 0,
      minRequired: MIN_TOUCH_TARGET_SIZE,
      reason: 'Element not found',
    }
  }

  const rect = element.getBoundingClientRect()
  const width = Math.round(rect.width)
  const height = Math.round(rect.height)

  const isValid = width >= MIN_TOUCH_TARGET_SIZE && height >= MIN_TOUCH_TARGET_SIZE

  return {
    isValid,
    width,
    height,
    minRequired: MIN_TOUCH_TARGET_SIZE,
    reason: isValid
      ? 'Touch target meets WCAG AAA standard'
      : `Touch target too small: ${width}×${height}px (require ≥${MIN_TOUCH_TARGET_SIZE}×${MIN_TOUCH_TARGET_SIZE}px)`,
  }
}

/**
 * Validate all interactive elements on page
 * @param {string} selector - CSS selector for elements to validate (default: all interactive)
 * @returns {object} Summary of validation results
 */
export const validateAllTouchTargets = (selector = 'button, [role="button"], input, a, [role="link"], [role="tab"], [role="checkbox"], [role="radio"]') => {
  const elements = document.querySelectorAll(selector)
  const results = {
    total: elements.length,
    valid: 0,
    invalid: 0,
    violations: [],
    summary: null,
  }

  elements.forEach((element, index) => {
    const validation = validateTouchTarget(element)
    if (validation.isValid) {
      results.valid++
    } else {
      results.invalid++
      results.violations.push({
        index,
        element: element.tagName,
        classes: element.className,
        id: element.id,
        ariaLabel: element.getAttribute('aria-label'),
        ...validation,
      })
    }
  })

  results.summary = `${results.valid}/${results.total} interactive elements have valid touch targets (${results.invalid} violations)`

  return results
}

/**
 * Get computed dimensions of element including padding/margin for touch target
 * Useful for understanding why an element might fail touch target requirements
 * @param {HTMLElement} element - DOM element to analyze
 * @returns {object} Detailed size breakdown
 */
export const getTouchTargetBreakdown = (element) => {
  if (!element) return null

  const styles = window.getComputedStyle(element)
  const rect = element.getBoundingClientRect()

  const paddinTop = parseFloat(styles.paddingTop) || 0
  const paddingRight = parseFloat(styles.paddingRight) || 0
  const paddingBottom = parseFloat(styles.paddingBottom) || 0
  const paddingLeft = parseFloat(styles.paddingLeft) || 0

  return {
    // Visual size (bounding box)
    visualWidth: Math.round(rect.width),
    visualHeight: Math.round(rect.height),
    // Content size (without padding)
    contentWidth: Math.round(rect.width - paddingLeft - paddingRight),
    contentHeight: Math.round(rect.height - paddinTop - paddingBottom),
    // Padding breakdown
    padding: {
      top: paddinTop,
      right: paddingRight,
      bottom: paddingBottom,
      left: paddingLeft,
    },
    // Meets WCAG AAA
    meetsWCAG_AAA: Math.round(rect.width) >= MIN_TOUCH_TARGET_SIZE && Math.round(rect.height) >= MIN_TOUCH_TARGET_SIZE,
  }
}

/**
 * Suggest padding adjustments to meet touch target requirements
 * @param {HTMLElement} element - DOM element to analyze
 * @returns {object} Recommended padding values
 */
export const suggestPaddingAdjustment = (element) => {
  if (!element) return null

  const rect = element.getBoundingClientRect()
  const currentWidth = Math.round(rect.width)
  const currentHeight = Math.round(rect.height)

  const neededWidth = Math.max(0, MIN_TOUCH_TARGET_SIZE - currentWidth)
  const neededHeight = Math.max(0, MIN_TOUCH_TARGET_SIZE - currentHeight)

  // Distribute padding evenly
  const paddingHorizontal = Math.ceil(neededWidth / 2)
  const paddingVertical = Math.ceil(neededHeight / 2)

  return {
    currentSize: `${currentWidth}×${currentHeight}px`,
    recommendedSize: `${currentWidth + neededWidth}×${currentHeight + neededHeight}px`,
    suggestedPadding: {
      top: paddingVertical,
      right: paddingHorizontal,
      bottom: paddingVertical,
      left: paddingHorizontal,
      cssShorthand: `${paddingVertical}px ${paddingHorizontal}px`,
    },
    message: `Add padding: ${paddingVertical}px ${paddingHorizontal}px to meet 44×44px requirement`,
  }
}

/**
 * Test whether element is focusable (keyboard accessible)
 * @param {HTMLElement} element - DOM element to test
 * @returns {boolean} Whether element can receive keyboard focus
 */
export const isFocusable = (element) => {
  if (!element) return false

  // Elements that can be focused
  const focusableSelectors = [
    'a[href]',
    'button',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]',
    '[role="link"]',
    '[role="tab"]',
    '[role="checkbox"]',
    '[role="radio"]',
  ]

  return focusableSelectors.some(selector => element.matches(selector))
}
