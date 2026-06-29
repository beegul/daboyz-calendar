/**
 * usePrefersReducedMotion Hook: Detect accessibility preference for reduced animations
 * 
 * Respects user's system preference: Settings > Accessibility > Reduce Motion
 * Available on: Windows, macOS, iOS, Android
 * 
 * Returns: boolean - true if user prefers reduced motion
 * 
 * Usage:
 * ```jsx
 * const prefersReducedMotion = usePrefersReducedMotion()
 * 
 * return (
 *   <motion.div
 *     animate={{ x: prefersReducedMotion ? 0 : 100 }}
 *     transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
 *   >
 *     Content
 *   </motion.div>
 * )
 * ```
 */

import { useState, useEffect } from 'react'

export const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    // Check if media query is supported
    if (!window.matchMedia) {
      return
    }

    // Create media query for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Set initial value
    setPrefersReduced(mediaQuery.matches)

    // Handle changes (user changes OS accessibility settings)
    const handleChange = (e) => {
      setPrefersReduced(e.matches)
    }

    // Modern API (most browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    // Fallback for older browsers
    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  return prefersReduced
}
