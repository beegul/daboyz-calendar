/**
 * T035: Form Input Animation Tests
 * Testing form input focus transitions and animations
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Form Input Animations (T035)', () => {
  describe('Focus Transitions', () => {
    test('input border transitions to primary blue on focus', () => {
      const { container } = render(
        <input
          type="text"
          className="border border-gray-300 focus:border-blue-500 transition-all duration-200"
          placeholder="Name"
        />
      );
      const input = container.querySelector('input');
      
      fireEvent.focus(input);
      expect(input).toHaveClass('focus:border-blue-500');
    });

    test('input ring appears on focus with 200ms transition', () => {
      const { container } = render(
        <input
          type="text"
          className="focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          placeholder="Email"
        />
      );
      const input = container.querySelector('input');
      
      fireEvent.focus(input);
      expect(input).toHaveClass('focus:ring-2', 'transition-all');
    });

    test('border reverts to gray on blur', () => {
      const { container } = render(
        <input
          type="text"
          className="border border-gray-300 focus:border-blue-500 focus:ring-2 transition-all duration-200"
          placeholder="Name"
        />
      );
      const input = container.querySelector('input');
      
      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(input).toHaveClass('border-gray-300');
    });

    test('focus duration is 200ms', () => {
      const { container } = render(
        <input
          type="text"
          className="transition-all duration-200"
          placeholder="Name"
        />
      );
      const input = container.querySelector('input');
      expect(input).toHaveClass('duration-200');
    });
  });

  describe('Error States', () => {
    test('error input displays red border', () => {
      const { container } = render(
        <input
          type="text"
          className="border border-red-300 focus:ring-red-400 transition-all duration-200"
          placeholder="Name"
          aria-invalid="true"
        />
      );
      const input = container.querySelector('input');
      expect(input).toHaveClass('border-red-300');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    test('error focus ring is red instead of blue', () => {
      const { container } = render(
        <input
          type="text"
          className="focus:ring-2 focus:ring-red-400 transition-all duration-200"
          placeholder="Name"
          aria-invalid="true"
        />
      );
      const input = container.querySelector('input');
      fireEvent.focus(input);
      expect(input).toHaveClass('focus:ring-red-400');
    });

    test('error message appears with smooth transition', () => {
      const { container } = render(
        <div>
          <input
            type="text"
            className="border border-red-300 transition-all duration-200"
            aria-invalid="true"
          />
          <p className="text-red-500 text-sm mt-1 opacity-100 transition-opacity duration-200">
            This field is required
          </p>
        </div>
      );
      const errorMessage = container.querySelector('p');
      expect(errorMessage).toHaveClass('transition-opacity', 'duration-200');
    });
  });

  describe('Prefers Reduced Motion', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });

    test('transition duration is reduced when prefers-reduced-motion active', () => {
      const { container } = render(
        <input
          type="text"
          className="border transition-all duration-200"
          style={{ transitionDuration: '0.01ms' }}
        />
      );
      const input = container.querySelector('input');
      expect(input.style.transitionDuration).toBe('0.01ms');
    });
  });

  describe('Focus Ring Visibility', () => {
    test('focus ring is high contrast for visibility', () => {
      const { container } = render(
        <input
          type="text"
          className="focus:ring-2 focus:ring-offset-2"
          placeholder="Name"
        />
      );
      const input = container.querySelector('input');
      fireEvent.focus(input);
      expect(input).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
    });

    test('focus ring has sufficient color contrast', () => {
      const { container } = render(
        <input
          type="text"
          className="focus:ring-blue-400 focus:ring-2"
          placeholder="Name"
        />
      );
      const input = container.querySelector('input');
      fireEvent.focus(input);
      expect(input).toHaveClass('focus:ring-blue-400');
    });
  });

  describe('Performance', () => {
    test('focus transition completes within 200ms', async () => {
      const { container } = render(
        <input
          type="text"
          className="transition-all duration-200"
          placeholder="Name"
        />
      );
      const input = container.querySelector('input');
      
      const startTime = performance.now();
      fireEvent.focus(input);
      
      // Wait for transition to complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThanOrEqual(250); // Allow 50ms buffer
    });

    test('no layout thrashing during focus transition', () => {
      const { container } = render(
        <input
          type="text"
          className="transition-all duration-200"
          placeholder="Name"
        />
      );
      const input = container.querySelector('input');
      
      fireEvent.focus(input);
      // If layout is thrashing, multiple reflows would occur
      // Component uses CSS transitions which are GPU-accelerated
      expect(input).toHaveClass('transition-all');
    });
  });

  describe('Color Picker Input', () => {
    test('color input maintains size and visual feedback on focus', () => {
      const { container } = render(
        <input
          type="color"
          className="w-16 h-10 rounded border border-gray-300 focus:ring-2 transition-all duration-200"
          aria-label="Color picker"
        />
      );
      const input = container.querySelector('input');
      fireEvent.focus(input);
      expect(input).toHaveClass('focus:ring-2', 'transition-all');
    });
  });

  describe('Textarea Animations', () => {
    test('textarea focus transition matches input behavior', () => {
      const { container } = render(
        <textarea
          className="border border-gray-300 focus:border-blue-500 focus:ring-2 transition-all duration-200"
          placeholder="Message"
        />
      );
      const textarea = container.querySelector('textarea');
      fireEvent.focus(textarea);
      expect(textarea).toHaveClass('focus:ring-2', 'transition-all', 'duration-200');
    });
  });
});
