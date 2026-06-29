/**
 * useToast Hook: Access toast notifications from any component
 * 
 * Usage:
 * ```jsx
 * const { success, error, info } = useToast()
 * 
 * const handleSave = async () => {
 *   try {
 *     await save()
 *     success('Saved successfully!')
 *   } catch (err) {
 *     error('Failed to save')
 *   }
 * }
 * ```
 */

import { useContext } from 'react'
import { ToastContext } from '../context/ToastContext'

export const useToast = () => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return {
    success: context.success,
    error: context.error,
    info: context.info,
    dismiss: context.dismiss,
    clearAll: context.clearAll,
  }
}
