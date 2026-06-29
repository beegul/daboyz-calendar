# Data Model: Premium Motion & Interaction Design

**Date**: 2026-06-29 | **Feature**: specs/006-premium-motion-ux

## Overview

This feature operates entirely on the frontend presentation layer. No new entities, database tables, or API contracts are required. Existing entities (Users, Availability) continue unchanged. Motion & design layer is purely UI/UX enhancements using existing data structures.

---

## Existing Entities (Unchanged)

### Users Table
**Purpose**: Persist personas (user's availability representations)

```
Users
├── PartitionKey: "user"
├── RowKey: {persona_name_normalized}  // e.g., "alice_freelancer"
├── name: string                        // "Alice Freelancer"
├── color: string (hex)                 // "#2563eb" (primary blue)
├── created_at: ISO8601
└── updated_at: ISO8601
```

**Motion Implications**:
- Delete persona → Row animates out with fade + slide left
- Create persona → Row fades in with staggered entrance
- Select persona → Highlight animates to new row (scale 1.02x momentarily)

### Availability Table
**Purpose**: Store calendar availability entries (persona + date + color state)

```
Availability
├── PartitionKey: "calendar-{YYYY-MM}"  // e.g., "calendar-2026-06"
├── RowKey: "{name}~{color_stripped}~{date}"  // e.g., "alice_freelancer~2563eb~2026-06-15"
├── date: YYYY-MM-DD
├── persona_name: string
├── color_stripped: string (hex without #)
├── updated_at: ISO8601
└── _ts: timestamp (internal)
```

**Motion Implications**:
- Toggle availability → Cell animates color fill (200ms)
- Delete persona → All rows with that persona cascade delete, remaining cells animate down (FLIP)
- Network sync → Cell shows loading shimmer during backend confirmation

---

## UI State Entities (Frontend Only)

These are managed by React components/hooks, not persisted to backend.

### Motion Configuration
**Purpose**: Centralized animation parameter definitions (durations, easing, delays)

```
MotionConfig = {
  durations: {
    'fast': 100,        // ms - quick micro-interactions
    'base': 200,        // ms - button feedback
    'slow': 300,        // ms - page transitions
  },
  easing: {
    'out': 'cubic-bezier(0.16, 1, 0.3, 1)',      // ease-out-quart
    'in': 'cubic-bezier(0.7, 0, 0.84, 0)',       // ease-in-quart
    'smooth': 'cubic-bezier(0.4, 0.0, 0.2, 1)',  // material ease
  },
  delays: {
    'stagger': 50,      // ms - stagger between elements
    'none': 0,
  },
}
```

**Validation**: Durations must be positive integers. Easing must be valid CSS cubic-bezier or keyword.

### Toast Notification
**Purpose**: Temporary feedback messages for user actions (success, error, info)

```
Toast = {
  id: uuid,
  type: enum('success' | 'error' | 'info'),
  message: string,
  duration: milliseconds,      // 3000-4000ms typical
  timestamp: ISO8601,
  // Derived:
  isVisible: boolean,           // Computed from timestamp + duration
  progress: percentage,         // Animation progress (0-100%)
}
```

**Validation**:
- message required and non-empty
- duration > 0
- type must be valid enum
- duration auto-expires after specified milliseconds
- Queue max 3 toasts visible at once (stack above each other)

**Lifecycle**:
- Created → Slides up from bottom (animate-slideUp 200ms)
- Visible → Auto-dismiss timer starts
- Dismissing → Slides down (animate-slideDown 200ms) then removed from DOM
- Error on click → Remains until dismissed or timeout

### Component State (Animation-Driven)

#### Modal State
```
Modal = {
  isOpen: boolean,
  isClosing: boolean,  // Intermediate state for exit animation
  // Derived animation state:
  scale: 0 → 1.0,
  opacity: 0 → 1.0,
  backdropOpacity: 0 → 0.5,
}
```

#### Button State
```
Button = {
  state: enum('idle' | 'hover' | 'active' | 'loading' | 'disabled'),
  // Derived animation state:
  scale: 1.0 | 1.02x (hover) | 0.98x (press)
  shadowDepth: 0 (idle) | 4px (hover) | 2px (active)
  opacity: 1.0 | 0.5 (disabled)
}
```

#### Calendar Cell State
```
CalendarCell = {
  isHovered: boolean,
  isActive: boolean,
  isLoading: boolean,  // Optimistic update pending
  value: hex_color | null,
  // Derived animation state:
  backgroundColor: transparent → persona_color (fill 200ms)
  scale: 1.0 (idle) | 1.04x (hover)
  shimmer: none | pulsing_animation (if isLoading)
}
```

---

## Relationships & State Transitions

### Persona Selection → Calendar Update
```
User selects persona
  ↓ (highlight animates to selected row, scale 1.02x)
Persona selector updates
  ↓ (calendar re-renders with selected persona's availability)
Calendar displays cells for selected persona
  ↓
User clicks cell to toggle availability
  ↓ (cell fills with color instantly - optimistic)
Optimistic UI reflects new state
  ↓ (loading shimmer shows)
Backend confirms / rejects
  ↓ (shimmer fades, success toast OR cell reverts + error toast)
State settled (stable)
```

### Delete Persona Flow
```
User clicks delete button
  ↓ (delete confirmation modal animates in - fade + scale 300ms)
Confirmation modal shows (title, description, buttons stagger-animate 50ms delay)
  ↓
User confirms deletion
  ↓ (modal fades out 250ms)
Backend deletes persona + cascades availability entries
  ↓ (persona row animates out - fade + slide left 300ms)
Remaining persona rows animate down (FLIP layout morphing 400ms)
  ↓ (success toast "Persona deleted" slides up 200ms)
Calendar re-renders with remaining personas
```

### Network Failure (Optimistic Rollback)
```
User toggles cell availability
  ↓ (cell fills with color instantly)
Backend request sent
  ↓ (loading shimmer appears, no user-visible change)
Backend fails / timeout occurs
  ↓ (shimmer fades, cell reverts to previous color via smooth animation 200ms)
Error toast slides in from bottom
  ↓ ("Failed to update. Retrying..." message)
User can retry by clicking cell again
```

---

## Validation Rules

### Animations
- Duration: Must be > 0ms. Typical: 100-400ms. Violations: Infinite loops, zero-duration glitches, negative values (invalid CSS).
- Easing: Must be valid CSS cubic-bezier or keyword. Violations: Malformed easing syntax, non-visual values.
- GPU Acceleration: Only `transform` and `opacity` can be animated. Violations: Animating width/height/color directly (triggers layout recalculation).
- prefers-reduced-motion: When active, all durations override to 0ms. Violations: Animations visible despite user OS setting.

### Touch Targets
- All interactive elements must be ≥44×44px. Violations: Smaller buttons, cramped date cells, overlapping touch areas.
- No pointer-events override to bypass hit area. Violations: Fake hit areas, mousedown outside hit area.

### Toast Notifications
- Message required and non-empty. Violations: Null/undefined messages, whitespace-only messages.
- Duration > 0. Violations: Negative or zero duration.
- Auto-dismiss after duration. Violations: Sticky toasts that don't auto-dismiss.
- Announced to screen readers via aria-live="polite". Violations: Missing aria-live, aria-hidden, silent toasts.

---

## Performance Constraints

### Layout Recalculation (Reflow)
- **Goal**: Zero reflows during animations.
- **Enforcement**: Only `transform` and `opacity` properties animated. No `width`, `height`, `top`, `left`, `margin`, `padding`, `border` changes during motion.
- **FLIP Technique**: For layout changes (delete persona → remaining rows shift down), pre-calculate positions, animate via `transform` only, then update DOM after animation completes.

### GPU Memory
- **Goal**: Max 2-3 GPU-accelerated animations simultaneously.
- **Enforcement**: Limit `will-change: transform` to active elements. Remove `will-change` after animation completes.

### Frame Rate
- **Goal**: 60fps on desktop, 30fps on mobile.
- **Enforcement**: Measure with Chrome DevTools Performance tab. Profile animation bottlenecks (JavaScript, rendering, painting). If FPS drops, reduce animation complexity or duration.

### Bundle
- **Goal**: +40-60kB gzipped for motion layer (Framer Motion ~35kB, react-use-gesture ~6kB, hooks/utilities ~3-5kB).
- **Enforcement**: Monitor bundle size in CI. Alert if total JS > 300kB after build.

---

## Summary

**Key Data Model Insights**:
1. **No new backend entities required**: Motion layer is purely frontend presentation.
2. **Existing data (Users, Availability) unchanged**: No schema migrations, no API changes.
3. **Derived UI state**: Toast notifications, component state machines, motion configurations live in React state/context.
4. **State transitions are choreographed**: Animation timing, sequencing, and cascading effects defined per user flow.
5. **Constraints are strict**: GPU-only animations, 44px touch targets, prefers-reduced-motion compliance, bundle limits.

**Next Phase**: Define interface contracts (API, component props, hooks) and quickstart validation guide.
