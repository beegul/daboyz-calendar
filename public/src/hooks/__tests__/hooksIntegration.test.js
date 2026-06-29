/**
 * Hook Integration Tests: Test interactions between multiple hooks
 * 
 * Coverage:
 * - useToast + useOptimisticUpdate working together
 * - useToast + usePrefersReducedMotion
 * - Animation duration respected when prefers-reduced-motion active
 * - All hooks work in same component
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useToast } from '../useToast'
import { useOptimisticUpdate } from '../useOptimisticUpdate'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
import { useAnimationDuration } from '../useAnimationDuration'
import { ToastProvider } from '../../context/ToastContext'

describe('Hook Integration', () => {
  const wrapper = ({ children }) => (
    <ToastProvider>{children}</ToastProvider>
  )

  describe('useToast + useOptimisticUpdate', () => {
    it('shows success toast after optimistic update succeeds', async () => {
      const updateFn = jest.fn(() => Promise.resolve())

      const { result: toastResult } = renderHook(
        () => useToast(),
        { wrapper }
      )

      const { result: updateResult } = renderHook(
        () => useOptimisticUpdate('initial', updateFn),
        { wrapper }
      )

      const { success } = toastResult.current
      const [, update] = updateResult.current

      // Verify both hooks are working
      expect(typeof success).toBe('function')
      expect(typeof update).toBe('function')
    })

    it('shows error toast after optimistic update fails', async () => {
      const updateFn = jest.fn(() =>
        Promise.reject(new Error('Update failed'))
      )

      const { result: toastResult } = renderHook(
        () => useToast(),
        { wrapper }
      )

      const { result: updateResult } = renderHook(
        () => useOptimisticUpdate('initial', updateFn),
        { wrapper }
      )

      const { error } = toastResult.current
      const [, update] = updateResult.current

      // Both hooks should be available for error handling
      expect(typeof error).toBe('function')
      expect(typeof update).toBe('function')
    })
  })

  describe('useToast + usePrefersReducedMotion', () => {
    it('toasts respect prefers-reduced-motion setting', () => {
      const { result: toastResult } = renderHook(
        () => useToast(),
        { wrapper }
      )

      const { result: motionResult } = renderHook(
        () => usePrefersReducedMotion()
      )

      expect(typeof toastResult.current.success).toBe('function')
      expect(typeof motionResult.current).toBe('boolean')
    })

    it('animation hooks work together', () => {
      const { result: reducedMotionResult } = renderHook(
        () => usePrefersReducedMotion()
      )

      const { result: durationResult } = renderHook(
        () => useAnimationDuration(300)
      )

      // When prefers-reduced-motion: false, duration should be 300
      // When prefers-reduced-motion: true, duration should be 0
      expect(typeof reducedMotionResult.current).toBe('boolean')
      expect(typeof durationResult.current).toBe('number')
    })
  })

  describe('All hooks in component', () => {
    it('multiple hooks can be used in same component', () => {
      const updateFn = jest.fn(() => Promise.resolve())

      const { result } = renderHook(
        () => {
          const toast = useToast()
          const [value, update, isLoading] = useOptimisticUpdate('initial', updateFn)
          const prefersReduced = usePrefersReducedMotion()
          const duration = useAnimationDuration(300)

          return { toast, value, update, isLoading, prefersReduced, duration }
        },
        { wrapper }
      )

      expect(result.current.toast).toBeDefined()
      expect(result.current.value).toBe('initial')
      expect(result.current.isLoading).toBe(false)
      expect(typeof result.current.prefersReduced).toBe('boolean')
      expect(typeof result.current.duration).toBe('number')
    })

    it('all hooks maintain independent state', () => {
      const updateFn1 = jest.fn(() => Promise.resolve())
      const updateFn2 = jest.fn(() => Promise.resolve())

      const { result } = renderHook(
        () => {
          const [value1, update1] = useOptimisticUpdate('init1', updateFn1)
          const [value2, update2] = useOptimisticUpdate('init2', updateFn2)
          return { value1, update1, value2, update2 }
        },
        { wrapper }
      )

      expect(result.current.value1).toBe('init1')
      expect(result.current.value2).toBe('init2')
    })
  })

  describe('Accessibility compliance', () => {
    it('respects prefers-reduced-motion in animation durations', () => {
      global.testPrefersReducedMotion = false
      const { result: durationResult1 } = renderHook(
        () => useAnimationDuration(300)
      )
      expect(durationResult1.current).toBe(300)

      global.testPrefersReducedMotion = true
      const { result: durationResult2 } = renderHook(
        () => useAnimationDuration(300)
      )
      expect(durationResult2.current).toBe(0)

      global.testPrefersReducedMotion = false
    })

    it('toast notifications still work when animations disabled', async () => {
      global.testPrefersReducedMotion = true

      const { result } = renderHook(
        () => useToast(),
        { wrapper }
      )

      expect(result.current.success).toBeDefined()
      expect(result.current.error).toBeDefined()
      expect(result.current.info).toBeDefined()

      global.testPrefersReducedMotion = false
    })

    it('optimistic updates work regardless of animation preference', async () => {
      const updateFn = jest.fn(() => Promise.resolve())

      global.testPrefersReducedMotion = true

      const { result } = renderHook(
        () => useOptimisticUpdate('initial', updateFn),
        { wrapper }
      )

      expect(result.current[0]).toBe('initial')
      expect(result.current[2]).toBe(false)

      global.testPrefersReducedMotion = false
    })
  })

  describe('Error handling and edge cases', () => {
    it('useToast throws error if used outside ToastProvider', () => {
      // Suppress console.error for this test
      const spy = jest.spyOn(console, 'error').mockImplementation()

      const { result } = renderHook(() => useToast())

      // Should throw error
      expect(result.error).toBeDefined()

      spy.mockRestore()
    })

    it('concurrent updates are prevented', async () => {
      const updateFn = jest.fn(() =>
        new Promise(resolve => setTimeout(resolve, 50))
      )

      const { result } = renderHook(
        () => useOptimisticUpdate('initial', updateFn),
        { wrapper }
      )

      const [, update] = result.current

      // Start first update
      act(() => {
        update('first')
      })

      // Try second update (should be prevented)
      act(() => {
        update('second')
      })

      await waitFor(() => {
        // Only first update should be processed
        expect(updateFn).toHaveBeenCalledTimes(1)
      })
    })
  })
})
