# Feature Specification: Post-Deployment Polish

**Feature Branch**: `005-post-deployment-polish`

**Created**: 2026-06-29

**Status**: Draft

**Input**: User description: "Tidy up some bits noticed since app deployment: remove mock data label, fix page flicker on refresh, add persona deletion capability"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove Mock Data Indicator (Priority: P1)

Users notice a "Using Mock Data (localStorage)" label on the main calendar page, which is confusing since the app is now deployed with a real backend API and actual database persistence. This label should not appear once users have created their persona and are actively using the production application.

**Why this priority**: P1 - This is a high-priority UX issue that directly impacts user confidence in the app. Users seeing "mock data" indicators in production creates confusion about whether their data is being saved reliably. Removing this indicator is critical for post-deployment polish and user trust.

**Independent Test**: Can be fully tested by: visiting the main page after app deployment → checking if the "Using Mock Data (localStorage)" label is visible → verifying label does not appear (or only appears during the initial fallback state when API is unavailable).

**Acceptance Scenarios**:

1. **Given** app is deployed with API working, **When** user creates persona and navigates to calendar, **Then** no "Using Mock Data (localStorage)" text appears anywhere on page
2. **Given** API is temporarily unavailable, **When** app falls back to localStorage, **Then** a warning banner appears (e.g., "Offline Mode: Using local data") instead of "Using Mock Data" label
3. **Given** user navigates to app URL directly (no session), **When** PersonaOnboarding modal is displayed, **Then** no "Using Mock Data" label appears

---

### User Story 2 - Eliminate Page Flicker on Refresh (Priority: P1)

Users experience a visible flicker/flash when refreshing the page (F5 or page reload). This happens because React state is initialized before API data is fetched, causing the UI to render in one state and then update when data arrives, creating a jarring visual effect.

**Why this priority**: P1 - Page flicker is a critical UX issue that makes the app feel unpolished and unreliable, especially on slower connections. This is one of the first things users notice and impacts perceived performance and quality.

**Independent Test**: Can be fully tested by: loading app → creating a persona → pressing F5 to refresh → observing page render without visual flicker or content shift → verifying calendar displays in final state immediately upon page load.

**Acceptance Scenarios**:

1. **Given** user has active session with persona data, **When** user refreshes page (F5), **Then** calendar renders smoothly without visible flicker or content shift
2. **Given** user refreshes while availability data is loading, **When** page loads, **Then** page shows skeleton/loading state instead of flashing between states
3. **Given** user has slow network connection, **When** user refreshes, **Then** page shows consistent loading state rather than multiple render flashes

---

### User Story 3 - Delete Personas and Their Calendar Entries (Priority: P2)

Users need the ability to delete personas they created and remove all associated calendar entries in one action. This is essential for managing personas (e.g., when someone leaves the group, or a persona was created by mistake). Since this is a casual app between mates, no admin approval is needed - any user can delete any persona.

**Why this priority**: P2 - This is important for data management and flexibility, but less critical than the UX polish issues. Once users can delete personas, the app's data model is complete and flexible enough for real use.

**Independent Test**: Can be fully tested by: creating multiple personas → selecting one persona → clicking delete → confirming deletion → verifying persona and all its calendar entries are removed → calendar updates to show only remaining personas.

**Acceptance Scenarios**:

1. **Given** user has created a persona (e.g., "Alice"), **When** user selects the delete option for that persona, **Then** a confirmation dialog appears showing "Delete Alice and all her calendar entries?"
2. **Given** user confirms deletion, **When** deletion completes, **Then** the persona is removed from the app, all calendar entries for that persona vanish, and calendar is updated to show remaining personas only
3. **Given** user selects delete for a persona, **When** deletion is in progress, **Then** user sees loading indicator and cannot perform other actions until deletion completes
4. **Given** deletion fails due to network error, **When** error occurs, **Then** error message appears and user can retry or cancel

---

## Clarifications

### Session 2026-06-29

- Q: Where should delete button appear and what confirmation pattern? → A: Three-dot menu on each persona row with confirmation modal (Option A)
- Q: Single endpoint for deletion or separate calls? → A: Single atomic endpoint `DELETE /api/personas/{name}` (Option A)
- Q: How detect offline and when show warning? → A: Show banner only after API call fails; hide when next call succeeds (Option A)
- Q: Fix flicker by preventing render or caching? → A: Hybrid hydration - load from localStorage first, fetch fresh in background (Option A)
- Q: Accessibility for loading states? → A: ARIA live regions + aria-busy to announce state changes (Option A)

---

### Edge Cases

- What happens if user deletes the only remaining persona? (App should show empty state and prompt persona creation; graceful degradation)
- How does deletion work if multiple users are editing the same calendar simultaneously? (Deletion endpoint must be atomic; all clients refresh via polling or WebSocket)
- What if user presses F5 during an in-flight API request? (localStorage hydration prevents flicker; fresh data loads in background)
- What if API fails after user clicks "Delete" but before deletion completes? (UI shows error message with retry button; persona remains until deletion succeeds)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: App MUST NOT display "Using Mock Data (localStorage)" text on the main calendar page when API is operational
- **FR-002**: When API call fails with network error, app MUST display a clear offline warning banner (e.g., "Offline Mode: Using local data") instead of generic mock data label; banner MUST disappear when next API call succeeds
- **FR-003**: App MUST hydrate UI state from localStorage immediately on page load (if available) to prevent flicker, then fetch fresh data from API in background
- **FR-004**: During page refresh, app MUST show skeleton/loading state with `aria-busy="true"` so screen readers announce loading state; no visual flicker or content shift permitted
- **FR-005**: Users MUST be able to delete any persona by clicking three-dot menu on persona row → selecting "Delete" → confirming in modal dialog
- **FR-006**: Deleting a persona MUST use atomic `DELETE /api/personas/{name}` endpoint that cascade-deletes all availability entries in single transaction
- **FR-007**: Users MUST receive confirmation modal showing "Delete [persona_name] and all calendar entries?" before deletion executes
- **FR-008**: Persona deletion request MUST be persisted to backend database and acknowledged before UI updates
- **FR-009**: Users MUST see loading spinner on delete button and `aria-busy="true"` during deletion operation; cannot perform other actions until completion
- **FR-010**: Users MUST see error message with retry button if deletion fails; persona remains until deletion succeeds
- **FR-011**: Loading state transitions (hydration complete, data refreshed) MUST be announced via ARIA live regions to assistive technology users

### Key Entities

- **Persona**: {name, color, id/composite_key} - unique user in calendar, immutable after creation except deletion
- **Availability**: {persona_id, date, status} - day-off entry tied to persona; MUST be cascade-deleted when persona deleted
- **UI State**: {loading, error, allPersonas, currentMonth, mockDataMode} - app state determining what UI renders

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Mock data label does not appear for any user accessing deployed app with working API; offline warning only appears after API call fails
- **SC-002**: Page refresh shows zero visible flicker or content reshift (localStorage hydrates immediately; fresh data loads silently in background)
- **SC-003**: Users can delete a persona by: clicking menu → confirming → seeing persona removed within 2 seconds; all dates removed immediately
- **SC-004**: 100% of persona deletion operations successfully remove all associated calendar entries atomically (zero orphaned dates)
- **SC-005**: No console errors appear when user refreshes page, hydrates from cache, or deletes persona
- **SC-006**: Deletion confirmation modal appears within 100ms; delete button disabled with loading spinner until response received
- **SC-007**: ARIA live regions announce "Offline mode enabled" and "Calendar updated" for screen reader users; no visual-only state changes

## Assumptions

- Users have stable internet connectivity for deletion operations (deletions require successful backend response before UI updates)
- A persona cannot be recreated after deletion (deletion is permanent)
- App already has localStorage fallback mechanism in place (confirmed in Feature 004)
- All three issues are independent and can be implemented/tested separately
- API endpoint `DELETE /api/personas/{name}` will be created; must cascade-delete all availability entries atomically
- Existing `useAvailability` hook can be extended with `deletePersona` function
- PersonaOnboarding component or a new PersonaList component will host the three-dot delete menu
- Page flicker is caused by React state initialization timing, not by network latency alone
- Offline detection logic relies on catch block in existing fetch utilities (no additional health check endpoint needed)
- ARIA live regions already available via React 19; no additional accessibility library required
- localStorage keys are synchronized with backend data structure (matching persona names and dates)
