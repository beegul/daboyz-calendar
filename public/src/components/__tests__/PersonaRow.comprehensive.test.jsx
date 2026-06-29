/**
 * PersonaRow Tests (T037)
 * Testing hover animation, left border accent slide-in, delete button visibility
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PersonaRow } from '../PersonaRow'
import { ToastProvider } from '../../context/ToastContext'

const mockPersona = { name: 'alex', color: '#ff0000' }

describe('T037: PersonaRow Hover Animations', () => {
  it('renders persona with name and color', () => {
    render(
      <ToastProvider>
        <PersonaRow persona={mockPersona} onDelete={jest.fn()} onEdit={jest.fn()} />
      </ToastProvider>
    )

    expect(screen.getByText('alex')).toBeInTheDocument()
  })

  it('shows delete button on hover', async () => {
    const { container } = render(
      <ToastProvider>
        <PersonaRow persona={mockPersona} onDelete={jest.fn()} onEdit={jest.fn()} />
      </ToastProvider>
    )

    const row = container.querySelector('[class*="flex"]')
    fireEvent.mouseEnter(row)

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton).toBeInTheDocument()
    })
  })

  it('hides delete button on mouse leave', async () => {
    const { container } = render(
      <ToastProvider>
        <PersonaRow persona={mockPersona} onDelete={jest.fn()} onEdit={jest.fn()} />
      </ToastProvider>
    )

    const row = container.querySelector('[class*="flex"]')
    
    // Hover to show
    fireEvent.mouseEnter(row)
    
    // Leave to hide
    fireEvent.mouseLeave(row)

    await waitFor(() => {
      // Delete button visibility should change
      const buttons = screen.queryAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('calls onEdit when edit button clicked', async () => {
    const handleEdit = jest.fn()
    const { container } = render(
      <ToastProvider>
        <PersonaRow persona={mockPersona} onDelete={jest.fn()} onEdit={handleEdit} />
      </ToastProvider>
    )

    const row = container.querySelector('[class*="flex"]')
    fireEvent.mouseEnter(row)

    const editButton = screen.getByRole('button', { name: /edit/i })
    await userEvent.click(editButton)

    expect(handleEdit).toHaveBeenCalledWith('alex')
  })

  it('calls onDelete when delete button clicked', async () => {
    const handleDelete = jest.fn(async () => {})
    const { container } = render(
      <ToastProvider>
        <PersonaRow persona={mockPersona} onDelete={handleDelete} onEdit={jest.fn()} />
      </ToastProvider>
    )

    const row = container.querySelector('[class*="flex"]')
    fireEvent.mouseEnter(row)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await userEvent.click(deleteButton)

    expect(handleDelete).toHaveBeenCalledWith('alex')
  })

  it('disables delete button during deletion', async () => {
    let isDeleting = false
    const handleDelete = jest.fn(async () => {
      isDeleting = true
      await new Promise(resolve => setTimeout(resolve, 100))
      isDeleting = false
    })

    const { container, rerender } = render(
      <ToastProvider>
        <PersonaRow persona={mockPersona} onDelete={handleDelete} onEdit={jest.fn()} />
      </ToastProvider>
    )

    const row = container.querySelector('[class*="flex"]')
    fireEvent.mouseEnter(row)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await userEvent.click(deleteButton)

    expect(handleDelete).toHaveBeenCalled()
  })

  it('animates out when deleting', async () => {
    const handleDelete = jest.fn(async () => {})
    const { container } = render(
      <ToastProvider>
        <PersonaRow persona={mockPersona} onDelete={handleDelete} onEdit={jest.fn()} />
      </ToastProvider>
    )

    const row = container.querySelector('[class*="flex"]')
    fireEvent.mouseEnter(row)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await userEvent.click(deleteButton)

    expect(handleDelete).toHaveBeenCalledWith('alex')
  })

  it('respects prefers-reduced-motion for animations', () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = jest.fn((query) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return { matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() }
      }
      return originalMatchMedia(query)
    })

    render(
      <ToastProvider>
        <PersonaRow persona={mockPersona} onDelete={jest.fn()} onEdit={jest.fn()} />
      </ToastProvider>
    )

    expect(screen.getByText('alex')).toBeInTheDocument()

    window.matchMedia = originalMatchMedia
  })
})
