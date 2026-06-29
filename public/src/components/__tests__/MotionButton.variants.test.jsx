/**
 * T029: MotionButton Variants Test
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { MotionButton } from '../MotionButton'

describe('MotionButton - Variants', () => {
  describe('all variants', () => {
    it('renders primary variant', () => {
      render(<MotionButton variant="primary">Primary</MotionButton>)
      expect(screen.getByText('Primary')).toHaveClass('bg-blue-600')
    })

    it('renders secondary variant', () => {
      render(<MotionButton variant="secondary">Secondary</MotionButton>)
      expect(screen.getByText('Secondary')).toHaveClass('bg-gray-200')
    })

    it('renders danger variant', () => {
      render(<MotionButton variant="danger">Danger</MotionButton>)
      expect(screen.getByText('Danger')).toHaveClass('bg-red-600')
    })
  })

  describe('sizes', () => {
    it('renders all sizes with 44px minimum', () => {
      const { rerender } = render(<MotionButton size="sm">Small</MotionButton>)
      expect(screen.getByRole('button')).toHaveClass('min-h-[44px]')

      rerender(<MotionButton size="md">Medium</MotionButton>)
      expect(screen.getByRole('button')).toHaveClass('min-h-[44px]')

      rerender(<MotionButton size="lg">Large</MotionButton>)
      expect(screen.getByRole('button')).toHaveClass('min-h-[44px]')
    })
  })
})
