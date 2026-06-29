# Quickstart & Validation Guide: Premium Motion UX

**Date**: 2026-06-29 | **Feature**: specs/006-premium-motion-ux | **Reference**: [spec.md](spec.md) | [data-model.md](data-model.md) | [contracts/components-and-hooks.md](contracts/components-and-hooks.md)

## Pre-Requisites

### Environment Setup
1. Node.js 18+ (LTS) installed
2. Workspace at `daboyz-calender` checked out
3. Dependencies installed: `npm install`
4. Dev server running: `npm run dev` (Vite serves on http://localhost:5173)
5. Tailwind CSS configured with animation extensions ([see plan.md](plan.md) for config)
6. Framer Motion installed: `npm install framer-motion react-use-gesture`
7. Toast provider and motion hooks implemented per [contracts](contracts/components-and-hooks.md)

### Browser Requirements
- Chrome/Edge (latest): Full support
- Safari (15+): Full support
- Firefox (latest): Full support
- Mobile: iOS Safari (14+), Chrome Mobile (latest)

### Testing Tools
- Chrome DevTools Performance tab (measure 60fps)
- Axe DevTools browser extension (accessibility audit)
- Wave (WebAIM) browser extension (WCAG compliance)
- React DevTools profiler (React component re-render metrics)

---

## Validation Scenarios

### Scenario 1: Page Transitions (Modal Entrance/Exit Animation)

**Goal**: Verify that modal animations are smooth, follow design timing, and respect accessibility settings.

**Setup**:
```bash
npm run dev
# Open http://localhost:5173 in Chrome
# Open DevTools (F12) → Performance tab
```

**Test Steps**:
1. **Modal Open Animation**:
   - Click "Create Persona" button
   - VERIFY: Modal fades in with scale animation (0.9 → 1.0) over 300ms
   - VERIFY: Title fades in + translates from y:20px
   - VERIFY: Form inputs stagger-animate with ~50ms delay between each
   - VERIFY: All elements complete within 300ms
   - START DevTools recording → Run this step again → STOP recording
   - CHECK Performance profile: No jank (red bars), frame rate stable at 60fps

2. **Modal Close Animation**:
   - Click "Cancel" button
   - VERIFY: Modal fades out + scales down (1.0 → 0.9) over 250ms
   - VERIFY: Backdrop fades out in parallel
   - VERIFY: Focus returns to "Create Persona" button

3. **Accessibility: prefers-reduced-motion**:
   - Open Chrome DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion`
   - Select `prefers-reduced-motion: reduce`
   - Click "Create Persona" button again
   - VERIFY: Modal appears instantly (no animation, but visible)
   - VERIFY: All elements appear at same time (no stagger)
   - VERIFY: No motion, only instant state change
   - DISABLE `prefers-reduced-motion` emulation
   - Reload page

4. **Touch Target Verification**:
   - Inspect close button (X) with DevTools
   - VERIFY: Height ≥ 44px, Width ≥ 44px (check computed style)
   - Click close button → Modal closes

**Expected Outcome**:
- ✅ Modal opens smoothly 300ms with stagger animation
- ✅ Modal closes smoothly 250ms
- ✅ When prefers-reduced-motion: animations disabled
- ✅ All 60fps, no jank
- ✅ Close button is 44×44px touch target
- ✅ Focus management correct (focus returns to trigger button on close)

**Failure Criteria**:
- ❌ Animation takes >400ms or shows jank (dropped frames)
- ❌ prefers-reduced-motion not respected (animations still play)
- ❌ Close button <44px
- ❌ Focus not managed

---

### Scenario 2: Button Micro-Interactions (Hover/Press Feedback)

**Goal**: Verify button animations provide tactile feedback and meet performance targets.

**Setup**:
```bash
# Continue from Scenario 1
# Modal should be open with "Create" and "Cancel" buttons visible
```

**Test Steps**:
1. **Hover Animation (Desktop)**:
   - Move mouse to "Create" button (don't click)
   - VERIFY: Button scales to 1.02x smoothly over 150ms
   - VERIFY: Shadow deepens (0px → 4px) over 150ms
   - VERIFY: Text color may darken slightly
   - Remove mouse from button
   - VERIFY: Button returns to normal 1.0x scale over 150ms (spring-back feel)

2. **Press Animation (Click Feedback)**:
   - Click "Create" button
   - VERIFY: Button scales to 0.98x immediately (<50ms response time)
   - VERIFY: Visual feedback occurs before form submission
   - VERIFY: Button shade darkens 15%
   - VERIFY: Button returns to 1.02x (hover) over 150ms
   - START DevTools recording → Repeat hover/press cycle 5x → STOP
   - VERIFY: Performance profile shows 60fps, no jank

3. **Accessibility: No Hover on Touch**:
   - Open DevTools → Toggle device toolbar (mobile emulation)
   - Select iPhone 12 (375px width)
   - Long-press "Create" button
   - VERIFY: Button does NOT show :hover state (hover not applicable to touch)
   - VERIFY: Button shows :active state (press feedback) on touch-down
   - Tap button
   - VERIFY: Press feedback (scale 0.98x) shows, then returns to normal (NOT hover state)

4. **Disabled State**:
   - Form has required field empty (mock scenario)
   - VERIFY: "Create" button appears disabled (opacity 0.5, pointer-events: none)
   - VERIFY: No hover/press animations on disabled button
   - Fill form field
   - VERIFY: Button becomes enabled, animations work again

**Expected Outcome**:
- ✅ Hover animation scales 1.02x smoothly (150ms)
- ✅ Press animation provides <50ms feedback
- ✅ 60fps performance, no jank
- ✅ Touch devices don't show hover state
- ✅ Disabled state disables animations
- ✅ Button shadow deepens on hover

**Failure Criteria**:
- ❌ Hover animation >200ms or choppy
- ❌ Press feedback delayed >50ms
- ❌ Performance drops below 60fps
- ❌ Touch devices show :hover persistent state
- ❌ Animation on disabled button

---

### Scenario 3: Optimistic UI & Error Rollback

**Goal**: Verify optimistic UI updates instantly, backend sync happens invisibly, and errors rollback gracefully.

**Setup**:
```bash
# Close modal, return to main calendar view
# Select a persona from the list
# Calendar shows dates for that persona (some filled, some empty)
```

**Test Steps**:
1. **Optimistic Availability Toggle**:
   - Click an empty date cell
   - VERIFY: Cell background animates to persona color immediately (<16ms)
   - VERIFY: Loading shimmer appears (pulsing gradient) over the cell
   - VERIFY: No network request visible in DevTools yet (async in background)
   - WAIT 300ms
   - VERIFY: Backend confirms in DevTools Network tab (/api/availability PUT)
   - VERIFY: Shimmer fades (200ms animation), cell settles to final color
   - VERIFY: Success toast slides up from bottom with checkmark icon
   - VERIFY: Success toast auto-dismisses after 4s

2. **Error: Network Failure Rollback**:
   - Open DevTools → Network tab
   - Throttle to "Offline" mode
   - Click another empty date cell
   - VERIFY: Cell fills with color immediately (optimistic, unaware of offline)
   - VERIFY: Loading shimmer appears
   - WAIT 3s (default sync timeout)
   - VERIFY: Backend request fails (Network tab shows error or timeout)
   - VERIFY: Cell reverts to previous color smoothly over 200ms (rollback animation)
   - VERIFY: Shimmer fades
   - VERIFY: Error toast slides in with warning icon: "Failed to update"
   - VERIFY: Error toast auto-dismisses after 4s
   - Set DevTools Network back to "No throttling"

3. **Error: Backend Rejects (400/500)**:
   - (Mock scenario: Server configured to reject toggle for specific date)
   - Click the "rejected" date cell
   - VERIFY: Cell fills with color (optimistic)
   - VERIFY: Shimmer appears
   - VERIFY: Backend request fails (DevTools shows 400 or 500)
   - VERIFY: Cell reverts to previous color (same rollback as offline)
   - VERIFY: Error toast shows: "Failed to update availability"

4. **Touch Target on Calendar Cell**:
   - Inspect date cell element in DevTools
   - VERIFY: All cells are ≥44×44px
   - Use mobile emulation, tap multiple cells
   - VERIFY: All taps register (no mis-taps due to small target)

**Expected Outcome**:
- ✅ Optimistic update within 16ms (1 frame)
- ✅ Loading shimmer visible during sync
- ✅ Backend confirms in <300ms (typical), sync completes
- ✅ Success toast shows and auto-dismisses
- ✅ Error causes smooth rollback (200ms) + error toast
- ✅ Calendar cells are 44×44px minimum
- ✅ All animations smooth, 60fps

**Failure Criteria**:
- ❌ Optimistic update delayed >50ms
- ❌ No feedback during backend sync (invisible loading)
- ❌ Error toast doesn't show or show wrong message
- ❌ Rollback animation jerky or takes >300ms
- ❌ Calendar cells <44px
- ❌ Toast doesn't auto-dismiss

---

### Scenario 4: Delete Persona with Cascading Animation

**Goal**: Verify delete confirmation modal, persona row exit animation, and FLIP layout transition for remaining rows.

**Setup**:
```bash
# Return to main view
# Click on a persona in the list (select it)
# Multiple personas should be visible in the list
```

**Test Steps**:
1. **Delete Confirmation Modal**:
   - Click delete button (trash icon) on one of the personas
   - VERIFY: Delete confirmation modal animates in (fade + scale 300ms)
   - VERIFY: Title, description, buttons stagger-animate (50ms delay)
   - VERIFY: "Are you sure?" message is clear

2. **Delete Persona Animation**:
   - Click "Confirm Delete" in modal
   - VERIFY: Modal fades out + scales down (250ms)
   - VERIFY: Persona row fades out + slides left (300ms)
   - VERIFY: Remaining persona rows slide down into new positions using FLIP technique (400ms)
   - VERIFY: All animations complete, row removed from DOM
   - VERIFY: Success toast "Persona deleted" slides up

3. **Layout Stability (FLIP)**:
   - START DevTools Performance recording → Delete persona → STOP
   - CHECK Performance profile for layout recalculations:
     - VERIFY: Only transform animations (translateY, translateX)
     - VERIFY: No width/height/margin/padding changes during animation
     - VERIFY: Layout recalculated once AFTER animation completes (for next render)
     - VERIFY: No jank, 60fps maintained

4. **Accessibility: Keyboard Navigation**:
   - Press Tab to focus delete button
   - VERIFY: Button has visible focus ring
   - Press Enter to activate
   - VERIFY: Modal opens with focus on "Cancel" button
   - VERIFY: Tab cycles through buttons
   - VERIFY: Escape key closes modal (and reverts animation)
   - VERIFY: Focus returns to delete button

**Expected Outcome**:
- ✅ Delete confirmation modal animates with staggered entrance
- ✅ Persona row exits with fade + slide (300ms)
- ✅ Remaining rows morph positions using FLIP (400ms)
- ✅ No layout jank, 60fps performance
- ✅ Success toast confirms deletion
- ✅ Keyboard navigation works, focus managed

**Failure Criteria**:
- ❌ Modal animation >400ms or choppy
- ❌ Delete row animation doesn't slide or takes >300ms
- ❌ Remaining rows jank or show layout thrashing
- ❌ Keyboard navigation broken or focus lost
- ❌ Performance drops, dropped frames visible

---

### Scenario 5: Mobile Swipe Gesture & Responsive Layout

**Goal**: Verify swipe gestures work on mobile, layout adapts responsive, and touch targets remain 44×44px.

**Setup**:
```bash
# Open DevTools → Toggle device toolbar
# Select iPhone 12 (375px) or iPad (1024px)
# Reload page
# Calendar should be visible in mobile layout
```

**Test Steps**:
1. **Swipe Left (Next Month)**:
   - Place finger on calendar grid
   - Swipe left (drag ~100px left over 400ms)
   - VERIFY: Calendar animates to next month from right-to-left (400ms, FLIP)
   - VERIFY: Previous month slides out left, new month slides in from right
   - VERIFY: Animation smooth, velocity-based (faster swipe = faster animation, but capped)
   - Check date cells are correctly showing new month

2. **Swipe Right (Previous Month)**:
   - Swipe right (drag ~100px right)
   - VERIFY: Calendar animates to previous month
   - VERIFY: Previous month fades back into view

3. **Slow Swipe (Short Distance, Edge Case)**:
   - Swipe left only 20px (below 50px threshold)
   - VERIFY: Calendar does NOT change month (no-op)
   - VERIFY: No animation triggered
   - VERIFY: Calendar stays on current month

4. **Portrait ↔ Landscape Rotation**:
   - In DevTools device emulation, rotate device (Ctrl+Shift+M or via device selector)
   - VERIFY: Layout reflows smoothly (300ms)
   - VERIFY: Calendar grid columns expand/contract
   - VERIFY: No jank, all elements reposition correctly
   - VERIFY: Touch targets remain ≥44×44px in both orientations

5. **Touch Target Sizes (Mobile)**:
   - Tap date cells, buttons, persona selector
   - VERIFY: All easily tappable (no small targets)
   - Inspect elements in DevTools
   - VERIFY: All ≥44×44px (computed style)

6. **Modal on Mobile (Fullscreen)**:
   - Click "Create Persona"
   - VERIFY: Modal is fullscreen width (100vw with 16px margins, not 600px centered)
   - VERIFY: Modal has rounded top corners (iOS-style)
   - VERIFY: Animates up from bottom (not fade + scale)

**Expected Outcome**:
- ✅ Swipe left/right triggers month navigation (velocity-based)
- ✅ Calendar morphs smoothly with FLIP (400ms)
- ✅ Slow swipes ignored (< 50px threshold)
- ✅ Device rotation adapts layout smoothly (300ms)
- ✅ All touch targets ≥44×44px
- ✅ Modal is fullscreen on mobile
- ✅ 60fps maintained, no jank

**Failure Criteria**:
- ❌ Swipe gestures not detected or inconsistent
- ❌ Calendar animation > 400ms or choppy
- ❌ Rotation causes jank or misalignment
- ❌ Touch targets <44px on mobile
- ❌ Modal not fullscreen on mobile
- ❌ Performance drops

---

### Scenario 6: Accessibility Audit (WCAG 2.1 AA / AAA)

**Goal**: Verify app meets WCAG 2.1 AA compliance and AAA standards for animations and touch targets.

**Setup**:
```bash
# Install Axe DevTools browser extension (if not already installed)
# npm run dev & open http://localhost:5173
```

**Test Steps**:
1. **Axe Accessibility Audit**:
   - Open DevTools → Axe DevTools
   - Click "Scan ALL of my page"
   - VERIFY: No violations (red issues)
   - VERIFY: No "Needs review" items (orange) related to motion/animations
   - Check violations list for any animation-related issues
   - Record results

2. **Color Contrast Check**:
   - Use Wave extension or Chrome DevTools Styles tab
   - Check text contrast on all UI elements:
     - Button text: Should be ≥4.5:1 (AA) or ≥7:1 (AAA)
     - Form labels: Should be ≥4.5:1
     - Toast notification text: Should be ≥4.5:1
   - VERIFY: No low-contrast text

3. **Screen Reader Testing (iOS/macOS VoiceOver)**:
   - Enable VoiceOver (Mac: Cmd+F5, iOS: Settings → Accessibility → VoiceOver)
   - Navigate app with VoiceOver
   - VERIFY: Button labels are announced (aria-label or visible text)
   - VERIFY: Modal is announced as dialog
   - VERIFY: Toast notifications are announced (aria-live="polite" or aria-live="assertive")
   - VERIFY: Form labels associated with inputs
   - VERIFY: Deleted elements are not announced (aria-hidden on transient elements)

4. **Keyboard Navigation**:
   - Tab through all interactive elements
   - VERIFY: Focus ring visible on all buttons, links, inputs
   - VERIFY: Focus ring is ≥3px and high contrast (WCAG AAA)
   - VERIFY: Tab order is logical (left-to-right, top-to-bottom)
   - VERIFY: No focus traps (ability to tab out of modal with Escape)

5. **ARIA Attributes**:
   - Inspect modal with DevTools
   - VERIFY: `role="dialog"` present
   - VERIFY: `aria-labelledby` points to title
   - VERIFY: `aria-modal="true"`
   - VERIFY: Buttons have aria-label or visible text
   - VERIFY: Toast has `role="status"` + `aria-live`

6. **Touch Target Size Verification (Automated)**:
   - In DevTools Console, run:
   ```javascript
   // Find all interactive elements
   const interactives = document.querySelectorAll('button, a, [role="button"], input, [role="checkbox"], [role="switch"]');
   interactives.forEach(el => {
     const rect = el.getBoundingClientRect();
     if (rect.width < 44 || rect.height < 44) {
       console.warn(`Small target (${rect.width}x${rect.height}):`, el);
     }
   });
   ```
   - VERIFY: No warnings in console (all ≥44×44px)

**Expected Outcome**:
- ✅ Axe DevTools: No violations
- ✅ Text contrast ≥4.5:1 (AA)
- ✅ Screen reader announces all content
- ✅ Keyboard navigation works end-to-end
- ✅ ARIA attributes correct on modals, buttons, toasts
- ✅ All touch targets ≥44×44px

**Failure Criteria**:
- ❌ Axe violations or "Needs review" items for motion
- ❌ Low contrast text (<4.5:1)
- ❌ Screen reader doesn't announce interactive elements
- ❌ Keyboard traps or broken navigation
- ❌ Missing ARIA labels
- ❌ Touch targets <44px

---

### Scenario 7: Performance & Bundle Size Validation

**Goal**: Verify animations run at 60fps, bundle stays within budget, and no layout thrashing occurs.

**Setup**:
```bash
npm run build
# Check bundle size output
npm run dev
```

**Test Steps**:
1. **Bundle Size Check**:
   - Run `npm run build`
   - VERIFY: Output shows bundle size (should be ≤300kB total JS)
   - VERIFY: Motion layer additions (<50kB gzipped):
     - Framer Motion: ~35kB
     - react-use-gesture: ~6kB
     - Tailwind motion utilities: ~1kB
   - Record bundle breakdown

2. **Chrome DevTools Performance Profiling**:
   - Open DevTools → Performance tab
   - Record during:
     - Modal open animation (300ms)
     - Button hover → press → release cycle
     - Calendar month navigation with swipe
     - Delete persona with FLIP layout transition
   - For each recording:
     - VERIFY: Frame rate 60fps (16.67ms per frame)
     - VERIFY: No red "Frame rate" bars (dropped frames)
     - VERIFY: Layout (yellow) brief, not continuous
     - VERIFY: Painting (purple) minimal
     - VERIFY: Scripting (blue) short bursts, not blocking

3. **React Profiler (Optional but Recommended)**:
   - Open DevTools → Profiler tab
   - Record component re-renders during:
     - Modal open/close
     - Optimistic UI update
     - Delete persona
   - VERIFY: Components re-render only when needed
   - VERIFY: No excessive re-renders during animation
   - Check render times: Should be <16.67ms (one frame)

4. **Lighthouse Audit**:
   - Open DevTools → Lighthouse
   - Run "Performance" audit
   - VERIFY: Performance score ≥90
   - VERIFY: First Contentful Paint (FCP) <2s
   - VERIFY: Cumulative Layout Shift (CLS) <0.1 (no jank)
   - VERIFY: Time to Interactive (TTI) <3.5s

5. **CPU Throttling (Slow Device Simulation)**:
   - DevTools → Performance → Settings (gear) → CPU throttling "6x slowdown"
   - Record animations with throttling applied
   - VERIFY: Animations still smooth (may target 30fps instead of 60fps)
   - VERIFY: No jank or layout thrashing even on slow CPU
   - Remove throttling

**Expected Outcome**:
- ✅ Total JS bundle ≤300kB (including motion layer)
- ✅ Motion dependencies add ~40-50kB gzipped
- ✅ Performance profile shows 60fps, no dropped frames
- ✅ Lighthouse Performance score ≥90
- ✅ CLS <0.1 (no unexpected layout shifts)
- ✅ React component re-renders minimal
- ✅ Even with 6x CPU throttling, animations remain smooth

**Failure Criteria**:
- ❌ Bundle size >300kB total
- ❌ Motion layer >60kB gzipped
- ❌ Performance profile shows dropped frames or <55fps average
- ❌ Lighthouse score <85
- ❌ CLS >0.15 (layout shifts)
- ❌ Excessive React re-renders

---

## Test Checklist

Use this checklist to validate all scenarios before marking feature complete:

```
Scenario 1: Page Transitions (Modal)
  ☐ Modal opens with fade + scale 300ms
  ☐ Stagger animation on title/form (50ms delay)
  ☐ Modal closes smoothly 250ms
  ☐ prefers-reduced-motion: animations disabled
  ☐ 60fps performance, no jank
  ☐ Close button ≥44×44px
  ☐ Focus management correct

Scenario 2: Button Micro-Interactions
  ☐ Hover scales 1.02x smoothly (150ms)
  ☐ Press feedback <50ms response
  ☐ Shadow deepens on hover
  ☐ Spring-back animation on release
  ☐ Touch devices: no :hover, :active works
  ☐ Disabled state disables animations
  ☐ 60fps maintained

Scenario 3: Optimistic UI & Error Rollback
  ☐ Calendar cell updates instantly (<16ms)
  ☐ Loading shimmer visible during sync
  ☐ Success toast shows and auto-dismisses
  ☐ Error causes smooth rollback (200ms)
  ☐ Error toast shows and auto-dismisses
  ☐ Cells ≥44×44px
  ☐ 60fps throughout

Scenario 4: Delete Persona
  ☐ Delete confirmation modal animates in
  ☐ Title/buttons stagger (50ms)
  ☐ Persona row fades out + slides left
  ☐ Remaining rows FLIP down smoothly
  ☐ No layout jank or recalculation during animation
  ☐ Success toast confirms
  ☐ Keyboard navigation and focus management

Scenario 5: Mobile Swipe & Responsive
  ☐ Swipe left/right triggers month navigation
  ☐ Calendar morphs with FLIP (400ms)
  ☐ Slow swipes (<50px) ignored
  ☐ Device rotation adapts smoothly (300ms)
  ☐ All touch targets ≥44×44px
  ☐ Modal fullscreen on mobile
  ☐ 60fps on mobile (or 30fps min)

Scenario 6: Accessibility Audit
  ☐ Axe DevTools: No violations
  ☐ Text contrast ≥4.5:1
  ☐ Screen reader announces all content
  ☐ Keyboard navigation complete
  ☐ ARIA attributes correct
  ☐ All touch targets ≥44×44px

Scenario 7: Performance & Bundle
  ☐ Total JS ≤300kB
  ☐ Motion layer ~40-50kB gzipped
  ☐ 60fps frame rate maintained
  ☐ Lighthouse ≥90
  ☐ CLS <0.1
  ☐ React re-renders minimal
  ☐ Smooth on 6x CPU throttle
```

---

## Next Steps

Once all validation scenarios pass:
1. Proceed to implementation phase (`/speckit.tasks` to generate task list)
2. Code review: Verify implementation matches contracts
3. Deploy to staging (Azure Static Web App)
4. Run full E2E test suite
5. User acceptance testing (UAT) with informal user feedback
6. Deploy to production

**Reference Documents**:
- [spec.md](spec.md) - Full feature specification
- [data-model.md](data-model.md) - Entity definitions and state transitions
- [contracts/components-and-hooks.md](contracts/components-and-hooks.md) - Component & hook API contracts
- [research.md](research.md) - Research findings and architectural decisions
- [plan.md](plan.md) - Implementation roadmap (Phase 0-2)
