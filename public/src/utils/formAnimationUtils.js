/**
 * Form Input Animation Utilities for Focus States
 * Used by PersonaOnboarding and other forms
 */

import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * Get focus animation classes respecting prefers-reduced-motion
 * @param {boolean} prefersReduced - Whether user prefers reduced motion
 * @returns {object} CSS class object for focus states
 */
export const getFocusClasses = (prefersReduced = false) => {
  return {
    base: 'transition-all focus:outline-none focus:ring-2',
    color: 'border border-gray-300 focus:border-blue-500',
    ring: prefersReduced ? 'focus:ring-blue-200' : 'focus:ring-blue-400',
  }
}

/**
 * Hook for input focus animations
 * @returns {object} Animation configuration
 */
export const useInputFocusAnimation = () => {
  const prefersReduced = usePrefersReducedMotion()

  return {
    transition: prefersReduced ? 'none' : 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    duration: prefersReduced ? 0 : 200,
  }
}

/**
 * Get error state animation classes
 * @returns {string} CSS classes for error state
 */
export const getErrorClasses = () => {
  return 'border-red-300 focus:border-red-500 focus:ring-red-400'
}
