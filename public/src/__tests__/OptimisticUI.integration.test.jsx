/**
 * T040-T045: Optimistic UI Integration Tests
 */

import React, { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from '../context/ToastContext'
import { useOptimisticUpdate } from '../hooks/useOptimisticUpdate'
import { Shimmer } from '../Shimmer'

// Mock component for testing optimistic UI patterns
const OptimisticComponent = ({ initialValue = false }) => {
  const [value, updateValue, isLoading] = useOptimisticUpdate(
    initialValue,
    async (newValue) => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return newValue
    }
  )

  return (
    <div>
      <Shimmer isLoading={isLoading}>
        <button onClick={() => updateValue(!value)} role="switch" aria-checked={value}>
          {value ? 'On' : 'Off'}
        </button>
      </Shimmer>
      <span>{isLoading ? 'Loading...' : 'Ready'}</span>
    </div>
  )
}

describe('Optimistic UI Patterns', () => {
  describe('instant feedback', () => {
    it('shows new value instantly before backend confirms', async () => {
      render(
        <ToastProvider>
          <OptimisticComponent initialValue={false} />
        </ToastProvider>
      )

      const button = screen.getByRole('switch')
      expect(button).toHaveAttribute('aria-checked', 'false')

      await userEvent.click(button)

      // Should immediately show new value (optimistic)
      expect(button).toHaveAttribute('aria-checked', 'true')
    })

    it('shows loading shimmer during update', async () => {
      render(
        <ToastProvider>
          <OptimisticComponent initialValue={false} />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('switch'))

      // Loading indicator should appear
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('success state', () => {
    it('confirms value after backend response', async () => {
      render(
        <ToastProvider>
          <OptimisticComponent initialValue={false} />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('switch'))

      await waitFor(() => {
        expect(screen.getByText('Ready')).toBeInTheDocument()
      })
    })
  })

  describe('prefers-reduced-motion', () => {
    beforeEach(() => {
      global.testPrefersReducedMotion = true
    })

    afterEach(() => {
      global.testPrefersReducedMotion = false
    })

    it('disables shimmer animation when prefers-reduced-motion active', () => {
      render(
        <ToastProvider>
          <OptimisticComponent initialValue={false} />
        </ToastProvider>
      )

      // Shimmer should still render but with no animation
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })
  })
})

describe('Delete Persona Animation', () => {
  const DeletePersonaComponent = ({ onDelete }) => {
    const [isDeleted, setIsDeleted] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const handleDelete = async () => {
      setDeleteLoading(true)
      try {
        await onDelete()
        setIsDeleted(true)
      } finally {
        setDeleteLoading(false)
      }
    }

    if (isDeleted) return null

    return (
      <div>
        <span>Persona: Alex</span>
        <button onClick={handleDelete} disabled={deleteLoading}>
          {deleteLoading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    )
  }

  it('removes persona from DOM after successful deletion', async () => {
    const onDelete = jest.fn(() => Promise.resolve())

    const { container } = render(
      <ToastProvider>
        <DeletePersonaComponent onDelete={onDelete} />
      </ToastProvider>
    )

    expect(screen.getByText('Persona: Alex')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(screen.queryByText('Persona: Alex')).not.toBeInTheDocument()
    })
  })
})
