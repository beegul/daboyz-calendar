# Tasks: Post-Deployment Polish (Feature 005)

**Input**: Design documents from `specs/005-post-deployment-polish/`

**Status**: Phase 2 Task Generation (Ready for Implementation)

**Branch**: `005-post-deployment-polish`

**Date**: 2026-06-29

---

## Format Guide

- **`- [ ]`**: Checkbox (incomplete)
- **`[ID]`**: Task ID (T001-T0NN in execution order)
- **`[P]`**: Parallelizable (can run simultaneously with other [P] tasks)
- **`[US#]`**: User Story label (US1=Priority P1, US2=Priority P1, US3=Priority P2)
- **File paths**: Included in description for clarity

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Verify dependencies, confirm testing framework, prepare branch

- [ ] T001 Verify project dependencies are installed: React 19.2.7, Vite 5.4.0, Jest 29.7.0
- [ ] T002 Confirm Python backend dependencies installed: azure-functions 1.19.0, azure-data-tables 12.7.0
- [ ] T003 [P] Create feature branch `005-post-deployment-polish` if not already created
- [ ] T004 [P] Configure git hooks to run linting before commit

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that User Stories depend on

**⚠️ CRITICAL**: These must complete before user story work begins

- [ ] T005 Confirm useAvailability hook exists and has fetchAvailability, toggleAvailability functions in `public/src/hooks/useAvailability.js`
- [ ] T006 [P] Confirm useAvailability hook has fetchAvailability, toggleAvailability, and error handling (hydration hook T022 is new)
- [ ] T007 [P] Confirm jest.setup.js properly mocks `/api/personas` endpoint for tests
- [ ] T008 Verify TestStorage utility has mock implementations for all Table Storage operations
- [ ] T009 [P] Review existing PersonaOnboarding.jsx modal pattern to match new DeletePersonaModal component design
- [ ] T010 [P] Confirm offline detection pattern exists in useAvailability.js (useMockAPI flag)

**Checkpoint**: ✅ Foundation ready - all user story tasks can now begin

---

## Phase 3: User Story 1 - Remove Mock Data Indicator (Priority: P1) 🎯 MVP

**Goal**: Remove "Using Mock Data (localStorage)" label from UI; show offline warning ONLY when API actually fails

**Independent Test**: Visit deployed app with working API → no mock label appears; temporarily disable API → offline banner appears instead

### Tests for User Story 1

- [ ] T011 [P] [US1] Create test for offline warning component: `public/src/components/OfflineWarning.test.js`
  - Test: OfflineWarning renders when API fails (useMockAPI = true after error)
  - Test: OfflineWarning hidden when API works (useMockAPI = false)
  - Test: aria-live="polite" present for screen reader announcement
  - Expected: All 3 tests pass, >90% component coverage

- [ ] T012 [P] [US1] Test useAvailability hook handles API errors gracefully: `public/src/hooks/useAvailability.test.js`
  - Test: Sets useMockAPI = true on network error
  - Test: Sets useMockAPI = false when API recovers
  - Test: Falls back to localStorage after error (no data loss)
  - Expected: 3 tests pass, error handling verified

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create OfflineWarning component in `public/src/components/OfflineWarning.jsx`
  - Shows: "Offline Mode: Using local data" when API fails
  - Hides: When API recovers (via useAvailability hook)
  - ARIA: aria-live="polite" for screen reader announcement
  - Styling: Matches existing error banner color/style
  - Expected: Component displays/hides correctly, accessible

- [ ] T014 [P] [US1] Update useAvailability hook in `public/src/hooks/useAvailability.js`
  - Add error handler: Catch fetch errors, set useMockAPI = true
  - Add recovery: When next fetch succeeds, set useMockAPI = false
  - Add ARIA: Announce offline state via live region
  - Keep localStorage fallback intact
  - Expected: Hook properly tracks API availability

- [ ] T015 [P] [US1] Remove mock data label from App.jsx or Calendar component in `public/src/App.jsx` or `public/src/components/Calendar.jsx`
  - Delete: All references to "Using Mock Data (localStorage)" text
  - Delete: Any DOM elements displaying useMockAPI flag
  - Confirm: Mock label completely removed from UI
  - Expected: No mock label visible in app

- [ ] T016 [P] [US1] Update PersonaOnboarding.jsx to NOT show mock label in `public/src/components/PersonaOnboarding.jsx`
  - Remove: Any mock data warning from modal
  - Confirm: Only OfflineWarning banner is shown on API failure
  - Expected: Modal clean, offline banner separate

- [ ] T017 [P] [US1] Update jest.setup.js to mock failed API responses in `jest.setup.js`
  - Mock: `/api/personas` endpoint returns error (simulate API down)
  - Verify: Tests can trigger offline state
  - Expected: Test infrastructure supports offline scenario testing

- [ ] T018 [US1] Manual test: Verify mock label removed from deployed app
  - Open: https://purple-mud-0c6ae6c0f.7.azurestaticapps.net
  - Verify: No "Using Mock Data" text on calendar
  - Verify: Create persona, toggle dates, no mock label appears
  - Expected: Production deployment shows clean UI

**Checkpoint**: ✅ User Story 1 complete - mock label removed, offline banner working

---

## Phase 4: User Story 2 - Eliminate Page Flicker on Refresh (Priority: P1) 🎯 MVP

**Goal**: Page renders cached data immediately on load (from localStorage); fetch fresh data in background without re-render flicker

**Independent Test**: Press F5 on deployed app → calendar renders immediately without flicker → data updates silently after API response

### Tests for User Story 2

- [ ] T019 [P] [US2] Create test for useHydration hook: `public/src/hooks/useHydration.test.js`
  - Test: Initializes state from localStorage if available (instant load)
  - Test: Fetches fresh data in background via useEffect (silent update)
  - Test: Only one render cycle during hydration (no flicker)
  - Test: localStorage empty → initial state is empty object (no error)
  - Expected: 4 tests pass, hydration verified, zero flicker

- [ ] T020 [P] [US2] Create integration test for page refresh: `public/src/__tests__/integration/page-flicker.test.js`
  - Test: Load app → create persona → refresh page → verify no blank state
  - Test: Verify calendar renders with cached data immediately
  - Test: Verify API request completes silently (no state re-render visible)
  - Test: React DevTools shows single render, not multiple
  - Expected: 3 integration tests pass, flicker eliminated

- [ ] T021 [P] [US2] E2E test for refresh on slow network: `public/src/__tests__/e2e/page-refresh-slow.test.js`
  - Test: Throttle network (Network tab: Slow 3G)
  - Test: Refresh page → calendar still renders quickly from cache
  - Test: API response eventually arrives, updates seamlessly
  - Expected: E2E test passes, UX smooth on slow networks

### Implementation for User Story 2

- [ ] T022 [P] [US2] Create useHydration hook in `public/src/hooks/useHydration.js`
  - Load: Availability entries from localStorage.getItem('daboyz_availability')
  - Initialize: React state with cached data immediately (no delay)
  - Background fetch: useEffect runs fetchAvailability() silently
  - Single render: Only 2 renders total (initial + API update), not 3+
  - Logging: Console.log('[sync] Hydrating from localStorage...')
  - Expected: Hook prevents flicker, fast initial render

- [ ] T023 [P] [US2] Update useAvailability hook to support background refresh in `public/src/hooks/useAvailability.js`
  - Add: setShowLoadingSpinner = false (hide spinner during background refresh)
  - Add: Silent update (API response updates state without animation)
  - Keep: localStorage sync on successful fetch
  - Keep: Conflict detection logic
  - Expected: Background refresh works without user noticing

- [ ] T024 [P] [US2] Update App.jsx or Calendar.jsx to use useHydration in `public/src/App.jsx` or `public/src/components/Calendar.jsx`
  - Replace: Direct useState with useHydration hook
  - Verify: Initial state from localStorage (fast render)
  - Verify: Background fetch happens in useHydration (no extra fetch)
  - Expected: Page renders instantly, data fresh after 1-2 seconds

- [ ] T025 [P] [US2] Update localStorage utility to properly serialize/deserialize entries in `public/src/utils/storage.js`
  - Implement: saveAvailability(entries) → JSON.stringify → localStorage
  - Implement: loadAvailability() → JSON.parse → return entries
  - Implement: clearAvailability() → removeItem → clean slate
  - Error handling: Try/catch for JSON parse errors
  - Expected: Storage utilities handle all serialization

- [ ] T026 [P] [US2] Add aria-busy attribute during hydration in `public/src/components/Calendar.jsx`
  - Add: aria-busy="true" during initial load (hydration)
  - Add: aria-busy="false" when hydration complete
  - Add: aria-label describing loading state for screen readers
  - Expected: Accessibility compliant, screen readers announce loading

- [ ] T027 [US2] Manual test: Verify no flicker on F5 refresh
  - Open: https://purple-mud-0c6ae6c0f.7.azurestaticapps.net
  - Create: Test persona, mark 3 dates
  - Refresh: Press F5 multiple times
  - Observe: Calendar renders immediately, no blank state
  - Expected: Zero visible flicker, smooth experience

**Checkpoint**: ✅ User Story 2 complete - page flicker eliminated, hydration working

---

## Phase 5: User Story 3 - Delete Personas with Cascade (Priority: P2)

**Goal**: Users can delete a persona via UI → triggers atomic DELETE endpoint → removes persona + all dates atomically

**Independent Test**: Create persona with 5 dates → click delete → confirm modal → persona + dates removed within 2s; other devices see removal within 3s

### Tests for User Story 3

- [ ] T028 [P] [US3] Create test for DeletePersonaModal component: `public/src/components/DeletePersonaModal.test.js`
  - Test: Modal renders with persona name in confirmation text
  - Test: Cancel button closes modal without calling API
  - Test: Delete button calls DELETE /api/personas/{name}
  - Test: Loading spinner shown during deletion
  - Test: Success message shown after deletion
  - Test: Error message shown if deletion fails (with retry button)
  - Expected: 6 tests pass, modal fully functional

- [ ] T029 [P] [US3] Create test for cascade delete logic: `public/src/__tests__/integration/cascade-delete.test.js`
  - Test: Delete persona via API
  - Test: Verify all availability entries for that persona removed
  - Test: Verify other personas unaffected
  - Test: localStorage cleared for deleted persona
  - Expected: 4 tests pass, cascade verified

- [ ] T030 [P] [US3] Create API contract test for DELETE endpoint: `public/src/__tests__/contract/delete-persona-contract.test.js`
  - Test: DELETE /api/personas/{name} returns 204 on success
  - Test: DELETE /api/personas/{name} returns 404 if not found
  - Test: DELETE /api/personas/{name} returns 400 if invalid name
  - Test: DELETE /api/personas/{name} atomically deletes all dates
  - Expected: 4 contract tests pass

- [ ] T031 [P] [US3] E2E test for cross-device delete sync: `public/src/__tests__/e2e/delete-cross-device.test.js`
  - Test: Delete on Device A
  - Test: Device B polls and detects deletion within 3s
  - Test: Both devices show consistent state
  - Expected: E2E test passes, cross-device sync verified

### Implementation for User Story 3 - Backend

- [ ] T032 [P] [US3] Create DELETE route in `api/routes/delete_persona.py`
  - Implement: DELETE /api/personas/{name} endpoint handler
  - Validate: Name is non-empty, valid format (1-50 chars, alphanumeric + spaces)
  - Query: Get all availability entries WHERE persona_name = {name}
  - Delete: All entries in atomic batch transaction
  - Return: 204 No Content on success, 404 if not found, 400 if invalid
  - Logging: Log all delete operations for audit trail
  - Expected: Endpoint fully functional, atomic deletion works

- [ ] T032.5 [P] [US3] Write Python unit tests for delete_persona route in `tests/unit/test_delete_persona.py`
  - Test: DELETE returns 204 on success
  - Test: DELETE returns 404 if persona not found
  - Test: DELETE returns 400 if invalid name
  - Test: DELETE atomically removes all availability entries for persona
  - Test: Other personas unaffected by deletion
  - Expected: 5+ tests pass, Constitution II (test standards) met

- [ ] T033 [P] [US3] Update function_app.py to route DELETE to new handler in `api/function_app.py`
  - Add: DELETE /api/personas/{name} route mapping
  - Import: delete_persona route handler
  - Verify: Route correctly registered and accessible
  - Expected: DELETE endpoint accessible from frontend

- [ ] T034 [P] [US3] Add transaction wrapper for atomic deletion in `api/models/table_storage.py`
  - Implement: batch_delete_entries(entries) using batch operations
  - Handle: Up to 100 entries per batch (loop if > 100)
  - Transaction: All batches succeed or all fail (atomic from user perspective)
  - Error handling: Rollback if any batch fails
  - Expected: Atomic deletion works, no orphaned entries

- [ ] T035 [P] [US3] Update Table Storage client to support batch delete in `api/models/table_storage.py`
  - Method: delete_by_persona(persona_name) → finds all rows with persona_name, deletes atomically
  - Logging: Logs how many rows deleted
  - Error handling: Raises exception if any delete fails
  - Expected: Helper method available for endpoint to use

### Implementation for User Story 3 - Frontend

- [ ] T036 [P] [US3] Create DeletePersonaModal component in `public/src/components/DeletePersonaModal.jsx`
  - Props: persona_name, onConfirm(name), onCancel()
  - UI: Modal title: "Delete {persona_name}?"
  - UI: Message: "This will remove {persona_name} and all their calendar entries. This cannot be undone."
  - Buttons: "Cancel" (closes modal), "Delete" (calls onConfirm)
  - Loading: Loading spinner on Delete button during API call
  - Error: Error message with "Retry" button if deletion fails
  - ARIA: aria-modal="true", aria-labelledby, aria-describedby
  - Expected: Modal component fully functional, accessible

- [ ] T037 [P] [US3] Create useDeletePersona hook in `public/src/hooks/useDeletePersona.js`
  - Function: deletePersona(name) → calls DELETE /api/personas/{name}
  - Success: Removes persona from useAvailability state
  - Success: Triggers immediate re-fetch via fetchAvailability()
  - Error: Catches error, stores error message in state
  - Retry: Allows user to retry deletion after error
  - Logging: Console.log('[delete] Deleting persona: {name}')
  - Expected: Hook encapsulates delete logic cleanly

- [ ] T038 [P] [US3] Add delete button/menu to persona rows in `public/src/components/Calendar.jsx`
  - UI: Three-dot menu icon on each persona row
  - Menu: "Delete" option (matches existing pattern from spec)
  - Click: Opens DeletePersonaModal when Delete clicked
  - Expected: Delete option visible, clickable, opens modal

- [ ] T039 [US3] Integrate DeletePersonaModal into Calendar in `public/src/components/Calendar.jsx`
  - Show: DeletePersonaModal when user clicks Delete from menu
  - Pass: persona_name to DeletePersonaModal
  - onConfirm: Calls useDeletePersona hook to delete
  - onCancel: Closes modal without deleting
  - Success: Removes persona from calendar view
  - Expected: Full delete flow works end-to-end

- [ ] T040 [P] [US3] Update useAvailability hook to remove deleted persona entries in `public/src/hooks/useAvailability.js`
  - Add: deletePersona(name) function that calls DELETE endpoint
  - Remove: All entries with persona_name = {name} from state
  - Update: localStorage to remove persona entries
  - Fetch: Fresh data immediately after delete (fetchAvailability)
  - Expected: Hook properly removes deleted persona

- [ ] T041 [P] [US3] Add aria-busy and loading states to delete UI in `public/src/components/DeletePersonaModal.jsx`
  - Add: aria-busy="true" during deletion
  - Add: aria-busy="false" when complete
  - Add: aria-label describing button state ("Deleting...")
  - Expected: Screen readers announce loading state

- [ ] T042 [US3] Manual test: Verify delete works on single device
  - Create: Test persona "DeleteMe" with 5 dates
  - Delete: Click menu → Delete → Confirm
  - Observe: Persona removed within 2s, all 5 dates gone
  - Verify: Success message shown
  - Expected: Single-device delete works

- [ ] T043 [US3] Manual test: Verify delete syncs to other devices
  - Device A: Delete persona
  - Device B: Wait 2-3 seconds (polling cycle)
  - Device B: Persona automatically removed
  - Expected: Cross-device sync works

- [ ] T043.5 [US3] Implement empty state UI in Calendar when no personas remain in `public/src/components/Calendar.jsx`
  - Show: Empty state message when entries array is empty AND no personas exist
  - Message: "No personas yet. Create one to get started!"
  - Button: "Create Persona" links to PersonaOnboarding modal
  - ARIA: aria-live="polite" announces empty state to screen readers
  - Styling: Matches existing empty state patterns in app
  - Expected: Graceful UX when last persona deleted

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, deployment preparation

- [ ] T044 Run full test suite: `npm test`
  - Expected: All 190+ tests pass
  - Expected: New tests for US1, US2, US3 all pass
  - Expected: Coverage >90% on new code

- [ ] T045 [P] Run linting: `npm run lint`
  - Expected: No ESLint errors or warnings in new files
  - Expected: Code formatting matches project standards (Prettier)

- [ ] T046 [P] Run Python linting on new backend code
  - Command: `black api/routes/delete_persona.py` (format)
  - Command: `pylint api/routes/delete_persona.py` (lint)
  - Expected: No style errors

- [ ] T047 Manual accessibility audit
  - Test: Keyboard navigation through delete modal (Tab, Enter, Escape)
  - Test: Screen reader reads all buttons and messages
  - Test: aria-busy announced during loading
  - Test: aria-live regions announce state changes
  - Expected: WCAG 2.1 Level AA compliant

- [ ] T048 Manual performance verification
  - Metric: Page load < 1s (localStorage hydration)
  - Metric: Cross-device sync < 3s (polling interval)
  - Metric: Delete operation < 2s (atomic endpoint)
  - Tool: DevTools Performance tab for measurements
  - Expected: All metrics within targets

- [ ] T049 [P] Update tests/README.md with new test locations
  - Document: DeletePersonaModal.test.js, useHydration.test.js, cascade-delete tests
  - Include: How to run each test, what it verifies
  - Expected: Team can find and understand new tests

- [ ] T050 [P] Update API documentation in `api/README.md` (if exists)
  - Document: DELETE /api/personas/{name} endpoint
  - Include: Request/response format, error codes, cascade behavior
  - Expected: Backend documentation up-to-date

- [ ] T051 Merge branch to main after approval
  - Command: `git checkout main && git merge 005-post-deployment-polish`
  - Verify: CI/CD passes (all tests, linting, build)
  - Expected: Feature merged, ready for production

- [ ] T052 Deploy to Azure Static Web App (GitHub Actions)
  - Trigger: Push to main
  - Expected: GitHub Actions runs CI/CD, deploys to production
  - Verify: App accessible at https://purple-mud-0c6ae6c0f.7.azurestaticapps.net
  - Expected: Feature 005 live in production

---

## Summary

| Phase 1: Setup | T001-T004 | Dependencies verified, branch created |
| Phase 2: Foundational | T005-T010 | Infrastructure ready, no blockers for user stories |
| Phase 3: US1 (Mock Label) | T011-T018 | Mock label removed, offline banner working |
| Phase 4: US2 (Flicker) | T019-T027 | Page hydration working, zero flicker on refresh |
| Phase 5: US3 (Delete) | T028-T043.5 | Delete endpoint + UI working, cross-device sync verified, empty state UI |
| Phase 6: Polish & Deploy | T044-T052 | Tests pass, linting passes, deployed to production |

**Total Tasks**: 54 | **Parallelizable (P)**: ~31 | **Sequential**: ~23

---

## Execution Strategy

### MVP Scope (Recommended First Delivery)

**User Stories 1 & 2 ONLY** (Phase 3 + Phase 4):
- Remove mock label: Quick win, high user impact
- Eliminate flicker: Quick win, improves perceived performance
- Deploy to production

**Delivery Time**: 1-2 days  
**Testing**: All tests pass, manual verification on deployed app

### Follow-Up Delivery (Phase 2 of Phase 5)

**User Story 3 (Delete Personas)**:
- Implement DELETE endpoint + UI
- Full cascade delete with cross-device sync
- Deploy in separate PR after US1/US2 approved

**Delivery Time**: 1-2 days  
**Testing**: All tests pass, manual delete verification on phone + PC

---

## Dependencies Between Tasks

```
T001-T004 (Setup)
    ↓
T005-T010 (Foundational)
    ↓
├─ T011-T018 (US1 - Mock Label) [Can run in parallel]
│
├─ T019-T027 (US2 - Flicker) [Can run in parallel]
│
└─ T028-T043.5 (US3 - Delete) [Can run in parallel]
    ↓
T044-T053 (Polish & Deploy)
```

**Parallelizable**: US1, US2, US3 are independent after foundational tasks complete

---

## Testing Strategy

### Test Pyramid

| Level | Tests | Files | Status |
|--|--|--|--|
| **Unit** | useHydration, useDeletePersona, OfflineWarning, DeletePersonaModal | T011, T012, T019, T028 | Phase 2 (write first) |
| **Integration** | Cascade delete, page flicker, offline detection | T020, T029, T031 | Phase 2 (write early) |
| **E2E** | Cross-device sync, slow network refresh | T021, T031, T043 | Phase 2 (manual + automated) |

**Coverage Goal**: >90% on all new code (OfflineWarning, DeletePersonaModal, useHydration, useDeletePersona)

---

## Code Review Checklist

Before merging to main:

- [ ] All 54 tasks completed
- [ ] All unit tests pass (npm test)
- [ ] All integration tests pass
- [ ] E2E tests pass on deployed app
- [ ] Linting passes (npm run lint, black, pylint)
- [ ] No console errors (DevTools)
- [ ] Accessibility audit passed (ARIA, keyboard)
- [ ] Performance metrics met (<1s load, <3s sync, <2s delete)
- [ ] Code review approved by 1+ team member
- [ ] README.md updated with new features

---

## Rollback Plan

If issues discovered in production:

1. **Immediate**: Revert GitHub Actions to previous commit
2. **Rollback**: `git revert HEAD~1 && git push` (reverts Feature 005)
3. **Result**: App returns to Feature 004 state
4. **Fix**: Fix issue locally, test thoroughly, re-submit PR

---

## Phase 7: Convergence (Accessibility Enhancements)

**Purpose**: Address accessibility gaps identified during post-implementation convergence review

- [X] T053 [P] Add aria-busy and aria-label to loading state in App.jsx per FR-004
  - File: `public/src/App.jsx` lines 303-310
  - Change: Add `aria-busy="true"` and `aria-label="Loading calendar data"` to loading div
  - Reason: FR-004 explicitly requires aria-busy on loading state during page refresh for screen reader announcements
  - Expected: Screen readers announce loading state, tests still pass (no new test needed - existing loading tests cover)
  - Severity: HIGH - violates FR-004 accessibility requirement

---

## Related Documentation

- **Specification**: [spec.md](spec.md) - User stories, acceptance criteria
- **Implementation Plan**: [plan.md](plan.md) - Technical approach, architecture
- **Data Model**: [data-model.md](data-model.md) - Entities, relationships, validation
- **API Contract**: [contracts/delete-endpoint.md](contracts/delete-endpoint.md) - DELETE endpoint spec
- **Quickstart**: [quickstart.md](quickstart.md) - End-to-end validation scenarios
- **Research**: [research.md](research.md) - Technical decisions, risks, rationale
