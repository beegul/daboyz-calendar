# Tasks: Multi-User Real-Time Sync & Mobile UX Overhaul

**Input**: Design documents from `/specs/007-multi-user-sync-mobile-ux/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Keep only high-signal regression tests that protect sync, persona reconciliation, offline recovery, and accessibility-critical form behavior. Prefer manual smoke checks for presentation-only verification.

**Organization**: Tasks are grouped by remaining user story and closeout workstream so the team can finish the feature with less test bloat and lower merge friction.

**Tracking Note**: This file tracks remaining closeout work only. Previously completed Phase 3 implementation and shipped production bugfixes are intentionally not repeated here unless reopened by regression.

**Progress Snapshot**:
- Total closeout tasks: 41
- Completed: 41
- Remaining: 0
- Known shipped bugfixes already reflected in this closeout scope: first-of-month date persistence, mobile current-month visibility

**Release Gate Completion Metrics**:
- SC-011 bundle size proof: 118.64 kB gzip (pass, below 120 kB)
- SC-012 Lighthouse mobile accessibility: 96 (pass, target 90+)
- SC-013 CLS: 0.032 (pass, no meaningful layout shift observed)
- Build gate: pass
- Lint gate: pass (warnings only, no errors)
- Retained closeout regression lanes: pass

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., `[US1]`, `[US2]`)
- Every task includes an exact file path

## Phase 1: Setup (Toolchain & Local Workflow)

**Purpose**: Repair or document the local development path so the rest of Phase 4 can execute predictably.

- [X] T001 Audit and update local development scripts and dependency declarations in `package.json`
- [X] T002 Document supported local prerequisites and fallback workflow in `README.md`
- [X] T003 [P] Update quick-start developer guidance in `README_START_HERE.md`

---

## Phase 2: Foundational (Backlog Normalization & Lean Validation Rules)

**Purpose**: Make Spec 007 the single accurate source of truth for the remaining work.

**⚠️ CRITICAL**: User-story closeout work should not proceed until this phase is complete.

- [X] T004 Normalize Phase 4 task numbering, completed bugfix entries, and remaining totals in `specs/007-multi-user-sync-mobile-ux/tasks.md`
- [X] T005 [P] Align the active closeout roadmap and validation rules in `specs/007-multi-user-sync-mobile-ux/plan.md`, `specs/007-multi-user-sync-mobile-ux/research.md`, and `specs/007-multi-user-sync-mobile-ux/data-model.md`
- [X] T006 [P] Trim the release validation checklist to the minimum sufficient smoke path in `specs/007-multi-user-sync-mobile-ux/quickstart.md`

**Checkpoint**: The active ledger is accurate, lean, and ready for execution.

---

## Phase 3: User Story 1 - Multi-User Concurrent Availability Updates (Priority: P1) 🎯 MVP Closeout

**Goal**: Protect the core sync flow with one focused logic lane, one focused integration lane, and any required bugfixes.

**Independent Test**: Mark and unmark dates in two browsers and confirm changes reconcile correctly on the next poll without regressions in date persistence.

### Tests for User Story 1

- [X] T007 [P] [US1] Consolidate sync and date-persistence regression coverage in `public/src/hooks/__tests__/useAvailability.test.js`
- [X] T008 [P] [US1] Keep one end-to-end availability sync regression lane in `public/src/__tests__/integration/availability-marking.integration.test.js`

### Implementation for User Story 1

- [X] T009 [US1] Fix any remaining sync reconciliation or date-format defects in `public/src/hooks/useAvailability.js` and `public/src/components/CalendarGrid.jsx`
- [X] T010 [US1] Record the retained two-browser sync smoke steps and pass criteria in `specs/007-multi-user-sync-mobile-ux/quickstart.md`

**Checkpoint**: Multi-user availability sync is protected by one focused automated path and one manual smoke path.

---

## Phase 4: User Story 2 - Persona Creation/Deletion Sync (Priority: P1)

**Goal**: Ensure persona CRUD stays consistent across clients without stale selections or orphaned data.

**Independent Test**: Create and delete personas in one browser and confirm the second browser updates persona state, active selection, and onboarding behavior correctly.

### Tests for User Story 2

- [X] T011 [P] [US2] Consolidate persona sync and cascade-delete regression coverage in `public/src/__tests__/integration/personas.integration.test.js` and `public/src/__tests__/integration/cascade-delete.test.js`

### Implementation for User Story 2

- [X] T012 [US2] Fix deleted-persona reconciliation and active-persona fallback handling in `public/src/App.jsx` and `public/src/hooks/useAvailability.js`
- [X] T013 [US2] Verify duplicate-name and delete confirmation behavior in `public/src/components/PersonaOnboarding.jsx` and `public/src/components/DeletePersonaModal.jsx`
- [X] T014 [US2] Record the retained persona sync smoke path in `specs/007-multi-user-sync-mobile-ux/quickstart.md`

**Checkpoint**: Persona creation, deletion, and active-persona fallback are stable across clients.

---

## Phase 5: User Story 4 - Mobile Layout Clarity (Priority: P1)

**Goal**: Close the remaining mobile clarity gaps without reopening broad design work.

**Independent Test**: On a 375px mobile viewport, identify the active persona, current month, sync status, and primary date interaction without zooming or horizontal scroll.

### Tests for User Story 4

- [X] T015 [P] [US4] Retain one focused mobile layout regression lane in `public/src/components/__tests__/Mobile.integration.test.jsx`

### Implementation for User Story 4

- [X] T016 [US4] Fix any remaining mobile visibility and layout issues in `public/src/App.jsx`, `public/src/components/MobileHeader.jsx`, `public/src/components/MobilePersonaSelector.jsx`, and `public/src/components/CalendarGrid.jsx`
- [X] T017 [US4] Record the mobile clarity smoke checklist in `specs/007-multi-user-sync-mobile-ux/quickstart.md`

**Checkpoint**: Mobile users can clearly read and use the primary flow at the target viewport.

---

## Phase 6: User Story 8 - Network Resilience & Offline Handling (Priority: P2)

**Goal**: Keep offline queue behavior reliable while avoiding broad new suite expansion.

**Independent Test**: Queue offline actions, restore connectivity, and confirm replay, sync state visibility, and no silent data loss in the happy path.

### Tests for User Story 8

- [X] T018 [P] [US8] Consolidate offline queue and retry coverage in `public/src/hooks/__tests__/useOfflineQueue.test.js` and `public/src/hooks/__tests__/usePolling.test.js`
- [X] T019 [P] [US8] Keep one cross-layer offline recovery regression lane in `public/src/hooks/__tests__/hooksIntegration.test.js`
- [X] T020 [P] [US8] Add one consolidated edge-case regression lane for orphaned offline actions, lost-response recovery, and refresh-mid-transaction behavior in `public/src/hooks/__tests__/hooksIntegration.test.js` and `public/src/__tests__/integration/personas.integration.test.js`

### Implementation for User Story 8

- [X] T021 [US8] Fix any offline replay, retry, sync-status, or orphaned-action reconciliation defects in `public/src/hooks/useOfflineQueue.js`, `public/src/hooks/usePolling.js`, and `public/src/hooks/useAvailability.js`
- [X] T022 [US8] Record the offline recovery smoke checklist in `specs/007-multi-user-sync-mobile-ux/quickstart.md`

**Checkpoint**: Offline actions remain durable and recover predictably.

---

## Phase 7: User Story 3 - Concurrent Active Persona Switches (Priority: P2)

**Goal**: Prove active persona switching stays coherent when persona state changes concurrently.

**Independent Test**: Switch active personas on two clients while deleting or changing personas and confirm each client lands in a valid state.

### Tests for User Story 3

- [X] T023 [P] [US3] Keep one focused concurrent persona switching regression lane in `public/src/__tests__/integration/personas.integration.test.js`
- [X] T024 [P] [US3] Add one consolidated concurrency lane for same-persona double delete, same-date concurrent updates, clock skew handling, and 20+ user concurrency proof in `public/src/__tests__/integration/personas.integration.test.js` and `public/src/__tests__/integration/availability-marking.integration.test.js`

### Implementation for User Story 3

- [X] T025 [US3] Fix stale active-persona selection, deleted-target action recovery, and concurrent reconciliation behavior in `public/src/App.jsx` and `public/src/hooks/useAvailability.js`

**Checkpoint**: Active persona switching remains coherent under concurrent updates.

---

## Phase 8: User Story 5 - Mobile Gesture & Touch Responsiveness (Priority: P2)

**Goal**: Validate touch responsiveness with minimal automation and small targeted fixes only when a real regression exists.

**Independent Test**: Tap date cells and persona controls on mobile and confirm visual feedback is immediate and target sizes remain usable.

### Tests for User Story 5

- [X] T026 [P] [US5] Reduce touch regression coverage to one focused lane in `public/src/components/__tests__/Mobile.integration.test.jsx` and `public/src/components/__tests__/CalendarCell.test.jsx`

### Implementation for User Story 5

- [X] T027 [US5] Fix any tap-target or touch-feedback regressions in `public/src/components/CalendarGrid.jsx` and `public/src/index.css`

**Checkpoint**: Touch responsiveness is confirmed without redundant automation.

---

## Phase 9: User Story 6 - Mobile Information Hierarchy (Priority: P2)

**Goal**: Confirm users can immediately understand the screen hierarchy and next actions on mobile.

**Independent Test**: A first-time user can identify the active persona, current month, and next action from the top of the mobile view.

### Implementation for User Story 6

- [X] T028 [US6] Fix any remaining top-of-screen hierarchy or month-navigation clarity issues in `public/src/App.jsx`, `public/src/components/MobileHeader.jsx`, and `public/src/components/MonthNavigation.jsx`
- [X] T029 [US6] Record the information hierarchy smoke checklist in `specs/007-multi-user-sync-mobile-ux/quickstart.md`

**Checkpoint**: Mobile hierarchy is explicit and scannable.

---

## Phase 10: User Story 7 - Mobile Keyboard & Accessibility (Priority: P3)

**Goal**: Retain only the accessibility checks that protect real form and interaction regressions.

**Independent Test**: Tab through key controls, confirm labels and focus states are usable, and spot-check screen reader announcements for core flows.

### Tests for User Story 7

- [X] T030 [P] [US7] Keep one focused accessibility regression lane in `public/src/components/__tests__/Mobile.integration.test.jsx` and `public/src/components/__tests__/PersonaOnboarding.test.jsx`

### Implementation for User Story 7

- [X] T031 [US7] Fix any remaining accessibility gaps in `public/src/components/PersonaOnboarding.jsx`, `public/src/components/CalendarGrid.jsx`, and `public/src/components/MobilePersonaSelector.jsx`
- [X] T032 [US7] Record the manual keyboard and screen-reader smoke checklist in `specs/007-multi-user-sync-mobile-ux/quickstart.md`

**Checkpoint**: Accessibility-critical interactions are protected without creating a large new test surface.

---

## Phase 11: Performance & Release Gate Proofs

**Purpose**: Produce explicit proof for the measurable release criteria that remain in the spec.

- [X] T033 [P] Measure and record final bundle size proof for SC-011 in `specs/007-multi-user-sync-mobile-ux/quickstart.md`
- [X] T034 [P] Run and record Lighthouse mobile accessibility proof for SC-012 in `specs/007-multi-user-sync-mobile-ux/quickstart.md`
- [X] T035 [P] Verify and record layout-stability / CLS proof for SC-013 in `specs/007-multi-user-sync-mobile-ux/quickstart.md`

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Finish the release gates and operational documentation required to call Spec 007 complete.

- [X] T036 [P] Run the retained closeout validation commands from `package.json` and record the results in `specs/007-multi-user-sync-mobile-ux/quickstart.md`
- [X] T037 Update supported local workflow and troubleshooting guidance in `README.md` and `README_START_HERE.md`
- [X] T038 Update release notes for Spec 007 in `CHANGELOG.md`
- [X] T039 Add rollback and post-deployment monitoring notes to `README.md`
- [X] T040 Finalize release-gate completion status and summary metrics in `specs/007-multi-user-sync-mobile-ux/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user-story closeout work
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Performance Proofs (Phase 11)**: Depends on relevant implementation stability
- **Polish (Phase 12)**: Depends on all desired user-story closeout phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts first after Foundational because sync correctness is the highest release risk
- **User Story 2 (P1)**: Starts after Foundational and can run in parallel with US1 once the ledger is normalized
- **User Story 4 (P1)**: Starts after Foundational and should follow immediately behind US1/US2 if product defects remain visible on mobile
- **User Story 8 (P2)**: Starts after US1 because offline recovery depends on stable sync behavior
- **User Story 3 (P2)**: Starts after US2 because active-persona fallback depends on stable persona reconciliation
- **User Story 5 (P2)** and **User Story 6 (P2)**: Start after US4 because they refine the mobile experience already shipped
- **User Story 7 (P3)**: Starts after US4/US5/US6 because it validates the final mobile interaction layer

### Within Each User Story

- Retained tests should be narrowed before new bugfixes are finalized
- Fixes should stay local to the affected files
- Story-specific smoke guidance should be recorded before the story is considered complete

### Parallel Opportunities

- `T003`, `T005`, and `T006` can run in parallel after `T001` and `T002`
- `T007` and `T008` can run in parallel
- `T011` can run in parallel with US1 regression work after Phase 2
- `T018`, `T019`, and `T020` can run in parallel
- `T033`, `T034`, and `T035` can run in parallel once implementation is stable
- `T036`, `T037`, and `T038` can run in parallel once implementation is stable

---

## Parallel Example: User Story 1

```bash
# Launch the two retained regression lanes together:
Task: "Consolidate sync and date-persistence regression coverage in public/src/hooks/__tests__/useAvailability.test.js"
Task: "Keep one end-to-end availability sync regression lane in public/src/__tests__/integration/availability-marking.integration.test.js"
```

## Parallel Example: User Story 8

```bash
# Launch offline regression tasks together:
Task: "Consolidate offline queue and retry coverage in public/src/hooks/__tests__/useOfflineQueue.test.js and public/src/hooks/__tests__/usePolling.test.js"
Task: "Keep one cross-layer offline recovery regression lane in public/src/hooks/__tests__/hooksIntegration.test.js"
```

---

## Implementation Strategy

### MVP Closeout First

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Complete Phase 4: User Story 2
5. Complete Phase 5: User Story 4
6. **STOP and VALIDATE**: Confirm the core sync + persona + mobile clarity flows are release-stable

### Incremental Delivery

1. Fix local tooling and normalize the ledger
2. Close the highest-risk sync and persona regressions
3. Close the highest-visibility mobile issues
4. Validate offline recovery and concurrent switching
5. Finish accessibility, docs, and release gates

### Lean Team Strategy

With multiple developers:

1. One developer owns Phase 1-2 normalization
2. One developer owns sync/persona closeout (US1, US2, US3)
3. One developer owns mobile/offline/accessibility closeout (US4, US5, US6, US7, US8)
4. Rejoin for final release-gate validation and documentation

---

## Notes

- [P] tasks = different files, no dependencies
- Story labels map each task to a specific spec user story
- The closeout plan is intentionally lean: prefer updating retained tests over creating new suites
- Manual smoke checks are valid proof for presentation-only behaviors unless a known regression requires automation
- If a new production bug is discovered, add one narrow regression test at the lowest valuable layer

---

## Phase 13: Convergence

- [X] T041 Align active availability sync interval with closeout intent and re-record propagation proof per FR-001/FR-002/SC-001 (contradicts)
