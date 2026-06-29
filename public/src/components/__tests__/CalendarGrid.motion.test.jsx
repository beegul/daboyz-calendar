/**
 * CalendarGrid Motion Tests
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import CalendarGrid from '../CalendarGrid'

describe('CalendarGrid Motion Animations', () => {
  const mockEntries = []
  const mockActivePersona = { name: 'alex', color: '#FF0000' }
  const mockCurrentMonth = new Date(2024, 5, 1) // June 2024

  describe('month navigation animations', () => {
    it('renders calendar for current month', () => {
      render(
        <CalendarGrid
          currentMonth={mockCurrentMonth}
          entries={mockEntries}
          activePersona={mockActivePersona}
          onDateClick={() => {}}
          onRemoveAvailability={() => {}}
        />
      )

      // Should show month days
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
    })

    it('displays weekday headers', () => {
      render(
        <CalendarGrid
          currentMonth={mockCurrentMonth}
          entries={mockEntries}
          activePersona={mockActivePersona}
          onDateClick={() => {}}
          onRemoveAvailability={() => {}}
        />
      )

      expect(screen.getByText('Sun')).toBeInTheDocument()
      expect(screen.getByText('Mon')).toBeInTheDocument()
      expect(screen.getByText('Fri')).toBeInTheDocument()
    })

    it('highlights today with special styling', () => {
      const today = new Date()
      render(
        <CalendarGrid
          currentMonth={today}
          entries={mockEntries}
          activePersona={mockActivePersona}
          onDateClick={() => {}}
          onRemoveAvailability={() => {}}
        />
      )

      const todayCell = screen.getByText(today.getDate().toString()).closest('div')
      expect(todayCell).toHaveClass('bg-blue-50')
    })
  })

  describe('availability display', () => {
    it('displays availability badges for dates with entries', () => {
      const entries = [
        { date: '2024-06-15', name: 'alex', color: '#FF0000' },
      ]

      render(
        <CalendarGrid
          currentMonth={mockCurrentMonth}
          entries={entries}
          activePersona={mockActivePersona}
          onDateClick={() => {}}
          onRemoveAvailability={() => {}}
        />
      )

      const badge = screen.getByText('alex')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onDateClick when date is clicked', () => {
      const onDateClick = jest.fn()
      render(
        <CalendarGrid
          currentMonth={mockCurrentMonth}
          entries={mockEntries}
          activePersona={mockActivePersona}
          onDateClick={onDateClick}
          onRemoveAvailability={() => {}}
        />
      )

      const cell = screen.getByText('15').closest('div')
      cell?.click()

      expect(onDateClick).toHaveBeenCalledWith('2024-06-15')
    })
  })
})
