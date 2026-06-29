import React, { useRef, useEffect, useState } from "react";
import useClickOutside from "../hooks/useClickOutside";
import useMediaQuery from "../hooks/useMediaQuery";
import { formatPersonaList } from "../utils/truncate";
import { Z_INDEX, MEDIA_QUERIES } from "../utils/theme";

/**
 * AvailabilityModal Component
 *
 * Displays all available personas for a selected date
 * Desktop: Renders as a tooltip/popover near the badge
 * Mobile: Renders as a bottom sheet modal (60-70% viewport height)
 *
 * Props:
 *   - isOpen: boolean - Modal visibility state
 *   - date: Date - Selected date for availability
 *   - personas: array - All available personas [{name, color}]
 *   - onClose: function - Called when modal should close
 *   - isDarkMode: boolean - Current theme (for styling)
 *   - triggerRef: React.RefObject - Reference to trigger element (for positioning)
 */
export default function AvailabilityModal({
  isOpen,
  date,
  personas = [],
  onClose,
  isDarkMode = false,
  triggerRef = null,
}) {
  const modalRef = useRef(null);
  const isMobile = useMediaQuery(MEDIA_QUERIES.isMobile);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Close modal when clicking outside
  useClickOutside(modalRef, onClose, { enabled: isOpen && !isMobile });

  // Calculate position for desktop tooltip
  useEffect(() => {
    if (!isOpen || isMobile || !triggerRef?.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    setPosition({
      top: triggerRect.bottom + 8,
      left: triggerRect.left,
    });
  }, [isOpen, isMobile, triggerRef]);

  if (!isOpen || !date) {
    return null;
  }

  // Format persona list for display
  const { displayed, remaining, remainingCount } = formatPersonaList(
    personas,
    10, // Show more in modal than badge
  );

  // Desktop tooltip
  if (!isMobile) {
    return (
      <div
        ref={modalRef}
        className={`
          fixed bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50
          max-w-sm
          ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : ""}
        `}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: Z_INDEX.tooltip,
        }}
        role="tooltip"
        aria-label="Availability list"
      >
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-sm">
            {date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </h3>
          <div className="flex flex-wrap gap-2">
            {displayed.map((persona) => (
              <div
                key={`${persona.name}-${persona.color}`}
                className="px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1"
                style={{ backgroundColor: persona.color }}
                title={persona.originalName}
              >
                <span>{persona.displayName}</span>
              </div>
            ))}
          </div>
          {remainingCount > 0 && (
            <div
              className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              +{remainingCount} more
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile bottom sheet
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        style={{ zIndex: Z_INDEX.modal - 1 }}
        aria-hidden="true"
      />

      {/* Bottom sheet modal */}
      <div
        ref={modalRef}
        className={`
          fixed bottom-0 left-0 right-0 rounded-t-2xl shadow-2xl
          max-h-[70vh] overflow-y-auto z-50
          transition-transform duration-300 ease-out
          ${
            isDarkMode
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white border-gray-200"
          }
        `}
        style={{
          zIndex: Z_INDEX.modal,
          animation: isOpen
            ? "slideUp 0.3s ease-out"
            : "slideDown 0.3s ease-in",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Availability for ${date.toLocaleDateString()}`}
      >
        <div
          className="px-4 py-4 border-b"
          style={{
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h2>
            <button
              onClick={onClose}
              className={`
                px-3 py-1 rounded hover:bg-gray-200 transition-colors
                ${isDarkMode ? "hover:bg-gray-700" : ""}
              `}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-4 py-4 space-y-2">
          {displayed.map((persona) => (
            <div
              key={`${persona.name}-${persona.color}`}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors"
              style={{
                backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "#f3f4f6",
              }}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: persona.color }}
                title={persona.originalName}
              />
              <span
                className="text-sm font-medium flex-1"
                title={persona.originalName}
              >
                {persona.displayName}
              </span>
            </div>
          ))}

          {remaining.length > 0 &&
            remaining.length <= 5 &&
            remaining.map((persona) => (
              <div
                key={`${persona.name}-${persona.color}`}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors"
                style={{
                  backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "#f3f4f6",
                }}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: persona.color }}
                  title={persona.originalName}
                />
                <span
                  className="text-sm font-medium flex-1"
                  title={persona.originalName}
                >
                  {persona.displayName}
                </span>
              </div>
            ))}

          {remaining.length > 5 && (
            <div
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              +{remaining.length} more personas
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }

          @keyframes slideDown {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(100%);
            }
          }

          @media (max-width: 767px) {
            div[role="dialog"] {
              animation: slideUp 0.3s ease-out;
            }
          }
        `}</style>
      </div>
    </>
  );
}
