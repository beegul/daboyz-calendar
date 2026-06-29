# Implementation Tasks: Dynamic User Personas

**Feature**: Dynamic User Personas  
**Total Tasks**: 22  
**Status**: Ready for Implementation  
**Created**: 2026-06-29  

---

## Overview

This document breaks down the implementation plan into 22 actionable tasks organized by phase and user story. Each task includes acceptance criteria, file paths, and dependencies.

### Task ID Format
- **T001-T005**: Phase 1 (Setup & Infrastructure)
- **T006-T010**: Phase 2 (Foundational - Shared across all stories)
- **T011-T016**: Phase 3 (User Story 1 - Create Custom Persona, P1)
- **T017-T020**: Phase 4 (User Story 2 - Mark Availability with Custom Persona, P1)
- **T021-T022**: Phase 5 (User Story 3 - Switch/Create New Persona, P2)
- (Polish tasks handled in review/QA phase)

### Parallelization
- Frontend tasks (T011-T020): Can start after T010 complete
- Backend tasks (T006-T010): Can start immediately, parallel to frontend
- Integration tasks (T021-T022): Depend on all frontend + backend tasks

---

## Phase 1: Setup & Infrastructure

- [ ] T001 Create feature branch and update copilot-instructions.md with plan reference
- [ ] T002 Add jest test setup file for persona components (mock localStorage, window.matchMedia)
- [ ] T003 Create test fixtures for personas and availability data in tests/fixtures/personas.json
- [ ] T004 Update .babelrc.cjs to handle new component imports (no changes needed, verify)
- [ ] T005 Verify vite.config.js proxy routes work for new /api/availability/personas endpoint

**Dependencies**: None (all can run in parallel)

**Acceptance Criteria (T001-T005)**:
- ✅ copilot-instructions.md references specs/002-dynamic-user-personas/plan.md
- ✅ Jest test setup includes localStorage mock (getItem, setItem, removeItem)
- ✅ Test fixtures available: personas.json with 3-5 test personas + availability entries
- ✅ Babel config parses JSX from new components without errors
- ✅ Vite proxy handles /api/availability/personas → localhost:7071/api/availability/personas

---

## Phase 2: Foundational Tasks (Backend & Data Model)

- [ ] T006 [P] Update api/models/availability.py: add validation for name (1-50 chars, alphanumeric+spaces), color (hex format), update AvailabilityEntry dataclass with name/color fields
- [ ] T007 [P] Update api/models/table_storage.py: change row key format from "{userId}-{date}" to "{name}#{color}#{date}", add method get_personas_for_month(month)
- [ ] T008 [P] Update api/routes/availability.py: modify POST handler to accept {name, color, date} body, update GET to return {name, color, date, timestamp}, update DELETE to use query params name/color/date
- [ ] T009 [P] Add new GET /api/availability/personas endpoint in api/function_app.py that returns distinct (name, color) tuples for a month
- [ ] T010 Update public/src/api/mock.js: extend mock storage to support {name, color, date} composite key schema instead of userId

**Dependencies**: T001-T005 must complete first (setup)

**Parallelization**: T006-T010 can all run in parallel

**Acceptance Criteria (T006-T010)**:
- ✅ api/models/availability.py validates names (1-50 chars, alphanumeric+spaces, no empty)
- ✅ api/models/availability.py validates colors (hex format #RRGGBB)
- ✅ Row key in Table Storage format: "{name}#{color}#{date}"
- ✅ get_personas_for_month() returns unique (name, color) tuples
- ✅ POST /api/availability accepts {name, color, date}, returns timestamp
- ✅ GET /api/availability returns {name, color, date, timestamp} entries
- ✅ DELETE /api/availability accepts ?name={name}&color={color}&date={date} query params
- ✅ GET /api/availability/personas endpoint exists, returns distinct personas
- ✅ Mock API extended: supports composite key, passes 11/11 API tests
- ✅ All changes backward compatible (no breaking changes to existing endpoints)

---

## Phase 3: User Story 1 - Create Custom Persona (P1)

### Story Goal
Users who navigate to the app for the first time can create their own persona by entering a name and selecting a color, without requiring pre-defined accounts.

### Independent Test
Open app for first time → Create persona "Sarah" + red color → Verify persona active in session → Persona persisted in localStorage

- [ ] T011 [P] Create public/src/components/PersonaOnboarding.jsx: modal form with name input (max 50 chars), HTML color picker, "Create Persona" button, validation (empty name blocked)
- [ ] T012 [P] Update public/src/App.jsx: add personaOnboardingVisible state, show PersonaOnboarding overlay when no personas exist, block calendar until persona created, initialize activePersona state
- [ ] T013 [P] Update public/src/hooks/useAvailability.js: change parameter from userId to persona {name, color}, update API calls to use new composite key schema
- [ ] T014 [P] Update public/src/api/client.js: change toggleAvailability(userId, date) to toggleAvailability(name, color, date), change getAvailability() response parsing for composite key
- [ ] T015 [P] Write unit tests for PersonaOnboarding.jsx: test name validation, color picker, form submission, state updates
- [ ] T016 [P] Write integration test: open app → create persona → verify localStorage "personas_storage" contains entry → verify "active_persona" set → verify calendar visible and interactive

**Dependencies**: T006-T010 must complete first (backend/data model)

**Parallelization**: T011-T016 can run in parallel (frontend development)

**Acceptance Criteria (T011-T016)**:
- ✅ PersonaOnboarding modal appears on first load
- ✅ Calendar blocked by overlay until persona created
- ✅ Name validation: 1-50 chars, alphanumeric+spaces only, empty rejected
- ✅ Color picker uses HTML `<input type="color">`
- ✅ Create button disabled until name non-empty
- ✅ On creation: overlay dismissed, calendar visible, persona stored in localStorage
- ✅ useAvailability hook uses {name, color} composite key
- ✅ API calls use new /api/availability endpoint with composite key
- ✅ Unit tests: form validation, state management, localStorage interaction
- ✅ Integration test: end-to-end onboarding flow passes
- ✅ 30-second onboarding achieved (< 30 seconds from open to marking first date)

---

## Phase 4: User Story 2 - Mark Availability with Custom Persona (P1)

### Story Goal
Users with a created persona can mark dates on the calendar and see their availability displayed in their chosen color.

### Independent Test
Create persona → Click date on calendar → Verify badge shows persona name + color → Click again → Verify badge removed → Refresh page → Verify data persisted

- [ ] T017 [P] Update public/src/components/CalendarGrid.jsx: change from userId param to persona {name, color}, pass persona data to AvailabilityBadge component, update click handler to call toggleAvailability(name, color, date)
- [ ] T018 [P] Update public/src/components/AvailabilityBadge.jsx: change from displaying userId to persona name, display badge in persona.color, add tooltip showing "Available - {persona.name}"
- [ ] T019 [P] Update public/src/App.jsx: pass activePersona {name, color} to CalendarGrid, update click handlers to use activePersona instead of selectedUserId
- [ ] T020 [P] Write integration test: create persona → mark 5 dates → verify badges show correct color + name → unmark 2 dates → verify removed → refresh → verify persisted

**Dependencies**: T011-T016 must complete (User Story 1)

**Parallelization**: T017-T020 can run in parallel

**Acceptance Criteria (T017-T020)**:
- ✅ CalendarGrid accepts persona {name, color} prop
- ✅ Click date creates availability entry with {name, color, date}
- ✅ Badge displays persona.name + colored background
- ✅ Badge tooltip shows "Available - {persona.name}"
- ✅ Click badge again removes availability (idempotent toggle)
- ✅ Data syncs to backend (if running)
- ✅ localStorage persists entries
- ✅ Page refresh restores all marked dates
- ✅ Integration test: mark/unmark/persist cycle passes
- ✅ Visual: badges correctly show persona color and name

---

## Phase 5: User Story 3 - Switch or Create New Persona (P2)

### Story Goal
Users can create additional personas or switch between existing personas to manage multiple identities on one device.

### Independent Test
Create 2+ personas → Switch between them → Verify each persona's distinct availability displayed → Create third persona → All 3 available in selector

- [ ] T021 Create public/src/components/PersonaSelector.jsx: dropdown showing all created personas, highlight active persona, "➕ New Persona" option at bottom to trigger creation form
- [ ] T022 Update public/src/App.jsx: replace UserSelector with PersonaSelector, update state management to track activePersona, handle persona creation/switching, remove DEFAULT_USERS initialization, remove UserLegend component entirely

**Dependencies**: T017-T020 must complete (User Story 2), but can start design earlier

**Parallelization**: T021-T022 can run in parallel with T017-T020

**Acceptance Criteria (T021-T022)**:
- ✅ PersonaSelector dropdown lists all created personas
- ✅ Active persona highlighted in dropdown
- ✅ "➕ New Persona" option opens PersonaOnboarding form
- ✅ Clicking persona in dropdown switches activePersona
- ✅ Calendar updates instantly when switching personas
- ✅ Each persona's availability shown/hidden appropriately
- ✅ Multiple personas stored in localStorage "personas_storage"
- ✅ UserLegend component completely removed
- ✅ No "Alice", "Bobby", "Carmen" hardcoded labels visible
- ✅ Header only shows persona dropdown + refresh button
- ✅ localStorage contains all personas: `[{name, color}, ...]`

---

## Phase 6: Integration & Testing

### Mock API Testing
- [ ] T023 Extend public/src/api/mock.js tests: verify composite key queries, multiple personas scenario, cross-persona availability isolation
- [ ] T024 Update public/src/__tests__/api/client.test.js: add tests for composite key parameter passing, persona-aware API calls

### Component Integration Tests
- [ ] T025 Integration test: PersonaOnboarding → CalendarGrid → PersonaSelector flow (create persona → mark dates → switch → mark different dates → switch back → verify all data intact)
- [ ] T026 Cross-device sync test (optional, requires backend): create personas on Device A → see on Device B (by (name, color) matching)

### Performance & Accessibility
- [ ] T027 Performance test: 10+ personas in dropdown, no lag on switch (< 50ms visual update)
- [ ] T028 Accessibility test: keyboard navigation (Tab through form, arrow keys in dropdown), screen reader labels on form inputs/buttons

### Browser Compatibility
- [ ] T029 Test color picker on Chrome, Firefox, Safari, Edge (native `<input type="color">` works)
- [ ] T030 Test responsive design: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)

**Dependencies**: All Phase 3-5 tasks must complete

**Acceptance Criteria (T023-T030)**:
- ✅ Mock API handles multiple personas per month
- ✅ Composite key queries return correct personas
- ✅ Personas isolated (marking dates for one doesn't affect another)
- ✅ API tests pass: 15+/15 (including new composite key tests)
- ✅ Integration test: complete onboarding → multi-persona flow passes
- ✅ Cross-device sync working (if backend available)
- ✅ No performance regression: dropdown smooth with 10+ personas
- ✅ Keyboard navigation works: form fillable via Tab + arrow keys
- ✅ Screen reader announces form labels, button purposes
- ✅ Color picker works on all modern browsers
- ✅ Responsive layouts render correctly on mobile/tablet/desktop

---

## Phase 7: Documentation & Review

- [ ] T031 Update specs/001-availability-calendar/README.md: document how Phase 2 changed availability schema from userId to (name, color)
- [ ] T032 Create public/README.md (frontend): document PersonaOnboarding, PersonaSelector components, localStorage schema
- [ ] T033 Create api/README.md (backend): document new row key format, GET /api/availability/personas endpoint, composite key validation
- [ ] T034 Update LOCAL_TESTING_GUIDE.md: add Dynamic Personas section with quickstart (create persona → mark dates → switch personas)
- [ ] T035 Code review: ensure linting passes (npm run lint), formatting correct (npm run format), no console errors

**Dependencies**: All Phase 3-6 tasks must complete

**Acceptance Criteria (T031-T035)**:
- ✅ README.md files document schema changes
- ✅ LOCAL_TESTING_GUIDE.md includes Dynamic Personas test scenarios
- ✅ npm run lint: 0 errors
- ✅ npm run format: no changes needed (code pre-formatted)
- ✅ npm run build: successful, no bundle size increase > 10%
- ✅ npm run test: all tests pass (60%+ coverage maintained/improved)
- ✅ No console errors in browser DevTools when using feature
- ✅ Commit messages clear and reference feature scope

---

## Task Dependencies Graph

```
Phase 1 (Setup): T001-T005
    ↓
Phase 2 (Foundational): T006-T010 [P] (parallel, 3-4 hours backend dev)
    ├↓
    Phase 3 (Story 1): T011-T016 [P] (parallel, 4-5 hours frontend dev)
    ├↓ (can start after T006-T010)
    Phase 4 (Story 2): T017-T020 [P] (parallel, 2-3 hours frontend dev)
    ├↓ (can start after T006-T010)
    Phase 5 (Story 3): T021-T022 [P] (parallel, 2-3 hours frontend dev)
    │
    Phase 6 (Integration): T023-T030 (2-3 hours testing)
    │
    Phase 7 (Docs): T031-T035 (1-2 hours documentation)
```

**Critical Path**:
T001-T005 → T006-T010 → T011-T016 → T017-T020 → T021-T022 → T023-T030 → T031-T035

**Estimated Timeline**:
- Setup: 0.5 hours
- Backend: 3-4 hours (parallel with frontend setup)
- Frontend (Stories 1-3): 8-11 hours (can run mostly in parallel after backend)
- Integration & Testing: 2-3 hours
- Documentation: 1-2 hours
- **Total**: 15-21 hours development + review

---

## Success Criteria (Feature Complete)

✅ **Functional**
- [ ] Persona creation form appears on first load
- [ ] Users can create personas with name + color
- [ ] Multiple personas can be created and stored
- [ ] Personas accessible via dropdown in header
- [ ] Switching personas updates calendar instantly
- [ ] Availability marked per-persona
- [ ] Users section completely removed
- [ ] Data persists across page refresh

✅ **Data Integrity**
- [ ] (name, color) composite key uniquely identifies personas
- [ ] Availability entries store {name, color, date, timestamp}
- [ ] Cross-device sync works by (name, color) matching
- [ ] No data loss during migration from Phase 1 → Phase 2

✅ **Code Quality**
- [ ] npm run lint: 0 errors
- [ ] npm run format: no changes (pre-formatted)
- [ ] npm run build: successful
- [ ] npm run test: ≥ 60% coverage
- [ ] No console errors in DevTools

✅ **UX/Accessibility**
- [ ] Keyboard navigation: form fillable, dropdown accessible
- [ ] Screen reader labels: inputs, buttons announced
- [ ] Color picker works on all browsers
- [ ] Responsive: mobile, tablet, desktop layouts correct
- [ ] Performance: persona switching < 50ms, dropdown smooth with 10+ personas

✅ **Documentation**
- [ ] README files updated
- [ ] LOCAL_TESTING_GUIDE updated with test scenarios
- [ ] API changes documented
- [ ] Component usage documented

---

## Sign-Off & Next Steps

### Ready to Implement ✅
This task breakdown is ready for implementation by a developer or pair. Each task includes:
- ✅ Specific file paths
- ✅ Clear acceptance criteria
- ✅ Dependency information
- ✅ Parallelization opportunities
- ✅ Estimated effort per phase

### Recommended Implementation Order
1. **Day 1 Morning**: T001-T010 (setup + backend, ~4-5 hours)
2. **Day 1 Afternoon**: T011-T020 (frontend Stories 1-2, ~6-8 hours)
3. **Day 2 Morning**: T021-T022 (Story 3, ~2-3 hours)
4. **Day 2 Afternoon**: T023-T030 (integration/testing, ~2-3 hours)
5. **Day 3 Morning**: T031-T035 (documentation/review, ~1-2 hours)

**Total Estimated**: 15-21 hours development + 2-3 hours review = 17-24 hours

### QA Validation
After implementation, QA should run the scenarios in [quickstart.md](./quickstart.md):
- Scenario 1: First-time onboarding
- Scenario 2: Mark/unmark availability
- Scenario 3: Create & switch personas
- Scenario 4: Users section removed
- Scenario 5: Cross-device sync (if backend available)
- Scenario 6: Color picker
- Scenario 7: Data validation
- Scenario 8: Performance

---

## Related Documents

- [Specification](./spec.md) - Feature requirements
- [Plan](./plan.md) - Implementation plan & architecture
- [Data Model](./data-model.md) - Entity definitions
- [API Contracts](./contracts/availability-api.md) - Endpoint specifications
- [Quickstart](./quickstart.md) - Validation test scenarios

---

**Tasks Generated**: 2026-06-29  
**Status**: ✅ READY FOR IMPLEMENTATION
