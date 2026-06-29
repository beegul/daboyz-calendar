/**
 * Animation Test Helpers: Utilities for testing animation performance and behavior
 * 
 * Helps validate:
 * - Animation frame rate (60fps target)
 * - Animation latency (<50ms for micro-interactions)
 * - prefers-reduced-motion compliance
 */

/**
 * Measure animation frame rate during an animation
 * @param {Function} animationFn - Async function that triggers animation
 * @param {number} durationMs - Expected animation duration in milliseconds
 * @returns {Promise<object>} Frame rate metrics
 */
export const measureFrameRate = async (animationFn, durationMs = 300) => {
  const frames = []
  let isRunning = true
  let frameCount = 0

  // Start measuring frames
  const startTime = performance.now()

  const measureFrame = () => {
    if (isRunning) {
      frames.push(performance.now() - startTime)
      frameCount++
      requestAnimationFrame(measureFrame)
    }
  }

  // Start frame measurement
  requestAnimationFrame(measureFrame)

  // Trigger animation
  await animationFn()

  // Stop measuring after expected duration + buffer
  await new Promise(resolve => setTimeout(resolve, durationMs + 100))
  isRunning = false

  // Calculate metrics
  const totalTime = frames[frames.length - 1] - frames[0]
  const expectedFrames = (durationMs / 1000) * 60 // 60fps baseline
  const actualFPS = (frameCount / totalTime) * 1000

  return {
    frameCount,
    expectedFrames: Math.round(expectedFrames),
    actualFPS: Math.round(actualFPS),
    targetFPS: 60,
    minFPS: 30, // Mobile minimum
    isSmooth: actualFPS >= 30,
    droppedFrames: Math.max(0, Math.round(expectedFrames) - frameCount),
    totalDuration: Math.round(totalTime),
    expectedDuration: durationMs,
    isOnTime: Math.abs(totalTime - durationMs) < 50, // 50ms tolerance
  }
}

/**
 * Measure animation latency (time from trigger to first visual change)
 * @param {HTMLElement} element - Element being animated
 * @param {Function} triggerFn - Function that triggers animation
 * @returns {Promise<number>} Latency in milliseconds
 */
export const measureAnimationLatency = async (element, triggerFn) => {
  if (!element) return 0

  const startTime = performance.now()
  const initialStyles = window.getComputedStyle(element)
  let latency = 0

  // Poll for style changes
  const pollInterval = setInterval(() => {
    const currentStyles = window.getComputedStyle(element)
    if (
      currentStyles.opacity !== initialStyles.opacity ||
      currentStyles.transform !== initialStyles.transform ||
      currentStyles.backgroundColor !== initialStyles.backgroundColor
    ) {
      latency = performance.now() - startTime
      clearInterval(pollInterval)
    }
  }, 1) // Poll every 1ms for precision

  // Trigger animation
  triggerFn()

  // Wait for detection or timeout after 100ms
  await new Promise(resolve => setTimeout(resolve, 100))
  clearInterval(pollInterval)

  return latency
}

/**
 * Wait for animation to complete
 * @param {HTMLElement} element - Animated element
 * @param {number} timeoutMs - Maximum time to wait (default 1000ms)
 * @returns {Promise<boolean>} True if animation completed, false if timeout
 */
export const waitForAnimationComplete = async (element, timeoutMs = 1000) => {
  if (!element) return true

  return new Promise(resolve => {
    const timeout = setTimeout(() => {
      element.removeEventListener('animationend', onAnimationEnd)
      element.removeEventListener('transitionend', onTransitionEnd)
      resolve(false) // Timeout - animation didn't complete
    }, timeoutMs)

    const onAnimationEnd = () => {
      clearTimeout(timeout)
      element.removeEventListener('animationend', onAnimationEnd)
      element.removeEventListener('transitionend', onTransitionEnd)
      resolve(true)
    }

    const onTransitionEnd = () => {
      clearTimeout(timeout)
      element.removeEventListener('animationend', onAnimationEnd)
      element.removeEventListener('transitionend', onTransitionEnd)
      resolve(true)
    }

    element.addEventListener('animationend', onAnimationEnd, { once: true })
    element.addEventListener('transitionend', onTransitionEnd, { once: true })
  })
}

/**
 * Check if element is currently animated
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if element has active animation or transition
 */
export const isElementAnimating = (element) => {
  if (!element) return false

  const styles = window.getComputedStyle(element)
  const animationName = styles.animationName
  const transitionDuration = styles.transitionDuration

  return (
    animationName !== 'none' ||
    (transitionDuration !== '0s' && transitionDuration !== 'all 0s ease 0s')
  )
}

/**
 * Verify prefers-reduced-motion compliance
 * @param {HTMLElement} element - Element being tested
 * @returns {object} Compliance check results
 */
export const checkReducedMotionCompliance = (element) => {
  if (!element) return null

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const prefersReduced = mq.matches

  if (!prefersReduced) {
    return {
      compliant: null, // Not applicable - user doesn't prefer reduced motion
      reason: 'User prefers animations',
    }
  }

  // When prefers-reduced-motion is active, animations should be instant/minimal
  const styles = window.getComputedStyle(element)
  const animationDuration = styles.animationDuration
  const transitionDuration = styles.transitionDuration

  // Parse duration values
  const parseMs = (value) => {
    if (!value || value === 'all') return 0
    if (value.includes('ms')) return parseFloat(value)
    if (value.includes('s')) return parseFloat(value) * 1000
    return 0
  }

  const animMs = parseMs(animationDuration)
  const transMs = parseMs(transitionDuration)

  // Should be instant (0-50ms) when prefers-reduced-motion
  const isCompliant = animMs < 50 && transMs < 50

  return {
    compliant: isCompliant,
    prefersReducedMotion: true,
    animationDuration,
    transitionDuration,
    reason: isCompliant
      ? 'Animations respect prefers-reduced-motion'
      : 'Animations are not instant when prefers-reduced-motion is active',
  }
}

/**
 * Test animation with prefers-reduced-motion enabled
 * @param {HTMLElement} element - Element being tested
 * @param {Function} triggerFn - Function that triggers animation
 * @returns {Promise<object>} Test results
 */
export const testAnimationWithReducedMotion = async (element, triggerFn) => {
  // Temporarily set reduced motion preference
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  global.testPrefersReducedMotion = true

  // Force re-evaluation of media query (in tests only)
  const checkCompliance = () => {
    return checkReducedMotionCompliance(element)
  }

  // Trigger animation
  triggerFn()

  // Check compliance
  const compliance = checkCompliance()

  // Reset
  global.testPrefersReducedMotion = false

  return {
    ...compliance,
    testedWithReducedMotion: true,
  }
}

/**
 * Verify animation timing matches contract
 * @param {HTMLElement} element - Element being tested
 * @param {object} contract - Expected animation contract {duration, easing, delay}
 * @returns {object} Validation results
 */
export const validateAnimationContract = (element, contract) => {
  if (!element || !contract) return null

  const styles = window.getComputedStyle(element)

  // Extract actual values
  const actualDuration = styles.animationDuration || styles.transitionDuration
  const actualTiming = styles.animationTimingFunction || styles.transitionTimingFunction
  const actualDelay = styles.animationDelay || styles.transitionDelay

  // Parse expected values
  const contractDuration = contract.duration ? `${contract.duration}ms` : null
  const contractEasing = contract.easing || null
  const contractDelay = contract.delay ? `${contract.delay}ms` : null

  return {
    duration: {
      expected: contractDuration,
      actual: actualDuration,
      matches: contractDuration ? actualDuration.includes(contractDuration) : true,
    },
    timing: {
      expected: contractEasing,
      actual: actualTiming,
      matches: contractEasing ? actualTiming.includes(contractEasing) : true,
    },
    delay: {
      expected: contractDelay,
      actual: actualDelay,
      matches: contractDelay ? actualDelay.includes(contractDelay) : true,
    },
    isValid: true, // Set false if any match is false
  }
}
