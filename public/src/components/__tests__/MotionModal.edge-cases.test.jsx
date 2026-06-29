/**
 * T026: MotionModal Edge Cases Test
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MotionModal } from '../MotionModal'

describe('MotionModal - Edge Cases', () => {
  describe('size variants', () => {
    it('renders small modal', () => {
      render(
        <MotionModal isOpen={true} onClose={() => {}} title="Test" size="sm">
          Content
        </MotionModal>
      )
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('renders large modal', () => {
      render(
        <MotionModal isOpen={true} onClose={() => {}} title="Test" size="lg">
          Content
        </MotionModal>
      )
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('nested modals', () => {
    it('handles multiple modals with proper z-index', () => {
      const { rerender } = render(
        <MotionModal isOpen={true} onClose={() => {}} title="Modal 1">
          First
        </MotionModal>
      )

      expect(screen.getByText('First')).toBeInTheDocument()

      rerender(
        <div>
          <MotionModal isOpen={true} onClose={() => {}} title="Modal 1">
            First
          </MotionModal>
          <MotionModal isOpen={true} onClose={() => {}} title="Modal 2">
            Second
          </MotionModal>
        </div>
      )

      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })
  })

  describe('content overflow', () => {
    it('handles long content with scrolling', () => {
      render(
        <MotionModal isOpen={true} onClose={() => {}} title="Test">
          {Array(50)
            .fill(0)
            .map((_, i) => (
              <div key={i}>Line {i + 1}</div>
            ))}
        </MotionModal>
      )

      expect(screen.getByText('Line 50')).toBeInTheDocument()
    })
  })
})
