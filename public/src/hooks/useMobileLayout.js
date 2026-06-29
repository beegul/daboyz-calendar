/**
 * useMobileLayout Hook
 * 
 * Detects viewport size and classifies as mobile/tablet/desktop.
 * 
 * Feature: 007-multi-user-sync-mobile-ux
 * Phase: 2 - Foundational Infrastructure
 * Contract: contracts/mobile-components-interface.md
 */

import { useState, useEffect } from 'react';

/**
 * @typedef {Object} MobileLayoutResult
 * @property {boolean} isMobile - true if viewport < 600px
 * @property {boolean} isTablet - true if viewport 600-999px
 * @property {boolean} isDesktop - true if viewport >= 1000px
 * @property {'mobile'|'tablet'|'desktop'} viewport - Current viewport classification
 */

/**
 * Custom hook for detecting viewport size and classifying layout
 * 
 * @returns {MobileLayoutResult} Viewport classification
 */
export function useMobileLayout() {
  const [viewport, setViewport] = useState(() => {
    // Server-side rendering safe default
    if (typeof window === 'undefined') {
      return 'desktop';
    }

    const width = window.innerWidth;
    if (width < 600) return 'mobile';
    if (width < 1000) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 600) {
        setViewport('mobile');
      } else if (width < 1000) {
        setViewport('tablet');
      } else {
        setViewport('desktop');
      }
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Initial check (in case initial value wasn't accurate)
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    isMobile: viewport === 'mobile',
    isTablet: viewport === 'tablet',
    isDesktop: viewport === 'desktop',
    viewport
  };
}

export default useMobileLayout;
