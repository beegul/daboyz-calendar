import { useState, useEffect } from "react";

/**
 * Hook to detect if a media query matches
 * Useful for responsive design logic (e.g., detecting mobile vs desktop)
 *
 * Usage:
 *   const isMobile = useMediaQuery('(max-width: 767px)')
 *   const isDesktop = useMediaQuery('(min-width: 1024px)')
 *   const hasHover = useMediaQuery('(hover: hover)')
 *
 * @param {string} query - CSS media query string
 * @returns {boolean} true if media query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create media query list
    const mediaQueryList = window.matchMedia(query);

    // Set initial match state
    setMatches(mediaQueryList.matches);

    // Define handler for media query changes
    const handleChange = (e) => {
      setMatches(e.matches);
    };

    // Add listener for media query changes
    // Use addEventListener for broader browser support
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(handleChange);
    }

    // Cleanup listener
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", handleChange);
      } else {
        // Fallback for older browsers
        mediaQueryList.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;
