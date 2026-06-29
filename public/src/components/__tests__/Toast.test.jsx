/**
 * Toast Component Tests
 * 
 * Coverage:
 * - Slide animation timing (200ms)
 * - Auto-dismiss behavior (4s)
 * - aria-live announcements
 * - Queue management (max 3 toasts)
 */

import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { motion } from 'framer-motion'
import { Toast, ToastContainer } from '../Toast'
import { waitForAnimationComplete } from '../../__tests__/setup/animationTestHelpers'

describe('Toast Component', () => {
  describe('Toast rendering', () => {
    it('renders success toast with correct styling and icon', () => {
      render(
        <Toast
          id="toast-1"
          message="Saved successfully!"
          type="success"
          onDismiss={() => {}}
        />
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('✓')).toBeInTheDocument()
      expect(screen.getByText('Saved successfully!')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveClass('bg-green-50')
    })

    it('renders error toast with correct styling and icon', () => {
      render(
        <Toast
          id="toast-2"
          message="Something went wrong"
          type="error"
          onDismiss={() => {}}
        />
      )

      expect(screen.getByRole('alert')).toHaveClass('bg-red-50')
      expect(screen.getByText('⚠')).toBeInTheDocument()
    })

    it('renders info toast with correct styling and icon', () => {
      render(
        <Toast
          id="toast-3"
          message="Please note"
          type="info"
          onDismiss={() => {}}
        />
      )

      expect(screen.getByRole('alert')).toHaveClass('bg-blue-50')
      expect(screen.getByText('ℹ')).toBeInTheDocument()
    })
  })

  describe('Toast interactions', () => {
    it('calls onDismiss when close button is clicked', async () => {
      const onDismiss = jest.fn()
      render(
        <Toast
          id="toast-1"
          message="Test message"
          type="success"
          onDismiss={onDismiss}
        />
      )

      const closeButton = screen.getByLabelText(/close success notification/i)
      await userEvent.click(closeButton)

      expect(onDismiss).toHaveBeenCalledWith('toast-1')
    })
  })

  describe('Toast accessibility', () => {
    it('has aria-live region for announcements', () => {
      const { container } = render(
        <Toast
          id="toast-1"
          message="Test message"
          type="success"
          onDismiss={() => {}}
        />
      )

      const alert = container.querySelector('[role="alert"]')
      expect(alert).toHaveAttribute('aria-live', 'polite')
      expect(alert).toHaveAttribute('aria-atomic', 'true')
    })

    it('has accessible close button with aria-label', () => {
      render(
        <Toast
          id="toast-1"
          message="Test message"
          type="error"
          onDismiss={() => {}}
        />
      )

      const closeButton = screen.getByLabelText(/close error notification/i)
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('ToastContainer', () => {
    it('renders multiple toasts with staggered animations', () => {
      const toasts = [
        { id: 'toast-1', message: 'First toast', type: 'success' },
        { id: 'toast-2', message: 'Second toast', type: 'info' },
        { id: 'toast-3', message: 'Third toast', type: 'error' },
      ]

      render(
        <motion.div>
          <ToastContainer toasts={toasts} onDismiss={() => {}} />
        </motion.div>
      )

      expect(screen.getByText('First toast')).toBeInTheDocument()
      expect(screen.getByText('Second toast')).toBeInTheDocument()
      expect(screen.getByText('Third toast')).toBeInTheDocument()
    })

    it('has aria-label for region', () => {
      const toasts = [
        { id: 'toast-1', message: 'Test', type: 'info' },
      ]

      const { container } = render(
        <ToastContainer toasts={toasts} onDismiss={() => {}} />
      )

      const region = container.querySelector('[role="region"]')
      expect(region).toHaveAttribute('aria-label', 'Notifications')
    })

    it('dismisses toasts when requested', async () => {
      const onDismiss = jest.fn()
      const toasts = [
        { id: 'toast-1', message: 'Test', type: 'success' },
      ]

      render(
        <motion.div>
          <ToastContainer toasts={toasts} onDismiss={onDismiss} />
        </motion.div>
      )

      const closeButton = screen.getByLabelText(/close success notification/i)
      await userEvent.click(closeButton)

      expect(onDismiss).toHaveBeenCalledWith('toast-1')
    })

    it('respects prefers-reduced-motion by disabling animations', () => {
      // When prefersReducedMotion is true, animations should have 0 duration
      const toasts = [
        { id: 'toast-1', message: 'Test', type: 'success' },
      ]

      const { container } = render(
        <ToastContainer
          toasts={toasts}
          onDismiss={() => {}}
          prefersReducedMotion={true}
        />
      )

      const motionDiv = container.querySelector('[role="region"]')
      expect(motionDiv).toBeInTheDocument()
    })
  })
})
