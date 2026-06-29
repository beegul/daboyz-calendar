# Implementation Plan: Mobile UI Enhancements

**Feature**: 003-mobile-ui-enhancements | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-mobile-ui-enhancements/spec.md`

## Summary

Enable users to view complete availability lists on any date via device-appropriate interactions (desktop hover → tooltip; mobile tap → bottom sheet), brand the calendar as "Da Boyz Availability Calender", implement dark mode toggle with system preference fallback, and ensure mobile-first responsive design with touch-optimized interactions. All personas are visible without truncation; persona names exceeding space are truncated with ellipsis and full name accessible via tooltip/long-press.

**Technical Approach**: 
- Leverage TailwindCSS dark mode class (`dark:`) for theme switching with CSS variables for persona colors
- Implement `useDarkMode` hook to manage localStorage preference + system preference fallback
- Create `AvailabilityModal` component (desktop tooltip via custom React positioning, mobile bottom sheet via custom CSS—avoiding external UI library to maintain simplicity per Principle V)
- Add `DarkModeToggle` component in header
- Update `AvailabilityBadge` to show max 2 personas inline; tap/hover opens modal
- Ensure responsive design with mobile-first breakpoints
- Add comprehensive unit + integration tests for all new interactions

## Technical Context

**Language/Version**: React 19.2.7, JavaScript/JSX, Vite 5.4.0, TailwindCSS 3.3.6

**Primary Dependencies**: 
- React (hooks, context for theme)
- TailwindCSS (dark mode, responsive utilities)
- Jest 29.7.0 + React Testing Library (testing)
- ✅ **NO new external UI libraries** - Modal implemented with custom React + CSS (Headless UI avoided per Principle V: Simplicity)

**Storage**: Browser localStorage (dark mode preference, any modal state)

**Testing**: Jest with React Testing Library (jsdom environment), 100% coverage target for new components

**Target Platform**: Web browsers (modern mobile browsers + desktop, iOS Safari 14+, Chrome/Firefox on Android)

**Project Type**: React web application (SPA)

**Performance Goals**: 
- Persona colors remain distinguishable in both themes (WCAG AA contrast ratio ≥ 4.5:1)
- Modal opens within 300ms of tap/hover
- Dark mode toggle applies instantly (no layout shift)
- Bottom sheet animation smooth (60 fps on mobile)
- Touch targets ≥ 44x44px on mobile

**Constraints**: 
- No new external dependencies if possible (use TailwindCSS + native CSS)
- Existing persona creation/availability marking workflows unchanged
- Must support screens down to 375px width
- Must respect system preference on first load
- Dark mode preference persists across browser sessions

**Scale/Scope**: 
- 4 user stories, 16 functional requirements
- ~5-7 new React components/hooks
- ~20-30 test cases
- 2-3 design files (contracts, data model, quickstart)

## Constitution Check

**✅ PASS - Pre-Design Gate**

| Principle | Status | Compliance |
|-----------|--------|-----------|
| **I. Code Quality** | ✅ | New components will follow React best practices, use clear naming (PersonaAvailabilityModal, useDarkMode), keep logic small and composable. Linting with ESLint (0 errors standard). |
| **II. Test Standards** | ✅ | Unit tests for useDarkMode (localStorage + system preference), DarkModeToggle (toggle state), AvailabilityModal (open/close/dismiss). Integration tests for dark mode persistence, availability modal interaction flows, responsive layout. |
| **III. UX Consistency** | ✅ | Floating modal/bottom sheet is standard mobile pattern. Dark mode uses TailwindCSS dark: classes to maintain consistency. Persona colors preserved via CSS variables. Touch targets 44x44px match mobile standards. No breaking changes to existing UX. |
| **IV. Performance** | ✅ | Modal rendering uses React.memo and lazy state updates. No external dependencies added. Dark mode toggle uses CSS class swap (instant). Bottom sheet uses CSS transforms (GPU-accelerated). No performance regression expected. |
| **V. Simplicity** | ✅ | Leverages existing TailwindCSS dark mode (no custom theme system). Uses browser localStorage (no new backend storage). Bottom sheet implemented with CSS + React state (no library). Simplest solution meeting requirements. |

**Gates Satisfied**: ✅ All 5 principles pass. No violations. Ready for Phase 1 design.

## Project Structure

### Documentation (this feature)

```text
specs/003-mobile-ui-enhancements/
├── spec.md                          # ✅ Completed specification
├── plan.md                          # ← This file (Phase 1 input)
├── research.md                      # Phase 0: Research (if clarifications remain)
├── data-model.md                    # Phase 1: Data model & entities
├── contracts/
│   ├── components.md                # React component interfaces
│   └── hooks.md                     # Custom hook contracts
├── quickstart.md                    # Phase 1: Validation scenarios
└── checklists/
    └── requirements.md              # ✅ Quality checklist
```

### Source Code (repository root)

```text
public/src/
├── components/
│   ├── AvailabilityBadge.jsx        # EXISTING: Will update for modal trigger
│   ├── AvailabilityModal.jsx        # NEW: Bottom sheet modal (mobile) + tooltip (desktop)
│   ├── DarkModeToggle.jsx           # NEW: Dark mode toggle button in header
│   ├── __tests__/
│   │   ├── AvailabilityModal.test.jsx          # NEW
│   │   ├── DarkModeToggle.test.jsx             # NEW
│   │   └── AvailabilityBadge.test.jsx          # UPDATE
│   └── ...
├── hooks/
│   ├── useDarkMode.js               # NEW: Dark mode state + localStorage + system preference
│   └── __tests__/
│       └── useDarkMode.test.js      # NEW
├── utils/
│   ├── theme.js                     # NEW: Theme constants, color utilities
│   ├── truncate.js                  # NEW: Text truncation helpers
│   └── __tests__/
│       ├── theme.test.js            # NEW
│       └── truncate.test.js         # NEW
├── App.jsx                          # EXISTING: Will add DarkModeToggle, theme context provider
├── index.css                        # EXISTING: May add Tailwind dark mode config
└── ...

public/
├── index.html                       # EXISTING: May update meta theme-color for dark mode
└── ...

jest.setup.js                        # EXISTING: May update for prefers-color-scheme mock
.eslintrc.cjs                        # EXISTING: No changes needed
tailwind.config.js                   # EXISTING: May enable dark mode mode: 'class'
```

**Structure Decision**: Single React project with new components in `components/`, new hook in `hooks/`, utilities in `utils/`. All follow existing project conventions. Tests co-located with source (Jest __tests__ directories). No new backend changes needed for this feature.

## Complexity Tracking

> No constitution violations. This feature is straightforward UI enhancement using existing tech stack. No additional complexity justified.

| Item | Assessment |
|------|-----------|
| New dependencies | ❌ None required - use TailwindCSS + native CSS |
| Architecture changes | ❌ None - fits existing React component structure |
| Backend changes | ❌ None - all client-side feature |
| Database schema | ❌ N/A - no new data persisted beyond localStorage |
| Performance impact | ✅ Neutral - modal is lazy, dark mode toggle is instant |

---

## Phase 0: Research (SKIPPED)

**Status**: ✅ All clarifications completed in specification phase.

**Clarifications Integrated**:
- ✅ Mobile interaction: Single tap on badge
- ✅ Modal type: Bottom sheet (60-70% viewport)
- ✅ Dark mode source: Manual toggle + system preference fallback
- ✅ Long names: Truncate with ellipsis + tooltip
- ✅ Modal presentation: Bottom sheet with swipe/tap/button dismiss

**No remaining research needed.** Proceed to Phase 1: Design & Contracts.

---

## Phase 1: Design & Contracts

### 1.1 Data Model (Entity Definitions)

**Output File**: `data-model.md` (to be created by design phase)

**Entities extracted from specification**:

1. **ThemePreference** (state entity)
   - `mode: 'light' | 'dark'`
   - `source: 'manual' | 'system'`
   - Persisted to localStorage under key `theme_mode`
   - On first load: check localStorage; if empty, read `prefers-color-scheme`

2. **AvailabilityModalState** (transient state)
   - `isOpen: boolean`
   - `selectedDate: Date | null`
   - `availablePersonas: Array<{name, color}>`
   - Lives in component state (not persisted)

3. **PersonaDisplay** (UI model)
   - `name: string` (max 50 chars, truncated to ~25 with ellipsis in compact mode)
   - `color: string` (hex format #RRGGBB)
   - `displayName: string` (truncated name if > max length)
   - `fullName: string` (original, shown on tooltip/long-press)

**Validation Rules**:
- Theme mode must be 'light' or 'dark'
- System preference queried via `window.matchMedia('(prefers-color-scheme: dark)')`
- Color must be valid hex and distinguishable in both light and dark modes
- Persona names truncated at display time; stored name unchanged

### 1.2 Component Contracts

**Output File**: `contracts/components.md` (to be created)

**AvailabilityModal Component**:
```javascript
// Props
{
  isOpen: boolean,                 // Modal visibility
  date: Date,                      // Selected date for availability
  personas: Array<{name, color}>,  // All available personas for date
  onClose: () => void,             // Called when modal should close
  isDarkMode: boolean              // Current theme (passed from parent)
}

// Behavior
- Desktop (hover: hover media query): Renders as tooltip/popover near trigger
- Mobile (no hover support): Renders as bottom sheet sliding up 60-70% viewport
- Dismiss interactions: Outside tap, swipe down (mobile), Escape key, close button
- Portal rendering: Mounts to document.body to avoid z-index stacking
- Accessibility: aria-modal, aria-label, focus management
```

**DarkModeToggle Component**:
```javascript
// Props
{
  isDarkMode: boolean,            // Current theme state
  onChange: (isDarkMode: boolean) => void  // Called on toggle
}

// Rendering
- Button with icon (☀️ sun for light, 🌙 moon for dark)
- Accessible: aria-label="Toggle dark mode", aria-pressed
- Touch target: minimum 44x44px
- Placement: Header/top-right area
```

**AvailabilityBadge Component** (Updated):
```javascript
// Existing Props (unchanged)
{
  entries: Array<{name, color, date}>,  // All personas with availability
  onRemove: (name, color) => void      // Remove single persona
}

// New Props
{
  onShowAll: (entries) => void         // Called when user requests full list
}

// Behavior Changes
- Display: Show max 2 personas inline
- Long names: Truncate with ellipsis if > 10 chars
- Interaction: Tap/hover on badge triggers onShowAll callback
- Modal: Rendered by parent component (App.jsx), not by badge
```

### 1.3 Hook Contracts

**Output File**: `contracts/hooks.md` (to be created)

**useDarkMode Hook**:
```javascript
// Returns
{
  isDarkMode: boolean,              // Current theme state (true = dark mode)
  toggleDarkMode: () => void,       // Toggle and persist to localStorage
  preferredMode: 'light' | 'dark'   // System preference (read-only)
}

// Initialization Logic
1. On mount: Check localStorage key `theme_mode`
2. If exists: Use stored value (manual preference takes precedence)
3. If missing: Read system preference via window.matchMedia('(prefers-color-scheme: dark)')
4. Update document.documentElement.classList for TailwindCSS dark: class activation

// Side Effects
- Writes to localStorage on toggleDarkMode
- Updates DOM class list immediately (no re-render delay)
- Listens to system preference changes (optional: can live-update if manual preference not set)
```

**useMediaQuery Hook** (supporting):
```javascript
// Returns: true if media query matches, false otherwise
const isMobile = useMediaQuery('(max-width: 767px)')

// Used for responsive component logic
```

**useClickOutside Hook** (supporting):
```javascript
// Detaches handler when element is clicked outside
useClickOutside(ref, onClickOutside)
```

### 1.4 Quickstart Validation Guide

**Output File**: `quickstart.md` (to be created)

**Scenario 1: View Complete Availability List**
```
Given: 3+ personas marked available on a date
Desktop test: Hover over availability badge → tooltip appears near badge showing all personas
Mobile test: Tap availability badge → bottom sheet slides up showing all personas + close button
Expected: All persona names and colors visible, no truncation, no "+1 more" text
Validation: Open DevTools, inspect badge element, verify onShowAll callback fires on interaction
```

**Scenario 2: Dark Mode Toggle and Persistence**
```
Given: Fresh browser session (clear localStorage and cache)
Test 1: Load app → dark mode auto-enabled if system prefers-color-scheme: dark
Test 2: Click dark mode toggle → entire UI switches themes instantly (no page reload)
Test 3: Inspect localStorage key `theme_mode` → should contain 'light' or 'dark'
Test 4: Close and reopen browser → same theme preference restored
Expected: Smooth transitions, all colors distinguishable, WCAG AA contrast maintained
Validation: Colors pass contrast checker tools, all text readable in both modes
```

**Scenario 3: Mobile Responsiveness**
```
Given: Mobile viewport < 768px (portrait and landscape)
Test 1: Portrait orientation → calendar visible without horizontal scrolling
Test 2: Landscape orientation → calendar visible without horizontal scrolling
Test 3: Long persona name (40 chars) → truncated to "Alexander Hamilton..." in badge
Test 4: Long name long-press (mobile) → full name shows in tooltip
Test 5: All interactive elements → 44x44px touch targets measured
Expected: No layout breaks, text readable at all sizes, touch targets comfortable
Validation: Measure elements in DevTools, test on real mobile devices if possible
```

**Scenario 4: Modal Dismiss Gestures (Mobile)**
```
Given: Bottom sheet modal open on mobile
Test 1: Swipe down on modal → modal closes smoothly
Test 2: Tap outside modal area → modal closes
Test 3: Tap close button (X) → modal closes
Test 4: Press Escape key → modal closes
Expected: All gestures respond within 300ms, smooth animation (60 fps)
Validation: No janky animations, modal fully hidden after dismiss, focus returns to badge
```

---

## Phase 2: Tasks Generation

**Status**: Ready for `/speckit.tasks` command

Once this plan is approved, run `/speckit.tasks` to generate `tasks.md` with:
- 30-40 actionable, dependency-ordered implementation tasks
- Task breakdown by component/hook/utility
- Responsive design implementation (breakpoints, media queries)
- Test task generation (unit + integration + responsive)
- Build/lint/test validation tasks
- Documentation/commit message tasks

---

## Constitution Check (Post-Design)

**✅ PASS - Post-Design Gate**

All 5 principles remain satisfied:
- **Code Quality**: Components use React hooks, clear naming (e.g., `useDarkMode`, `AvailabilityModal`), small focused logic, no complex abstractions
- **Test Standards**: 20-30 test cases targeting unit (hook logic, truncation), integration (modal flow, dark mode persistence), and UX (responsive layout)
- **UX Consistency**: Mobile-native patterns (bottom sheet), TailwindCSS theme consistency, persona colors preserved in both themes
- **Performance**: Lazy rendering with React.memo, CSS-based dark mode (instant), no layout shifts, bottom sheet uses CSS transforms (GPU-accelerated)
- **Simplicity**: Leverages existing tech stack (React, TailwindCSS, localStorage), no new dependencies, straightforward component composition

**Design is approved to proceed to Phase 2: Task Generation.**

---

## Related Documents

- **Specification**: [spec.md](./spec.md) - Feature requirements and acceptance criteria
- **Data Model**: [data-model.md](./data-model.md) - Entity definitions and validation (to be created in Phase 1)
- **Component Contracts**: [contracts/components.md](./contracts/components.md) - React component interfaces (to be created in Phase 1)
- **Hook Contracts**: [contracts/hooks.md](./contracts/hooks.md) - Custom hook contracts (to be created in Phase 1)
- **Quickstart**: [quickstart.md](./quickstart.md) - Validation scenarios (to be created in Phase 1)
- **Tasks**: [tasks.md](./tasks.md) - Actionable implementation tasks (to be created by `/speckit.tasks`)
