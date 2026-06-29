# Quickstart & Validation Guide

**Feature**: 005-post-deployment-polish | **Date**: 2026-06-29 | **Status**: End-to-End Test Scenarios

This document provides runnable validation scenarios proving each user story works end-to-end. Use these to validate Feature 005 during Phase 3.

---

## Prerequisites

**Environment**: 
- Browser with DevTools (Chrome, Firefox, Safari, Edge)
- Two devices (phone + PC, or two browsers)
- Network connectivity (app deployed to Azure)

**Deployed App**:
- URL: https://purple-mud-0c6ae6c0f.7.azurestaticapps.net

**Setup**:
1. Open app on Device A (PC browser)
2. Open app on Device B (phone browser or second browser window)
3. Create test persona: "TestUser" with color red

---

## Scenario 1: Remove Mock Data Label ✅

**User Story**: "As a user, I want to see that my data is saved to the real backend, not localStorage, so I have confidence my data persists."

### Validation Steps

**Setup**:
1. Open app
2. Look for text label on page: "Using Mock Data (localStorage)" or similar

**Expected (BEFORE Fix)**:
- Label visible even though API is working
- Users confused about data persistence

**Expected (AFTER Fix)**:
- Mock label completely removed/hidden
- Only show "Offline Mode" banner if API actually fails (not in normal operation)

### Test Command

```bash
# Open DevTools Console on PC
# Run this to verify mock label logic:

console.log('useMockAPI flag:', window.app?.state?.useMockAPI);
// Should be: false (when API working)

// Verify DOM doesn't contain mock label
document.body.textContent.includes('Mock Data') 
// Should be: false (label removed from DOM)

// Verify offline warning appears only on API error
// Simulate API error in useAvailability hook
// Confirm "Offline Mode" banner appears
```

**Expected Output**:
```
✅ useMockAPI = false (API working, no mock fallback)
✅ Mock label not in DOM (label removed)
✅ Offline banner only appears on API error (clean UX)
```

**Acceptance Criteria**:
- [ ] Mock data label not visible on page load (API available)
- [ ] No "Using Mock Data" text in DOM
- [ ] Offline banner appears ONLY if API actually fails
- [ ] No console errors related to mock detection

---

## Scenario 2: Eliminate Page Flicker on Refresh 🔄

**User Story**: "As a user, I want to see my calendar instantly on page refresh without flicker, so the app feels fast and responsive."

### Validation Steps

**Setup**:
1. Device A: Create test persona "TestUser"
2. Device A: Toggle availability for one date (e.g., July 15, 2026)
3. Device A: Verify date marked on calendar

**Test - Page Refresh**:
1. Device A: Open DevTools (F12), go to Network tab
2. Device A: Press F5 (refresh page)
3. **Observe carefully** (watch for any blank state before data appears)

**Expected (BEFORE Fix)**:
- Page loads blank (state empty)
- Quick flicker (state updates)
- Data appears after ~1-2 seconds
- **Bad UX**: Visible render flicker

**Expected (AFTER Fix)**:
- Page loads with data instantly (from localStorage)
- Background fetch happens silently
- Data refreshed seamlessly
- **Good UX**: No flicker, instant load

### Test Command

```bash
# Open DevTools Console
# Test hydration logic:

// 1. Verify localStorage has data
console.log('localStorage.daboyz_availability:', 
  JSON.parse(localStorage.getItem('daboyz_availability')));
// Should show: [list of availability entries]

// 2. Verify state initializes from localStorage
// Look for console log: "[sync] Hydrating from localStorage"
// This means hydration hook ran

// 3. Measure time to first render
// Should be < 100ms (instant from cache)

// 4. Measure time to data update (API response)
// Should be < 1s (API fetch + state update)

// 5. Check for flicker (React dev tools Profiler)
// Should see single render cycle, not state → empty → filled
```

**Expected Output**:
```
✅ localStorage has cached availability data
✅ Hydration hook logs "[sync] Hydrating from localStorage"
✅ Initial state populated within 100ms
✅ API refresh completes within 1s
✅ No render flicker (single cycle)
✅ React DevTools shows 1 render, not 2+
```

**Acceptance Criteria**:
- [ ] Page renders cached data immediately on load
- [ ] Calendar visible within 100ms of page load (no blank state)
- [ ] No visual flicker during refresh (watch carefully)
- [ ] API updates happen silently in background
- [ ] DevTools Profiler shows single render, not multiple

---

## Scenario 3: Delete Personas with Cascade 🗑️

**User Story**: "As a user, I want to delete a persona and have all their calendar dates removed at once, so I can clean up the calendar without orphaned entries."

### Validation Steps - Single Device

**Setup**:
1. Device A: Create test persona "DeleteMe" (color: blue)
2. Device A: Mark 5 dates for "DeleteMe" (e.g., July 1-5, 2026)
3. Device A: Verify calendar shows 5 blue dots for "DeleteMe"

**Test - Delete Persona**:
1. Device A: Locate persona row or name on calendar
2. Device A: Click three-dot menu (or delete button)
3. Device A: Confirm deletion modal appears
4. Device A: Click "Delete" button
5. Device A: Watch calendar update

**Expected Behavior**:
```
Before delete:
- Calendar shows "DeleteMe" persona
- 5 blue dots visible (July 1-5)
- Persona list includes "DeleteMe"

During delete:
- Loading spinner appears (0.5-1s)
- Button disabled (prevent double-click)

After delete (< 2s):
- All 5 blue dots removed
- Persona no longer appears
- Remaining personas still visible
- Calendar updated
- Success message appears
```

**Test Command**:

```bash
# Open DevTools Console
# Test cascade deletion:

// 1. Count personas before delete
const before = document.querySelectorAll('[data-persona]').length;
console.log('Personas before delete:', before);

// 2. Click delete button for "DeleteMe" persona
// (in UI)

// 3. Wait for deletion to complete

// 4. Count personas after delete
const after = document.querySelectorAll('[data-persona]').length;
console.log('Personas after delete:', after);
console.assert(after === before - 1, 'Persona count decreased by 1');

// 5. Verify "DeleteMe" dates removed
const deleteMe = document.querySelectorAll('[data-persona="DeleteMe"]');
console.assert(deleteMe.length === 0, 'All "DeleteMe" dates gone');
```

**Expected Output**:
```
✅ Personas before delete: 2
✅ Personas after delete: 1
✅ All "DeleteMe" dates removed from calendar
✅ Remaining persona still visible
```

---

### Validation Steps - Cross-Device Sync

**Setup**:
1. Device A: Persona "DeleteMe" with 5 dates
2. Device B: Same persona visible
3. Both devices showing same calendar state

**Test - Cross-Device Sync**:
1. Device A: Click delete on "DeleteMe"
2. Device A: Confirm deletion
3. Device A: Observe persona gone (< 2s)
4. **Wait 2-3 seconds** (polling cycle)
5. Device B: Observe persona automatically removed

**Expected Behavior**:
```
Device A (deletes):
- Persona removed immediately (< 0.5s)

Device B (polls):
- Still shows persona for ~1-2s
- Polling interval: 2 seconds
- After next poll: Persona removed
- Device B sees removal < 3s total
```

**Test Command - Device B**:

```bash
# Open DevTools Console on Device B

// 1. Note timestamp before delete
console.time('cross-device-sync');

// 2. Delete on Device A (manually)

// 3. Wait for Device B polling to pick up change
// Check console logs for: "[sync] Fetched 1 entries"

// 4. Time how long until "DeleteMe" disappears from Device B
console.timeEnd('cross-device-sync');
// Should be: ~2-3 seconds

// 5. Verify persona gone
const deleteMe = document.querySelectorAll('[data-persona="DeleteMe"]');
console.assert(deleteMe.length === 0, 'Cross-device sync worked!');
```

**Expected Output**:
```
✅ Device A: Persona deleted immediately (< 0.5s)
✅ Device B: Persona removed after polling (2-3s)
✅ Console shows: "[sync] Fetched entries" after delete
✅ No errors in console (network requests succeed)
```

**Acceptance Criteria - Single Device**:
- [ ] Delete button/menu visible on persona row
- [ ] Confirmation modal appears before deletion
- [ ] Loading spinner shown during deletion
- [ ] All dates for persona removed (< 2s)
- [ ] Success message shown
- [ ] Persona no longer appears in list
- [ ] No error messages
- [ ] Remaining personas unaffected

**Acceptance Criteria - Cross-Device**:
- [ ] Delete on Device A completes
- [ ] Device B sees removal within 3 seconds
- [ ] No manual refresh required on Device B
- [ ] Both devices show consistent state
- [ ] No orphaned entries remain in storage

---

## Error Handling Scenarios

### Scenario: Network Error During Delete

**Setup**:
1. Device A: Create persona "TestError"
2. Device A: Mark availability for TestError

**Test**:
1. Device A: Open DevTools, Network tab
2. Device A: Throttle network to "Offline" (DevTools)
3. Device A: Click delete on "TestError"
4. Device A: Observe error handling

**Expected**:
```
✅ Delete button shows loading spinner
✅ Request fails (network error)
✅ Error modal appears: "Failed to delete. Retry?"
✅ Persona still visible (not deleted)
✅ User can click Retry or Cancel
✅ No app crash or hanging state
```

---

### Scenario: Delete Last Persona

**Setup**:
1. Device A: Only one persona left ("LastOne")
2. Device A: One date marked

**Test**:
1. Device A: Click delete on "LastOne"
2. Device A: Confirm deletion
3. Device A: Observe deletion completes

**Expected**:
```
✅ Persona deleted successfully
✅ Calendar shows empty state
✅ Message: "Create a persona to get started"
✅ No error, app still functional
✅ Can create new persona
```

---

## Performance Benchmarks

Use these to validate Feature 005 meets performance goals:

| Metric | Target | Validation |
|--|--|--|
| **Page load** | <1s | Time to cached data visible |
| **Cross-device sync** | <3s | Time for Device B to see changes |
| **Delete operation** | <2s | Time from click to persona removed |
| **API request** | <1s | Network latency (should be <200ms) |
| **React render** | <100ms | Time for state update to render |

**Test Command - Performance**:

```bash
# Measure page load time
console.time('page-load');
// Load page
// When calendar visible:
console.timeEnd('page-load');
// Should be: < 1s

# Measure delete operation
console.time('delete-operation');
// Click delete, confirm
// When persona disappears:
console.timeEnd('delete-operation');
// Should be: < 2s

# Measure API response
console.time('api-response');
// Fetch API
console.timeEnd('api-response');
// Should be: < 1s (usually < 200ms)
```

---

## Sign-Off Checklist

When validating Feature 005, confirm all items:

### Scenario 1: Remove Mock Label
- [ ] Page loads without "Mock Data" label
- [ ] Offline banner appears only on actual API error
- [ ] Console has no errors

### Scenario 2: Eliminate Flicker
- [ ] F5 refresh shows cached data immediately
- [ ] No blank state visible before data loads
- [ ] Calendar renders in < 1s
- [ ] No visual flicker observed

### Scenario 3: Delete Personas
- [ ] **Single device**: Persona + dates deleted < 2s
- [ ] **Cross-device**: Removal visible on other device within 3s
- [ ] **Error handling**: Failed delete shows error, allows retry
- [ ] **Edge case**: Deleting last persona leaves clean state

### Performance
- [ ] Page load < 1s
- [ ] Cross-device sync < 3s
- [ ] Delete operation < 2s
- [ ] API response < 1s

### Accessibility
- [ ] Delete modal keyboard accessible (Tab, Enter, Escape)
- [ ] ARIA labels present (aria-label, aria-busy)
- [ ] Screen reader announces "Persona deleted"
- [ ] Loading state announced to screen readers

### Browser Compatibility
- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Edge ✅
- [ ] Mobile Safari (iOS) ✅
- [ ] Chrome Mobile (Android) ✅

---

## How to Run Automated Tests

After Phase 2 implementation, run Jest tests:

```bash
# Frontend unit tests
npm test -- DeletePersonaModal.test.js
npm test -- OfflineWarning.test.js
npm test -- useHydration.test.js

# Integration tests
npm test -- delete-persona-flow.test.js

# All tests
npm test

# With coverage
npm test -- --coverage
```

Expected result: All tests pass, >90% coverage on new code.

---

## Documentation References

- **Data Model**: See [data-model.md](data-model.md) for entity definitions
- **API Contract**: See [contracts/delete-endpoint.md](contracts/delete-endpoint.md) for DELETE specification
- **Implementation Plan**: See [plan.md](plan.md) for Phase 2 tasks
