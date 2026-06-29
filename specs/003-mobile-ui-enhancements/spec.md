# Feature Specification: Mobile UI Enhancements

**Feature Branch**: `003-mobile-ui-enhancements`

**Created**: 2026-06-29

**Status**: Draft

**Input**: User description: "we need to have the ability to see who is available on whichever day by hovering over the dates on the calender. currently it just show a 'plus one more' on the date. lets also rename the calender to 'Da Boyz Availability Calender' and add a dark mode toggle feature. lets also make sure this site is mobile friendly as we will mainly be using this on our phones. so features such as the hover to see who is available and everything else will need to be adapted to use best practices for mobile usage also."

## Clarifications

### Session 2026-06-29

- Q: How should users access the complete availability list on mobile devices? → A: Single tap on the availability badge (fastest, most discoverable pattern for mobile UX)
- Q: Availability display component - Tooltip vs Modal? → A: Floating modal (centered or anchored to badge, larger, standard mobile pattern)
- Q: Dark mode preference source? → A: Manual toggle button with system preference as fallback (user control + automatic first-time setup)
- Q: Long persona names in mobile view? → A: Truncate with ellipsis + full name on hover/long-press (clean, scannable, accessible)
- Q: Floating modal presentation on mobile? → A: Bottom sheet (slides up from bottom, 60-70% viewport, mobile-native and thumb-friendly)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Complete Availability List on Date (Priority: P1)

Users currently see a truncated availability display with "+1 more" text when multiple personas are available on a date. They need to see the complete list of all available people for that date to make scheduling decisions quickly.

**Why this priority**: This is the core value proposition - users need complete information without extra clicks or navigation steps. Currently, availability information is hidden.

**Independent Test**: Marking 3+ personas as available on a date and verifying all names and colors are visible (either via tooltip, modal, or expanded list depending on device) without truncation.

**Acceptance Scenarios**:

1. **Given** a date has 3+ personas marked as available, **When** user hovers over the date (desktop) or taps the availability indicator (mobile), **Then** a complete list of all available personas is displayed with names and colors
2. **Given** a bottom sheet modal with availability list is displayed on mobile, **When** user swipes down, taps outside, or taps close button, **Then** the modal closes and returns to calendar view
3. **Given** a tooltip with availability list is displayed on desktop, **When** user moves cursor away or taps elsewhere, **Then** the tooltip closes and returns to calendar view
4. **Given** a date has 1-2 personas available, **When** user hovers/taps the date, **Then** all personas are displayed without truncation
5. **Given** a date has no availability markers, **When** user hovers/taps the date, **Then** no modal or tooltip appears

---

### User Story 2 - Calendar Branding with Title Rename (Priority: P1)

The calendar currently has a generic or minimal title. Users want the calendar branded as "Da Boyz Availability Calender" to make it clear this is for group scheduling.

**Why this priority**: Branding improves user recognition and group identity. This is a simple but important change for the user experience.

**Independent Test**: Verifying the calendar header displays "Da Boyz Availability Calender" prominently and consistently across all views (mobile and desktop).

**Acceptance Scenarios**:

1. **Given** user loads the application, **When** page fully renders, **Then** the header displays "Da Boyz Availability Calender" as the main title
2. **Given** user resizes window from desktop to mobile, **When** layout adapts, **Then** the calendar title remains visible and readable (may adjust sizing but text is not hidden)
3. **Given** user navigates between months, **When** month changes, **Then** the "Da Boyz Availability Calender" title remains constant and visible

---

### User Story 3 - Dark Mode Toggle for Eye Comfort (Priority: P2)

Users primarily access the calendar on phones at various times of day, including evenings and low-light environments. A manual dark mode toggle will reduce eye strain and improve accessibility, with automatic detection of system preference on first load.

**Why this priority**: Mobile-first usage means users may access the app in various lighting conditions. Dark mode is a standard mobile app feature that improves user comfort. It's important but slightly lower priority than core functionality.

**Independent Test**: Toggling between light and dark modes verifies the entire UI switches appropriately (colors, contrast, text, backgrounds) and preference persists across page refreshes. System preference is respected on first load.

**Acceptance Scenarios**:

1. **Given** the application loads for the first time, **When** page renders, **Then** dark mode is automatically enabled/disabled based on system preference (prefers-color-scheme)
2. **Given** the application is in light mode, **When** user clicks/taps the manual dark mode toggle, **Then** the entire UI switches to dark colors with sufficient contrast for readability
3. **Given** the application is in dark mode, **When** user clicks/taps the manual dark mode toggle, **Then** the entire UI switches back to light colors
4. **Given** user has manually toggled dark mode, **When** user closes and reopens the application, **Then** the manual preference is restored (overrides system preference if user explicitly changed it)
5. **Given** dark mode is active, **When** user marks dates or views calendar, **Then** all persona colors remain distinguishable against dark background

---

### User Story 4 - Mobile-Optimized Availability View and Interactions (Priority: P1)

Desktop hover interactions don't translate to mobile - touch devices lack hover states. Users need a touch-optimized gesture to see availability details on mobile devices. The entire interface must be responsive and touch-friendly.

**Why this priority**: Mobile is the primary device for this user group. Without mobile-optimized interactions, the app is unusable on phones for the core availability-viewing feature.

**Independent Test**: Opening app on mobile device (or mobile viewport), tapping on availability badge with multiple personas, and verifying complete availability list displays without requiring additional scrolling or complex gestures.

**Acceptance Scenarios**:

1. **Given** user is on mobile device with 2+ personas available on a date, **When** user taps the availability badge/indicator, **Then** a modal displays all available personas with full details (no "+1 more" text)
2. **Given** a modal with availability details is open on mobile, **When** user taps outside the modal or on a close button, **Then** the modal closes and returns to calendar view
3. **Given** user is on mobile portrait orientation, **When** calendar renders, **Then** calendar grid and all elements are fully visible without horizontal scrolling
4. **Given** calendar title, persona selector, and month controls are displayed on mobile, **When** user views the UI, **Then** all interactive elements are large enough to tap comfortably (minimum recommended touch target size)
5. **Given** user is switching between landscape and portrait orientations on mobile, **When** device rotates, **Then** layout responsively adjusts with all content remaining accessible

---

### Edge Cases

- Persona names longer than display space (max 50 chars): truncated with ellipsis (...), full name shown on hover (desktop) or long-press (mobile)
- How is the floating modal positioned when the date is at the edge of the screen (right edge, bottom edge)?
- What's the behavior if dark mode is toggled while the availability modal is open?
- How does the interface handle small screens (< 375px width - older phones)?
- What happens when orientation changes (portrait ↔ landscape) while viewing the availability modal?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display the complete list of all available personas for a date without truncation or "+1 more" text
- **FR-002**: On desktop, system MUST display availability list on hover (mouse over) the date or availability badge
- **FR-003**: On mobile/touch devices, system MUST display availability list on single tap of the availability badge (fast, discoverable gesture optimized for mobile)
- **FR-004**: System MUST provide a way to dismiss/close the availability list (clicking outside, escape key on desktop, tap outside on mobile)
- **FR-005**: Calendar header MUST display the text "Da Boyz Availability Calender" as the primary title
- **FR-006**: System MUST provide a manual dark mode toggle button/switch in the UI
- **FR-007**: On first load, system MUST respect the user's system preference (prefers-color-scheme media query)
- **FR-008**: Dark mode MUST apply consistent dark colors to all UI elements (backgrounds, text, cards, buttons, badges)
- **FR-009**: Dark mode preference MUST be persisted to browser storage so manual preference is retained across sessions (overriding system preference if user explicitly changed it)
- **FR-010**: System MUST be responsive and render correctly on mobile devices (portrait and landscape orientations)
- **FR-011**: System MUST ensure all interactive elements (buttons, date cells, toggles) are touch-friendly with adequate spacing and minimum touch target sizes
- **FR-012**: Calendar grid MUST not require horizontal scrolling on mobile devices in either orientation
- **FR-013**: Persona colors in availability badges MUST remain visually distinct in both light and dark modes
- **FR-014**: When availability details modal is displayed on mobile, system MUST show close affordance (button or outside-tap behavior)
- **FR-015**: On mobile, availability modal MUST be implemented as a bottom sheet (slides up from bottom, occupies 60-70% of viewport) with swipe-down, outside-tap, and close button dismiss gestures
- **FR-016**: System MUST display all UI elements (title, controls, calendar) in readable text sizes on screens as small as 375px width
- **FR-017**: When persona name exceeds available display width, system MUST truncate with ellipsis (...) and show full name on hover (desktop) or long-press (mobile)

### Key Entities

- **Availability Floating Modal**: On desktop: hover tooltip anchored near badge. On mobile: bottom sheet modal (slides up from bottom, occupies 60-70% of viewport) displaying complete list of (name, color) tuples for a selected date; triggered by single tap on badge; dismissable by swiping down, tapping outside, or close button
- **Dark Mode Preference**: User-level setting with two-tier fallback: (1) localStorage for manual user preference, (2) system preference (prefers-color-scheme) on first load if no localStorage value exists. Controls theme application across all UI components.
- **Touch-Friendly UI**: Buttons, dates, badges, and controls sized and spaced for comfortable mobile interaction (recommended minimum 44x44px touch targets)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view complete availability list on any date within 1 tap/hover gesture with no truncation
- **SC-002**: 100% of available personas on a date are visible in the availability display (no "+1 more" text or hidden people)
- **SC-003**: Calendar title "Da Boyz Availability Calender" is visible and properly branded on all views (desktop, tablet, mobile)
- **SC-004**: Dark mode toggle is discoverable within 5 seconds of opening the app
- **SC-005**: Dark mode preference persists across at least 3 browser session restarts (manual selection takes precedence over system preference)
- **SC-006**: On mobile (< 768px viewport), calendar renders fully without horizontal scrolling in both portrait and landscape
- **SC-007**: All buttons and interactive elements are at least 44x44px touch targets on mobile
- **SC-008**: Persona colors are distinguishable in both light and dark modes (contrast ratio meets WCAG AA standard)
- **SC-009**: Availability bottom sheet modal closes within 1 swipe/tap/gesture after being opened
- **SC-010**: Dark mode feature is actively used by at least 70% of mobile users within first week of feature release (adoption indicates improved comfort and reduces support requests)

## Assumptions

- **Device diversity**: Mobile devices used will be modern smartphones (5" - 6.5" screens) with standard mobile browsers. Legacy devices (< 375px width) are lower priority but should not break.
- **Dark mode implementation**: Assumes CSS custom properties (variables) or CSS-in-JS can be used to switch themes. Platform's existing styling system (TailwindCSS) supports dark mode. Manual toggle stored in localStorage; system preference used as fallback on first load via `prefers-color-scheme` media query.
- **Hover vs Tap distinction**: The system will use CSS media queries (`@media (hover: hover)`) to distinguish desktop and mobile, or JavaScript feature detection for touch capability.
- **Modal positioning**: On desktop: tooltip near badge. On mobile: bottom sheet modal sliding up from bottom (60-70% of viewport height), with swipe-down and outside-tap dismiss, matching mobile best practices.
- **Long persona names**: Persona names are max 50 characters (per existing validation). Names exceeding available space are truncated with ellipsis; full name accessible via tooltip/long-press.
- **Persona color sRGB**: Assumes persona colors are valid hex colors that can be displayed and differentiated on both light and dark backgrounds.
- **Storage availability**: Browser localStorage is available and has at least 1-2 KB space for dark mode preference and any view state.
- **No breaking changes**: Existing persona creation, availability marking, and persona switching workflows remain unchanged. These enhancements are purely UI/UX improvements.
- **Responsive breakpoints**: Standard breakpoints are used (mobile < 768px, tablet 768px-1024px, desktop > 1024px).
