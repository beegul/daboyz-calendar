# Implementation Plan: Infrastructure and Cost Optimizations

**Feature**: 004-infrastructure-and-optimizations | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-infrastructure-and-optimizations/spec.md`

## Summary

Optimize Azure deployment architecture with cost protection mechanisms for Free Tier sustainability, implement intelligent API polling that adapts to tab visibility and user idle state, add collision safeguards during persona onboarding to prevent duplicate name+color combinations, and establish local development orchestration using SWA CLI proxy with concurrent tooling.

**Key Deliverables**:
- **Cost Protection**: Adaptive API polling using Page Visibility API (stop when tab hidden, throttle to 5min when idle for 10+ minutes)
- **Onboarding Safeguards**: Client-side validation for unique (name, color) tuples with case-insensitive name comparison and whitespace trimming
- **Local Development**: SWA CLI proxy configuration with concurrently for seamless backend + frontend orchestration
- **Azure Deployment**: Cost-optimized architecture leveraging Free Tier limits with automatic request throttling

**Technical Approach**:
- Extend `useAvailability` hook with Page Visibility API listener and idle timeout tracking (using mouse/keyboard/touch events)
- Implement adaptive polling: 5s (foreground), 5min (idle), stopped (hidden)
- Add `useIdleTimeout` hook to track user activity and trigger polling throttle
- Enhance `PersonaOnboarding` component with real-time validation against existing personas
- Trim whitespace and perform case-insensitive comparison for name duplicate detection
- Configure `staticwebapp.config.json` for production routing and cache strategies
- Update `package.json` scripts with concurrently for `func start` + `vite dev` orchestration

## Technical Context

**Language/Version**: JavaScript, React 19.2.7, Node.js 18+, Python 3.11+

**Primary Dependencies**:
- React hooks (useState, useEffect, useContext)
- Page Visibility API (native browser, no dependency)
- Idle event listeners (native browser: mousemove, keydown, touchstart)
- Azure Functions Core Tools (`func` CLI)
- Azure Static Web Apps CLI (`swa` CLI)
- concurrently (npm package for parallel local dev)

**Storage**: Browser localStorage (polling state preferences), Azure Table Storage (availability data)

**Testing**: Jest with React Testing Library, integration tests for adaptive polling across tab visibility scenarios

**Target Platform**: 
- Web browsers (modern mobile + desktop)
- Azure Free Tier (Functions: 1M invocations/month, Table Storage: 1GB data)
- Local development via SWA CLI proxy on localhost

**Performance Goals**:
- API polling stops within 500ms of tab hide
- Polling resumes within 1 second of tab show
- Idle detection throttles within 500ms of inactivity threshold
- Form validation response < 100ms
- Zero cost waste from background polling in Free Tier

**Constraints**:
- Must stay within Azure Free Tier limits (cost protection mandatory)
- Idle timeout = 10 minutes with no mouse/keyboard/touch events
- Persona names case-insensitive for duplicate detection
- Leading/trailing whitespace trimmed before comparison
- No changes to existing availability API contract
- SWA CLI proxy must support concurrent backend + frontend startup

**Deployment Environment**: 
- Local: SWA CLI with func backend + Vite frontend
- Production: Azure Static Web Apps + Azure Functions + Table Storage

## Constitution Check

**✅ PASS - Pre-Design Gate**

| Principle | Status | Compliance |
|-----------|--------|-----------|
| **I. Code Quality** | ✅ | New hooks (useIdleTimeout, enhanced useAvailability) will follow React best practices. Validation logic is pure function for testability. ESLint 0 errors standard. |
| **II. Test Standards** | ✅ | Unit tests for idle tracking, integration tests for adaptive polling across tab visibility, component tests for collision validation form. Target ≥90% coverage on new code. |
| **III. UX Consistency** | ✅ | Cost protection is invisible to users (polling throttles silently). Collision safeguards appear as standard form validation error. Local dev setup improves developer ergonomics. No breaking changes to existing UX. |
| **IV. Performance** | ✅ | Page Visibility API is instant (native). Idle tracking uses debounced event listeners (minimal overhead). Collision validation O(n) is acceptable with memo optimization. Polling frequency change is instantaneous (no layout shift). No regressions expected. |
| **V. Simplicity** | ✅ | Uses native browser APIs (Page Visibility, event listeners). Leverages existing useAvailability hook for extension. SWA CLI proxy replaces manual CORS. Validation is straightforward string comparison. No new libraries required beyond concurrently (already in ecosystem). |

**Gates Satisfied**: ✅ All 5 principles pass. No violations. Ready for Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/004-infrastructure-and-optimizations/
├── spec.md                          # ✅ Completed specification with clarifications
├── plan.md                          # ← This file (Phase 1 input)
├── research.md                      # Phase 0: Research (if clarifications remain - SKIPPED, all clarified)
├── data-model.md                    # Phase 1: Data model & entities
├── contracts/
│   ├── hooks.md                     # Custom hook interfaces (useIdleTimeout, enhanced useAvailability)
│   └── components.md                # Component contracts (PersonaOnboarding validation updates)
├── quickstart.md                    # Phase 1: Validation scenarios
└── checklists/
    └── requirements.md              # ✅ Quality checklist
```

### Source Code (repository root)

```text
public/src/
├── hooks/
│   ├── useAvailability.js           # EXISTING: Will extend with Page Visibility API + polling control
│   ├── useIdleTimeout.js            # NEW: Track user activity and idle state
│   ├── __tests__/
│   │   ├── useAvailability.test.js  # UPDATE: Add adaptive polling tests
│   │   └── useIdleTimeout.test.js   # NEW: Idle tracking tests
│   └── ...
├── components/
│   ├── PersonaOnboarding.jsx        # EXISTING: Will add collision detection validation
│   ├── __tests__/
│   │   └── PersonaOnboarding.test.jsx # UPDATE: Add collision validation tests
│   └── ...
├── utils/
│   ├── validation.js                # NEW: Persona collision detection logic
│   └── __tests__/
│       └── validation.test.js       # NEW: Validation tests
└── ...

azure-functions/
├── AvailabilityAPI/                 # Existing Functions remain unchanged
└── ...

staticwebapp.config.json            # NEW: Production SWA routing configuration
package.json                         # UPDATE: Add concurrently + SWA CLI to dev dependencies + scripts
```

**Structure Decision**: Extends existing React project. New hooks added to hooks/ directory following current conventions. Validation utilities go to utils/ with tests in __tests__/ subdirectories. Production config (staticwebapp.config.json) at repo root. Azure Functions backend remains unchanged (availability API contract preserved).

## Complexity Tracking

> No constitution violations. This feature uses native browser APIs and leverages existing hook patterns. Minimal complexity, well-scoped implementation.

| Item | Assessment |
|------|-----------|
| New dependencies | ✅ Only concurrently (dev tool, already common in React projects). No new runtime dependencies. |
| Architecture changes | ❌ None. Hooks extend existing pattern, validation is pure function, polling is internal to hook. |
| Backend changes | ❌ None. Azure Functions API contract unchanged. Only local dev orchestration updated (non-production). |
| Database/Storage | ❌ None. Table Storage remains unchanged. Data model stays the same. |
| Performance impact | ✅ Positive. Cost protection reduces API calls. Idle tracking reduces server load. |

---

## Phase 0: Research

**Status**: ✅ All clarifications completed in specification phase.

**Research Needs Resolved**:
- ✅ Collision detection data source: Check all existing personas (all months)
- ✅ Page Visibility API fallback: Implement blur/focus with documented limitation
- ✅ Table Storage partition strategy: PartitionKey=YYYY-MM, RowKey=persona#date
- ✅ Port conflict handling: Auto-find next available port, log prominently
- ✅ Browser compatibility: Modern browsers only (Chrome/Firefox/Safari v2)

**No additional research needed.** All technical decisions documented in spec clarifications. Proceed to Phase 1: Design & Contracts.

---

## Phase 1: Design & Contracts

### 1.1 Data Model (Entity Definitions)

**Output File**: `data-model.md` (to be created)

**Entities extracted from specification**:

1. **VisibilityState** (browser-provided)
   - `visibilityState: 'visible' | 'hidden'`
   - From: `document.visibilityState`
   - Triggers: Stop polling when hidden, resume when visible

2. **IdleState** (application-managed)
   - `lastActivityTime: timestamp`
   - `isIdle: boolean`
   - `idleThresholdMs: 600000` (10 minutes)
   - Properties: Track mouse/keyboard/touch events to determine idle status

3. **PollingControl** (hook state)
   - `intervalId: number | null`
   - `frequency: 5000 | 300000` (5s normal, 5min idle)
   - `isActive: boolean`
   - Combines visibility and idle state to manage polling lifecycle

4. **PersonaValidationPayload** (form input)
   - `name: string` (trimmed, case-normalized for comparison)
   - `color: hex string` (e.g., #FF5733)
   - `allExistingPersonas: Array<{name, color}>`
   - Input to collision detection

5. **CollisionResult** (validation output)
   - `isValid: boolean`
   - `errorMessage: string | null` (e.g., "Name and color combo already taken!")
   - Used to block/allow form submission

6. **AzureInfrastructure** (deployment configuration)
   - `PartitionKey: YYYY-MM` (month)
   - `RowKey: persona_name#YYYY-MM-DD` (unique identifier)
   - `Table: DaboyzAvailability`
   - Storage model in Table Storage

### 1.2 Component & Hook Contracts

**Output File**: `contracts/hooks.md` and `contracts/components.md` (to be created)

**useIdleTimeout Hook** (NEW):
```javascript
// Returns
{
  isIdle: boolean,                    // true if user inactive > 10 minutes
  lastActivityTime: number,           // timestamp of last activity
  resetIdleTimer: () => void          // reset timer when activity detected
}

// Initialization
- On mount: Initialize lastActivityTime to Date.now()
- Attach listeners: mousemove, keydown, touchstart → resetIdleTimer()
- Calculate isIdle: (Date.now() - lastActivityTime) >= 600000

// Cleanup
- On unmount: Remove all event listeners
```

**useAvailability Hook** (UPDATED):
```javascript
// Existing behavior preserved, adds:
- Use useIdleTimeout() to track idle state
- Listen to document.visibilityState changes
- Polling frequency logic:
  * If hidden: stop polling (clear interval)
  * If idle: frequency = 300000 (5 minutes)
  * If visible & active: frequency = 5000 (5 seconds)

// Returns (same as before)
{
  entries: Array<AvailabilityEntry>,
  loading: boolean,
  error: string | null,
  refetch: () => Promise<void>
}
```

**PersonaOnboarding Component** (UPDATED):
```javascript
// Props (unchanged):
{
  onPersonaCreate: (persona) => void
}

// Enhanced validation:
- New function: validatePersonaUniqueness(name, color, allPersonas)
  * Trim whitespace from name
  * Lowercase name for comparison
  * Check (name, color) tuple against all personas
  * Return {isValid, errorMessage}

// Form submission:
- Before submit: Call validatePersonaUniqueness()
- If validation fails: Show error, don't submit
- If validation passes: Continue with creation
```

### 1.3 Quickstart Validation Guide

**Output File**: `quickstart.md` (to be created)

**Scenario 1: Cost Protection - Tab Visibility**
```
Given: App open in two browser tabs
Test:
  1. Tab A (visible): Monitor network → requests every 5 seconds
  2. Switch to Tab B (different tab)
  3. Tab A (hidden): Monitor network → no requests (polling stopped)
  4. Switch back to Tab A (visible)
  5. Tab A (visible): Monitor network → requests resume within 1 second
Expected: Polling stops when hidden, resumes when visible
Validation: DevTools Network tab time stamps
```

**Scenario 2: Cost Protection - Idle Throttling**
```
Given: App open and focused
Test:
  1. Initial: Monitor network → requests every 5 seconds
  2. Wait 10 minutes with no mouse/keyboard/touch
  3. After 10 min: Monitor network → requests throttle to every 5 minutes
  4. Move mouse or press key
  5. After activity: Monitor network → requests resume every 5 seconds
Expected: Idle throttles polling, activity resumes normal frequency
Validation: Network timestamps show 300s intervals during idle
```

**Scenario 3: Collision Detection**
```
Given: PersonaOnboarding form open, with existing persona "Jack" (#FF5733)
Test:
  1. Enter name "Jack", color #FF5733
  2. Click submit
  3. Validation error appears: "Name and color combo already taken!"
  4. Clear form, enter name "Jack", color #0000FF
  5. Click submit
  6. Form submission succeeds (different color)
Expected: Duplicate (name, color) tuples blocked, different combinations allowed
Validation: Form validation error appears/disappears as expected
```

**Scenario 4: Local Development Setup**
```
Given: Developer with Node.js, Azure Functions Core Tools, SWA CLI installed
Test:
  1. Run: npm run dev
  2. Verify terminal shows:
     - "Frontend running at http://localhost:5173"
     - "Functions running at http://localhost:7071"
     - "SWA proxy running, routing /api/* to backend"
  3. Make API call from frontend: http://localhost:5173/api/availability
  4. Verify request reaches backend without CORS errors
Expected: All three services start together, API calls work without CORS config
Validation: All services healthy, network tab shows successful API call
```

---

## Constitution Check (Post-Design)

**✅ PASS - Post-Design Gate**

All 5 principles remain satisfied post-design:
- **Code Quality**: Hooks use idiomatic React patterns, validation is pure function, component changes minimal
- **Test Standards**: Unit tests cover idle tracking, integration tests cover polling control, validation tests cover edge cases
- **UX Consistency**: Cost protection is invisible (no UI changes), collision detection follows standard form validation patterns, dev setup improves DX
- **Performance**: Idle tracking debounced, Page Visibility API native, no regressions, positive performance impact from reduced API calls
- **Simplicity**: Leverages native APIs, extends existing hooks, no new dependencies, straightforward component updates

**Design is approved to proceed to Phase 2: Task Generation.**

---

## Related Documents

- **Specification**: [spec.md](./spec.md) - Feature requirements and acceptance criteria (with clarifications)
- **Data Model**: [data-model.md](./data-model.md) - Entity definitions and relationships (to be created in Phase 1)
- **Hook Contracts**: [contracts/hooks.md](./contracts/hooks.md) - Custom hook interfaces (to be created in Phase 1)
- **Component Contracts**: [contracts/components.md](./contracts/components.md) - React component updates (to be created in Phase 1)
- **Quickstart**: [quickstart.md](./quickstart.md) - Validation scenarios (to be created in Phase 1)
- **Tasks**: [tasks.md](./tasks.md) - Actionable implementation tasks (to be created by `/speckit.tasks`)
