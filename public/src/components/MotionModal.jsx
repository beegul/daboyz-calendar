/**
 * MotionModal Component: Animated modal with Framer Motion
 * 
 * Features:
 * - Fade + scale entrance (300ms, ease-out-quart)
 * - Staggered child animations (50ms delay between elements)
 * - Keyboard accessibility (Escape to close, focus management)
 * - Backdrop click to close
 * - Responsive sizing
 * 
 * Props:
 * - isOpen (boolean): Controls modal visibility
 * - onClose (function): Callback when modal closes
 * - title (string): Modal heading
 * - children (React.ReactNode): Modal content
 * - size ('sm' | 'md' | 'lg'): Modal width
 * - variant ('default' | 'danger'): Color scheme
 * - actions (React.ReactNode): Footer actions/buttons
 */

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getPreset } from '../utils/motionConfig'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

// Size mappings
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

// Variant styling
const variantClasses = {
  default: {
    header: 'bg-white border-b border-gray-200',
    close: 'text-gray-400 hover:text-gray-600',
    headerText: 'text-gray-900',
  },
  danger: {
    header: 'bg-red-50 border-b border-red-200',
    close: 'text-red-400 hover:text-red-600',
    headerText: 'text-red-900',
  },
}

export const MotionModal = ({
  isOpen = false,
  onClose = () => {},
  title = '',
  children = null,
  size = 'md',
  variant = 'default',
  actions = null,
  prefersReducedMotion = false,
}) => {
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)
  const userPreferences = usePrefersReducedMotion()
  const effectivePrefersReduced = prefersReducedMotion || userPreferences

  // Get animation presets
  const enterPreset = getPreset('modalEnter', effectivePrefersReduced)
  const exitPreset = getPreset('modalExit', effectivePrefersReduced)

  // Handle focus management and keyboard
  useEffect(() => {
    if (isOpen) {
      // Store current focused element
      previousActiveElement.current = document.activeElement

      // Move focus to modal
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        firstFocusable?.focus()
      }

      // Handle Escape key
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'
        previousActiveElement.current?.focus()
      }
    }
  }, [isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const variantStyle = variantClasses[variant] || variantClasses.default

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={enterPreset}
            className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none`}
          >
            <motion.div
              className={`${sizeClasses[size]} w-full mx-4 bg-white rounded-lg shadow-xl pointer-events-auto overflow-hidden`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
            >
              {/* Header */}
              {title && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...enterPreset, delay: enterPreset.delay + 50 }}
                  className={`${variantStyle.header} px-6 py-4 flex items-center justify-between`}
                >
                  <h2
                    id="modal-title"
                    className={`text-lg font-semibold ${variantStyle.headerText}`}
                  >
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className={`text-2xl leading-none ${variantStyle.close} transition-colors p-1`}
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </motion.div>
              )}

              {/* Content - staggered animation */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
                className="px-6 py-4"
              >
                {/* Children with individual stagger */}
                {React.Children.map(children, (child, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{
                      duration: effectivePrefersReduced ? 0 : 0.2,
                      delay: effectivePrefersReduced ? 0 : index * 0.05,
                    }}
                  >
                    {child}
                  </motion.div>
                ))}
              </motion.div>

              {/* Footer with actions */}
              {actions && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    ...enterPreset,
                    delay: enterPreset.delay + (React.Children.count(children) * 50),
                  }}
                  className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3"
                >
                  {actions}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
