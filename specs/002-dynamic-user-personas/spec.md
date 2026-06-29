# Feature Specification: Dynamic User Personas

Users who navigate to the app can create their own unique persona with a custom name and color, without requiring pre-defined user accounts. This replaces the static user list with a dynamic, user-driven approach.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Custom Persona (Priority: P1)

As a new user, I want to create my own persona by choosing a name and picking a color so I can participate in the shared calendar without pre-configured accounts.

**Why this priority**: This is the foundation for enabling any user to access the app. Without this, users are limited to pre-defined options.

**Independent Test**: Open the app for the first time, create a new persona (name: "Sarah", color: red), and confirm the persona is active in the session.

**Acceptance Scenarios**:

1. **Given** the app is accessed for the first time, **When** I see the persona creation UI, **Then** I can enter a name and select a color from a color picker.
2. **Given** I have entered a name and selected a color, **When** I click "Create Persona" or equivalent, **Then** my persona is created and immediately becomes the active session user.
3. **Given** I have created a persona, **When** I navigate away or refresh, **Then** my persona is remembered in the current session (stored in browser storage).

---

### User Story 2 - Mark Availability with Custom Persona (Priority: P1)

As a user with a custom persona, I want to mark dates on the calendar and have my availability show in my chosen color so other users can see when I'm available.

**Why this priority**: Once a persona is created, the core app functionality must work seamlessly.

**Independent Test**: Create a persona, click a date, and verify the date displays a badge in the persona's chosen color.

**Acceptance Scenarios**:

1. **Given** I have an active persona, **When** I click a date, **Then** the date shows my availability tagged with my color.
2. **Given** I have marked a date, **When** I click it again, **Then** my availability is removed.

---

### User Story 3 - Switch or Create New Persona (Priority: P2)

As a user, I want to be able to create an additional persona or switch between personas so I can manage multiple identities or represent different group members.

**Why this priority**: Enables flexible use cases (one device, multiple users) without losing data.

**Independent Test**: Create a second persona and verify I can switch between them, with each persona having its own availability markers.

**Acceptance Scenarios**:

1. **Given** I have one persona created, **When** I access a "New Persona" button or option, **Then** I can create a second persona.
2. **Given** I have multiple personas, **When** I switch personas via a dropdown or selector, **Then** the calendar updates to show the active persona's availability in their color.

---

### Edge Cases

- **No personas created yet**: Show a welcome/onboarding screen for persona creation.
- **Color conflicts**: If two users pick identical colors, the system should handle visual distinction via badges or tooltips.
- **Invalid input**: Reject empty names or names with invalid characters (validation rules TBD).
- **Browser storage limit**: If localStorage is full, gracefully degrade (document assumption).

---

## Functional Requirements

1. **Persona Creation Form (Mandatory on First Load)**
   - Calendar access is blocked until a persona is created (no skip or default fallback)
   - Input field for persona name (text, max 50 characters, trimmed)
   - Color picker widget using HTML `<input type="color">` for visual selection and full RGB range support
   - "Create Persona" button to confirm and activate
   - Form validates name is non-empty before allowing submission
   - Once created, onboarding overlay disappears and calendar becomes interactive

2. **Persona Activation & Session Management**
   - Active persona is stored in browser session storage and/or localStorage
   - Persona persists within a single browser session
   - User can create multiple personas and switch between them via dropdown in header
   - Dropdown displays all created personas with option to select, plus "➕ New Persona" at bottom to create new
   - Active persona is highlighted in dropdown
   - Clicking "➕ New Persona" opens the creation form (inline form or modal)

3. **Availability Marking**
   - Dates marked by a persona show a badge in that persona's color
   - Clicking a date toggles the active persona's availability for that date
   - Badge displays the persona's name on hover or in a tooltip

4. **Remove Static Users Section & Replace with Dynamic Selector**
   - Remove the hardcoded "Users" list from the UI (Alice, Bobby, Carmen legend)
   - Replace with persona dropdown in header showing all created personas
   - Dropdown acts as both selector and creation trigger
   - No static "Users" legend needed; persona colors displayed inline with badges on calendar

5. **Data Persistence**
   - New personas and their availability are saved to backend storage (API endpoints updated)
   - **Availability entries store (name, color) composite key** instead of persona UUID
   - Each entry: {name, color, date, timestamp}
   - Cross-device sync works automatically: if "Sarah" + blue marks a date on Device A, Device B retrieves by (name, color) and sees the same availability
   - No separate persona creation endpoint needed; personas are implicitly created when first availability entry is recorded

---

## Success Criteria

1. A new user can create a persona and mark availability within 30 seconds of opening the app
2. Color picker supports at least 16 predefined colors or full RGB/hex range
3. Multiple personas can be created and persisted without data loss
4. Persona name and color are uniquely stored in the backend
5. Switching between personas instantly updates the calendar view
6. The app no longer displays a hardcoded "Users" section
7. Zero validation errors for reasonable inputs (names 1-50 chars, standard colors)

---

## Key Entities

- **Availability**: {name (string), color (hex string), date (YYYY-MM-DD), timestamp (ISO)}
  - (name, color) composite key uniquely identifies a persona across all devices
  - No separate Personas table needed; persona identity embedded in each availability entry
  - Query by (name, color, date) to retrieve all personas available on a specific date

---

## Non-Functional Requirements

- Form submission should be instant (< 100ms perceived latency)
- Color picker should be accessible (WCAG AA compliant)
- Persona creation should not require backend call on first creation (optimistic creation)

---

## Assumptions

1. One device = one or more personas; users can represent multiple people on the same device.
2. **Personas are identified by (name, color) tuple across all devices**: Two personas with identical name AND color are the same persona and sync automatically. Same name with different color = different persona. This enables intuitive cross-device sync without requiring manual ID sharing.
3. A persona can only be created by entering name and color; no email or external account required.
4. **Color picker uses HTML `<input type="color">` widget** for native browser support with full RGB range, meeting the 16+ color success criterion.
5. **Backend stores (name, color) as composite key in availability entries**: No separate Personas table. Simplifies schema and data model. Personas implicitly exist when availability entries are created.
6. Availability continues to sync every 5 seconds as before (no change to polling interval).

---

## Out of Scope

- User authentication or login system
- Shared persona management (one user per persona only)
- Persona deletion or archival
- Analytics on most-used colors

---

## Clarifications

### Session 2026-06-29

- Q: How should the backend identify and match personas across devices? → A: Use name + color as unique key (Option B). Two personas with the same name AND color are treated as identical across all devices; automatically sync. Same name with different color = different persona.
- Q: What should happen when a user first opens the app with no personas created? → A: Mandatory creation (Option A). Show onboarding UI that blocks calendar access until a persona is created. User cannot proceed without providing name and color.
- Q: How should users select colors for their personas? → A: HTML color picker (Option C). Browser native `<input type="color">` widget for visual color selection, full RGB range support, works across all modern browsers and devices.
- Q: How should the persona selector and "Create New Persona" action be presented? → A: Dropdown in header (Option A). Single dropdown showing all created personas + "➕ New Persona" option. Mirrors existing UI pattern, maintains consistency, saves header space, all actions in one place.
- Q: How should the backend store persona identities and query availability? → A: Composite key in availability entries (Option A). Each availability entry stores {name, color, date, timestamp}. No separate personas table. Simpler schema, aligns with (name, color) as persona identity. Cross-device sync happens automatically.