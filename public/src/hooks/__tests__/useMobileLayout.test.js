/**
 * Tests for useMobileLayout Hook
 * Feature: 007-multi-user-sync-mobile-ux
 * Phase: 2 - Foundational Infrastructure
 */

import { renderHook, act } from '@testing-library/react';
import { useMobileLayout } from '../useMobileLayout';

describe('useMobileLayout', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    // Restore original window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
  });

  describe('Mobile Viewport', () => {
    test('should detect mobile viewport (< 600px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      const { result } = renderHook(() => useMobileLayout());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.viewport).toBe('mobile');
    });

    test('should detect mobile at 599px boundary', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 599
      });

      const { result } = renderHook(() => useMobileLayout());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.viewport).toBe('mobile');
    });
  });

  describe('Tablet Viewport', () => {
    test('should detect tablet viewport (600-999px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });

      const { result } = renderHook(() => useMobileLayout());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.viewport).toBe('tablet');
    });

    test('should detect tablet at 600px boundary', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      });

      const { result } = renderHook(() => useMobileLayout());

      expect(result.current.isTablet).toBe(true);
      expect(result.current.viewport).toBe('tablet');
    });

    test('should detect tablet at 999px boundary', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 999
      });

      const { result } = renderHook(() => useMobileLayout());

      expect(result.current.isTablet).toBe(true);
      expect(result.current.viewport).toBe('tablet');
    });
  });

  describe('Desktop Viewport', () => {
    test('should detect desktop viewport (>= 1000px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      });

      const { result } = renderHook(() => useMobileLayout());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.viewport).toBe('desktop');
    });

    test('should detect desktop at 1000px boundary', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1000
      });

      const { result } = renderHook(() => useMobileLayout());

      expect(result.current.isDesktop).toBe(true);
      expect(result.current.viewport).toBe('desktop');
    });
  });

  describe('Resize Events', () => {
    test('should update viewport on resize', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      const { result, rerender } = renderHook(() => useMobileLayout());

      expect(result.current.isMobile).toBe(true);

      // Simulate resize to tablet
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 768
        });
        window.dispatchEvent(new Event('resize'));
      });

      rerender();

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
    });

    test('should update from mobile to desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      const { result, rerender } = renderHook(() => useMobileLayout());

      expect(result.current.viewport).toBe('mobile');

      // Simulate resize to desktop
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920
        });
        window.dispatchEvent(new Event('resize'));
      });

      rerender();

      expect(result.current.viewport).toBe('desktop');
    });

    test('should update from desktop to mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });

      const { result, rerender } = renderHook(() => useMobileLayout());

      expect(result.current.viewport).toBe('desktop');

      // Simulate resize to mobile
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375
        });
        window.dispatchEvent(new Event('resize'));
      });

      rerender();

      expect(result.current.viewport).toBe('mobile');
    });
  });

  describe('Cleanup', () => {
    test('should remove resize listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useMobileLayout());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Viewport Classifications', () => {
    const viewportTests = [
      { width: 320, expected: 'mobile' },
      { width: 375, expected: 'mobile' },
      { width: 500, expected: 'mobile' },
      { width: 599, expected: 'mobile' },
      { width: 600, expected: 'tablet' },
      { width: 768, expected: 'tablet' },
      { width: 800, expected: 'tablet' },
      { width: 999, expected: 'tablet' },
      { width: 1000, expected: 'desktop' },
      { width: 1200, expected: 'desktop' },
      { width: 1920, expected: 'desktop' }
    ];

    viewportTests.forEach(({ width, expected }) => {
      test(`should classify ${width}px as ${expected}`, () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        });

        const { result } = renderHook(() => useMobileLayout());

        expect(result.current.viewport).toBe(expected);
      });
    });
  });

  describe('Boolean Flags', () => {
    test('should set exactly one flag to true', () => {
      const testViewports = [375, 768, 1200];

      testViewports.forEach((width) => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        });

        const { result } = renderHook(() => useMobileLayout());

        const trueCount =
          [result.current.isMobile, result.current.isTablet, result.current.isDesktop].filter(
            (v) => v === true
          ).length;

        expect(trueCount).toBe(1);
      });
    });
  });
});
