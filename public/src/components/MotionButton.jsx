/**
 * MotionButton Component: Interactive button with micro-interactions
 * 
 * Features:
 * - Hover scale animation (1.02x at 150ms)
 * - Press feedback (<50ms response, 0.98x scale)
 * - Loading spinner
 * - Touch target ≥44×44px (WCAG AAA)
 * - Disabled state animations
 * 
 * Props:
 * - onClick (function): Click handler
 * - children (React.ReactNode): Button content
 * - variant ('primary' | 'secondary' | 'danger'): Color scheme
 * - size ('sm' | 'md' | 'lg'): Button size
 * - isLoading (boolean): Show spinner
 * - disabled (boolean): Disable button
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { getPreset } from '../utils/motionConfig'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

// Size mappings - ensure minimum 44×44px touch target
const sizeClasses = {
  sm: 'px-3 py-2 text-sm min-w-[44px] min-h-[44px]',
  md: 'px-4 py-2.5 text-base min-w-[44px] min-h-[44px]',
  lg: 'px-6 py-3 text-lg min-w-[44px] min-h-[44px]',
}

// Variant styling
const variantClasses = {
  primary: 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white',
  secondary: 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white',
  danger: 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white',
}

export const MotionButton = ({
  onClick = () => {},
  children = 'Button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  prefersReducedMotion = false,
}) => {
  const [isPressed, setIsPressed] = useState(false)
  const userPreferences = usePrefersReducedMotion()
  const effectivePrefersReduced = prefersReducedMotion || userPreferences

  // Get animation presets
  const hoverPreset = getPreset('buttonHover', effectivePrefersReduced)
  const pressPreset = getPreset('buttonPress', effectivePrefersReduced)

  const isInteractive = !disabled && !isLoading

  return (
    <motion.button
      type={type}
      onClick={(e) => {
        if (isInteractive) {
          onClick(e)
        }
      }}
      onMouseDown={() => isInteractive && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => isInteractive && setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      disabled={disabled || isLoading}
      whileHover={
        isInteractive && !effectivePrefersReduced
          ? { scale: 1.02, transition: hoverPreset }
          : undefined
      }
      whileTap={
        isInteractive && !effectivePrefersReduced
          ? { scale: 0.98, transition: pressPreset }
          : undefined
      }
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        rounded-lg font-medium transition-all
        focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500
        ${className}
      `}
      aria-label={typeof children === 'string' ? children : undefined}
      aria-disabled={disabled}
    >
      <motion.div
        className="flex items-center justify-center gap-2"
        animate={isLoading ? { opacity: 0.7 } : { opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isLoading ? (
          <>
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
            />
            {children}
          </>
        ) : (
          children
        )}
      </motion.div>
    </motion.button>
  )
}
