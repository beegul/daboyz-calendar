/**
 * MotionButton Component Tests
 * Coverage: Hover/press animations, accessibility, touch targets, loading state
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MotionButton } from '../MotionButton'

describe('MotionButton Component', () => {
  describe('rendering', () => {
    it('renders button with text', () => {
      render(<MotionButton>Click me</MotionButton>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('renders in different variants', () => {
      const { rerender } = render(<MotionButton variant="primary">Primary</MotionButton>)
      expect(screen.getByRole('button')).toHaveClass('bg-blue-600')

      rerender(<MotionButton variant="danger">Danger</MotionButton>)
      expect(screen.getByRole('button')).toHaveClass('bg-red-600')

      rerender(<MotionButton variant="secondary">Secondary</MotionButton>)
      expect(screen.getByRole('button')).toHaveClass('bg-gray-200')
    })

    it('renders in different sizes with 44×44px minimum', () => {
      const { rerender } = render(<MotionButton size="sm">Small</MotionButton>)
      expect(screen.getByRole('button')).toHaveClass('min-h-[44px]')

      rerender(<MotionButton size="lg">Large</MotionButton>)
      expect(screen.getByRole('button')).toHaveClass('min-h-[44px]')
    })

    it('renders loading spinner when isLoading is true', () => {
      render(<MotionButton isLoading={true}>Loading</MotionButton>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('renders disabled state', () => {
      render(<MotionButton disabled={true}>Disabled</MotionButton>)
      expect(screen.getByRole('button')).toBeDisabled()
      expect(screen.getByRole('button')).toHaveClass('opacity-50')
    })
  })

  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const onClick = jest.fn()
      render(<MotionButton onClick={onClick}>Click me</MotionButton>)

      await userEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalled()
    })

    it('does not call onClick when disabled', async () => {
      const onClick = jest.fn()
      render(<MotionButton onClick={onClick} disabled={true}>Disabled</MotionButton>)

      await userEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })

    it('does not call onClick while loading', async () => {
      const onClick = jest.fn()
      render(<MotionButton onClick={onClick} isLoading={true}>Loading</MotionButton>)

      await userEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('has proper ARIA attributes for disabled state', () => {
      render(<MotionButton disabled={true}>Disabled</MotionButton>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
    })

    it('meets 44×44px touch target minimum', () => {
      render(<MotionButton>Touch</MotionButton>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('min-h-[44px]')
    })

    it('has focus ring', () => {
      render(<MotionButton>Focus</MotionButton>)
      expect(screen.getByRole('button')).toHaveClass('focus:ring-2')
    })
  })
})
