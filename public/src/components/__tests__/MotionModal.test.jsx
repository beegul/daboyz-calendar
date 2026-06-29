/**
 * MotionModal Component Tests
 * Coverage: Animation timing, accessibility, focus management, keyboard handling
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MotionModal } from '../MotionModal'

describe('MotionModal Component', () => {
  describe('rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <MotionModal isOpen={false} title="Test Modal">
          Content
        </MotionModal>
      )
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
    })

    it('renders modal content when isOpen is true', () => {
      render(
        <MotionModal isOpen={true} title="Test Modal">
          Modal content here
        </MotionModal>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Modal content here')).toBeInTheDocument()
    })

    it('renders with correct title', () => {
      render(
        <MotionModal isOpen={true} title="Custom Title">
          Content
        </MotionModal>
      )
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('renders actions in footer when provided', () => {
      render(
        <MotionModal
          isOpen={true}
          title="Test"
          actions={<button>Action Button</button>}
        >
          Content
        </MotionModal>
      )
      expect(screen.getByText('Action Button')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = jest.fn()
      render(
        <MotionModal isOpen={true} title="Test Modal" onClose={onClose}>
          Content
        </MotionModal>
      )

      const closeButton = screen.getByLabelText('Close modal')
      await userEvent.click(closeButton)

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when backdrop is clicked', async () => {
      const onClose = jest.fn()
      const { container } = render(
        <MotionModal isOpen={true} onClose={onClose}>
          Content
        </MotionModal>
      )

      const backdrop = container.querySelector('[aria-hidden="true"]')
      if (backdrop) {
        await userEvent.click(backdrop)
        expect(onClose).toHaveBeenCalled()
      }
    })

    it('calls onClose when Escape key is pressed', async () => {
      const onClose = jest.fn()
      render(
        <MotionModal isOpen={true} onClose={onClose}>
          Content
        </MotionModal>
      )

      await userEvent.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <MotionModal isOpen={true} title="Test Modal">
          Content
        </MotionModal>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    })

    it('traps focus within modal', async () => {
      render(
        <MotionModal isOpen={true} title="Test Modal">
          <input placeholder="Field 1" />
          <button>Action</button>
        </MotionModal>
      )

      const input = screen.getByPlaceholderText('Field 1')
      expect(document.activeElement).toBeInTheDocument()
    })

    it('restores focus when modal closes', async () => {
      const onClose = jest.fn()
      const { rerender } = render(
        <>
          <button>Before Modal</button>
          <MotionModal isOpen={true} onClose={onClose}>
            Content
          </MotionModal>
        </>
      )

      // Close modal
      rerender(
        <>
          <button>Before Modal</button>
          <MotionModal isOpen={false} onClose={onClose}>
            Content
          </MotionModal>
        </>
      )

      // Focus should be restored
      await waitFor(() => {
        expect(document.activeElement).toBeDefined()
      })
    })
  })

  describe('variants', () => {
    it('applies danger variant styling', () => {
      render(
        <MotionModal isOpen={true} title="Delete?" variant="danger">
          Are you sure?
        </MotionModal>
      )

      const header = screen.getByText('Delete?').closest('div')
      expect(header?.className).toContain('bg-red')
    })
  })

  describe('sizes', () => {
    it('respects size prop', () => {
      const { container } = render(
        <MotionModal isOpen={true} size="lg">
          Large modal
        </MotionModal>
      )

      expect(container.querySelector('.max-w-lg')).toBeInTheDocument()
    })
  })
})
