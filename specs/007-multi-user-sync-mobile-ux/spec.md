# Feature Specification: Multi-User Real-Time Sync & Mobile UX Overhaul

**Feature Branch**: `007-multi-user-sync-mobile-ux`

**Created**: 2026-06-29

**Status**: Draft

**Input**: User description: "Large analysis and update on multi-user concurrent access with instant action reflection across all devices. Mobile UX redesign for congested layout - best-in-class usability."

## Clarifications

### Session 2026-06-29

- **Q1: Real-Time Sync Strategy** → **A: Increase polling frequency to 1 second** (from 3s) rather than implementing WebSocket. Simpler, leverages existing infrastructure, meets 500ms requirement through faster polling cycle.
- **Q2: Mobile/Tablet Breakpoint** → **A: Focus v1 on mobile (375–500px), verify acceptable on 600px**. Defer tablet-optimized layouts to phase 2. Reduces scope while maintaining quality.
- **Q3: Offline Queue Persistence** → **A: Persist queue to localStorage**. Survives browser close/refresh and retries on reconnection. Prevents data loss for offline-queued actions.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Multi-User Concurrent Availability Updates (Priority: P1)

Multiple users are marking availability on the same calendar simultaneously. When one user marks a date as available, that change should appear instantly on all other users' screens without delay, refresh, or polling artifact.

**Why this priority**: Core feature value—users depend on real-time visibility of team member availability to make decisions. Stale data creates coordination failures.

**Independent Test**: Can be tested by opening the app on two browsers side-by-side, marking a date available on one, and verifying it appears instantly on the other.

**Acceptance Scenarios**:

1. **Given** two users viewing the same persona's calendar, **When** user A marks June 15 as available, **Then** user B sees the update within 500ms without requiring refresh or action.
2. **Given** multiple users are simultaneously marking different dates, **When** each submits availability, **Then** all updates appear on all screens in the correct order with no losses or duplications.
3. **Given** rapid-fire date selections (3+ dates in 2 seconds), **When** submitted from user A, **Then** user B receives all updates together, not staggered or missed.
4. **Given** a user is offline and reconnects, **When** network is restored, **Then** any missed availability updates from other users are fetched and applied automatically.

---

### User Story 2 - Persona Creation/Deletion Sync (Priority: P1)

When one user creates or deletes a persona, that change propagates instantly to all other users, updating their persona lists and availability calendars without user action.

**Why this priority**: Persona CRUD is foundational—missing or extra personas cause confusion and render inconsistent data sets across the team.

**Independent Test**: Can be tested by creating a persona on mobile, verifying it appears on desktop within 1 second without refresh.

**Acceptance Scenarios**:

1. **Given** user A creates a new persona named "MANAGER", **When** creation completes, **Then** user B's persona dropdown shows "MANAGER" within 500ms.
2. **Given** user A deletes the last persona and sees onboarding screen, **When** deletion syncs across API, **Then** user B's page refreshes to onboarding state within 1 second.
3. **Given** multiple users create personas simultaneously with unique names, **When** all creations complete, **Then** all users see identical persona lists with no duplicates or missing entries.
4. **Given** user A deletes a non-active persona, **When** deletion syncs, **Then** user B's availability data for that persona is cleaned up (no stale dates shown).

---

### User Story 3 - Concurrent Active Persona Switches (Priority: P2)

When multiple users switch their active persona simultaneously, the app maintains coherent state where each user sees their own selection while respecting server-side persona existence.

**Why this priority**: Users routinely switch personas to view different team members' availability. Concurrent switches can cause race conditions if not handled correctly.

**Independent Test**: Can be tested by switching active personas on two devices simultaneously and verifying each device shows the correct selection and data.

**Acceptance Scenarios**:

1. **Given** users A and B are both viewing persona "DEV", **When** A switches to "QA" and B switches to "MANAGER" at the same instant, **Then** A sees QA calendar and B sees MANAGER calendar within 200ms.
2. **Given** user A switches to a persona that user B just deleted, **When** deletion sync reaches A, **Then** A's selection automatically reverts to another available persona without error.
3. **Given** both users switch to the same persona at the same time, **When** both selections sync, **Then** they both see identical calendar data and state.

---

### User Story 4 - Mobile Layout Clarity (Priority: P1)

Mobile users can clearly view calendar dates, see availability markers, and perform all actions (mark availability, create persona, delete persona) without visual clutter, excessive scrolling, or confusion about interactive elements.

**Why this priority**: Mobile is a primary use case. Current layout is congested, reducing discoverability and causing friction. Best-in-class mobile UX is table stakes.

**Independent Test**: Can be tested by loading the app on a phone browser, verifying all UI elements are legible and tappable without zooming, and performing a full workflow (create persona, mark dates, delete persona).

**Acceptance Scenarios**:

1. **Given** a mobile user opens the app, **When** page loads, **Then** the calendar is readable without horizontal scrolling, dates are clearly visible, and date text is at least 16px.
2. **Given** a mobile user wants to mark a date available, **When** they tap a date cell, **Then** the cell highlights instantly and provides clear visual feedback (e.g., color change or checkmark), and the tap target is at least 44x44px.
3. **Given** a mobile user wants to create a persona, **When** they tap the "+" or create button, **Then** a modal appears with a clear form, legible input fields (18px+), and an obvious submit button—no horizontal scrolling required.
4. **Given** a mobile user wants to delete a persona, **When** they access the persona dropdown and locate the delete option, **Then** the option is clearly visible (not hidden behind hover), and confirming deletion shows a clear success or error message.

---

### User Story 5 - Mobile Gesture & Touch Responsiveness (Priority: P2)

Touch interactions on mobile feel responsive and immediate, with no perceptible lag, and provide tactile/visual feedback that makes the app feel native and polished.

**Why this priority**: Touch responsiveness is critical to perceived performance and user satisfaction on mobile. Sluggish or delayed feedback frustrates users.

**Independent Test**: Can be tested by interacting with buttons, dropdowns, and date cells on a real device and measuring response time visually (should be instant, not 200+ ms).

**Acceptance Scenarios**:

1. **Given** a mobile user taps a date cell, **When** tap is registered, **Then** visual feedback (highlight or animation) appears within 50ms.
2. **Given** a mobile user taps the persona dropdown, **When** dropdown opens, **Then** it animates smoothly (0-200ms) and does not shift the page layout.
3. **Given** a mobile user scrolls the calendar, **When** scrolling is active, **Then** scroll is smooth (60fps) and there is no jank or lag.

---

### User Story 6 - Mobile Information Hierarchy (Priority: P2)

Mobile users can quickly scan the screen and understand: what persona is active, what month is shown, how many dates are marked, and how to perform next actions. Information is presented in a priority-based order.

**Why this priority**: Mobile screens are small. Poor information hierarchy forces excessive scrolling and increases cognitive load. Clear hierarchy improves usability.

**Independent Test**: Can be tested by showing the mobile app to a first-time user and asking them to identify (1) active persona, (2) current month, (3) how to mark a date. They should answer in under 10 seconds without prompting.

**Acceptance Scenarios**:

1. **Given** a mobile user opens the app, **When** page renders, **Then** the active persona name is prominently displayed at the top (not buried below other content), and the current month is equally visible.
2. **Given** a mobile calendar view, **When** user scans the top section, **Then** they see: app title, dark mode toggle, active persona (with color), and action buttons (create, refresh) in a logical, compact layout.
3. **Given** a mobile user is scrolling the calendar, **When** they reach the bottom of a month, **Then** the previous/next month buttons are adjacent (not far apart), and pagination is clear.
4. **Given** a mobile user viewing a full month, **When** the entire month is visible within one screen height or requires minimal scrolling, **Then** no date or important UI is cut off or hidden.

---

### User Story 7 - Mobile Keyboard & Accessibility (Priority: P3)

Mobile users can interact with the app using keyboard navigation and screen readers, and form inputs are appropriately formatted for mobile keyboards (e.g., text input, number input type="tel" where applicable).

**Why this priority**: Accessibility is a constitutional principle. Mobile users may rely on screen readers or keyboard navigation, and native mobile keyboard formatting improves UX for all users.

**Independent Test**: Can be tested by using a screen reader on mobile, tabbing through interactive elements, and filling out a form using the mobile keyboard.

**Acceptance Scenarios**:

1. **Given** a mobile user navigates with a screen reader, **When** they focus on a date cell, **Then** the screen reader announces the date, availability status, and how to interact with it.
2. **Given** a mobile user taps a text input field, **When** the keyboard appears, **Then** the keyboard type is appropriate (e.g., text for persona names, not numeric) and autocorrect/autocomplete settings are reasonable.
3. **Given** a mobile user using keyboard navigation, **When** they tab through the form, **Then** tab order is logical and no interactive elements are skipped or unreachable.

---

### User Story 8 - Network Resilience & Offline Handling (Priority: P2)

When network connectivity is unstable or unavailable, the app gracefully handles failures, queues offline actions, and syncs when connectivity is restored. Users always know the current sync status.

**Why this priority**: Mobile users experience connectivity drops. Without resilience, offline users lose data or become confused. Graceful handling builds confidence.

**Independent Test**: Can be tested by simulating offline mode in dev tools, performing actions, going online, and verifying actions sync correctly.

**Acceptance Scenarios**:

1. **Given** a mobile user marks availability while offline, **When** the app is in offline mode, **Then** the action is saved locally and a clear offline indicator is shown (e.g., "Offline - changes will sync when online").
2. **Given** a user performs 3 actions offline, **When** network is restored, **Then** all 3 actions are sent to the server in order and synced to other users within 2 seconds.
3. **Given** a user marks a date offline, then another user deletes that persona while first user is still offline, **When** first user reconnects, **Then** the app resolves the conflict gracefully (e.g., clears the orphaned date, shows a notification).
4. **Given** an availability update fails to post (network error), **When** user is online, **Then** the app retries automatically up to 3 times before showing an error message, and users can manually retry.

---

### Edge Cases

- What happens when two users delete the same persona at the exact same time?
- How does the system handle a user's active persona being deleted by another user while they are interacting with it?
- What if a mobile user marks 10 dates while offline, reconnects, and another user marks conflicting dates during that time?
- What happens when a user's local clock is out of sync with the server?
- Can the system handle 20+ concurrent users all marking availability on the same calendar simultaneously?
- What is the behavior if a network request is sent but the response is lost (no ack received)?
- How does the app behave if a user refreshes their browser mid-transaction?
- What happens if a WebSocket connection drops during a sync operation?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect when any user creates, updates, or deletes a persona via API and propagate the change to all connected clients within 500ms of the update being posted to the server, measured from the action trigger on the originating client to visible change on peer clients via 1-second HTTP polling.
- **FR-002**: System MUST detect when any user marks or unmarks availability and propagate the change to all connected clients within 500ms of the update being posted to the server, measured from the action trigger (tap on date cell) to visible change on peer clients via 1-second HTTP polling.
- **FR-003**: System MUST maintain a consistent persona list across all clients—if a persona is deleted, it must be removed from all clients' lists immediately, and onboarding must be triggered on any client viewing the deleted persona.
- **FR-004**: System MUST sync active persona selection across all clients when a user switches personas—other clients may see a different active persona if switching to a different one.
- **FR-005**: System MUST validate that actions (mark availability, create persona, delete persona) are accepted only if the target persona still exists on the server; if deleted, return a clear error and refresh the persona list.
- **FR-006**: Mobile calendar layout MUST display the current month without horizontal scrolling and with font sizes at minimum 16px for dates. Target viewport is 375–500px; acceptable on up to 600px.
- **FR-007**: ALL interactive elements (date cells, buttons, dropdowns, toggles, form inputs) MUST have a minimum tap target of 44x44px (measured as touch-sensitive area) and provide immediate visual feedback on tap (within 50ms).
- **FR-008**: Mobile persona selector MUST display available personas clearly in the top section, with the active persona highlighted, and delete actions must be discoverable without hover.
- **FR-009**: Mobile forms (persona creation) MUST display on-screen without horizontal scrolling, with form input text size minimum 18px, form labels minimum 16px, and all labels must be clear and properly associated with inputs (via `<label for>` or `aria-label`).
- **FR-010**: System MUST show a persistent sync status indicator on mobile (e.g., "Last synced: 1m ago" or a spinner during sync) so users know the app is working.
- **FR-011**: System MUST handle network disconnections gracefully—offline actions must be queued in localStorage and retried automatically when connectivity is restored, with a maximum queue size of 100 actions and a retention period of 24 hours.
- **FR-012**: System MUST implement optimistic UI updates on the client—when a user marks availability, the UI updates immediately while the request is sent in the background.
- **FR-013**: Mobile navigation/pagination (previous/next month) MUST be easily accessible and not require excessive scrolling; buttons should remain visible or sticky.
- **FR-014**: System MUST enforce that concurrent updates do not result in data loss; if two users mark the same date simultaneously on the same persona, both updates are persisted and reflected on all clients within 500ms.
- **FR-015**: Mobile touch interactions (date selection, dropdown open, form submission) MUST not cause page scroll or layout shifts (measured as Cumulative Layout Shift < 0.1).
- **FR-016**: System MUST validate persona names for uniqueness and MUST reject duplicate names with clear error message: "Persona name '{name}' already exists. Please choose another name."

### Key Entities

- **Persona**: Represents a team member with a name and color. Shared across all users via /api/users. When deleted, all associated availability entries are removed.
- **Availability**: A mapping of (persona, date) → available/unavailable status. Stored server-side and synced to all clients within 500ms.
- **Client State**: Local React state holding personas and activePersona. Synced with server via API polling and updates. Single source of truth for UI rendering.
- **Sync Status**: Indicates whether the client is in sync with the server (synced, pending, error, offline).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Any availability update from one client appears on all other clients within 500ms, measured from the moment the user taps to mark/unmark availability on the originating client to the moment the change is visibly rendered on peer clients (via HTTP polling at 1-second interval, typical latency ~65ms endpoint + 500ms polling = achieves requirement).
- **SC-002**: Persona creation on one device appears on all other devices within 500ms via HTTP polling, measured from the moment the creator submits the form to the moment other clients' persona lists are updated and displayed.
- **SC-003**: Persona deletion triggers onboarding screen on all clients viewing that persona within 2 seconds.
- **SC-004**: Mobile calendar is fully readable on a 375px-wide screen (iPhone SE) without horizontal scrolling or zoom.
- **SC-005**: All date cell tap targets are at least 44x44px, measured using dev tools or manual testing.
- **SC-006**: Visual feedback on date cell tap occurs within 50ms (measured by recording video or visual inspection).
- **SC-007**: Mobile form submission completes and closes modal within 300ms (user-perceived latency).
- **SC-008**: Offline actions are queued and synced within 2 seconds of network restoration.
- **SC-009**: Zero data loss when two users perform conflicting concurrent actions (e.g., marking same date); both updates persist.
- **SC-010**: Mobile sync status is visible to the user at all times (e.g., persistent "Last synced" badge).
- **SC-011**: Bundle size remains under 120 kB gzipped after all mobile UX changes.
- **SC-012**: Lighthouse accessibility score on mobile is 90+.
- **SC-013**: No layout shifts (CLS < 0.1) when modals open, personas sync, or data updates.

## Assumptions

- **Polling Frequency**: Real-time sync is achieved through increased HTTP polling (1-second interval instead of 3 seconds). WebSocket implementation is deferred to a future phase if polling throughput becomes a bottleneck at scale (50+ concurrent users).
- **Mobile-First Design**: v1 focuses on mobile (375–500px viewport). Tablet and larger screens will use the mobile layout initially; dedicated tablet-optimized layouts are deferred to phase 2.
- **Offline Queue Persistence**: Offline actions are persisted to localStorage with a max age of 24 hours and a max queue size of 100 items. Browser close/refresh does not lose queued actions. Older items are discarded after 24h.
- **Concurrent User Scale**: System is designed and tested for 5–20 concurrent users. Scaling beyond 50 requires infrastructure review (database connection pooling, polling throughput optimization).
- **Connection Stability**: Users have periodic network connectivity; brief offline periods (< 5 minutes) are expected on mobile, but the app will remain connected for longer sessions.
- **Persona Uniqueness**: Persona names are unique across the team; the system MUST validate uniqueness on creation and reject duplicates with error message per FR-016.
- **Real-Time Expectation**: "Instantly reflected" means within 500ms for typical network conditions. Longer delays (1–3s) are acceptable if network is poor, but should be clearly communicated via sync status.
- **Authentication**: User identity is established at page load (via localStorage or session) and does not change during the session. Multi-account switching is out of scope for this spec.
- **Existing API**: The backend /api/users and /api/availability endpoints are already implemented and stable. This spec assumes they remain unchanged or backward-compatible.
- **Mobile Gestures**: Swipe for month navigation is out of scope; buttons are the primary navigation method. Pinch-to-zoom is allowed but not required.
- **Dark Mode**: Mobile UX must respect the app's existing dark mode setting and ensure all text is readable in both light and dark modes.
