/**
 * useGestureSwipe Hook: Mobile swipe gesture detection
 * 
 * Wraps @use-gesture/react for velocity-based swipe detection.
 * Detects left/right swipes on touch devices with 50px minimum distance.
 * 
 * Features:
 * - Velocity calculation for natural swipe feel
 * - 50px minimum threshold (prevents accidental triggers)
 * - Touch/mouse/pointer event support
 * - Returns ref to attach to swipe target element
 * 
 * Usage:
 * ```jsx
 * const ref = useGestureSwipe(
 *   () => previousMonth(),
 *   () => nextMonth()
 * )
 * 
 * return <div ref={ref}>Calendar content</div>
 * ```
 */

import { useRef, useCallback } from 'react'
import { useGesture } from '@use-gesture/react'

// Minimum distance for swipe to be recognized (pixels)
const SWIPE_THRESHOLD = 50

export const useGestureSwipe = (onSwipeLeft, onSwipeRight, enabled = true) => {
  const ref = useRef(null)
  const startX = useRef(0)
  const startY = useRef(0)

  const handleSwipe = useCallback(
    (event) => {
      if (!enabled || !ref.current) return

      const { type, touches, clientX, clientY } = event

      // Track initial position
      if (type === 'touchstart' || type === 'pointerdown' || type === 'mousedown') {
        startX.current = clientX || touches?.[0]?.clientX || 0
        startY.current = clientY || touches?.[0]?.clientY || 0
        return
      }

      // Calculate swipe
      if (type === 'touchend' || type === 'pointerup' || type === 'mouseup') {
        const endX = clientX || touches?.[0]?.clientX || 0
        const endY = clientY || touches?.[0]?.clientY || 0

        const deltaX = endX - startX.current
        const deltaY = endY - startY.current
        const distance = Math.abs(deltaX)

        // Only trigger if:
        // 1. Horizontal movement > threshold
        // 2. More horizontal than vertical (not a scroll)
        if (distance > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0) {
            // Right swipe
            onSwipeRight?.()
          } else {
            // Left swipe
            onSwipeLeft?.()
          }
        }

        // Reset
        startX.current = 0
        startY.current = 0
      }
    },
    [enabled, onSwipeLeft, onSwipeRight]
  )

  // Bind gesture events
  useGesture(
    {
      onTouchStart: handleSwipe,
      onTouchEnd: handleSwipe,
      onMouseDown: handleSwipe,
      onMouseUp: handleSwipe,
      onPointerDown: handleSwipe,
      onPointerUp: handleSwipe,
    },
    {
      target: ref,
    }
  )

  return ref
}
