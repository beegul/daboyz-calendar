/**
 * CalendarCell Component Tests
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CalendarCell } from '../CalendarCell'

describe('CalendarCell Component', () => {
  const mockDate = new Date('2024-06-15')
  const mockPersonas = [
    { name: 'alex', color: '#FF0000' },
    { name: 'bobby', color: '#0000FF' },
  ]
  const mockAvailability = { alex: true, bobby: false }

  describe('rendering', () => {
    it('renders date number', () => {
      render(
        <CalendarCell
          date={mockDate}
          personas={mockPersonas}
          availability={mockAvailability}
        />
      )
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('renders all personas as buttons', () => {
      render(
        <CalendarCell
          date={mockDate}
          personas={mockPersonas}
          availability={mockAvailability}
        />
      )
      expect(screen.getByText(/alex/)).toBeInTheDocument()
      expect(screen.getByText(/bobby/)).toBeInTheDocument()
    })

    it('shows available status (✓) for available personas', () => {
      render(
        <CalendarCell
          date={mockDate}
          personas={mockPersonas}
          availability={{ alex: true }}
        />
      )
      expect(screen.getByText(/alex.*✓/)).toBeInTheDocument()
    })

    it('shows unavailable status (✗) for unavailable personas', () => {
      render(
        <CalendarCell
          date={mockDate}
          personas={mockPersonas}
          availability={{ alex: false }}
        />
      )
      expect(screen.getByText(/alex.*✗/)).toBeInTheDocument()
    })
  })

  describe('optimistic updates', () => {
    it('toggles persona availability on click', async () => {
      const onToggle = jest.fn(() => Promise.resolve())
      render(
        <CalendarCell
          date={mockDate}
          personas={mockPersonas}
          availability={mockAvailability}
          onToggle={onToggle}
        />
      )

      const alexButton = screen.getByText(/alex/)
      await userEvent.click(alexButton)

      await waitFor(() => {
        expect(onToggle).toHaveBeenCalledWith(mockDate.toISOString().split('T')[0], 'alex', false)
      })
    })

    it('updates UI instantly (optimistic)', async () => {
      const onToggle = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(
        <CalendarCell
          date={mockDate}
          personas={mockPersonas}
          availability={{ alex: true }}
          onToggle={onToggle}
        />
      )

      const alexButton = screen.getByText(/alex.*✓/)
      await userEvent.click(alexButton)

      // Should immediately show unavailable (before backend responds)
      expect(screen.getByText(/alex.*✗/)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <CalendarCell
          date={mockDate}
          personas={mockPersonas}
          availability={mockAvailability}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(btn => {
        expect(btn).toHaveAttribute('aria-label')
      })
    })

    it('has proper ARIA pressed state', () => {
      render(
        <CalendarCell
          date={mockDate}
          personas={mockPersonas}
          availability={{ alex: true }}
        />
      )

      const alexButton = screen.getByText(/alex/)
      expect(alexButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('meets 44×44px touch target minimum', () => {
      render(
        <CalendarCell
          date={mockDate}
          personas={mockPersonas}
          availability={mockAvailability}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(btn => {
        expect(btn).toHaveClass('min-h-[44px]')
      })
    })
  })
})
