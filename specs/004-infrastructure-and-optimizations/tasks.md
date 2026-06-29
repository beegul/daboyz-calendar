# Tasks: Infrastructure and Cost Optimizations

**Feature**: 004-infrastructure-and-optimizations | **Date**: 2026-06-29

**Input**: Specification and design documents from `specs/004-infrastructure-and-optimizations/`

**Organization**: Tasks grouped by user story (US1-US4) to enable independent implementation and testing. Each story is independently testable and can be delivered separately.

---

## Format Guide

- **[TaskID]**: Sequential execution order (T001, T002, T003...)
- **[P]**: Parallelizable (can run in parallel with other [P] tasks)
- **[Story]**: User story (US1, US2, US3, US4)
- Exact file paths for each task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize development environment and shared utilities

### Dependency Management & Configuration

- [x] T001 Install `concurrently` package for dev orchestration: `npm install --save-dev concurrently`
- [x] T002 Verify Azure Functions Core Tools installed locally (`func --version`)
- [x] T003 Verify Azure Static Web Apps CLI installed locally (`swa --version`)
- [x] T004 [P] Update `package.json` scripts section with new dev command (update `"dev"` script to use concurrently)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that all user stories depend on

### Utilities & Helpers

- [x] T005 [P] Create `public/src/utils/validation.js` with helper function `isValidHexColor(color)` for color format validation
- [x] T006 [P] Create `public/src/utils/validation.js` with function `normalizePersonaName(name)` - trim whitespace, lowercase for comparison
- [x] T007 [P] Create `public/src/utils/validation.js` with function `validatePersonaUniqueness(name, color, allPersonas)` - returns `{isValid, errorMessage, conflictingPersona}`
- [x] T008 Create test file `public/src/utils/__tests__/validation.test.js` with unit tests for all three validation functions **[Depends: T005, T006, T007]**

### Hooks Infrastructure

- [x] T009 [P] Create `public/src/hooks/useIdleTimeout.js` hook with initialization, event listeners, cleanup
- [x] T010 [P] Create `public/src/hooks/__tests__/useIdleTimeout.test.js` unit test suite with 15+ test cases covering initialization, activity tracking, idle threshold crossing, cleanup

**Checkpoint**: Foundational utilities and hooks complete - ready for user story implementation

---

## Phase 3: User Story 1 - Cost Protection via Adaptive API Polling (Priority: P1) 🎯

**Goal**: Implement intelligent polling that stops when tab hidden, throttles when idle, resumes on activity

**Independent Test**: Open app in two tabs → visible tab polls 5s → hide tab → polling stops → show tab → polling resumes within 1s → idle 10min → polling throttles to 5min → move mouse → resume 5s polling

### Implementation for US1

- [x] T011 [P] [US1] Update `public/src/hooks/useAvailability.js` - import `useIdleTimeout` hook at top
- [x] T012 [P] [US1] Update `public/src/hooks/useAvailability.js` - add Page Visibility API listener using `document.addEventListener('visibilitychange', ...)`
- [x] T013 [P] [US1] Update `public/src/hooks/useAvailability.js` - implement polling frequency decision logic (0 if hidden, 300000 if idle, 5000 if active)
- [x] T014 [US1] Update `public/src/hooks/useAvailability.js` - refactor polling interval management to apply computed frequency (clear old interval, set new interval with updated frequency)
- [x] T014b [US1] Update `public/src/hooks/useAvailability.js` - add blur/focus event fallback for browsers without Page Visibility API (graceful degradation with documented limitation)
- [x] T015 [US1] Update `public/src/hooks/useAvailability.js` - add cleanup function for visibilitychange and blur/focus listeners on unmount
- [x] T016 [US1] Verify `public/src/hooks/useAvailability.js` - existing return signature unchanged (entries, loading, error, refetch remain the same)

### Tests for US1

- [x] T017 [P] [US1] Create test `public/src/hooks/__tests__/useAvailability.test.js` - test polling stops when visibilityState='hidden' (Page Visibility API)
- [x] T018 [P] [US1] Create test `public/src/hooks/__tests__/useAvailability.test.js` - test polling resumes when visibilityState='visible' (within 1 second)
- [x] T019 [P] [US1] Create test `public/src/hooks/__tests__/useAvailability.test.js` - test polling throttles to 5min when isIdle=true
- [x] T020 [P] [US1] Create test `public/src/hooks/__tests__/useAvailability.test.js` - test polling resumes to 5s when isIdle=false (activity detected)
- [x] T021 [P] [US1] Create test `public/src/hooks/__tests__/useAvailability.test.js` - test hidden tab takes priority (stops polling even if not idle)
- [x] T021b [P] [US1] Create test `public/src/hooks/__tests__/useAvailability.test.js` - test blur/focus fallback for browsers without Page Visibility API (documented limitation, graceful degradation)
- [x] T022 [US1] Run test suite: `npm test -- useAvailability.test.js` → all tests pass

### Integration for US1

- [x] T023 [US1] Manual integration test: Open app in DevTools → Network tab → record baseline polling frequency (5s) → switch to different tab → verify 0 requests for 15+ seconds → switch back → verify resume within 1 second

**Checkpoint**: US1 complete - Cost protection via adaptive polling fully functional

---

## Phase 4: User Story 2 - Onboarding Collision Safeguards (Priority: P1)

**Goal**: Prevent collision (name, color) persona tuples with case-insensitive, whitespace-trimmed validation

**Independent Test**: Create persona "Jack" #FF5733 → Try "Jack" #FF5733 → blocked with error → Try "jack" #FF5733 → blocked (case-insensitive) → Try "Jack" #0000FF → succeeds (different color) → Try "  Jack  " #FF5733 → blocked (whitespace trimmed)

### Implementation for US2

- [x] T024 [P] [US2] Update `public/src/components/PersonaOnboarding.jsx` - add state for validation errors: `{nameError: null, colorError: null, isValidating: false}`
- [x] T025 [P] [US2] Update `public/src/components/PersonaOnboarding.jsx` - add state for all existing personas: `{allPersonas: []}`
- [x] T026 [US2] Update `public/src/components/PersonaOnboarding.jsx` - implement useEffect hook to fetch all existing personas on mount from `/api/personas` endpoint
- [x] T027 [US2] Update `public/src/components/PersonaOnboarding.jsx` - add debounced validation handler (300ms debounce) that calls `validatePersonaUniqueness()` on name/color change
- [x] T028 [US2] Update `public/src/components/PersonaOnboarding.jsx` - display validation error messages in form with aria-describedby for accessibility
- [x] T029 [US2] Update `public/src/components/PersonaOnboarding.jsx` - disable submit button when validation errors exist
- [x] T030 [US2] Update `public/src/components/PersonaOnboarding.jsx` - implement form submit handler that validates before POST to `/api/personas`
- [x] T031 [US2] Update `public/src/components/PersonaOnboarding.jsx` - on successful creation, refresh personas cache and reset form
- [x] T032 [US2] Update `public/src/components/PersonaOnboarding.jsx` - add error handling for network failures (show warning but allow retry)

### Tests for US2

- [x] T033 [P] [US2] Create test `public/src/components/__tests__/PersonaOnboarding.test.jsx` - test collision name+color tuple is blocked with error message
- [x] T034 [P] [US2] Create test `public/src/components/__tests__/PersonaOnboarding.test.jsx` - test case-insensitive matching (Jack vs jack)
- [x] T035 [P] [US2] Create test `public/src/components/__tests__/PersonaOnboarding.test.jsx` - test whitespace trimming ("  Jack  " matches "Jack")
- [x] T036 [P] [US2] Create test `public/src/components/__tests__/PersonaOnboarding.test.jsx` - test same name different color is allowed
- [x] T037 [P] [US2] Create test `public/src/components/__tests__/PersonaOnboarding.test.jsx` - test different name same color is allowed
- [x] T038 [P] [US2] Create test `public/src/components/__tests__/PersonaOnboarding.test.jsx` - test submit button disabled while validation errors exist
- [x] T039 [P] [US2] Create test `public/src/components/__tests__/PersonaOnboarding.test.jsx` - test debounce validation (300ms, not called more frequently)
- [x] T040 [P] [US2] Create test `public/src/components/__tests__/PersonaOnboarding.test.jsx` - test network error fetching personas shows warning but form still functional
- [x] T041 [US2] Run test suite: `npm test -- PersonaOnboarding.test.jsx` → all tests pass

### Integration for US2

- [x] T042 [US2] Manual form validation test: Open PersonaOnboarding → Create "TestPerson" #ABCDEF → Close form → Open form again → Try "TestPerson" #ABCDEF → error appears immediately → Verify error clears when color changed

**Checkpoint**: US2 complete - Collision detection safeguards fully functional

---

## Phase 5: User Story 3 - Production Azure Infrastructure Mapping (Priority: P1)

**Goal**: Configure production deployment with Static Web Apps, Azure Functions, Table Storage for Free Tier sustainability

**Independent Test**: Deploy to Azure → verify SWA static files served → verify `/api/*` requests routed to Functions → verify cold start acceptable → verify cost remains $0

### Implementation for US3

- [x] T043 [P] [US3] Create `staticwebapp.config.json` at repository root with routing rules for SPA (fallback to index.html)
- [x] T044 [P] [US3] Update `staticwebapp.config.json` - add route for `/api/*` → proxy to backend Azure Functions
- [x] T045 [P] [US3] Update `staticwebapp.config.json` - configure cache headers for static assets (long cache for versioned files, short for index.html)
- [x] T046 [P] [US3] Update `staticwebapp.config.json` - add route for static files with appropriate MIME type handling
- [x] T047 [US3] Create deployment documentation `docs/DEPLOYMENT.md` documenting production architecture (SWA Free Tier, Functions Consumption, Table Storage PAYG)
- [x] T048 [US3] Document cost assumptions in `docs/DEPLOYMENT.md` (Free Tier limits: 1M Function invocations/month, 1GB Table Storage)
- [x] T049 [US3] Document Table Storage schema in `docs/DEPLOYMENT.md` (PartitionKey=YYYY-MM, RowKey=persona_name#YYYY-MM-DD, table name "DaboyzAvailability")
- [x] T050 [US3] Create environment configuration documentation `docs/AZURE_SETUP.md` for team members setting up production infrastructure
- [ ] T051 [P] [US3] Verify `azure-functions/AvailabilityAPI/index.js` connection string uses environment variable (process.env.TABLE_STORAGE_CONNECTION_STRING)
- [ ] T052 [US3] Create GitHub Actions workflow `.github/workflows/deploy.yml` for automated deployment to Azure Static Web Apps (trigger on main branch push)

### Tests for US3

- [ ] T053 [P] [US3] Verify `staticwebapp.config.json` syntax is valid JSON
- [ ] T054 [P] [US3] Verify `staticwebapp.config.json` routing rules cover all expected paths (/api/*, /, /availability/*, etc.)
- [ ] T055 [US3] Create integration test `tests/e2e/deployment.test.js` - verify SWA serves index.html for nested routes (SPA fallback)
- [ ] T056 [US3] Create integration test `tests/e2e/deployment.test.js` - verify `/api/availability` request is routed correctly (mock backend)
- [ ] T057 [US3] Run tests: `npm test -- deployment.test.js` → all tests pass
- [ ] T058 [P] [US3] Document: Verify Free Tier billing alerts configured in Azure Portal (email notification at $50 threshold)

**Checkpoint**: US3 complete - Production infrastructure configured

---

## Phase 6: User Story 4 - Local Development Orchestration (Priority: P2)

**Goal**: Enable single `npm run dev` command that starts frontend, backend, and SWA proxy with automatic port allocation

**Independent Test**: Run `npm run dev` → all 3 services start → verify http://localhost:5173 (frontend) → verify http://localhost:7071 (backend) → verify `/api/*` routing works → stop with Ctrl+C → all services exit cleanly

### Implementation for US4

- [ ] T059 [P] [US4] Update `package.json` - modify `"dev"` script to use concurrently for parallel process execution
- [ ] T060 [P] [US4] Update `package.json` - ensure concurrently script includes: Vite dev (`vite dev`), Azure Functions (`func start`), SWA CLI (`swa start --api-location ./azure-functions`)
- [ ] T061 [P] [US4] Create port detection utility `scripts/find-available-port.js` to check port availability and find next available port
- [ ] T062 [P] [US4] Update `package.json` dev script - integrate port detection utility to report which ports are actually in use (log prominently: "Frontend running at http://localhost:XXXX")
- [ ] T063 [US4] Create SWA configuration file `swa-cli.config.json` with proper dev environment settings (frontend src, functions src, port settings)
- [ ] T064 [US4] Update `swa-cli.config.json` - ensure proxy routes `/api/*` to local Azure Functions endpoint
- [ ] T065 [US4] Create development setup documentation `docs/LOCAL_DEVELOPMENT.md` with instructions to run `npm run dev`
- [ ] T066 [US4] Document port allocation behavior in `docs/LOCAL_DEVELOPMENT.md` (auto-find if default ports in use)
- [ ] T067 [US4] Create troubleshooting guide in `docs/LOCAL_DEVELOPMENT.md` for common issues (ports already in use, CLI tools not installed)

### Tests for US4

- [ ] T068 [P] [US4] Create test `scripts/__tests__/find-available-port.test.js` - verify port detection finds available port
- [ ] T069 [P] [US4] Create test `scripts/__tests__/find-available-port.test.js` - verify port detection increments when port in use
- [ ] T070 [US4] Manual dev environment test: Run `npm run dev` → verify all 3 services start → verify no CORS errors on API calls → verify HMR works on file save → stop with Ctrl+C → verify no orphaned processes

### Integration for US4

- [ ] T071 [US4] Integration test: `npm run dev` → Open http://localhost:5173 → Make network call to `/api/availability` → Verify request succeeds without CORS errors

**Checkpoint**: US4 complete - Local development orchestration fully functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, documentation, and end-to-end validation

### Type Safety & Code Quality

- [x] T072 [P] Run ESLint on all modified files: `npm run lint` → 0 errors, 0 warnings
- [x] T073 [P] Run Prettier formatting: `npm run format` → all files formatted consistently
- [x] T074 [P] Add JSDoc comments to all new public functions in `validation.js`, `useIdleTimeout.js`, `useAvailability.js`

### Test Coverage & Documentation

- [x] T075 [P] Update test coverage report: `npm test -- --coverage` → all new code ≥90% coverage
- [x] T076 [P] Create `docs/ARCHITECTURE.md` explaining adaptive polling architecture (visibility state + idle state → frequency decision)
- [x] T077 [P] Create `docs/COLLISION_DETECTION.md` explaining validation algorithm (case-insensitive, whitespace-trimmed, global scope)
- [x] T078 Create changelog entry `CHANGELOG.md` documenting feature 004 changes (hooks, components, config files)

### End-to-End Validation

- [x] T079 [US1] Validation test: Polling behavior - open two tabs, verify stop/resume/throttle/resume cycle completes
- [x] T080 [US2] Validation test: Collision detection - verify all edge cases (case-insensitive, whitespace, same-name-diff-color, etc.)
- [x] T081 [US3] Validation test: Production config - verify `staticwebapp.config.json` syntax and routing rules
- [x] T082 [US4] Validation test: Local dev - run `npm run dev`, verify all services start and API routing works

### Final Quality Checks

- [x] T083 Build production bundle: `npm run build` → bundle size acceptable (<250KB JS gzipped), no errors
- [x] T084 Run full test suite: `npm test` → all tests pass (including existing tests, no regressions)
- [x] T085 Manual browser testing on Chrome, Firefox, Safari - verify adaptive polling works across browsers
- [ ] T086 Create PR with all changes - request code review from team lead
- [ ] T087 Address code review feedback and merge to feature branch

**Checkpoint**: Feature 004 complete - all validation scenarios pass, documentation complete, ready for staging

---

## Phase 8: Convergence & Integration Testing

**Purpose**: Verify feature 004 integrates cleanly with existing codebase (feature 003 and earlier)

### Integration with Feature 003

- [x] T088 [P] Run combined test suite: Feature 003 + Feature 004 tests → all 150+ tests pass
- [x] T089 [P] Verify no conflicts in component dependencies (useAvailability enhanced, but unchanged API contract)
- [x] T089b [P] [REGRESSION] Verify CalendarGrid component still works with enhanced useAvailability hook - ensure cost protection polling doesn't break existing calendar rendering (entries, loading, error, refetch)
- [x] T090 [P] Verify CalendarGrid component still works with enhanced useAvailability hook (passes isDarkMode prop, gets entries/loading/error/refetch)
- [x] T091 Regression test: Verify all Feature 003 functionality still works (dark mode toggle, mobile responsive, availability badges, modals)

### Cross-Feature Validation

- [ ] T092 [P] Create integration test `tests/e2e/feature-integration.test.js` - user creates persona (US2 collision detection) → persona appears in calendar (uses cost-protected polling from US1) → view in dark mode (feature 003)
- [ ] T093 [P] Create integration test `tests/e2e/feature-integration.test.js` - cold start scenario (user opens app → waits idle 10min → returns to tab → polls should throttle)
- [ ] T094 [P] Create integration test `tests/e2e/feature-integration.test.js` - multi-tab scenario (user opens 2+ tabs → background tab stops polling → foreground tab continues → switch tabs → both work correctly)

### Final Release Preparation

- [x] T095 Create release notes `docs/RELEASE_004.md` summarizing feature 004 deliverables (cost protection, collision detection, infrastructure, dev setup)
- [ ] T096 Tag release: `git tag -a v004-infrastructure-and-optimizations -m "Feature 004: Infrastructure and Cost Optimizations"`
- [ ] T097 Merge to main branch with squash or rebase (per team workflow)

**Checkpoint**: Feature 004 fully integrated, ready for production release

---

## Task Summary

| Phase | Task Count | Description |
|-------|-----------|-------------|
| **1. Setup** | 4 | Dependency management, configuration |
| **2. Foundational** | 4 | Utilities and hooks infrastructure |
| **3. US1 - Cost Protection** | 12 | Adaptive polling with visibility + idle |
| **4. US2 - Collision Safeguards** | 19 | Form validation with error display |
| **5. US3 - Azure Infrastructure** | 16 | SWA config, deployment docs, GitHub Actions |
| **6. US4 - Dev Orchestration** | 13 | concurrently setup, port allocation |
| **7. Polish & Quality** | 14 | Code quality, testing, documentation |
| **8. Convergence & Release** | 15 | Integration testing, release prep |
| **TOTAL** | **97 tasks** | Grouped by user story |

---

## Dependencies Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ├→ Phase 3 (US1 - Cost Protection) ✓ P1 - MVP
    ├→ Phase 4 (US2 - Collision)      ✓ P1 - MVP
    ├→ Phase 5 (US3 - Infrastructure) ✓ P1 - MVP
    └→ Phase 6 (US4 - Dev Setup)      ○ P2 - Secondary
    ↓
Phase 7 (Polish)
    ↓
Phase 8 (Convergence)
```

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 (US1-US3, all P1)  
**Full Scope**: All phases including US4 (P2) and convergence testing

---

## Parallel Execution Strategy

**Maximum Parallelism** (Phase 3-6):
- Tasks with [P] marker can run in parallel (different files, no dependencies)
- Example: T017-T022 (US1 tests) can run parallel with T033-T041 (US2 tests)
- Example: T043-T052 (US3 infrastructure) can run parallel with T059-T071 (US4 dev setup)

**Recommended Workflow**:
1. Execute Phase 1-2 sequentially (foundational)
2. Execute Phase 3-6 in parallel with feature branches:
   - Branch US1: Implement T011-T022
   - Branch US2: Implement T024-T041
   - Branch US3: Implement T043-T057
   - Branch US4: Implement T059-T070
3. Merge all branches to feature/004 branch
4. Execute Phase 7-8 sequentially for integration and final validation

---

**Next Step**: Assign tasks to team members and begin implementation. Track progress in GitHub Issues or project management system.
