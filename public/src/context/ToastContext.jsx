/**
 * Toast Context: Global notification state management
 * 
 * Manages toast queue (max 3 visible at once)
 * Provides toast dispatch methods: success, error, info
 * Auto-dismisses after 4s
 */

import React, { createContext, useCallback, useState } from 'react'

export const ToastContext = createContext()

/**
 * ToastProvider: Wrap application with this to enable toast notifications
 * 
 * Usage:
 * ```jsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  // Create unique ID for each toast
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Add toast to queue (max 3 visible)
  const addToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = generateId()

      setToasts(prev => {
        // Keep only last 3 toasts
        const newToasts = [...prev, { id, message, type, duration }]
        return newToasts.slice(-3)
      })

      // Auto-dismiss after duration
      if (duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(toast => toast.id !== id))
        }, duration)
      }

      return id
    },
    [generateId]
  )

  // Convenience methods for different toast types
  const success = useCallback(
    (message, duration) => addToast(message, 'success', duration),
    [addToast]
  )

  const error = useCallback(
    (message, duration) => addToast(message, 'error', duration),
    [addToast]
  )

  const info = useCallback(
    (message, duration) => addToast(message, 'info', duration),
    [addToast]
  )

  // Remove specific toast by ID (for manual dismissal)
  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Clear all toasts
  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  const value = {
    toasts,
    addToast,
    success,
    error,
    info,
    dismiss,
    clearAll,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}
