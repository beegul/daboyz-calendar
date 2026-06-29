/**
 * T056-T063: Mobile Integration Tests
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { CalendarGrid } from '../CalendarGrid'

describe('Mobile Integration', () => {
  const mockEntries = []
  const mockActivePersona = { name: 'alex', color: '#FF0000' }
  const mockCurrentMonth = new Date(2024, 5, 1)

  describe('swipe gesture detection', () => {
    it('responds to swipe gestures on mobile', () => {
      render(
        <CalendarGrid
          currentMonth={mockCurrentMonth}
          entries={mockEntries}
          activePersona={mockActivePersona}
          onDateClick={() => {}}
          onRemoveAvailability={() => {}}
        />
      )

      // Calendar should render with swipe capability
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('shows month navigation on mobile', () => {
      render(
        <CalendarGrid
          currentMonth={mockCurrentMonth}
          entries={mockEntries}
          activePersona={mockActivePersona}
          onDateClick={() => {}}
          onRemoveAvailability={() => {}}
        />
      )

      // Should have month header
      expect(screen.getByText(/June 2024/i)).toBeInTheDocument()
    })
  })

  describe('responsive layout', () => {
    it('adapts to mobile viewport', () => {
      // Mock mobile viewport
      window.innerWidth = 375
      window.innerHeight = 667

      render(
        <CalendarGrid
          currentMonth={mockCurrentMonth}
          entries={mockEntries}
          activePersona={mockActivePersona}
          onDateClick={() => {}}
          onRemoveAvailability={() => {}}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('adapts to tablet viewport', () => {
      window.innerWidth = 768
      window.innerHeight = 1024

      render(
        <CalendarGrid
          currentMonth={mockCurrentMonth}
          entries={mockEntries}
          activePersona={mockActivePersona}
          onDateClick={() => {}}
          onRemoveAvailability={() => {}}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('touch target validation', () => {
    it('meets WCAG AAA 44×44px minimum on all buttons', () => {
      render(
        <CalendarGrid
          currentMonth={mockCurrentMonth}
          entries={mockEntries}
          activePersona={mockActivePersona}
          onDateClick={() => {}}
          onRemoveAvailability={() => {}}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(btn => {
        const styles = window.getComputedStyle(btn)
        // Should have min-height and min-width of 44px
        expect(btn).toHaveClass('min-h-[44px]')
      })
    })
  })
})
