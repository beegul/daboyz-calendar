/**
 * useOptimisticUpdate Hook: Instant UI feedback with rollback on errors
 * 
 * Implements optimistic updates pattern:
 * 1. User interacts (e.g., clicks calendar cell)
 * 2. UI updates instantly (<16ms) - optimistic state
 * 3. Backend request fires in background
 * 4. On success: Keep optimistic state, show success toast
 * 5. On error: Revert to previous state (200ms rollback animation), show error toast
 * 
 * Usage:
 * ```jsx
 * const [status, updateStatus, isLoading] = useOptimisticUpdate(
 *   persona,
 *   async (newValue) => {
 *     await api.updatePersona(newValue)
 *   }
 * )
 * 
 * const handleToggle = async () => {
 *   await updateStatus(!status)
 * }
 * ```
 */

import { useState, useCallback } from 'react'
import { useToast } from './useToast'

export const useOptimisticUpdate = (initialValue, updateFn) => {
  const [value, setValue] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)
  const [previousValue, setPreviousValue] = useState(initialValue)
  const { error: errorToast, success: successToast } = useToast()

  const update = useCallback(
    async (newValue) => {
      // Already loading - don't start another update
      if (isLoading) return

      // Store previous value for rollback
      setPreviousValue(value)

      // Instant optimistic update (<16ms)
      setValue(newValue)
      setIsLoading(true)

      try {
        // Fire backend request in background
        await updateFn(newValue)

        // Backend confirmed - keep optimistic state
        setIsLoading(false)
        successToast('Updated successfully')

        return true
      } catch (err) {
        // Rollback to previous value on error
        setIsLoading(false)

        // Animated rollback (200ms)
        setTimeout(() => {
          setValue(previousValue)
        }, 0) // Revert immediately, animation handled by component

        // Show error toast
        errorToast(err?.message || 'Failed to update')

        return false
      }
    },
    [value, isLoading, previousValue, updateFn, errorToast, successToast]
  )

  return [value, update, isLoading]
}
