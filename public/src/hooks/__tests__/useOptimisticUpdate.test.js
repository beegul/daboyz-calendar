/**
 * Tests for useOptimisticUpdate Hook
 * 
 * Coverage:
 * - Instant optimistic state update
 * - Background API request
 * - Error rollback behavior
 * - Toast notifications
 * - Loading state management
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useOptimisticUpdate } from '../useOptimisticUpdate'
import { ToastProvider } from '../../context/ToastContext'

describe('useOptimisticUpdate Hook', () => {
  // Wrapper component with ToastProvider (required for useToast)
  const wrapper = ({ children }) => (
    <ToastProvider>{children}</ToastProvider>
  )

  describe('initial state', () => {
    it('initializes with provided value', () => {
      const updateFn = jest.fn()
      const { result } = renderHook(
        () => useOptimisticUpdate('initial', updateFn),
        { wrapper }
      )

      const [value, , isLoading] = result.current
      expect(value).toBe('initial')
      expect(isLoading).toBe(false)
    })
  })

  describe('optimistic updates', () => {
    it('updates state instantly before backend confirms', async () => {
      const updateFn = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))

      const { result } = renderHook(
        () => useOptimisticUpdate('initial', updateFn),
        { wrapper }
      )

      const [, update] = result.current

      // Call update with new value
      act(() => {
        update('updated')
      })

      // Check state immediately (before backend)
      expect(result.current[0]).toBe('updated')
      expect(result.current[2]).toBe(true) // isLoading
    })

    it('calls updateFn with new value', async () => {
      const updateFn = jest.fn(() => Promise.resolve())

      const { result } = renderHook(
        () => useOptimisticUpdate('initial', updateFn),
        { wrapper }
      )

      const [, update] = result.current

      act(() => {
        update('new-value')
      })

      await waitFor(() => {
        expect(updateFn).toHaveBeenCalledWith('new-value')
      })
    })

    it('keeps optimistic state on successful update', async () => {
      const updateFn = jest.fn(() => Promise.resolve())

      const { result } = renderHook(
        () => useOptimisticUpdate('initial', updateFn),
        { wrapper }
      )

      const [, update] = result.current

      let updateResult
      act(() => {
        updateResult = update('updated')
      })

      await waitFor(() => {
        expect(result.current[0]).toBe('updated')
        expect(result.current[2]).toBe(false) // isLoading
      })

      // Update should return true for success
      expect(await updateResult).toBe(true)
    })
  })

  describe('error rollback', () => {
    it('reverts to previous value on error', async () => {
      const updateFn = jest.fn(() => Promise.reject(new Error('API error')))

      const { result } = renderHook(
        () => useOptimisticUpdate('initial', updateFn),
        { wrapper }
      )

      const [, update] = result.current

      // First successful update
      await act(async () => {
        // Mock successful first update
        const successFn = jest.fn(() => Promise.resolve())
        const { result: result2 } = renderHook(
          () => useOptimisticUpdate('initial', successFn),
          { wrapper }
        )
        await result2.current[1]('first-update')
      })

      // Now try update that will fail
      let updateResult
      act(() => {
        updateResult = update('will-fail')
      })

      await waitFor(() => {
        // Should revert to initial value after error
        expect(result.current[0]).toBe('initial')
        expect(result.current[2]).toBe(false) // isLoading false after error
      })

      // Update should return false for failure
      expect(await updateResult).toBe(false)
    })

    it('prevents concurrent updates while loading', async () => {
      const updateFn = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))

      const { result } = renderHook(
        () => useOptimisticUpdate('initial', updateFn),
        { wrapper }
      )

      const [, update] = result.current

      // Start first update
      act(() => {
        update('first')
      })

      // Try second update while loading
      act(() => {
        update('second')
      })

      // Should still be first update
      expect(result.current[0]).toBe('first')

      // Only first updateFn should be called
      await waitFor(() => {
        expect(updateFn).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('state transitions', () => {
    it('manages loading state correctly', async () => {
      const updateFn = jest.fn(
        () => new Promise(resolve => setTimeout(resolve, 50))
      )

      const { result } = renderHook(
        () => useOptimisticUpdate('initial', updateFn),
        { wrapper }
      )

      const [, update] = result.current

      // Before update
      expect(result.current[2]).toBe(false)

      // During update
      act(() => {
        update('updated')
      })
      expect(result.current[2]).toBe(true)

      // After update complete
      await waitFor(() => {
        expect(result.current[2]).toBe(false)
      })
    })

    it('returns [value, update, isLoading] tuple in correct order', async () => {
      const updateFn = jest.fn(() => Promise.resolve())
      const { result } = renderHook(
        () => useOptimisticUpdate('test-value', updateFn),
        { wrapper }
      )

      expect(result.current).toHaveLength(3)
      expect(result.current[0]).toBe('test-value') // value
      expect(typeof result.current[1]).toBe('function') // update function
      expect(typeof result.current[2]).toBe('boolean') // isLoading
    })
  })
})
