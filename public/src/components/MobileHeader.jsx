/**
 * MobileHeader Component (ULTRA-LEAN)
 * 
 * Minimal header for mobile displays (375px+).
 * Shows title, dark mode toggle, and sync status inline.
 * 
 * Feature: 007-multi-user-sync-mobile-ux
 * Phase: 3 - User Story 4 (Mobile Layout Clarity)
 */

import React from 'react';
import DarkModeToggle from './DarkModeToggle';

export function MobileHeader({
  activePersona,
  currentMonth,
  isDarkMode,
  onToggleDarkMode,
  isSyncing,
  isOnline,
  pendingCount,
}) {
  // Format month for display (e.g., "Jun 2026")
  const monthDisplay = currentMonth
    ? currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

  // Simple status - no animation
  let status = '✓ Synced';
  if (isSyncing) status = '⏳ Syncing...';
  else if (!isOnline && pendingCount > 0) status = `⚠️ ${pendingCount} pending`;
  else if (!isOnline) status = '📡 Offline';

  return (
    <header
      className={`${
        isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'
      } shadow-sm sticky top-0 z-40`}
    >
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h1 className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Da Boyz {monthDisplay && `• ${monthDisplay}`}
          </h1>
          <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {activePersona?.name || 'Create'}
          </p>
        </div>
        <div className="text-xs flex-shrink-0">{status}</div>
        <DarkModeToggle isDarkMode={isDarkMode} onChange={onToggleDarkMode} />
      </div>
    </header>
  );
}

export default MobileHeader;
