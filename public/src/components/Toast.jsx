/**
 * Toast Component: Animated notification with Framer Motion
 * 
 * Features:
 * - Slide-up entrance animation (200ms, ease-out-quart)
 * - Slide-down exit animation (200ms, ease-in-quart)
 * - Icons for success/error/info types
 * - Auto-dismiss after 4s with close button
 * - aria-live region for accessibility
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getPreset } from '../utils/motionConfig'

/**
 * Individual Toast notification
 */
export const Toast = ({ id, message, type = 'info', onDismiss, prefersReducedMotion = false }) => {
  // Toast variant styling
  const variants = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: '✓',
      iconColor: 'text-green-600',
      textColor: 'text-green-900',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: '⚠',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'ℹ',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
    },
  }

  const variant = variants[type] || variants.info

  // Animation presets
  const slideInPreset = getPreset('toastSlideIn', prefersReducedMotion)
  const slideOutPreset = getPreset('toastSlideOut', prefersReducedMotion)

  return (
    <motion.div
      key={id}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={slideInPreset}
      className={`${variant.bg} border px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 pointer-events-auto`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 text-lg font-bold mt-0.5 ${variant.iconColor}`}>
        {variant.icon}
      </div>

      {/* Message */}
      <p className={`flex-grow ${variant.textColor} text-sm font-medium`}>
        {message}
      </p>

      {/* Close button */}
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-2 -mr-1 -mt-1"
        aria-label={`Close ${type} notification`}
      >
        ✕
      </button>
    </motion.div>
  )
}

/**
 * ToastContainer: Renders all active toasts with staggered entrance
 * 
 * Usage:
 * ```jsx
 * <ToastContainer
 *   toasts={toasts}
 *   onDismiss={dismiss}
 *   prefersReducedMotion={prefersReducedMotion}
 * />
 * ```
 */
export const ToastContainer = ({ toasts, onDismiss, prefersReducedMotion = false }) => {
  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50 pointer-events-none flex flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={onDismiss}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
