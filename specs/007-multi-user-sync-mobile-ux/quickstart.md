# Quickstart: Validation Scenarios

**Feature**: [007-multi-user-sync-mobile-ux](spec.md)  
**Date**: 2026-06-29  
**Status**: Phase 1 Design - Validation

---

## Overview

This document describes 3 validation scenarios to verify that Phase 1 design is correct and Phase 2 implementation meets requirements.

**Objective**: Confirm:
1. Multi-user sync works end-to-end (latency < 500ms p99)
2. Mobile UX is usable on target devices (375px–600px)
3. Offline queue persists and auto-syncs

---

## Scenario 1: Multi-User Sync Validation

**Title**: Two browsers, concurrent date marking, verify sub-500ms sync

**Setup**:
- Open app in two browser windows (or two tabs with different localStorage)
- Both logged in, same account (if needed)
- Both on June 2026 calendar
- One browser: Browser A (syncer)
- Other browser: Browser B (observer)

**Steps**:

1. **Browser A**: Select persona "DEV", mark June 15 available
   - Expected: UI updates instantly (< 50ms)
   - Expected: SyncStatusBadge shows "Syncing..." (1-2s)

2. **Browser B**: Observe June 15 on DEV calendar
   - Expected: June 15 remains unmarked (no sync yet)
   - Expected: SyncStatusBadge on B shows "Last synced: 5s ago"

3. **Wait 1 second** (polling interval on B)

4. **Browser B**: Refresh page (or observe natural poll)
   - Expected: June 15 now marked available on DEV
   - Expected: SyncStatusBadge shows "Last synced: <1s ago"
   - Expected: Time from step 1 to step 4: ~2-3 seconds (within 500ms sync latency on average)

5. **Browser B**: Mark June 16 unavailable
   - Expected: UI updates instantly on B

6. **Browser A**: Observe June 16
   - Expected: Within 1-2s, June 16 is marked unavailable on A
   - Expected: A's SyncStatusBadge updates

**Pass Criteria**:
- [ ] June 15 appears on B within 2s of marking on A
- [ ] June 16 appears on A within 2s of marking on B
- [ ] SyncStatusBadge correctly reflects sync state ("Syncing", "Last synced: Xs ago")
- [ ] No data loss (both dates persist on both browsers)

**Fail Criteria**:
- [ ] Sync latency > 3s (indicates polling or API issue)
- [ ] One browser's change doesn't appear on other browser
- [ ] SyncStatusBadge shows "Error" (API or network failure)

---

## Scenario 2: Mobile UX Validation

**Title**: Real mobile device (iPhone SE or Galaxy S21), verify readability, touch targets, no horizontal scroll

**Setup**:
- Real device (iPhone SE 375px or Galaxy S21 360px, NOT emulator)
- Open app in Safari (iOS) or Chrome (Android)
- Latest version of app deployed

**Steps**:

1. **Header**: Verify header is fully visible and readable
   - Expected: Persona name visible (≥ 16px)
   - Expected: Month displayed
   - Expected: Dark toggle button visible (≥ 32x32px tap target)
   - Expected: Sync badge visible (≥ 20x20px)

2. **Persona Selector**: Verify personas are listed clearly
   - Expected: Each persona is ≥ 44px tall (easy to tap)
   - Expected: Color dot visible
   - Expected: Delete button (✕) always visible, not hidden
   - Expected: No horizontal scroll

3. **Calendar**: Verify date grid is readable
   - Expected: 7 columns fit on screen without horizontal scroll
   - Expected: Each date cell is ≥ 44x44px (easy to tap)
   - Expected: Date numbers are ≥ 16px (readable without zoom)
   - Expected: Checkmark (✓) for marked dates is visible
   - Expected: Day headers (Sun, Mon, Tue, etc.) visible

4. **Touch Responsiveness**: Tap 3 dates and observe feedback
   - Expected: Each tap has instant visual response (< 100ms, appears immediate)
   - Expected: Tap target does not require pinch-to-zoom to hit
   - Expected: No accidental taps on adjacent cells

5. **Sync Status**: Trigger a sync and observe status badge
   - Expected: SyncStatusBadge shows "Syncing..." (spinner)
   - Expected: After sync, shows "Last synced: <1s ago"
   - Expected: Badge does not cover other UI elements

**Pass Criteria**:
- [ ] No horizontal scrolling required (full layout fits in 375px)
- [ ] All tap targets are ≥ 44x44px
- [ ] All text is ≥ 16px (no pinch-to-zoom needed)
- [ ] Touch feedback is instant (< 100ms visual response)
- [ ] Delete buttons always visible (not hover-dependent)

**Fail Criteria**:
- [ ] Horizontal scroll required to see all content
- [ ] Tap targets < 44x44px (difficult to tap on real device)
- [ ] Text < 16px (hard to read)
- [ ] Touch feedback delayed (> 100ms)
- [ ] Delete buttons hidden or obscured

---

## Scenario 3: Offline & Sync Validation

**Title**: Mark dates offline, then reconnect, verify auto-sync with no data loss

**Setup**:
- Single browser, dev tools open
- Chrome DevTools: Network tab → Set to "Offline" (or use Throttling → Offline)
- App loaded and functional
- At least one persona created

**Steps**:

1. **Go Offline**: DevTools → Network → Offline
   - Expected: App recognizes offline state
   - Expected: OfflineIndicator appears at bottom: "You are offline"
   - Expected: SyncStatusBadge shows offline icon (✕)

2. **Mark 3 Dates**: While offline, mark June 10, June 11, June 12 available
   - Expected: Each tap updates UI instantly
   - Expected: OfflineIndicator shows "3 changes will sync when online"
   - Expected: No error messages

3. **Refresh Page**: While still offline
   - Expected: App reloads without error
   - Expected: All 3 dates (June 10, 11, 12) are still marked available
   - Expected: Offline queue persisted to localStorage

4. **Go Online**: DevTools → Network → Offline (uncheck)
   - Expected: OfflineIndicator disappears
   - Expected: SyncStatusBadge shows "Syncing..."
   - Expected: OfflineIndicator briefly shows "3 changes will sync when online"

5. **Observe Sync**: Wait 2-3 seconds
   - Expected: SyncStatusBadge changes to "Last synced: <1s ago"
   - Expected: OfflineIndicator disappears
   - Expected: OfflineIndicator shows "0 changes" (queue is empty)

6. **Verify API**: Open second browser, observe same 3 dates
   - Expected: June 10, 11, 12 are marked available on second browser too
   - Expected: Date appears within 1-2s (1-second polling interval)

**Pass Criteria**:
- [ ] Offline queue persists through page refresh
- [ ] All 3 dates marked offline are still there after refresh
- [ ] Auto-sync happens within 2-3s of reconnecting
- [ ] SyncStatusBadge updates correctly (Offline → Syncing → Synced)
- [ ] All 3 dates appear on second browser (API sync confirmed)
- [ ] No error messages during offline/online transition

**Fail Criteria**:
- [ ] Dates lost after refresh
- [ ] Sync fails after reconnect (error persists)
- [ ] Dates don't appear on second browser
- [ ] OfflineIndicator doesn't update
- [ ] Queue gets stuck (shows pending but never syncs)

---

## Additional Validation Scenarios (Optional, Phase 2+)

### Scenario 4: Persona Deletion Sync
- User A deletes persona while User B is viewing it
- Verify: Auto-switch to another persona on User B's device

### Scenario 5: Edge Case - Concurrent Conflicts
- Both users mark same date simultaneously
- Verify: No data loss, both updates persist (last-write-wins)

### Scenario 6: Performance Under Load
- Simulate 5 concurrent users, mark 50 dates total
- Verify: Sync latency p99 < 500ms, no dropped updates

---

## Validation Checklist

Use this checklist after Phase 2 implementation:

| Scenario | Test | Expected Result | Status |
|----------|------|-----------------|--------|
| Multi-User Sync | Mark date on Browser A | Appears on B within 2s | ☐ |
| Multi-User Sync | Mark date on Browser B | Appears on A within 2s | ☐ |
| Mobile UX | No horizontal scroll | All content fits 375px | ☐ |
| Mobile UX | Tap date cell | Visual feedback < 100ms | ☐ |
| Mobile UX | All tap targets | Size ≥ 44x44px | ☐ |
| Offline & Sync | Mark 3 dates offline | All 3 persist after refresh | ☐ |
| Offline & Sync | Reconnect online | All 3 auto-sync within 2s | ☐ |
| Offline & Sync | Check second browser | All 3 dates appear on 2nd browser | ☐ |

**Pass Criteria**: All rows checked ✓

---

## Debugging Tips

### If multi-user sync is slow:
1. Check polling interval: Should be 1s (1000ms)
2. Check usePolling hook retry logic: Ensure no infinite backoff
3. Check API endpoint latency: `/api/users` and `/api/availability` should respond < 500ms
4. Check network: Throttle to 4G or 3G to simulate real-world conditions

### If mobile UX is broken:
1. Test on real device (not emulator): Emulator may have different DPI
2. Check Tailwind breakpoints: Ensure responsive utilities are correct
3. Check viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
4. Check font sizes: Verify all text is ≥ 16px

### If offline queue doesn't sync:
1. Check localStorage: `localStorage['daboyz_offline_queue_v1']` should exist
2. Check online event listener: Ensure hook is listening to `window.online` event
3. Check API endpoint: POST should accept offline queue items
4. Check retry logic: Should use exponential backoff (1s, 2s, 4s, 8s)

---

**Phase 1 Complete** ✅  
**Ready for**: Phase 2 Implementation (T066–T109)
