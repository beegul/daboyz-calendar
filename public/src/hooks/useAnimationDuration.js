/**
 * useAnimationDuration Hook: Get animation duration respecting accessibility preference
 * 
 * Wrapper around usePrefersReducedMotion that returns animation durations.
 * When user prefers reduced motion: duration is 0
 * Otherwise: duration is the provided baseDuration
 * 
 * Usage:
 * ```jsx
 * const duration = useAnimationDuration(300) // 300ms or 0 if prefers reduced motion
 * 
 * return (
 *   <motion.div
 *     animate={{ opacity: 1 }}
 *     transition={{ duration: duration / 1000 }} // Convert to seconds
 *   />
 * )
 * ```
 */

import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export const useAnimationDuration = (baseDuration = 300) => {
  const prefersReducedMotion = usePrefersReducedMotion()

  // Return 0 if user prefers reduced motion, otherwise return baseDuration (in ms)
  return prefersReducedMotion ? 0 : baseDuration
}
