# Implementation Plan: Post-Deployment Polish

**Branch**: `005-post-deployment-polish` | **Date**: 2026-06-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification - remove mock data label, fix page flicker, add persona deletion

---

## Summary

This feature addresses three post-deployment UX polish issues critical for user confidence and app reliability:

1. **Remove misleading "mock data" label** - Users need confidence their data persists to real backend, not localStorage fallback
2. **Eliminate page flicker on refresh** - Implement hybrid hydration (localStorage first, API background) for smooth loading
3. **Enable persona deletion** - Users can remove personas and cascade-delete all associated calendar entries atomically

Technical approach: Client-side hydration strategy + aggressive cross-device sync (2s polling) + atomic API endpoint for cascade deletion.

---

## Technical Context

**Language/Version**: React 19.2.7 (frontend), Python 3.11 (Azure Functions backend)

**Primary Dependencies**: 
- Frontend: React, Vite, localStorage
- Backend: Azure Functions (Python), Azure Table Storage, azure-data-tables 12.7.0

**Storage**: Azure Table Storage (DaboyzAvailability table)  
- Personas: Embedded in availability entries (name, color composite key)
- Availability: PartitionKey=YYYY-MM, RowKey=persona_name#YYYY-MM-DD

**Testing**: Jest 29.7.0 (frontend, 190 tests passing), no Python API tests yet

**Target Platform**: Web (React app + REST API), mobile-responsive

**Project Type**: Web application (React + Python serverless API)

**Performance Goals**:
- Page render: <1s (from localStorage cache)
- Cross-device sync: <3s (from API polling)
- Delete operation: <2s (atomic endpoint)
- Mock label removal: immediate (removes DOM element)
- Page flicker: zero (hydration prevents state shifts)

**Constraints**:
- Must stay within Azure Free Tier (<250GB storage, 100 table transactions/5min)
- No new infrastructure (no WebSocket, no message queue)
- Offline fallback maintained (localStorage must sync)
- 100% accessibility compliance (ARIA live regions)

**Scale/Scope**:
- Users: Handful of mates (< 10 concurrent)
- Personas: < 10 per calendar
- Dates: ~365 per year per persona
- Implementation: 3 independent features

---

## Constitution Check

**Gate Status**: ✅ PASS (pre-Phase 1)

Verification against project constitution:

### I. Code Quality is Non-Negotiable
- ✅ **Commitment**: All new code follows existing patterns (useAvailability hook pattern, component structure)
- ✅ **Approach**: JSX/Python formatting via Prettier/Black (existing setup)
- ✅ **Testing**: New components must have unit tests (localStorage hydration, delete flow, offline warning)
- ✅ **Debt**: None planned; all changes incremental

### II. Test Standards Drive Development
- ✅ **Frontend Tests**: Jest tests for DeletePersonaModal, offline detection, hydration logic
- ✅ **Integration Tests**: E2E persona deletion flow (create → delete → verify cascade)
- ✅ **Coverage**: Maintain >90% on new code (current: 190 tests passing)
- ✅ **CI/CD**: All tests must pass before GitHub Actions deploy

### III. User Experience Consistency is Mandatory
- ✅ **Design Pattern**: Three-dot menu matches existing persona UI (consistent with calendar cards)
- ✅ **Confirmation Modal**: Uses existing modal patterns (PersonaOnboarding modal as reference)
- ✅ **Error States**: Error messages match existing error banner style
- ✅ **Accessibility**: ARIA live regions + aria-busy follow WAI-ARIA patterns

### IV. Performance Requirements are Built In
- ✅ **Page Load**: Hydration from localStorage prevents render flicker (no extra fetch)
- ✅ **Delete Operation**: Atomic endpoint prevents multiple round-trips
- ✅ **Polling**: 2s aggressive polling + immediate refresh triggers (documented cost/benefit)
- ✅ **Bundle Size**: No new dependencies; all uses existing libraries

### V. Simplicity and Incremental Improvement
- ✅ **Scope**: 3 independent, incremental improvements (not a rewrite)
- ✅ **Dependencies**: Minimal - reuses existing hooks (useAvailability) and components
- ✅ **User Value**: Each feature solves a real problem (UX polish, data confidence, data management)
- ✅ **No Bloat**: No new UI patterns or complexity; leverages existing design system

**Re-check After Phase 1**: Will verify design artifacts align with constitution before Phase 2 tasks.

## Project Structure

### Documentation (Feature 005)

```text
specs/005-post-deployment-polish/
├── spec.md              # ✅ Feature specification (COMPLETE)
├── plan.md              # ✅ This file (OUTPUT OF speckit.plan)
├── research.md          # ✅ Phase 0 research (OUTPUT OF speckit.plan)
├── data-model.md        # 🔄 Phase 1 (NEXT)
├── contracts/           # 🔄 Phase 1 (NEXT)
│   └── delete-endpoint.md
├── quickstart.md        # 🔄 Phase 1 (NEXT)
├── checklists/
│   └── requirements.md  # ✅ Spec quality checklist
└── tasks.md             # ⏳ Phase 2 (via speckit.tasks AFTER plan approved)
```

### Source Code Structure (React Frontend)

```text
public/src/
├── components/
│   ├── PersonaOnboarding.jsx          # Existing - modal for persona creation
│   ├── Calendar.jsx                   # Existing - main calendar view
│   ├── DeletePersonaModal.jsx         # 🆕 Phase 2 - delete confirmation
│   └── OfflineWarning.jsx             # 🆕 Phase 2 - offline banner
├── hooks/
│   ├── useAvailability.js             # ✅ ALREADY UPDATED - real-time sync
│   ├── useIdleTimeout.js              # Existing - idle tracking
│   └── useHydration.js                # 🆕 Phase 2 - localStorage → React state
├── utils/
│   ├── storage.js                     # Existing - localStorage helpers
│   ├── api-client.js                  # Existing - API calls
│   └── conflict-detection.js          # Existing - sync conflict logic
├── App.jsx                            # Existing - main app component
└── App.css                            # Existing - styling

tests/
├── components/
│   ├── DeletePersonaModal.test.js     # 🆕 Phase 2
│   └── OfflineWarning.test.js         # 🆕 Phase 2
├── hooks/
│   ├── useHydration.test.js           # 🆕 Phase 2
│   └── useAvailability.test.js        # ✅ Existing (update if needed)
└── integration/
    └── delete-persona-flow.test.js    # 🆕 Phase 2 - E2E test
```

### Source Code Structure (Python Backend)

```text
api/
├── function_app.py                    # ✅ UPDATED - added /api/personas endpoint
├── routes/
│   ├── users.py                       # Existing - GET/POST /api/users
│   ├── availability.py                # Existing - GET/POST/DELETE /api/availability
│   ├── personas.py                    # ✅ UPDATED - added GET /api/personas (alias for users)
│   └── delete_persona.py              # 🆕 Phase 2 - DELETE /api/personas/{name}
├── models/
│   └── table_storage.py               # Existing - Table Storage client
└── requirements.txt                   # Existing - Python dependencies
```

---

## Implementation Phases (Roadmap)

### Phase 1: Design (THIS PLAN)
- ✅ Research: Technical approach finalized
- 🔄 Data Model: Entity definitions and relationships
- 🔄 Contracts: API endpoint specifications
- 🔄 Quickstart: End-to-end test scenarios
- 🔄 Constitution Check: Re-validation post-design

### Phase 2: Tasks (via `/speckit.tasks`)
- Backend: Implement DELETE /api/personas/{name} endpoint
- Frontend: Implement useHydration hook (localStorage → React)
- Frontend: Build DeletePersonaModal component
- Frontend: Build OfflineWarning banner component
- Frontend: Remove/hide mock data label
- Tests: Unit tests for new components and hooks
- Tests: Integration tests for deletion flow
- Tests: E2E test for page flicker fix
- Deployment: GitHub Actions builds and deploys to Azure

### Phase 3: Validation & Release
- Manual testing on phone + PC (cross-device sync)
- Performance testing (page render time, API latency)
- Accessibility audit (ARIA, keyboard navigation)
- Code review + PR approval
- Merge to main and deploy to production

---

## Related Features & Dependencies

| Feature | Status | Dependency |
|---------|--------|-----------|
| Feature 004: Infrastructure & Cost Optimizations | ✅ Complete | Base for this feature; provides API + storage |
| Real-Time Cross-Device Sync | ✅ Complete | Already implemented in commit 7eca582 |
| Feature 005: Post-Deployment Polish | 🔄 In Progress | This feature (planning phase) |

---

## Next Steps

1. ✅ **Phase 0 Complete**: Research document finalized
2. 🔄 **Phase 1 Next**: Generate data-model.md, contracts/, quickstart.md
3. 🔄 **Phase 1 Next**: Update agent context via speckit.agent-context.update
4. 🔄 **Phase 1 Next**: Re-validate Constitution Check
5. ⏳ **Phase 2 Next**: Run `/speckit.tasks` to generate task breakdown
6. ⏳ **Implementation**: Execute tasks and deploy to production

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
