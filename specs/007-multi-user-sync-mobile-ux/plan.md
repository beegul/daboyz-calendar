# Implementation Plan: Multi-User Real-Time Sync & Mobile UX Overhaul

**Branch**: `007-multi-user-sync-mobile-ux` | **Date**: 2026-06-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification with 8 user stories (P1-P3), 15 functional requirements, 14 measurable success criteria, and 8 edge case scenarios.

## Summary

This feature addresses two interconnected requirements: (1) **Multi-user real-time sync** - enabling 5–20 concurrent users to mark availability and manage personas with updates propagating to all clients within 500ms, and (2) **Mobile UX overhaul** - redesigning the congested mobile layout to be clear, responsive, and best-in-class usable on 375–500px viewports.

The technical approach uses **HTTP polling increased from 3 seconds to 1 second** to achieve 500ms sync latency without requiring WebSocket infrastructure. This leverages existing API endpoints (/api/users, /api/availability) and reduces implementation complexity. Offline actions are persisted to localStorage with automatic retry on reconnection. Mobile layout is redesigned using Tailwind's responsive utilities, ensuring readability at 16px+, touch targets at 44x44px+, and 60fps scroll performance.

## Technical Context

**Language/Version**: JavaScript (React 19.0.0) + Node.js backend (Azure Functions)

**Primary Dependencies**: 
- Frontend: React 19, Framer Motion 12.42.0 (animations), Tailwind CSS 3.3.6 (styling)
- Backend: Azure Functions, Azure Table Storage (personas/availability persistence)
- Existing API: GET /api/users, POST /api/users, DELETE /api/personas/{name}, POST/DELETE /api/availability endpoints already implemented

**Storage**: Azure Table Storage (Users table for personas, Availability table for date markers)

**Testing**: Jest + React Testing Library (unit/integration), manual device testing for mobile responsiveness

**Target Platform**: Web browser (desktop + mobile), responsive design 375px–1200px+

**Project Type**: Full-stack web app (React frontend + Node.js backend on Azure)

**Performance Goals**: 
- Sync latency: 500ms (99th percentile)
- Touch feedback: 50ms visual response
- Scroll smoothness: 60fps
- Bundle size: < 120 kB gzipped (no regression from current 115 kB)

**Constraints**: 
- Polling cycle is limited by backend capacity and network latency; 1-second interval sustainable for 5–20 concurrent users
- Mobile layout must work on devices with viewport as narrow as 375px (iPhone SE)
- Offline queue max size 100 items, 24-hour retention in localStorage
- No breaking changes to existing /api/users or /api/availability contracts

**Scale/Scope**: 
- Users: 5–20 concurrent users on same calendar (phase 1); scaling to 50+ requires WebSocket/infrastructure review (phase 2)
- Code: ~3–5 new React components (mobile layout), ~2–3 new hooks (offline queue, polling), ~500–800 lines of component changes
- Mobile breakpoints: Optimize for 375–500px, verify acceptable to 600px; defer tablet-specific layouts to phase 2

## Constitution Check

**GATE: Must pass all 5 constitution principles before Phase 0 research. Re-evaluate after Phase 1 design.**

### Principle I: Code Quality is Non-Negotiable
- **Requirement**: All code must follow formatting, linting rules (ESLint), clear naming, and composable logic.
- **Plan Compliance**: ✅ 
  - Lint all new components before merge
  - Use existing ESLint config (.eslintrc.cjs)
  - Break large sync logic into small, testable hooks (usePolling, useOfflineQueue)
  - Use React.memo on mobile layout components to prevent unnecessary re-renders

### Principle II: Test Standards Drive Development
- **Requirement**: Every feature and bug fix must have unit tests + integration tests covering happy path and edge cases.
- **Plan Compliance**: ✅ 
  - Write tests for new polling hook (1s interval, retry logic, error handling)
  - Write tests for offline queue (persist, retry, TTL, max size)
  - Write tests for mobile layout components (responsive breakpoints, tap targets, touch feedback)
  - Write integration tests for concurrent persona creation (no duplicates, no race conditions)
  - Test edge cases: concurrent deletes, persona deletion during render, offline sync conflicts
  - Acceptance tests for all 8 user stories

### Principle III: User Experience Consistency is Mandatory
- **Requirement**: Visual and interaction patterns must be consistent. UI state changes must be predictable and accessible.
- **Plan Compliance**: ✅ 
  - Reuse existing animation config (motionConfig.js) for mobile transitions
  - Preserve existing dark mode styling; ensure mobile layout respects both light and dark modes
  - Maintain persona dropdown and calendar interaction patterns; improve touch targets and feedback
  - Add persistent sync status indicator (badge showing "Last synced: 10s ago")
  - Use consistent spacing (Tailwind's spacing scale) across mobile layout
  - Ensure all interactive elements have clear focus states for keyboard navigation

### Principle IV: Performance Requirements are Built In
- **Requirement**: App must remain fast and responsive. No performance regressions. Latency, memory, and bundle size must be within limits.
- **Plan Compliance**: ✅ 
  - Bundle size limit: 120 kB gzipped (current 115 kB + ~1–2 kB for new hooks and components)
  - Sync latency: 500ms (achieved via 1s polling + async updates)
  - Touch feedback: 50ms visual response (use Framer Motion instant animations from motionConfig)
  - Scroll performance: 60fps (use CSS transforms, avoid layout thrashing)
  - Memory: Offline queue max 100 items (~10 kB localStorage); polling doesn't create memory leaks (clear intervals properly)
  - Monitor bundle size via CI pipeline; measure sync latency with performance.mark/measure in production

### Principle V: Simplicity and Incremental Improvement
- **Requirement**: Avoid premature optimization and feature bloat. Solve with least complexity.
- **Plan Compliance**: ✅ 
  - Use HTTP polling (simple, proven, no new infrastructure) rather than WebSocket
  - Persist offline queue to localStorage (already used, no new dependencies)
  - Reuse existing API endpoints; no new backend changes required
  - Mobile layout uses Tailwind utilities (no new CSS libs)
  - Phase approach: mobile layout in v1, tablet optimization in v2, WebSocket in v3 (if needed)

**Constitution Gate Status**: ✅ **PASS** - All 5 principles can be met. No design conflicts with constitution.

## Project Structure

### Documentation (This Feature)

```text
specs/007-multi-user-sync-mobile-ux/
├── spec.md                  # ✅ User stories, requirements, success criteria
├── plan.md                  # ← You are here
├── research.md              # Phase 0 (TBD - polling implementation, mobile layout patterns)
├── data-model.md            # Phase 1 (TBD - sync state, offline queue schema, mobile component tree)
├── contracts/               # Phase 1 (TBD - polling response format, offline queue interface)
│   ├── polling-contract.md
│   ├── offline-queue-interface.md
│   └── mobile-components-interface.md
├── quickstart.md            # Phase 1 (TBD - validation scenarios: two-user sync, mobile workflow)
└── checklists/
    └── requirements.md      # ✅ Quality checklist
```

### Source Code (Repository Root)

```text
# Frontend: React app (existing structure + new components)
public/src/
├── App.jsx                                  # Updated: add polling to 1s, integrate offline queue
├── components/
│   ├── existing (PersonaSelector, DeletePersonaModal, etc.)
│   ├── MobileCalendarLayout.jsx             # NEW: responsive calendar for 375–500px
│   ├── MobilePersonaSelector.jsx            # NEW: vertical dropdown, delete always visible
│   ├── MobileHeader.jsx                     # NEW: compact top section (title, dark toggle, sync status)
│   ├── SyncStatusBadge.jsx                  # NEW: persistent "Last synced: Xs" indicator
│   ├── OfflineIndicator.jsx                 # NEW: show when offline, queue status
│   └── __tests__/
│       ├── MobileCalendarLayout.test.jsx
│       ├── MobilePersonaSelector.test.jsx
│       ├── SyncStatusBadge.test.jsx
│       └── OfflineIndicator.test.jsx
├── hooks/
│   ├── usePolling.js                        # NEW: 1-second polling hook with retry logic
│   ├── useOfflineQueue.js                   # NEW: localStorage-backed offline action queue
│   ├── useMobileLayout.js                   # NEW: responsive layout hook (mobile/desktop detection)
│   ├── useAvailability.js                   # Updated: integrate polling hook
│   └── __tests__/
│       ├── usePolling.test.js
│       ├── useOfflineQueue.test.js
│       └── useMobileLayout.test.js
├── utils/
│   ├── motionConfig.js                      # Already updated (instant animations)
│   └── syncConfig.js                        # NEW: polling intervals, retry config, queue limits
├── styles/ (if separate from Tailwind)
│   └── mobile.css                           # NEW: mobile-specific media queries (375px, 500px breakpoints)
└── __tests__/
    ├── integration/
    │   ├── multi-user-sync.integration.test.jsx     # NEW: two-client concurrent updates
    │   ├── persona-sync.integration.test.jsx        # NEW: persona CRUD sync
    │   └── offline-sync.integration.test.jsx        # NEW: offline queue and retry
    └── edge-cases/
        ├── concurrent-deletes.test.jsx              # NEW: race condition coverage
        ├── persona-deletion-during-render.test.jsx  # NEW: safety check
        └── offline-conflict-resolution.test.jsx     # NEW: API vs localStorage conflict

# Backend: Azure Functions (minimal changes - mostly observational)
api/
├── GetUsers/                                # Existing endpoint
├── CreateUser/                              # Existing endpoint
├── DeletePersona/                           # Existing endpoint
├── GetAvailability/                         # Existing endpoint (may add caching optimization)
└── __tests__/ (existing)

# Root config
├── package.json                             # Updated: dependencies (if adding offline queue lib), scripts
├── tailwind.config.js                       # Updated: add mobile breakpoint tokens, z-index scale review
├── vite.config.js                           # Unchanged (no new build targets)
└── jest.config.cjs                          # Updated: test coverage thresholds for new files
```

**Structure Decision**: 
Existing monorepo structure (frontend public/src + backend api/) is retained. All sync logic additions live in hooks/ (usePolling, useOfflineQueue) and utils/ (syncConfig). Mobile layout lives in components/Mobile*. Tests are colocated in __tests__/ directories. No new top-level folders or major structural changes required. This keeps the codebase maintainable and consistent with existing patterns.

---

## Phase 0: Research & Architecture

**Goal**: Resolve all technical unknowns and confirm implementation approach.

**Duration**: 1–2 days (design spike, PoC if needed)

### Research Tasks

1. **Polling Performance & Scalability**
   - Confirm 1-second polling interval is sustainable for 5–20 concurrent clients
   - Test current /api/users and /api/availability endpoints under load (simulated 20 clients polling every 1s)
   - Measure latency distribution (p50, p95, p99) of polling response times
   - Document baseline and limits; identify if database optimization is needed (e.g., query indexes, connection pooling)
   - Decision: If sustainable, proceed with 1-second interval. If not, optimize backend queries or defer to phase 2 WebSocket implementation.

2. **Mobile Layout Patterns & Constraints**
   - Research mobile calendar libraries (Daypicker, React Native Calendar, custom) or confirm custom Tailwind-based approach
   - Test current app on real iOS device (iPhone SE, 375px) and Android device (Galaxy S21, 360px) to identify pain points
   - Capture screenshots of current mobile layout; document congestion issues (overlapping text, unreadable dates, invisible buttons)
   - Design mobile-optimized layout sketches: compact header, full-width calendar, touch-friendly personas
   - Decision: Custom Tailwind layout (proven in project) vs. library. If library, evaluate bundle impact.

3. **Offline Queue Implementation & Persistence**
   - Research localStorage quota limits on mobile browsers (typically 5–10 MB; 100 items is ~10 kB, safe)
   - Test localStorage reliability across browser close/refresh/offline scenarios
   - Prototype offline queue data structure and serialization
   - Decide: In-memory only vs. localStorage vs. IndexedDB. (Already decided: localStorage per clarification Q3)
   - Document: Queue schema (action type, params, timestamp, retry count), TTL logic (24h), max size (100)

4. **Concurrent User Edge Cases**
   - Document all 8 edge cases (concurrent deletes, persona loss, offline conflicts, clock skew, etc.)
   - Design state machine for handling concurrent updates (e.g., API-first reconciliation)
   - Test with mock backend: simulate two clients updating availability simultaneously
   - Identify any race conditions in current code (App.jsx persona sync logic)

5. **Mobile Touch & Gesture Patterns**
   - Audit current app for touch responsiveness issues (measure tap-to-feedback latency)
   - Review Framer Motion animation timing for mobile (instant 0ms animations already in place)
   - Test 44x44px tap targets with real fingers on mobile device
   - Document scroll performance baseline (FPS measurement)

6. **Browser & Device Compatibility**
   - Test polling on old browsers (IE 11, Safari 12) or confirm minimum version target
   - Test offline queue persistence on Firefox, Safari, Chrome
   - Test app on low-end Android device (high latency network)

### Research Output Artifacts

- **research.md** (this phase output)
  - Polling performance test results (latency, throughput, limits)
  - Mobile layout pain points (documented via screenshots and user testing)
  - Offline queue design (schema, TTL, max size)
  - Concurrent update state machine (conflict resolution logic)
  - Edge case mitigations (documented with code sketches)
  - Browser/device compatibility matrix
  - Technology choices & rationales (Tailwind vs. library, localStorage vs. IndexedDB, polling vs. WebSocket)

---

## Phase 1: Design & Contracts

**Goal**: Define data models, API contracts, component interfaces, and validation scenarios.

**Duration**: 2–3 days (design review, contract validation)

### Design Tasks

1. **Data Model: Sync State**
   - Define React state shape for personas, activePersona, availability, syncStatus, offlineQueue
   - Design sync state machine (synced, syncing, error, offline)
   - Document conflict resolution: API-first (server is source of truth), local overrides only while offline
   - Define activePersona behavior when deleted by another user (auto-switch to first available)

   **Output**: data-model.md section "Sync State"

2. **Data Model: Offline Queue**
   - Define queue item schema: { type, personaName, date, value, timestamp, retryCount, maxRetries, ttl }
   - Define queue lifecycle: enqueue → serialize to localStorage → serialize from localStorage on app load → retry loop
   - Define TTL: 24 hours from timestamp; discard expired items on load
   - Define max size: 100 items; reject new items if at capacity (show user error)
   - Define retry: exponential backoff (1s, 2s, 4s, 8s) up to maxRetries (3), then show persistent error banner

   **Output**: data-model.md section "Offline Queue"

3. **Component Architecture: Mobile Layout**
   - Design responsive breakpoints: mobile (375–500px), tablet (600–999px), desktop (1000px+)
   - Phase 1 focus: mobile (375–500px) optimized; verify acceptable on up to 600px
   - Define mobile component hierarchy:
     - MobileHeader (title, dark mode toggle, sync status badge)
     - MobilePersonaSelector (dropdown, delete always visible)
     - MobileCalendarLayout (month calendar, no horizontal scroll, 16px+ text)
     - SyncStatusBadge (persistent "Last synced: Xs")
     - OfflineIndicator (shown when offline or queue has pending items)
   - Define CSS approach: Tailwind responsive utilities (sm:, md:, lg: breakpoints) or media queries

   **Output**: data-model.md section "Mobile Component Tree"

4. **Polling Hook Interface**
   - Design usePolling hook signature and behavior
   - Inputs: endpoint URL, interval (1000ms), retry config (max 3, exponential backoff)
   - Outputs: data, loading, error, lastSync timestamp, isOnline status
   - Behavior: start polling on mount, stop on unmount, handle errors gracefully, detect offline
   - Integration: called by App.jsx's persona sync and availability sync logic

   **Output**: contracts/polling-contract.md

5. **Offline Queue Hook Interface**
   - Design useOfflineQueue hook signature
   - Inputs: none (reads from localStorage on init)
   - Outputs: queue (array), enqueue, dequeue, clear, isOnline status, pendingCount
   - Behavior: persist to localStorage, auto-retry when online, enforce TTL and max size
   - Integration: called by handleAvailabilityToggle and handlePersonaCreate

   **Output**: contracts/offline-queue-interface.md

6. **Mobile Components Interface**
   - Define props for each mobile component (MobileCalendarLayout, MobilePersonaSelector, etc.)
   - Define accepted props, required props, default values
   - Define component composition rules (how components communicate)

   **Output**: contracts/mobile-components-interface.md

### Validation & Acceptance Scenarios

7. **Quickstart: Multi-User Sync**
   - Set up two browser windows side-by-side
   - User A marks June 15 as available in browser 1
   - Verify it appears in browser 2 within 500ms (or next 1s poll cycle)
   - Test concurrent updates (5 dates marked simultaneously by both users)
   - Test persona creation and deletion

   **Validation Script**: "Open app in two windows. Perform actions simultaneously. Verify sync within latency."

   **Output**: quickstart.md section "Multi-User Sync Validation"

8. **Quickstart: Mobile Workflow**
   - Open app on mobile device (iPhone SE, 375px)
   - Verify calendar is fully visible without horizontal scroll
   - Tap a date to mark available → verify tap target is 44x44px and feedback is instant (< 50ms)
   - Open persona dropdown → verify delete option is visible
   - Create a new persona → verify form is legible without scrolling
   - Delete a persona → verify it disappears

   **Validation Script**: "Load on mobile. Perform full workflow. Check readability, tap targets, responsiveness."

   **Output**: quickstart.md section "Mobile UX Validation"

9. **Quickstart: Offline & Sync**
   - Open app in dev tools offline mode
   - Mark availability while offline → verify "Offline" indicator appears
   - Go online → verify queued action syncs automatically
   - Go offline again, mark 2 more dates, go online → verify all 3 dates sync

   **Validation Script**: "Toggle offline mode. Queue actions. Verify auto-sync on reconnection."

   **Output**: quickstart.md section "Offline & Sync Validation"

### Design Output Artifacts

- **data-model.md** (Phase 1 output)
  - Sync state shape and machine
  - Offline queue schema and lifecycle
  - Mobile component tree and responsibilities
  - Conflict resolution rules
  - Error handling strategy

- **contracts/polling-contract.md** (Phase 1 output)
  - Hook interface (inputs, outputs, behavior)
  - Error scenarios and recovery
  - Integration points

- **contracts/offline-queue-interface.md** (Phase 1 output)
  - Hook interface (inputs, outputs, behavior)
  - Queue schema
  - Lifecycle (enqueue, persist, retry, TTL, max size)

- **contracts/mobile-components-interface.md** (Phase 1 output)
  - Component tree and hierarchy
  - Props interface for each component
  - Composition and communication rules

- **quickstart.md** (Phase 1 output)
  - 3 validation scenarios (multi-user sync, mobile UX, offline & sync)
  - Setup instructions, step-by-step actions, expected outcomes
  - Pass/fail criteria for each scenario

---

## Constitution Compliance Summary

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Code Quality | ✅ PASS | ESLint config applied; hooks are small and composable; naming is clear; no premature optimization |
| II. Testing | ✅ PASS | Unit tests for polling/queue hooks; integration tests for sync; edge case tests; acceptance tests for user stories |
| III. UX Consistency | ✅ PASS | Reuse existing animations, dark mode, interaction patterns; add sync status indicator; mobile layout preserves app language |
| IV. Performance | ✅ PASS | Bundle < 120 kB (1–2 kB overhead); sync < 500ms (1s poll); touch < 50ms (instant animations); scroll 60fps (CSS transforms); memory safe (100 items, 10 kB) |
| V. Simplicity | ✅ PASS | HTTP polling (simple); localStorage (proven); reuse API endpoints; Tailwind layout (no new libs); phase approach (mobile v1, tablet v2, WebSocket v3) |

**Overall Constitution Gate**: ✅ **PASS** - All principles met. No violations requiring justification.

---

## Next Steps

1. **Phase 0 Execution** (1–2 days)
   - Run research tasks
   - Produce research.md with findings and technology choices
   - Team review & approval before Phase 1

2. **Phase 1 Execution** (2–3 days)
   - Run design tasks
   - Produce data-model.md, contracts/, quickstart.md
   - Validate contracts with mock backend
   - Team review & approval before Phase 2 (tasks & implementation)

3. **Phase 2: Task Generation** (TBD via `/speckit.tasks`)
   - Break design into dependency-ordered tasks
   - Assign complexity estimates (T-shirt sizing or story points)
   - Identify critical path and dependencies
   - Hand off to implementation team

4. **Implementation Phase** (TBD - phase 2 and beyond)
   - Execute tasks in dependency order
   - Write tests as implementation proceeds
   - Validate against acceptance criteria
   - Submit PR for review

---

**Plan Status**: ✅ **READY FOR PHASE 0 RESEARCH**

All technical context documented. Constitution compliance verified. Research tasks defined. Ready to begin design spike.
