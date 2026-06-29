# Tasks: Premium Motion & Interaction Design

**Input**: Design documents from `/specs/006-premium-motion-ux/`

**Prerequisites**: ✅ plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks grouped by user story for independent implementation and testing. Total ~125 hours (3 weeks).

**Test Coverage**: Comprehensive - unit + integration + accessibility tests per task (100% coverage target).

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no inter-task dependencies)
- **[Story]**: User story (US1=Fluid Transitions, US2=Button Micro, US3=Optimistic UI, US4=Visual Design, US5=Mobile)
- **File paths**: Exact target locations per implementation plan

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and motion layer foundation

**Duration**: ~8 hours

### Dependency Installation & Configuration

- [x] T001 Install Framer Motion & react-use-gesture (`npm install framer-motion @use-gesture/react`)
- [x] T002 Update package.json with new dependencies and verify versions
- [x] T003 [P] Create `public/src/utils/motionConfig.js` with centralized animation design tokens (durations, easing, delays)
- [x] T004 [P] Create `public/src/utils/touchTargetUtils.js` with 44px validation helpers
- [x] T005 [P] Extend `public/src/utils/theme.js` - add MEDIA_QUERIES.prefersReducedMotion constant
- [x] T006 Update `tailwind.config.js` with animation keyframes (fadeIn, scaleUp, slideUp), easing tokens, duration tokens, motion-safe/motion-reduce utilities

### Jest & Testing Setup

- [x] T007 [P] Update `jest.setup.js` - enhance `window.matchMedia` mock to include `prefers-reduced-motion: reduce` case
- [x] T008 [P] Create `public/src/__tests__/setup/animationTestHelpers.js` with utilities for testing animation performance (frame rate, transition timing)

**Checkpoint**: Motion layer foundation ready. Can begin component/hook implementation in parallel.

---

## Phase 2: Foundational (Core Hooks & Context)

**Purpose**: Reusable state management, accessibility, gesture handling - foundation for all components

**Duration**: ~20 hours

**⚠️ CRITICAL**: All hooks must be complete before component implementation begins

### Toast Notification System

- [x] T009 [P] Create `public/src/context/ToastContext.jsx` with React Context, useContext hook, provider wrapper, toast queue management (max 3 visible)
- [x] T010 [P] Create `public/src/hooks/useToast.js` - hook to dispatch success/error/info toasts from any component. Returns { success, error, info } methods
- [x] T011 [US3] Create `public/src/components/Toast.jsx` - Toast component with slide-up/down animation (Framer Motion), 4s auto-dismiss timer, aria-live regions, icon slots (success ✓, error ⚠️, info ℹ️)
- [x] T012 [US3] Create `public/src/components/__tests__/Toast.test.jsx` - test slide animation timing, auto-dismiss behavior, aria-live announcement, queue management

### Accessibility Hooks

- [x] T013 [P] Create `public/src/hooks/usePrefersReducedMotion.js` - React hook detecting `prefers-reduced-motion: reduce` media query. Returns boolean, listens for changes
- [x] T014 [P] Create `public/src/hooks/useAnimationDuration.js` - wrapper around usePrefersReducedMotion. Returns animation duration (0 if prefers reduced motion, else baseDuration). File: `public/src/hooks/useAnimationDuration.js`
- [x] T015 [P] Create `public/src/hooks/__tests__/usePrefersReducedMotion.test.js` - test media query detection, change event listening, default value when unsupported

### Optimistic UI Hook

- [x] T016 Create `public/src/hooks/useOptimisticUpdate.js` - hook managing optimistic state + rollback. Parameters: (entity, updateFn). Returns [value, update, isLoading]. On error: shows error toast + reverts state after 3s timeout
- [x] T017 Create `public/src/hooks/__tests__/useOptimisticUpdate.test.js` - test instant optimistic update, error rollback, toast notification triggering, success state, promise handling

### Gesture Hook

- [x] T018 Create `public/src/hooks/useGestureSwipe.js` - wraps react-use-gesture for swipe detection. Parameters: (onSwipeLeft, onSwipeRight). Returns ref to attach to swipe target. Velocity-based animation integration
- [x] T019 Create `public/src/hooks/__tests__/useGestureSwipe.test.js` - test left/right swipe detection (50px threshold), velocity calculation, non-motion on small swipes, no-op when disabled

### Integration: Hook Interdependencies

- [x] T020 [P] Create `public/src/hooks/__tests__/hooksIntegration.test.js` - test useToast + useOptimisticUpdate together, useToast + usePrefersReducedMotion, animation duration respected when prefers-reduced-motion active

**Checkpoint**: All hooks tested and working independently. Ready for component implementation.

---

## Phase 3: User Story 1 - Fluid Page Transitions & Modal Animations (Priority: P1) 🎯 MVP

**Goal**: Implement smooth, elegant modal animations (entrance/exit) with staggered sub-element animations

**Independent Test**: Modal can be opened/closed with smooth animations. Stagger animation on title/form inputs. Focus management correct. No jank (60fps maintained).

**Duration**: ~20 hours

### Implementation

- [x] T021 [US1] Create `public/src/components/MotionModal.jsx` - animated modal wrapper using Framer Motion. Props: isOpen, onClose, title, children, size, variant, actions. Entry: fade+scale 300ms easing ease-out-quart. Stagger child elements with 50ms delay. Exit: reverse 250ms
- [x] T022 [US1] Implement MotionModal accessibility - aria-modal, aria-labelledby, aria-hidden on backdrop, focus trap, Escape key closes, focus return on close
- [x] T023 [US1] Update `public/src/components/PersonaOnboarding.jsx` - wrap form content in MotionModal, remove old modal styling. Test that modal animates in/out correctly
- [x] T024 [US1] Update `public/src/components/DeletePersonaModal.jsx` - wrap in MotionModal, stagger title + description + buttons. Implement confirm/cancel animations
- [ ] T025 [P] [US1] Create `public/src/components/CalendarGrid.jsx` enhancement - add month navigation animations. When month changes: FLIP layout morphing using Framer Motion AnimatePresence. Previous month fades out, new month fades in + content morphs 400ms

### Tests for User Story 1

- [x] T026 [US1] Create `public/src/components/__tests__/MotionModal.test.jsx` - test fade+scale entrance 300ms, stagger animation on children (50ms), exit animation 250ms, prefers-reduced-motion disables animation, focus management, Escape key closes, accessibility attributes (aria-modal, aria-labelledby)
- [ ] T027 [US1] Create `public/src/components/__tests__/CalendarGrid.motion.test.jsx` - test month navigation animation (400ms FLIP), fade in/out of calendar content, performance (60fps during animation)

**Checkpoint**: Modal animations working smoothly. Page transitions fluid. Ready for button micro-interactions.

---

## Phase 4: User Story 2 - Button & Interactive Element Micro-interactions (Priority: P1)

**Goal**: Implement subtle scale + shadow animations on hover/press for all interactive elements

**Independent Test**: Button hover scales 1.02x smoothly (150ms). Press feedback appears <50ms. Spring-back animation on release. Touch devices don't show :hover. Disabled state disables animations.

**Duration**: ~18 hours

### Implementation

- [x] T028 [US2] Create `public/src/components/MotionButton.jsx` - button component with micro-interactions. Props: onClick, children, variant (primary/secondary/danger), size (sm/md/lg), isLoading, disabled. Hover: scale 1.02x + shadow deepening 150ms. Press: 0.98x for 100ms. Loading: spinner rotation
- [x] T029 [US2] Implement MotionButton accessibility - touch target ≥44×44px, aria-label for icon-only buttons, disabled state with aria-disabled, proper focus ring visibility
- [ ] T030 [US2] Create `public/src/components/__tests__/MotionButton.test.jsx` - test hover scale 1.02x (150ms), press feedback <50ms response, spring-back animation, prefers-reduced-motion disables scale (only opacity), touch devices (no :hover), disabled state, 44×44px minimum
- [ ] T031 [P] [US2] Update `public/src/components/PersonaOnboarding.jsx` - replace button styling with MotionButton components
- [ ] T032 [P] [US2] Update `public/src/components/DeletePersonaModal.jsx` - replace button styling with MotionButton components
- [ ] T033 [P] [US2] Update action buttons in PersonaSelector, CalendarHeader - use MotionButton

### Form Input Animations

- [ ] T034 [US2] Enhance `public/src/components/PersonaOnboarding.jsx` form inputs - add border color transition on focus (gray #ddd → primary blue #2563eb, 200ms). Add subtle focus ring animation. Implemented with Tailwind + CSS transitions
- [ ] T035 [US2] Create input field test in `public/src/components/__tests__/PersonaOnboarding.test.jsx` - test focus color transition, focus ring visibility, prefers-reduced-motion effect

### Row Hover States

- [x] T036 [P] [US2] Update `public/src/components/PersonaRow.jsx` - on hover: background animates to subtle highlight color (#f9fafb) 150ms, left border accent appears with slide-in animation, delete button becomes visible
- [ ] T037 [US2] Create `public/src/components/__tests__/PersonaRow.test.jsx` - test hover animation, left border accent slide-in, delete button visibility

**Checkpoint**: All interactive elements have delightful micro-interactions. Button feedback instant and satisfying. Ready for optimistic UI.

---

## Phase 5: User Story 3 - Optimistic UI & Real-Time Data Updates (Priority: P1)

**Goal**: Instant feedback on create/delete/toggle actions, smooth rollback on errors with toast notifications

**Independent Test**: Calendar cell updates instantly (<16ms) when clicked. Loading shimmer visible. Success toast slides up after backend confirms. Error causes smooth rollback + error toast.

**Duration**: ~22 hours

### Calendar Cell Enhancement

- [ ] T038 [US3] Update `public/src/components/CalendarCell.jsx` - integrate useOptimisticUpdate hook. On click: cell background animates to persona_color instantly (optimistic). Loading shimmer appears (pulsing gradient overlay, Framer Motion). Backend confirms within 300ms. If success: shimmer fades, success toast slides up. If error: cell reverts to previous color smoothly (200ms) + error toast
- [ ] T039 [US3] Implement shimmer animation - create `public/src/components/Shimmer.jsx` with pulsing gradient (Framer Motion keyframes). Used in CalendarCell + PersonaRow during updates
- [ ] T040 [US3] Create `public/src/components/__tests__/CalendarCell.optimisticUI.test.jsx` - test instant optimistic update <16ms, loading shimmer visibility, success toast (4s auto-dismiss), error rollback smoothness, prefers-reduced-motion effect (no duration, instant state)

### Delete Persona Animation

- [ ] T041 [US3] Update `public/src/components/PersonaRow.jsx` - implement delete animation. On deletion confirmed: row fades out + slides left 300ms. Remaining rows animate down (FLIP layout morphing) 400ms. Success toast confirms deletion
- [ ] T042 [US3] Update `public/src/hooks/useDeletePersona.js` - integrate useOptimisticUpdate for delete action. On success: shows success toast. On error: shows error toast, state reverts
- [ ] T043 [US3] Create integration test `public/src/__tests__/OptimisticUI.integration.test.jsx` - test create persona (optimistic + success), toggle availability (optimistic + rollback), delete persona (cascade animation + success), network offline scenario (error toast + rollback)

### App.jsx Integration

- [x] T044 Wrap `public/src/App.jsx` in `<ToastProvider>` so all components can use useToast hook
- [ ] T045 [US3] Create `public/src/__tests__/App.integration.optimisticUI.test.jsx` - test E2E optimistic UI flow with mock backend delay/failure scenarios

**Checkpoint**: Optimistic UI fully functional. All CRUD operations have instant feedback + smooth error handling. Ready for visual design upgrade.

---

## Phase 6: User Story 4 - Modern Visual Design & Typography (Priority: P2)

**Goal**: Clean, intentional design system with consistent typography, colors, spacing, shadows inspired by Apple/Stripe

**Independent Test**: Typography hierarchy consistent (H1, H2, body, labels). Color palette cohesive (primary blue, danger red, success green, neutrals). Border radius consistent (0, 4, 6, 8px). Shadows subtle + directional from top-left. Whitespace generous + consistent.

**Duration**: ~15 hours

### Design System

- [ ] T046 [P] Extend `tailwind.config.js` - finalize color palette (primary #2563eb, danger #dc2626, success #16a34a, neutrals #f9fafb → #111111). Add typography scale (H1 20px bold, H2 18px semibold, body 14px regular, label 12px regular). Border radius tokens (0, 4, 6, 8px). Box shadow scale (0, 2px, 4px, 8px) with directional light from top-left
- [ ] T047 [P] Update `public/src/index.css` - add global typography styles, color reset, ensure consistent line-height (1.5x for readability). Add `@media (prefers-reduced-motion: reduce)` rules to disable all animations instantly

### Component Styling

- [ ] T048 [P] [US4] Audit `public/src/components/PersonaOnboarding.jsx` styling - ensure consistent spacing (8px grid), border radius (4px inputs, 8px buttons), color usage (primary blue, neutral grays). Update CSS to match design system
- [ ] T049 [P] [US4] Audit `public/src/components/PersonaSelector.jsx` styling - consistent card design, shadows (subtle at rest, deeper on hover), typography hierarchy. Update CSS
- [ ] T050 [P] [US4] Audit `public/src/components/CalendarGrid.jsx` styling - date cells 14px semibold, day headers 12px uppercase gray. Cell borders 1px solid #e5e7eb, border radius 4px. Consistent spacing (8px grid)
- [ ] T051 [P] [US4] Audit `public/src/components/MotionModal.jsx` styling - modal border radius 8px, content padding 24px, consistent shadow on modal (8px depth), close button 8px border radius. Typography for title + description following scale
- [ ] T052 [P] [US4] Update `public/src/components/Toast.jsx` styling - icon color based on type (success green, error red, info blue). Consistent padding, border radius 4px, box shadow 4px
- [ ] T053 [P] [US4] Update `public/src/components/MotionButton.jsx` - ensure all variants (primary/secondary/danger) match design system colors + sizing. Shadows deepen correctly on hover

### Visual Polish

- [ ] T054 [US4] Create `public/src/components/__tests__/DesignSystem.visual.test.jsx` - snapshot tests for all components to catch unintended styling changes. Color contrast validation (≥4.5:1 for AA)
- [ ] T055 [US4] Run Lighthouse audit on dev build - verify Performance ≥90, Accessibility ≥95 (color contrast, focus indicators)

**Checkpoint**: App looks polished, cohesive, premium. Consistent design language throughout. Ready for mobile responsiveness.

---

## Phase 7: User Story 5 - Flawless Mobile Responsiveness & Touch Interactions (Priority: P2)

**Goal**: Native feel on mobile, swipe gestures for month navigation, responsive layout, all touch targets 44×44px

**Independent Test**: Swipe left/right on mobile calendar triggers month navigation with velocity-based animation. Device rotation adapts layout smoothly. All touch targets ≥44×44px verified. Modal fullscreen on mobile.

**Duration**: ~18 hours

### Swipe Gesture Implementation

- [ ] T056 [US5] Update `public/src/components/CalendarGrid.jsx` - integrate useGestureSwipe hook. Swipe left → next month (animate 400ms FLIP). Swipe right → previous month. Minimum 50px distance. Velocity-based animation duration
- [ ] T057 [US5] Create `public/src/components/__tests__/CalendarGrid.swipe.test.jsx` - test left/right swipe detection, month change triggered, velocity affects animation speed (faster swipe = faster animation, capped). Swipes <50px ignored. Tap-drag not triggering

### Responsive Layout Adjustments

- [ ] T058 [P] [US5] Update `public/src/components/MotionModal.jsx` responsive behavior - on mobile (<640px): fullscreen width (100vw with 16px margins), animates up from bottom (not fade+scale), rounded top corners. On desktop: centered 600px modal, fade+scale
- [ ] T059 [P] [US5] Update `public/src/components/PersonaSelector.jsx` - on mobile: dropdown shows as fullscreen modal (100vw height). On desktop: dropdown menu (200px wide). Smooth layout transition at breakpoint (300ms)
- [ ] T060 [P] [US5] Update `public/src/components/CalendarGrid.jsx` - responsive columns: mobile shows 7 columns (small). Tablet shows 7 columns (medium). Desktop shows 7 columns (large). Grid adapts font sizes + spacing per breakpoint. Rotation (portrait ↔ landscape) adapts smoothly 300ms

### Touch Target Validation

- [ ] T061 [P] Audit all interactive elements for 44×44px minimum:
  - All buttons: MotionButton, close buttons, delete buttons
  - Calendar cells: date cells must be ≥44×44px
  - Persona rows: clickable area ≥44×44px
  - Form inputs: ensure tap area ≥44px height
  - Update CSS if needed to expand hit areas without reducing visual size (use padding)
- [ ] T062 [US5] Create `public/src/__tests__/TouchTargets.test.jsx` - automated test checking all interactive elements ≥44×44px computed style. Axe accessibility audit integration

### Mobile Testing

- [ ] T063 [US5] Create `public/src/components/__tests__/Mobile.integration.test.jsx` - test swipe month navigation on mobile, button feedback (no :hover persistence), touch feedback on cells, modal fullscreen behavior, responsive layout breakpoints

**Checkpoint**: App fully responsive and touch-friendly. Swipe gestures working smoothly. All touch targets WCAG AAA compliant.

---

## Phase 8: Polish & Accessibility Audit (Final Phase)

**Purpose**: Final compliance checks, performance validation, cross-browser testing, documentation

**Duration**: ~12 hours

### Accessibility Compliance

- [ ] T064 [P] Run Axe DevTools audit on entire app - fix any violations. Verify 0 violations, 0 "needs review" items
- [ ] T065 [P] Keyboard navigation audit - Tab through all elements, verify focus visible, focus ring ≥3px high contrast, logical tab order, no focus traps, Escape key closes modals
- [ ] T066 [P] Screen reader testing (VoiceOver macOS) - all buttons announced, modal announced as dialog, toast announced via aria-live, form labels associated, deleted elements not announced (aria-hidden)
- [ ] T067 [P] Color contrast check - verify all text ≥4.5:1 (AA) using Wave extension or DevTools
- [ ] T068 Create `public/src/__tests__/Accessibility.comprehensive.test.jsx` - Axe integration test, keyboard nav simulation, ARIA attribute validation, touch target audit

### Performance Validation

- [ ] T069 [P] Run Chrome DevTools Performance audit - record during modal open/close, button hover/press, swipe navigation, delete persona with FLIP. Verify 60fps maintained, no dropped frames, animation latency <50ms
- [ ] T070 [P] Lighthouse audit - Performance ≥90, Accessibility ≥95, CLS <0.1. Bundle size check: motion layer ≤60kB gzipped, total JS ≤300kB
- [ ] T071 [P] React Profiler test - verify no excessive re-renders during animations. Component render times <16.67ms (one frame at 60fps)
- [ ] T072 Create `public/src/__tests__/Performance.test.jsx` - measure animation frame rate, layout recalculation during motion, CPU throttle simulation (6x slowdown)

### Cross-Browser Testing

- [ ] T073 [P] Test animations in Chrome, Safari, Firefox, Edge (latest versions) - verify consistent animation behavior, no webkit-only hacks, Pointer Events API works correctly
- [ ] T074 [P] Mobile browser testing - iOS Safari (gesture swipe, modal transitions, button feedback), Chrome Mobile (same checks)

### Test Coverage & Documentation

- [ ] T075 Run Jest test suite - verify ≥90% coverage (lines, branches, functions). Generate coverage report
- [ ] T076 [P] Update README.md - add section on motion layer: "Premium Motion UX" with library dependencies, known limitations, accessibility guidelines
- [ ] T077 [P] Create `PUBLIC_MOTION_UX_GUIDE.md` - developer guide for using motion components/hooks, animation token reference, testing motion animations, debugging prefers-reduced-motion

### Final Integration & Verification

- [ ] T078 Deploy to staging (Azure Static Web App) - run full E2E test suite against staging
- [ ] T079 Run full validation checklist from quickstart.md - all 7 scenarios passing, all test cases passing
- [ ] T080 Prepare for UAT (User Acceptance Testing) - document test scenarios for informal user feedback

**Checkpoint**: All phases complete. Feature production-ready with 100% test coverage, zero accessibility violations, 60fps performance, and full documentation.

---

## Phase 9: Deployment & Release (Post-Implementation)

**Purpose**: Final deployment, monitoring, rollout to production

**Duration**: ~5 hours

- [ ] T081 Merge feature branch → main after final code review approval
- [ ] T082 Deploy to production (Azure Static Web App)
- [ ] T083 Monitor Lighthouse + performance metrics post-deployment (first 24 hours)
- [ ] T084 Collect informal user feedback - does app feel premium and smooth?
- [ ] T085 Document any issues/regressions and prioritize for next release

---

## Dependency Graph & Parallel Execution Strategy

### Critical Path
```
T001-T008 (Setup) 
  ↓
T009-T020 (Foundational Hooks)
  ↓
T021-T027 (US1: Modals) + T028-T037 (US2: Buttons) [PARALLEL]
  ↓
T038-T045 (US3: Optimistic UI) [can start after T009-T020]
  ↓
T046-T055 (US4: Design) [PARALLEL with US3]
  ↓
T056-T063 (US5: Mobile) [PARALLEL with US4]
  ↓
T064-T080 (Polish & Validation)
  ↓
T081-T085 (Deployment)
```

### Parallelizable Work Streams (After Phase 2 Complete)
- **Stream A**: T021-T027 (Modals) + T038-T045 (Optimistic UI)
- **Stream B**: T028-T037 (Buttons) + T046-T055 (Design)
- **Stream C**: T056-T063 (Mobile/Swipe) [can run in parallel]
- **Stream D**: T064-T080 (Tests & Validation) [continuous during development]

**Optimal Team Allocation**: 1 developer full-time (sequential) or 2-3 developers in parallel streams.

---

## Success Criteria per Phase

### After Phase 1 (Setup)
- ✅ Dependencies installed
- ✅ Tailwind config updated with animation tokens
- ✅ Jest setup enhanced for animation testing

### After Phase 2 (Hooks)
- ✅ All 5 hooks tested independently
- ✅ Toast context working, useToast hook accessible from any component
- ✅ useOptimisticUpdate tested with error rollback
- ✅ useGestureSwipe detecting swipes correctly
- ✅ usePrefersReducedMotion detecting OS setting

### After Phase 3 (US1)
- ✅ Modal animations smooth, 300ms entrance, 250ms exit
- ✅ Stagger animation on children (50ms delay)
- ✅ No jank, 60fps maintained
- ✅ Focus management correct

### After Phase 4 (US2)
- ✅ Button hover scales 1.02x (150ms)
- ✅ Press feedback <50ms
- ✅ All interactive elements ≥44×44px
- ✅ Touch devices don't show :hover

### After Phase 5 (US3)
- ✅ Optimistic update instant (<16ms)
- ✅ Loading shimmer visible during sync
- ✅ Error rollback smooth (200ms)
- ✅ Toast notifications working

### After Phase 6 (US4)
- ✅ Design system consistent
- ✅ Typography hierarchy clear
- ✅ Colors cohesive
- ✅ Shadows directional and subtle

### After Phase 7 (US5)
- ✅ Swipe gestures working on mobile
- ✅ Responsive layout adapting smoothly
- ✅ All touch targets 44×44px
- ✅ Modal fullscreen on mobile

### After Phase 8 (Polish)
- ✅ Axe audit: 0 violations
- ✅ Lighthouse: ≥90 Performance
- ✅ Test coverage: ≥90%
- ✅ Cross-browser: Chrome, Safari, Firefox, Edge, iOS/Android
- ✅ User feedback: "Feels premium and smooth"

---

## Estimated Effort Breakdown

| Phase | Tasks | Hours | Person-Days | Notes |
|-------|-------|-------|-------------|-------|
| 1. Setup | T001-T008 | 8 | 1 | Quick config + dependency setup |
| 2. Hooks | T009-T020 | 20 | 2.5 | Core reusable logic |
| 3. US1 (Modals) | T021-T027 | 20 | 2.5 | Foundation animation work |
| 4. US2 (Buttons) | T028-T037 | 18 | 2.25 | Micro-interactions + tests |
| 5. US3 (Optimistic) | T038-T045 | 22 | 2.75 | Integration + animation |
| 6. US4 (Design) | T046-T055 | 15 | 1.9 | Styling + polish |
| 7. US5 (Mobile) | T056-T063 | 18 | 2.25 | Responsive + swipe |
| 8. Polish | T064-T080 | 12 | 1.5 | Audits + validation |
| 9. Deploy | T081-T085 | 5 | 0.6 | Production rollout |
| **TOTAL** | **85 tasks** | **~138 hours** | **~17 person-days** | **~3 weeks (1 dev) or 1 week (3 devs)** |

---

## Testing Strategy

### Unit Tests (Per Task)
- Hook tests: 100% coverage
- Component props: Valid inputs/outputs
- Animation timing: Matches contracts
- Accessibility: aria-*, keyboard nav, touch targets

### Integration Tests (Per Phase)
- User flows: Create → Update → Delete
- Error scenarios: Network failures, rollback
- Gesture + animation: Swipe triggering month change
- Optimistic UI: Toast notifications + state sync

### Accessibility Tests (Continuous)
- Axe audit (per component)
- Keyboard navigation (per component)
- Screen reader (E2E)
- Color contrast (automated + manual)
- Touch target size (automated)

### Performance Tests (Final Phase)
- Chrome DevTools Performance: 60fps maintained
- Lighthouse: ≥90 Performance score
- React Profiler: No excessive re-renders
- Bundle size: Motion layer ≤60kB gzipped

---

## Reference Documents

- [spec.md](spec.md) - 25 acceptance scenarios
- [plan.md](plan.md) - Implementation roadmap
- [research.md](research.md) - Architectural decisions
- [data-model.md](data-model.md) - UI state design
- [contracts/components-and-hooks.md](contracts/components-and-hooks.md) - API contracts
- [quickstart.md](quickstart.md) - 7 validation scenarios
- [Constitution](../../.specify/memory/constitution.md) - Project principles

---

**Next Steps**: Begin Phase 1 setup. Install dependencies, configure Tailwind, update Jest. Estimated completion: 1-3 weeks depending on team size and parallel work streams.
