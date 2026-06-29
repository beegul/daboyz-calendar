import React, { useRef } from "react";
import { truncatePersonaName } from "../utils/truncate";

export default function AvailabilityBadge({
  entries,
  onRemove,
  onShowAll,
  isDarkMode = false,
}) {
  const badgeRef = useRef(null);

  if (!entries || entries.length === 0) {
    return null;
  }

  const displayCount = 2;
  const hiddenCount = Math.max(0, entries.length - displayCount);

  const handleBadgeClick = () => {
    if (onShowAll) {
      onShowAll(entries, badgeRef);
    }
  };

  return (
    <div
      className="flex flex-wrap gap-1"
      ref={badgeRef}
      onClick={hiddenCount > 0 ? handleBadgeClick : undefined}
      onKeyDown={(e) => {
        if (hiddenCount > 0 && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleBadgeClick();
        }
      }}
      role={hiddenCount > 0 ? "button" : undefined}
      tabIndex={hiddenCount > 0 ? 0 : undefined}
      aria-label={
        hiddenCount > 0
          ? `Show all ${entries.length} available people`
          : undefined
      }
    >
      {entries.slice(0, displayCount).map((entry, index) => {
        const { truncated, isTruncated, original } = truncatePersonaName(
          entry.name,
          15,
        );

        return (
          <button
            key={`${entry.name}-${entry.color}-${index}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(entry.name, entry.color);
            }}
            className={`
              px-2 py-1 rounded text-xs font-medium text-white transition-opacity 
              hover:opacity-75 cursor-pointer
              ${isDarkMode ? "opacity-90" : ""}
            `}
            style={{ backgroundColor: entry.color }}
            title={
              isTruncated
                ? original
                : `Available - ${entry.name} (click to remove)`
            }
            aria-label={`${entry.name} available (click to remove)`}
          >
            {truncated}
          </button>
        );
      })}
      {hiddenCount > 0 && (
        <div
          className={`
            px-2 py-1 rounded text-xs font-medium cursor-pointer transition-opacity
            hover:opacity-75
            ${
              isDarkMode
                ? "bg-gray-600 text-gray-100"
                : "bg-gray-300 text-gray-800"
            }
          `}
          title={`Click to see all ${entries.length} available people`}
          aria-label={`${hiddenCount} more people available`}
        >
          +{hiddenCount} more
        </div>
      )}
    </div>
  );
}
