# Tasks: Mobile UI Enhancements

**Feature**: 003-mobile-ui-enhancements | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

**Input**: Design documents from `/specs/003-mobile-ui-enhancements/`

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: User story label (US1, US2, US3, US4)
- **File paths**: Exact locations for each task

---

## Phase 1: Setup (Project Configuration)

**Purpose**: Initialize configuration and shared utilities for the feature

- [x] T001 Enable dark mode in TailwindCSS config in `tailwind.config.js`
- [x] T002 [P] Update Jest setup to mock `prefers-color-scheme` media query in `jest.setup.js`
- [x] T003 [P] Create theme constants and utilities in `public/src/utils/theme.js` (colors, breakpoints, z-index)
- [x] T004 [P] Create text truncation utilities in `public/src/utils/truncate.js` (truncatePersonaName function)
- [x] T005 [P] Create utilities test file in `public/src/utils/__tests__/theme.test.js` for constants validation

---

## Phase 2: Foundational (Shared Infrastructure)

**Purpose**: Hooks and utilities that all user stories depend on

**⚠️ CRITICAL**: Must complete before user story implementation begins

- [x] T006 Create `useDarkMode` hook in `public/src/hooks/useDarkMode.js` (localStorage + system preference)
- [x] T007 [P] Create `useMediaQuery` hook in `public/src/hooks/useMediaQuery.js` for responsive logic
- [x] T008 [P] Create `useClickOutside` hook in `public/src/hooks/useClickOutside.js` for modal dismiss
- [x] T009 Add unit tests for `useDarkMode` hook in `public/src/hooks/__tests__/useDarkMode.test.js` (localStorage persistence, system preference fallback, toggle)
- [x] T010 [P] Add unit tests for `useMediaQuery` hook in `public/src/hooks/__tests__/useMediaQuery.test.js`
- [x] T011 [P] Add unit tests for `useClickOutside` hook in `public/src/hooks/__tests__/useClickOutside.test.js`
- [x] T012 [P] Create truncate utility tests in `public/src/utils/__tests__/truncate.test.js`
- [x] T013 Create text truncation test in `public/src/utils/__tests__/truncate.test.js` for persona name truncation

**Checkpoint**: All hooks and utilities ready and tested - user story implementation can begin

---

## Phase 3: User Story 1 - View Complete Availability List on Date (Priority: P1) 🎯 MVP

**Goal**: Enable users to see all available personas on a date (no "+1 more" truncation) via device-appropriate interactions

**Independent Test**: Mark 3+ personas available on a date; hover (desktop) or tap (mobile) availability badge; verify all personas displayed with names and colors

### Tests for User Story 1

- [ ] T014 [P] [US1] Create desktop tooltip interaction test in `public/src/components/__tests__/AvailabilityModal.test.jsx` (hover shows tooltip)
- [ ] T015 [P] [US1] Create mobile bottom sheet interaction test in `public/src/components/__tests__/AvailabilityModal.test.jsx` (tap shows modal, swipe/tap outside closes)
- [ ] T016 [P] [US1] Create persona display test (verify names and colors visible, no truncation)
- [ ] T017 [US1] Create integration test for availability modal flow in `public/src/__tests__/integration/availability-modal.integration.test.js`

### Implementation for User Story 1

- [ ] T018 [P] [US1] Create `AvailabilityModal` component in `public/src/components/AvailabilityModal.jsx` (desktop tooltip via Popper)
- [ ] T019 [US1] Add mobile bottom sheet styling to `AvailabilityModal` component (CSS-in-JS or Tailwind classes, 60-70% viewport height)
- [ ] T020 [P] [US1] Update `AvailabilityBadge` component in `public/src/components/AvailabilityBadge.jsx` to call `onShowAll` callback on tap/hover
- [ ] T021 [P] [US1] Add modal open/close state management to `AvailabilityBadge`
- [ ] T022 [US1] Integrate `AvailabilityModal` into `CalendarGrid` component in `public/src/components/CalendarGrid.jsx`
- [ ] T023 [US1] Add click-outside and swipe-down dismiss gesture handling to `AvailabilityModal`
- [ ] T024 [P] [US1] Add persona name truncation display logic in `AvailabilityModal` (show first 2, use "...+N more" pattern in compact view)
- [ ] T025 [US1] Add accessibility attributes (aria-modal, aria-label, focus management) to `AvailabilityModal`

**Checkpoint**: User Story 1 complete - users can view complete availability list on any date

---

## Phase 4: User Story 2 - Calendar Branding with Title Rename (Priority: P1)

**Goal**: Brand the calendar as "Da Boyz Availability Calender" consistently across all views

**Independent Test**: Load app; verify header displays "Da Boyz Availability Calender"; resize to mobile; verify title remains visible

### Tests for User Story 2

- [ ] T026 [P] [US2] Create title rendering test in `public/src/__tests__/integration/calendar-branding.integration.test.js`
- [ ] T027 [P] [US2] Create responsive title test (title visible on desktop and mobile viewports)

### Implementation for User Story 2

- [ ] T028 [US2] Update `App.jsx` header section to display "Da Boyz Availability Calender" as primary title in `public/src/App.jsx`
- [ ] T029 [P] [US2] Add responsive text sizing for title using TailwindCSS classes (base size → smaller on mobile)
- [ ] T030 [P] [US2] Ensure title remains visible and readable at all breakpoints (test at 375px, 768px, 1024px+)

**Checkpoint**: User Story 2 complete - calendar is branded with clear title across all views

---

## Phase 5: User Story 3 - Dark Mode Toggle for Eye Comfort (Priority: P2)

**Goal**: Implement dark mode toggle with system preference fallback for improved eye comfort on mobile

**Independent Test**: Load app → dark mode follows system preference; toggle switch → theme changes instantly; refresh page → manual preference persists

### Tests for User Story 3

- [ ] T031 [P] [US3] Create dark mode toggle render test in `public/src/components/__tests__/DarkModeToggle.test.jsx`
- [ ] T032 [P] [US3] Create dark mode persistence test (localStorage survives page refresh)
- [ ] T033 [P] [US3] Create system preference fallback test (uses prefers-color-scheme on first load)
- [ ] T034 [US3] Create integration test for dark mode theme switching in `public/src/__tests__/integration/dark-mode.integration.test.js`
- [ ] T035 [P] [US3] Create contrast verification test (persona colors distinguishable in both themes)

### Implementation for User Story 3

- [ ] T036 [P] [US3] Create `DarkModeToggle` component in `public/src/components/DarkModeToggle.jsx` (sun/moon icon button)
- [ ] T037 [P] [US3] Integrate `DarkModeToggle` into `App.jsx` header using `useDarkMode` hook
- [ ] T038 [US3] Add `dark:` class application to all components (backgrounds, text, cards, buttons, badges)
- [ ] T039 [P] [US3] Create CSS custom properties for persona colors (or update theme object) to ensure colors work in both themes
- [ ] T040 [P] [US3] Add theme-color meta tag update on dark mode toggle in `public/index.html`
- [ ] T041 [US3] Test all UI components in dark mode for readability and contrast (WCAG AA standard check)

**Checkpoint**: User Story 3 complete - dark mode toggle working with system preference fallback and proper contrast

---

## Phase 6: User Story 4 - Mobile-Optimized Availability View and Interactions (Priority: P1)

**Goal**: Ensure mobile-first responsive design with touch-friendly interactions

**Independent Test**: Open app on mobile viewport; all elements visible without horizontal scroll; tap badge shows modal; modal dismisses with swipe/tap; all touch targets ≥ 44x44px

### Tests for User Story 4

- [ ] T042 [P] [US4] Create responsive layout test in `public/src/__tests__/integration/mobile-responsiveness.integration.test.js` (no horizontal scroll at 375px, 768px)
- [ ] T043 [P] [US4] Create touch target size test (measure all interactive elements, verify ≥ 44x44px)
- [ ] T044 [P] [US4] Create persona name truncation test (long names truncated with ellipsis + tooltip)
- [ ] T045 [P] [US4] Create orientation change test (portrait ↔ landscape, verify layout adapts)
- [ ] T046 [US4] Create bottom sheet modal dismiss test (swipe down, tap outside, close button)

### Implementation for User Story 4

- [ ] T047 [P] [US4] Add mobile-first responsive CSS to `CalendarGrid` component (mobile < 768px breakpoint)
- [ ] T048 [P] [US4] Ensure calendar grid uses full width on mobile without horizontal scroll in `public/src/components/CalendarGrid.jsx`
- [ ] T049 [P] [US4] Add CSS Grid adjustments for mobile layout (fewer columns, adjusted padding/gaps)
- [ ] T050 [P] [US4] Implement text truncation for persona names in badges (use truncatePersonaName utility from T004)
- [ ] T051 [P] [US4] Add tooltip/long-press affordance for truncated names in `AvailabilityBadge` and modal
- [ ] T052 [P] [US4] Update all buttons and touch targets to be ≥ 44x44px using TailwindCSS (min-h-11, min-w-11)
- [ ] T053 [P] [US4] Adjust date cell spacing for comfortable tap targets (padding, margin)
- [ ] T054 [US4] Add swipe gesture detection to bottom sheet modal (use useClickOutside + touch event listeners for swipe-down)
- [ ] T055 [US4] Verify all text sizes are readable on 375px width screens (adjust font sizes using responsive Tailwind classes)
- [ ] T056 [US4] Update PersonaSelector button to be touch-friendly (increase size for mobile)

**Checkpoint**: User Story 4 complete - mobile-first responsive design with touch-optimized interactions

---

## Phase 7: Polish, Testing & Quality Assurance

**Purpose**: Comprehensive validation, documentation, and release preparation

### Unit Test Validation

- [ ] T057 [P] Run full Jest test suite: `npm test -- --no-coverage --watchAll=false` and verify 100% pass rate
- [ ] T058 [P] Verify test coverage for new components (aim for ≥ 80% coverage on new files)

### Code Quality & Linting

- [ ] T059 [P] Run ESLint: `npm run lint` and fix all errors and warnings in new components
- [ ] T060 [P] Verify no console warnings or errors in browser DevTools
- [ ] T061 [P] Check code style consistency (naming, formatting, organization)

### Integration & Cross-Feature Testing

- [ ] T062 Integration test: Dark mode + Availability modal (toggle dark mode while modal open, verify no layout break)
- [ ] T063 Integration test: Mobile view + Dark mode (verify all colors distinguishable at all breakpoints)
- [ ] T064 Integration test: Persona availability marking flow (create persona → mark dates → view full availability in both modes)
- [ ] T065 Integration test: Orientation changes (switch portrait ↔ landscape during availability modal interaction)
- [ ] T066 Test: Verify dark mode preference survives multiple browser restarts

### Accessibility & Contrast Testing

- [ ] T067 [P] Verify WCAG AA contrast ratios for all colors in both light and dark modes
- [ ] T068 [P] Test keyboard navigation on desktop (Tab through elements, Enter/Space on buttons)
- [ ] T069 [P] Verify focus indicators are visible in both themes
- [ ] T070 [P] Test screen reader compatibility for modal (aria-modal, aria-label, focus management)

### Performance Review

- [ ] T071 [P] Profile modal open/close animation (target 300ms open time)
- [ ] T072 [P] Verify dark mode toggle is instant (no layout shift, < 50ms response time)
- [ ] T073 [P] Check bundle size impact (new components should not exceed 20KB gzipped)

### Manual Testing on Devices

- [ ] T074 Manual test on iOS Safari 14+ (tap interactions, bottom sheet animation, dark mode)
- [ ] T075 Manual test on Chrome Android (swipe gestures, landscape rotation, touch targets)
- [ ] T076 Manual test on desktop browsers (Chrome, Firefox, Safari) for hover tooltips

### Documentation & Changelog

- [ ] T077 Update CHANGELOG.md with v1.2.0 release notes (availability modal, dark mode, mobile responsive)
- [ ] T078 Add inline code comments to complex logic (modal positioning, gesture handling, color logic)
- [ ] T079 Update README.md if needed (new features section, dark mode mention)

### Final Build & Deployment Readiness

- [ ] T080 Build production bundle: `npm run build` and verify success
- [ ] T081 [P] Verify bundle size and gzip compression (target < 100KB gzipped total)
- [ ] T082 [P] Test production build locally before merge
- [ ] T083 Create pull request with summary of all changes, tests passing, acceptance criteria met

---

## Completion Criteria

✅ **All Tasks Completed When**:

1. **Phase 1-7**: All 83 tasks marked complete
2. **Testing**: 100% of new tests passing (unit + integration)
3. **Quality**: ESLint 0 errors, no console warnings, WCAG AA contrast verified
4. **Manual**: Tested on at least 2 mobile devices (iOS + Android), desktop browser
5. **Documentation**: Changelog updated, code comments added
6. **Release**: Production build passes, no performance regressions

---

## Task Dependencies & Parallelization

**Dependency Graph**:
```
Setup Phase (T001-T005) 
    ↓ (all must complete)
Foundational Phase (T006-T013)
    ↓ (all must complete)
    ├─→ US1 (T014-T025) [Can run in parallel with US2, US3, US4]
    ├─→ US2 (T026-T030)
    ├─→ US3 (T031-T041)
    ├─→ US4 (T042-T056)
    ↓ (all stories must complete)
Polish Phase (T057-T083)
```

**Parallelization Opportunities**:
- T002-T005: Run in parallel (independent utilities)
- T010-T012: Run in parallel (independent hooks)
- T014-T017: Run in parallel (independent tests)
- T018-T024: Most can run in parallel (different component concerns)
- T031-T035: Run in parallel (different test aspects)
- T057-T073: Run in parallel (independent validation tasks)

**Suggested Implementation Order** (respecting dependencies):
1. Complete all Setup Phase tasks (T001-T005)
2. Complete all Foundational Phase tasks (T006-T013)
3. Implement US1 in parallel with US2/US3/US4 (teams can divide)
4. Complete Polish Phase (T057-T083)

---

## Success Metrics

| Metric | Target | Validation |
|--------|--------|-----------|
| **Test Coverage** | ≥ 80% on new files | `npm test -- --coverage` |
| **Linting** | 0 errors, 0 warnings | `npm run lint` |
| **Performance** | Modal: < 300ms open | DevTools Performance tab |
| **Accessibility** | WCAG AA contrast | Contrast checker tool |
| **Mobile Responsiveness** | No horizontal scroll @ 375px | DevTools mobile viewport |
| **Touch Targets** | ≥ 44x44px | Measure in DevTools |
| **Dark Mode** | System preference + manual toggle | localStorage inspection |
| **Production Build** | < 100KB gzipped | `npm run build` output |

---

## Notes

- **Tests are marked [P] when parallelizable** - run multiple test tasks simultaneously
- **Story labels [US1], [US2], [US3], [US4]** - indicate which user story each task belongs to
- **File paths are exact** - use them as-is for implementation
- **Each task should take 30-60 minutes** (excluding tests and validation)
- **Total estimate**: 50-80 hours of implementation + testing (assuming single developer, parallelization available for teams)

---

## Phase 8: Convergence - Test Suite Creation & Validation

**Purpose**: Close gaps between implementation and specification by creating test files for components and verifying all acceptance criteria are met.

### Component Test Suite Creation

- [ ] T084 [P] Create `AvailabilityModal.test.jsx` with desktop tooltip interaction tests (hover shows tooltip, click outside closes) per US1/FR-002
- [ ] T085 [P] Create mobile bottom sheet interaction tests in `AvailabilityModal.test.jsx` (tap opens modal, swipe/tap outside closes) per US1/FR-015
- [ ] T086 [P] Create persona display test in `AvailabilityModal.test.jsx` (verify all personas visible, names not truncated, colors displayed) per FR-001
- [ ] T087 Create `calendar-branding.integration.test.js` verifying "Da Boyz Availability Calender" title renders at 375px, 768px, 1024px breakpoints per FR-005
- [ ] T088 [P] Create `DarkModeToggle.test.jsx` render test (button appears in header, sun/moon icons toggle) per FR-006
- [ ] T089 [P] Create dark mode persistence test in `__tests__/integration/dark-mode.integration.test.js` (localStorage saves preference, survives page refresh) per FR-009
- [ ] T090 [P] Create system preference fallback test (first load respects prefers-color-scheme, manual toggle overrides) per FR-007
- [ ] T091 Create `mobile-responsiveness.integration.test.js` validating no horizontal scroll at 375px and 768px viewports, all elements visible per FR-012

### Mobile & Accessibility Validation

- [ ] T092 [P] Create touch target size test verifying all interactive elements ≥ 44x44px (buttons, dates, badges, toggles) per FR-011
- [ ] T093 [P] Create contrast verification test checking persona colors meet WCAG AA standard (≥4.5:1 ratio) in both light and dark modes per FR-013, SC-008
- [ ] T094 Create orientation change test (portrait ↔ landscape rotation) verifying layout adapts and modal remains functional per FR-010
- [ ] T095 [P] Add aria-labels and focus management test to `AvailabilityModal.test.jsx` (screen reader compatibility, keyboard navigation) per FR-014, FR-004

### Final Quality & Release Validation

- [ ] T096 [P] Run full test suite `npm test -- --no-coverage --watchAll=false` and verify 100% pass rate, coverage ≥ 80% on new files per Constitution II
- [ ] T097 [P] Run ESLint `npm run lint` and verify 0 errors, 0 warnings in new components per Constitution I
- [ ] T098 Run production build `npm run build` and verify success, bundle size ≤ 100KB gzipped per FR requirements & Constitution IV
- [ ] T099 [P] Verify dark mode styling applied to all components (backgrounds, text, borders, buttons, badges) using dark: Tailwind classes per FR-008
- [ ] T100 Create CHANGELOG.md entry documenting v1.2.0 features (availability modal, dark mode toggle, mobile-responsive design) per Constitution
- [ ] T101 Verify README.md mentions new features and provides dark mode usage instructions per Constitution
- [ ] T102 Profile modal open/close animation timing and verify < 300ms response time, verify dark mode toggle < 50ms per Constitution IV

### Post-Implementation Manual Testing

- [ ] T103 Manual test on iOS Safari 14+ (tap availability badge, bottom sheet animation, dark mode toggle, no layout breaks) per FR-002, FR-003, FR-015
- [ ] T104 Manual test on Chrome Android (swipe down to dismiss modal, landscape/portrait rotation, all touch targets functional) per FR-010, FR-011, FR-015
- [ ] T105 Manual test on desktop browsers (Chrome, Firefox, Safari) verifying hover tooltips, dark mode toggle, no console errors per FR-002, FR-006

**Checkpoint**: All convergence tests created and passing, manual validation complete, release-ready

---

## Convergence Status

**Phase Completion**:
- ✅ Phase 1 (T001-T005): Setup configuration complete
- ✅ Phase 2 (T006-T013): Foundational hooks and utilities complete and tested
- ✅ Phase 3 (T014-T025): US1 components implemented (AvailabilityModal, updated AvailabilityBadge, CalendarGrid integration)
- ✅ Phase 4 (T026-T030): US2 calendar branding implemented (App.jsx header title updated to "Da Boyz Availability Calender")
- ✅ Phase 5 (T031-T041): US3 dark mode implemented (useDarkMode hook, DarkModeToggle component, App.jsx integration with dark: classes)
- ✅ Phase 6 (T042-T056): US4 mobile responsive implemented (touch targets 44x44px, useMediaQuery hook, responsive layouts, bottom sheet on mobile)
- ⏳ Phase 7 (T057-T083): Polish phase - tests exist for utilities/hooks, integration tests needed for components
- ⏳ Phase 8 (T084-T105): **CONVERGENCE** - Component test suites and final validation (NEW TASKS - append to implement phase)

**Test Coverage Summary**:
- ✅ Phase 1-2 utilities & hooks: 65+ tests passing (theme, truncate, useDarkMode, useMediaQuery, useClickOutside)
- ✅ Existing components: PersonaOnboarding tested
- ❌ New US1-US4 components: Test files missing (AvailabilityModal, DarkModeToggle component tests)
- ❌ Integration tests: Brand, dark mode, mobile responsiveness, accessibility tests needed

**Implementation Status**: 95% complete (all components built, all hooks created, all styling applied)

**Test Status**: 60% complete (foundation tests done, component/integration tests needed)

