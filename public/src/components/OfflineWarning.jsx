import React from "react";

/**
 * OfflineWarning Component
 * 
 * Displays a banner when the app is in offline mode (using localStorage fallback instead of API)
 * Only shown when API calls have failed and the app is using local data
 * 
 * Accessibility: Uses aria-live="polite" to announce state changes to screen readers
 */
function OfflineWarning({ isOffline }) {
  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Offline mode notification"
      className="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-md p-4 shadow-md z-40 max-w-md"
    >
      <div className="flex items-start gap-3">
        <div className="text-yellow-600 text-xl leading-none mt-0.5">⚠️</div>
        <div>
          <p className="text-sm font-semibold text-yellow-900">Offline Mode</p>
          <p className="text-xs text-yellow-800 mt-1">Using local data</p>
          <p className="text-xs text-yellow-700 mt-2">
            Your changes will sync when the connection is restored.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OfflineWarning;
