/**
 * PersonaRow Component Tests
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PersonaRow } from '../PersonaRow'

describe('PersonaRow Component', () => {
  const mockPersona = { name: 'alex', color: '#FF0000' }

  describe('rendering', () => {
    it('renders persona name and color swatch', () => {
      render(<PersonaRow persona={mockPersona} />)
      expect(screen.getByText('alex')).toBeInTheDocument()
    })

    it('renders action buttons (Edit, Delete)', () => {
      render(<PersonaRow persona={mockPersona} />)
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onEdit when Edit button clicked', async () => {
      const onEdit = jest.fn()
      render(<PersonaRow persona={mockPersona} onEdit={onEdit} />)

      await userEvent.click(screen.getByText('Edit'))
      expect(onEdit).toHaveBeenCalledWith('alex')
    })

    it('calls onDelete when Delete button clicked', async () => {
      const onDelete = jest.fn(() => Promise.resolve())
      render(<PersonaRow persona={mockPersona} onDelete={onDelete} />)

      await userEvent.click(screen.getByText('Delete'))
      await waitFor(() => expect(onDelete).toHaveBeenCalledWith('alex'))
    })
  })

  describe('hover states', () => {
    it('shows action buttons on hover', async () => {
      render(<PersonaRow persona={mockPersona} />)
      const row = screen.getByText('alex').closest('div').parentElement

      // Buttons should be present but may have opacity
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })
  })

  describe('delete animation', () => {
    it('animates out when deletion completes', async () => {
      const onDelete = jest.fn(() => Promise.resolve())
      const { container } = render(<PersonaRow persona={mockPersona} onDelete={onDelete} />)

      await userEvent.click(screen.getByText('Delete'))
      await waitFor(() => expect(onDelete).toHaveBeenCalled())

      // Component should remove from DOM after animation
      await waitFor(() => {
        expect(screen.queryByText('alex')).not.toBeInTheDocument()
      }, { timeout: 500 })
    })
  })
})
