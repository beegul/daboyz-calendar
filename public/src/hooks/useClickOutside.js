import { useEffect } from "react";

/**
 * Hook to detect clicks outside a specified element
 * Useful for closing modals, dropdowns, and popovers
 *
 * Usage:
 *   const ref = useRef(null)
 *   useClickOutside(ref, () => setIsOpen(false))
 *
 * @param {React.RefObject} ref - Ref to the element to track
 * @param {function} onClickOutside - Callback when click is outside
 * @param {object} options - Additional options
 * @param {boolean} options.enabled - Enable/disable the hook (default: true)
 */
export const useClickOutside = (ref, onClickOutside, options = {}) => {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    // Handler for click events
    const handleClickOutside = (e) => {
      // Check if ref exists and click is outside
      if (ref && ref.current && !ref.current.contains(e.target)) {
        onClickOutside(e);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, onClickOutside, enabled]);
};

export default useClickOutside;
