# Implementation Plan: Dynamic User Personas

**Feature**: Dynamic User Personas  
**Specification**: [spec.md](./spec.md)  
**Status**: Planning Phase 1 - Design & Architecture  
**Created**: 2026-06-29  

---

## 1. Technical Context

### Current State (Phase 1 App Foundation)
- **Frontend**: React 19.2.7 + Vite 5.4.0 on port 5174
- **Backend**: Python Azure Functions on port 7071 (local dev)
- **Storage**: Azure Table Storage (mock localStorage fallback in dev)
- **Polling**: 5-second sync interval for availability
- **Pre-defined users**: Alice, Bobby, Carmen (hardcoded, to be removed)

### Technology Stack (Unchanged)
- **Frontend**: React 19, Vite, TailwindCSS 3.3.6
- **Backend**: Python 3.11, Azure Functions, azure-data-tables
- **Testing**: Jest 29.7 + React Testing Library 14.1.2
- **Data Model**: (name, color, date, timestamp) composite key in availability entries

### Known Constraints
1. Personas identified by (name, color) tuple, not UUID
2. No separate Personas table; persona metadata embedded in Availability entries
3. Mandatory persona creation on first load (blocks calendar)
4. HTML 5 color picker for color selection
5. Persona selector dropdown in header (mirrors existing UserSelector UI)
6. Static Users section completely removed

### Dependencies & Assumptions
- Existing React app structure, component patterns, and TailwindCSS styling reusable
- Existing availability API endpoints can be extended to support (name, color) keys
- Mock API fallback still functional
- 5-second polling interval unchanged
- localStorage sufficient for session-scope persona storage

---

## 2. Constitution Check

### Pre-Design Validation

**Code Quality** ✅  
- Will apply existing linting (npm run lint, npm run format)
- Components follow established patterns (hooks, TailwindCSS utilities)
- No new technical debt; persona entity is straightforward data structure

**Test Standards** ✅  
- Persona creation form will have unit tests (input validation, state management)
- Calendar integration will have integration tests (create persona → mark dates → verify badges)
- Mock API will be extended with persona test scenarios
- Target: 60%+ coverage (existing jest config)

**UX Consistency** ✅  
- Persona dropdown mirrors UserSelector component (existing pattern)
- Color picker uses native HTML widget (standard, accessible)
- Onboarding modal follows card styling pattern (shadow, padding, rounded corners)
- Badge display on calendar unchanged from phase 1
- No new colors/spacing introduced; uses existing TailwindCSS palette

**Performance** ✅  
- Persona creation is client-side operation (< 100ms)
- Dropdown rendering: O(n) personas, acceptable for typical use (< 50 personas)
- No new polling; reuses 5-second sync interval
- Color picker native widget has no bundle impact
- Storage: localStorage key size modest (name + hex color string)

**Simplicity** ✅  
- Composite key approach eliminates UUID management complexity
- Personas implicitly created (no separate endpoint)
- Onboarding is mandatory but simple (2 inputs: name, color)
- Persona switching via single dropdown (familiar pattern)

---

## 3. Phase 0: Research (Complete)

**Status**: ✅ All clarifications resolved in session 2026-06-29

### Clarifications Integrated
1. Persona identity: (name, color) composite key across devices
2. First-load behavior: Mandatory creation (blocks calendar)
3. Color picker: HTML <input type="color">
4. Persona selector UI: Dropdown in header
5. Backend storage: Composite key in availability entries (no Personas table)

---

## 4. Phase 1: Design Artifacts (Pending Generation)

### 4.1 Data Model
**File**: [data-model.md](./data-model.md) - Entities, relationships, schemas

### 4.2 API Contracts  
**File**: [contracts/availability-api.md](./contracts/availability-api.md) - Endpoint specs

### 4.3 Quickstart Validation
**File**: [quickstart.md](./quickstart.md) - Test scenarios

### 4.4 Agent Context
Update [.github/copilot-instructions.md](.github/copilot-instructions.md) with plan reference

---

## 5. Component Breakdown

### Frontend Components (React)
- **PersonaOnboarding.jsx** (new): Modal form for persona creation
- **PersonaSelector.jsx** (new): Dropdown for persona management
- **App.jsx** (refactor): Remove DEFAULT_USERS, add persona state
- **CalendarGrid.jsx** (update): Support (name, color) instead of userId
- **useAvailability.js** (update): Composite key API calls

### Backend Updates (Python)
- **api/routes/availability.py**: Accept {name, color, date} composite key
- **api/models/availability.py**: Update validation for name, color
- **api/models/table_storage.py**: Composite key row generation

---

## 6. Success Criteria

✅ Persona creation works (name + color input, validation)  
✅ Availability marking persists per persona  
✅ Persona switching updates calendar instantly  
✅ Multiple personas stored and retrievable  
✅ Users section removed from UI  
✅ 30-second onboarding achieved  
✅ All code passes linting & tests (60%+ coverage)  

---

## 7. Timeline (Estimated)

- Design artifacts: 1-2 hours
- Frontend components: 4-5 hours
- Backend updates: 3-4 hours
- Integration & testing: 2-3 hours
- Documentation & review: 1-2 hours

**Total**: 11-16 hours (excluding dependencies & reviews)

---

## Status: READY FOR PHASE 1 DESIGN

**Next Command**: /speckit.tasks to generate detailed task breakdown
