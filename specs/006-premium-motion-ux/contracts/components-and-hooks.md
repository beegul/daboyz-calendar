# Component Contracts: Premium Motion UX

**Date**: 2026-06-29 | **Feature**: specs/006-premium-motion-ux

## Motion-Enabled Components

### `<MotionModal>`
**Purpose**: Animated modal dialog with staggered entrance/exit animations

**Props**:
```typescript
interface MotionModalProps {
  isOpen: boolean;                    // Trigger open/close animation
  onClose: () => void;                // Callback when modal closes (after exit animation)
  title: string;                      // Modal title (animated with stagger)
  children: ReactNode;                // Modal content (each child animates with 50ms stagger)
  closeOnBackdropClick?: boolean;     // Default: true
  size?: 'sm' | 'md' | 'lg';         // Default: 'md' (600px on desktop, 100vw mobile)
  variant?: 'danger' | 'default';     // Default: 'default'
  actions?: ReactNode;                // Footer action buttons (stagger-animated last)
}
```

**Animation Contract**:
```
Entry: Modal fades in + scales (0.9 → 1.0) over 300ms, easing: ease-out-quart
  - Title fades in + translates (y: 20px → 0) at delay: 0ms, duration: 200ms
  - Description fades in at delay: 50ms, duration: 200ms
  - Each action button fades in at delay: 100ms, 150ms, etc.
Exit: Reverse animation (fade out + scale 1.0 → 0.9) over 250ms
Backdrop: Fades in with opacity 0.5 over 300ms (in parallel with modal)
```

**Accessibility**:
- `role="dialog"` on modal wrapper
- `aria-labelledby` pointing to title
- `aria-modal="true"`
- When prefers-reduced-motion: durations → 0ms, scale animations → instant

**Touch Target**:
- Close button: ≥44×44px

### `<MotionButton>`
**Purpose**: Button with hover/press micro-interactions

**Props**:
```typescript
interface MotionButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';  // Default: 'primary'
  size?: 'sm' | 'md' | 'lg';                     // Default: 'md'
  isLoading?: boolean;                            // Shows spinner, disables interaction
  disabled?: boolean;                             // Disabled state
  className?: string;                             // Tailwind classes
}
```

**Animation Contract**:
```
Hover (desktop only):
  - Button scales 1.0 → 1.02x over 150ms, easing: ease-out-quart
  - Shadow deepens (0px → 4px) over 150ms
  - Text color may shift slightly (10% darker on hover)
Press (click feedback):
  - Button scales 1.02x → 0.98x over 100ms (immediate visual feedback)
  - Shade darkens by 15%
  - Return to hover state 1.02x over 150ms (spring-back feel)
Release (click complete):
  - All animations revert to idle state
  - onclick callback fires mid-scale-down (for instant feedback feel)
Loading:
  - Spinner icon rotates 360° every 1s (continuous)
  - Button disabled (pointer-events: none)
```

**Accessibility**:
- Touch target (all sizes): ≥44×44px
- When prefers-reduced-motion: scale animations disabled, only opacity transition (fade 100ms)
- aria-label for icon-only buttons

### `<Toast>`
**Purpose**: Temporary notification for success/error/info feedback

**Props**:
```typescript
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;              // Default: 4000ms (auto-dismiss)
  onDismiss: (id: string) => void;
}
```

**Animation Contract**:
```
Entry: Slides up from bottom + fades in over 200ms, easing: ease-out-quart
  - Initial state: opacity 0, transform: translateY(100px)
  - Final state: opacity 1, transform: translateY(0)
Exit: Slides down + fades out over 200ms
  - Dismissal triggered by: auto-timeout, click close button, or programmatic call
```

**Icon Mapping**:
- `success`: ✓ (green #10b981)
- `error`: ⚠️ (red #ef4444)
- `info`: ℹ️ (blue #2563eb)

**Accessibility**:
- `role="status"` for all toasts
- `aria-live="polite"` for non-interrupting announcements (success, info)
- `aria-live="assertive"` for error toasts (important)
- aria-label: "{type}: {message}"

**Queueing**:
- Max 3 toasts visible at once
- Stack vertically, bottom-right corner (on desktop), full-width (on mobile)
- Each toast takes up ~80px height with 8px gap

### `<CalendarCell>`
**Purpose**: Interactive calendar date cell with availability toggle animation

**Props**:
```typescript
interface CalendarCellProps {
  date: string;                    // YYYY-MM-DD
  personaName: string;
  personaColor: string | null;     // Hex color if available, null if empty
  isHovered: boolean;
  isLoading: boolean;              // During optimistic update
  onClick: () => void;
  onError?: (msg: string) => void;
}
```

**Animation Contract**:
```
Idle: Cell shows date number, transparent or light gray background
Hover (desktop): 
  - Background animates to subtle highlight color (#f9fafb) over 150ms
  - Border accent appears on left (width 2px, color: #2563eb) with slide-in 150ms
  - Scale slightly (1.02x) for tactile feedback
Click (toggle):
  - If becoming active: background fills with persona_color over 200ms (instant + animate opacity/color)
  - Loading shimmer appears (pulsing gradient overlay) 200-500ms
  - Scale pulse 1.04x for click feedback
  - After backend confirms: shimmer fades, cell settles
Click (error):
  - Cell reverts to previous color over 200ms (smooth animation)
  - Loading shimmer removed
Touch (mobile):
  - Active state: scale 1.02x, darkened shade (no hover pseudo-class)
  - Release: returns to idle
```

**Accessibility**:
- Touch target: 44×44px minimum (date cell always fills)
- When prefers-reduced-motion: no scale animations, only color transition
- aria-label: "{date}, {persona_name}, {availability_status}"
- aria-pressed={isActive} if toggleable

### `<PersonaRow>`
**Purpose**: Persona list item with delete animation

**Props**:
```typescript
interface PersonaRowProps {
  name: string;
  color: string;                   // Hex color
  isSelected: boolean;
  isDeleting: boolean;             // Delete animation in progress
  onClick: () => void;
  onDelete: () => void;
}
```

**Animation Contract**:
```
Idle: Row shows name + color indicator
Hover: 
  - Background animates to subtle highlight (#f9fafb) over 150ms
  - Left border accent appears (2px color) with slide-in
  - Delete button becomes visible/opacity 1 (if hidden initially)
Select (click):
  - Selected row gets blue left border (4px)
  - Highlight animates in over 150ms
  - Persona selector updates calendar display
Delete (isDeleting=true):
  - Row fades out (opacity 0) + slides left (translate -50px) over 300ms
  - Remaining rows slide down into new positions (FLIP technique) 300ms
  - Animation completes, row removed from DOM
```

**Touch Target**:
- Delete button: ≥44×44px

---

## Hook Contracts

### `useToast()`
**Purpose**: Dispatch toast notifications from anywhere in component tree

**Return**:
```typescript
interface ToastAPI {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}
```

**Usage**:
```javascript
const { success, error } = useToast();

// In event handler
success('Persona created!', 3000);
error('Failed to delete persona', 4000);
```

**Requirements**:
- Must be wrapped in `<ToastProvider>` context
- Queues toasts (max 3 visible)
- Auto-dismisses after duration
- Never throws; silently fails if context missing (dev warning only)

### `useOptimisticUpdate(entity, updateFn)`
**Purpose**: Manage optimistic state updates with rollback on error

**Parameters**:
```typescript
useOptimisticUpdate<T>(
  entity: T,                              // Initial value
  updateFn: (newValue: T) => Promise<void>  // Async update function (should throw on error)
)
```

**Return**:
```typescript
{
  value: T;                               // Current value (optimistic or actual)
  update: (newValue: T) => Promise<void>;  // Trigger optimistic update
  isLoading: boolean;                     // true during backend sync
}
```

**Behavior**:
```
1. Call update(newValue)
2. Immediately set value = newValue (optimistic render)
3. Dispatch updateFn(newValue) in background
4. On success: Keep optimistic value, show success toast
5. On error: Revert value to previous, show error toast
6. Caller can .catch() for additional error handling
```

**Usage**:
```javascript
const { value, update, isLoading } = useOptimisticUpdate(
  availability,
  async (newVal) => {
    const res = await fetch('/api/availability', { method: 'PUT', body: JSON.stringify(newVal) });
    if (!res.ok) throw new Error('Update failed');
  }
);

// In click handler
await update({ date, color: newColor });  // Optimistic, then confirms
```

**Requirements**:
- Must be wrapped in `<ToastProvider>` context
- updateFn must throw on error (for rollback detection)
- Returns Promise for async flow control

### `useGestureSwipe(onSwipeLeft, onSwipeRight)`
**Purpose**: Detect swipe gestures on touch-enabled calendar

**Parameters**:
```typescript
useGestureSwipe(
  onSwipeLeft: () => void,    // Called when user swipes left (velocity-based)
  onSwipeRight: () => void    // Called when user swipes right
)
```

**Return**:
```typescript
{
  ref: React.RefObject<HTMLElement>;      // Attach to swipe-target element
}
```

**Behavior**:
```
Swipe Detection (mobile/tablet):
- Minimum distance: 50px horizontal movement
- Ignore vertical movement (>30% of horizontal)
- Velocity-based: Velocity integrated into animation speed
  - Slow swipe (200px/s): Animate 300ms
  - Fast swipe (500px/s): Animate 150ms (velocity-capped)
- Swipes outside min distance ignored (no-op)
```

**Usage**:
```javascript
const { ref: calendarRef } = useGestureSwipe(
  () => goToNextMonth(),
  () => goToPreviousMonth()
);

<div ref={calendarRef} className="calendar">
  {/* Calendar grid */}
</div>
```

**Requirements**:
- Requires `react-use-gesture` + Framer Motion to be installed
- Only activates on touch devices (pointer or touch events)
- Velocity calculation automatic via react-use-gesture

### `usePrefersReducedMotion()`
**Purpose**: Detect user's prefers-reduced-motion OS setting

**Return**:
```typescript
boolean  // true if prefers-reduced-motion: reduce, false otherwise
```

**Behavior**:
```
1. On mount: Query window.matchMedia('(prefers-reduced-motion: reduce)')
2. Listen for changes (media query change event)
3. Re-render component if setting changes (user toggles in OS)
4. When true: All animations should have duration 0ms or be skipped
```

**Usage**:
```javascript
const prefersReduced = usePrefersReducedMotion();

<motion.div
  animate={{ opacity: 1 }}
  transition={prefersReduced ? { duration: 0 } : { duration: 300 }}
>
  Content
</motion.div>
```

**Requirements**:
- Must handle matchMedia not supported (old browsers) gracefully
- Default to false if unsupported
- Should not throw errors

### `useAnimationDuration(baseDuration)`
**Purpose**: Get animation duration respecting prefers-reduced-motion

**Parameters**:
```typescript
useAnimationDuration(baseDuration: number)  // e.g., 300 (milliseconds)
```

**Return**:
```typescript
number  // Duration to use for animation (0 if prefers reduced motion)
```

**Usage**:
```javascript
const duration = useAnimationDuration(300);  // Returns 300 or 0

<motion.div transition={{ duration }}>...</motion.div>
```

**Requirements**:
- Wrapper around usePrefersReducedMotion for cleaner component code

---

## Touch Target Specification

All interactive elements must comply with WCAG 2.5.5 Level AAA (44×44px minimum):

| Element | Min Size | CSS Classes | Notes |
|---------|----------|-------------|-------|
| Button (all variants) | 44×44px | `h-11 w-11` | Use padding, not reduced hit area |
| Calendar Date Cell | 44×44px | `h-11 w-11` | Must fill cell entirely |
| Delete Button | 44×44px | `h-11 w-11` | In persona row |
| Close Button (modal) | 44×44px | `h-11 w-11` | Top-right corner |
| Persona Selector | 44×44px | Dropdown trigger height | Mobile: full-width, Desktop: 200px wide |
| Checkbox/Toggle | 44×44px | `h-11 w-11` | If used |
| Link/Tap Target | 44×44px | Padding around text | Min height 44px |

**Verification**: 
- Automated: Axe accessibility audit (`axe-core`)
- Manual: Chrome DevTools "Inspect element" → check computed height/width
- Mobile: iOS Settings → Accessibility → Larger Accessibility Sizes or Android equivalent

---

## Summary

**Component & Hook Contracts define the visible contract (props, animations, accessibility) without prescribing implementation details (Framer Motion, Tailwind utilities, CSS-in-JS).**

**Key Principles**:
1. **Animation timing must be consistent**: All durations use design tokens (100ms, 200ms, 300ms)
2. **Accessibility first**: prefers-reduced-motion respected, aria-* attributes required, touch targets ≥44px
3. **Props are stable**: Component props don't change based on animation library choices
4. **Hooks decouple concerns**: useOptimisticUpdate, useGestureSwipe, usePrefersReducedMotion are reusable across components
5. **Error handling is explicit**: Toast API for notifications, hook Promises for async control flow

**Next**: Quickstart validation guide defines how to test these contracts.
