# Implementation Plan: Multi-User Real-Time Sync & Mobile UX Overhaul

**Branch**: `007-multi-user-sync-mobile-ux` | **Date**: 2026-06-30 | **Spec**: [spec.md](spec.md)

**Input**: Existing Spec 007 implementation is largely shipped. The remaining goal is to complete Phase 4 in a lean, low-conflict way by reducing redundant test scope, fixing toolchain blockers, normalizing spec bookkeeping, and validating only the highest-risk behavior.

## Summary

Spec 007 is no longer a greenfield implementation effort. The codebase already contains the primary product work: 1-second polling sync, optimistic availability updates, offline queue persistence, mobile layout changes, duplicate persona validation, and recent production bugfixes for first-of-month persistence and visible month display on mobile.

The remaining work is a **closeout plan**, not a feature-build plan. The objective is to move from "MVP shipped with open polish items" to "release-complete and maintainable" while explicitly avoiding test bloat and process overhead that slow delivery.

This plan uses a **risk-based completion strategy**:

1. Fix repo and tooling blockers that prevent reliable local execution.
2. Normalize the Spec 007 task ledger so remaining work is accurate.
3. Prioritize production-impacting defects and UX gaps before broad audits.
4. Replace broad duplicate test expansion with a smaller validation matrix:
   - one automated layer for critical hook/business logic
   - one automated integration layer for sync/offline regressions
   - one manual smoke layer for responsive/accessibility confirmation
5. Finish only the documentation needed to ship and maintain the feature.

## Technical Context

**Language/Version**: JavaScript (React 19.x frontend) + Azure Functions backend

**Primary Dependencies**:
- Frontend: React, Framer Motion, Tailwind CSS
- Tooling: Vite, Jest, React Testing Library, ESLint
- Backend/Local Dev: Azure Functions Core Tools, Azure Static Web Apps CLI

**Current Product State**:
- Phase 3 behavior shipped to production
- Polling-based sync implemented at 1 second
- Offline queue implemented and persisted to localStorage
- Mobile header now shows active month
- First-of-month date persistence bug fixed

**Current Tooling State**:
- `npm run build` succeeds
- `npm run dev` is now frontend-only for a stable fast loop
- `npm run dev:full` runs the full local stack when `func` and `swa` are installed
- Azure Functions Core Tools bootstrap is failing or incompatible with current Node runtime
- Azure CLI is not installed locally

**Storage**: Azure Table Storage plus browser localStorage for offline queue

**Testing**: Existing Jest + RTL suite, but current remaining work should prefer consolidation over test proliferation

**Target Platform**: Production web app with desktop + mobile support, plus maintainable local developer workflow

**Performance Goals**:
- Keep bundle under 120 kB gzipped
- Preserve responsive touch feedback on mobile
- Preserve current sync responsiveness without adding infrastructure

**Constraints**:
- Avoid introducing new architectural layers or broad refactors
- Do not add redundant tests that duplicate existing coverage at multiple layers
- Respect constitution requirement for testing, but satisfy it with a lean validation set rather than maximal test count
- Local tooling must align with Azure Functions supported Node versions

**Scale/Scope**:
- Remaining work is concentrated in Phase 4 polish, validation, tooling, and documentation
- Scope excludes new sync architecture, tablet redesign, and speculative feature work

## Constitution Check

**GATE: Must pass all 5 constitution principles before closeout work proceeds. Re-evaluate after lean design decisions.**

### Principle I: Code Quality is Non-Negotiable
- **Requirement**: Clean, readable, maintainable code with explicit tradeoffs.
- **Plan Compliance**: ✅
  - Remaining code work is limited to bugfixes, tooling alignment, and small UX corrections.
  - Repo bookkeeping and local-dev fixes are prioritized before adding more code.

### Principle II: Test Standards Drive Development
- **Requirement**: Every feature and bug fix must be covered by tests before merge.
- **Plan Compliance**: ✅ with lean interpretation
  - Critical logic and regressions remain covered.
  - Duplicate tests across unit/integration/manual layers will be avoided.
  - New tests are added only when they protect a real bug, contract, or high-risk sync behavior.

### Principle III: User Experience Consistency is Mandatory
- **Requirement**: UX changes must remain predictable, accessible, and coherent.
- **Plan Compliance**: ✅
  - Remaining UX work is limited to clarity, accessibility, and messaging gaps.
  - Manual smoke checks will confirm mobile hierarchy, tap targets, and sync visibility.

### Principle IV: Performance Requirements are Built In
- **Requirement**: Preserve responsiveness and asset budget.
- **Plan Compliance**: ✅
  - Bundle budget remains an explicit release gate.
  - No new heavy libraries or complex runtime layers will be introduced.

### Principle V: Simplicity and Incremental Improvement
- **Requirement**: Solve the user need with the least complexity necessary.
- **Plan Compliance**: ✅
  - This plan intentionally reduces completion scope to the smallest set of work that proves correctness and maintainability.
  - Low-value documentation and duplicate test expansion are explicitly out of scope.

**Constitution Gate Status**: ✅ **PASS**

## Lean Completion Strategy

### Guiding Decisions

1. **Risk-based testing over volume-based testing**
   - Keep automated coverage where failure would cause data loss, sync failure, or broken primary flows.
   - Move purely cosmetic or repetitive assertions to manual smoke validation.

2. **Tooling reliability before broad QA expansion**
   - A repo that cannot run locally will slow or block every remaining task.
   - Local-dev repair is treated as completion work, not optional cleanup.

3. **Backlog normalization before execution**
   - Phase 4 task numbering, counts, and completed bugfix entries must be accurate before remaining work is tracked.

4. **Defect-first polish**
   - Any user-visible or production-impacting issue outranks non-blocking test/documentation work.

5. **Minimal release documentation**
   - Only README deltas, changelog entry, rollback note, and monitoring checklist are required.
   - No new narrative docs unless they unblock developers or operations.

## Project Structure Impact

No new top-level structure is required. Remaining work should stay within:

```text
public/src/                 # small bugfixes, UX polish, retained test suite cleanup
api/                        # only if backend validation or local tooling needs small updates
specs/007-.../              # planning + backlog normalization
package.json                # toolchain and dev script alignment
README.md / changelog       # release-ready documentation only
```

## Workstreams

### Workstream 0: Baseline & Toolchain Repair

**Goal**: Make local execution predictable enough to support the rest of Phase 4.

Tasks:
- Verify and install missing local dependencies referenced by scripts.
- Document a supported Node LTS version compatible with Azure Functions Core Tools and SWA CLI.
- Keep `npm run dev` as the frontend loop and `npm run dev:full` as the full-stack local workflow for easier troubleshooting.
- Document minimal local prerequisites: Node version, Azure Functions Core Tools, optional Azure CLI.

Exit Criteria:
- Local frontend can run predictably.
- Backend/local emulator path is either working or explicitly documented with a supported fallback.

### Workstream 1: Spec & Backlog Normalization

**Goal**: Make the remaining work list accurate and small enough to execute confidently.

Tasks:
- Fix duplicate task IDs in Spec 007 Phase 4.
- Recount remaining tasks after already completed production bugfixes.
- Reclassify low-value or duplicate validation items as manual checks instead of new automated tests.
- Mark superseded or redundant plan assumptions as historical, not active work.

Exit Criteria:
- One trustworthy Phase 4 list exists.
- Remaining work is grouped into defects, validation, docs, and tooling.

### Workstream 2: Product Closeout

**Goal**: Finish any remaining user-visible bugs and UX clarity gaps.

Tasks:
- Continue fixing production-impacting bugs discovered during mobile and cross-device use.
- Keep changes local and reversible.
- Require a focused validation step after each bugfix.

Exit Criteria:
- No known high-severity user-facing defects remain for core flows.

### Workstream 3: Lean Validation Matrix

**Goal**: Prove release readiness with the minimum sufficient set of checks.

#### Automated checks to keep
- Build must pass.
- Lint must pass.
- Critical hook/business-logic tests for sync/offline queue must pass.
- One integration lane each for:
  - multi-user sync
  - persona sync/deletion safety
  - offline queue recovery

#### Manual checks to prefer over new automated tests
- tap target sizing verification
- mobile layout readability at target widths
- screen reader spot-checks
- month visibility, active persona visibility, and sync indicator clarity
- two-browser smoke validation for sync latency behavior

#### Checks to avoid unless a defect forces them
- multiple overlapping tests asserting the same UI text/styling at unit, integration, and E2E layers
- animation-specific assertions that do not protect user value
- new snapshot suites for already-stable components
- large documentation-driven test expansion

Exit Criteria:
- Core release gates are proven with small, high-signal checks.
- The suite is smaller or flatter than the current projected Phase 4 backlog, not larger.

### Workstream 4: Release Readiness

**Goal**: Finish the operational tail without reopening implementation scope.

Tasks:
- Update README with the current supported local workflow and feature summary.
- Add concise changelog entry.
- Write a rollback note and a post-deploy monitoring checklist.
- Record final measured bundle size and validation results.

Exit Criteria:
- A maintainer can run, validate, and monitor the release without reverse-engineering the repo.

## Phase 0: Updated Research Decisions

All prior technical unknowns have enough evidence to proceed. The remaining research questions are now closeout-specific rather than architectural.

Resolved decisions:
- Keep 1-second polling; no WebSocket expansion.
- Keep existing mobile layout direction; only refine defects and clarity.
- Keep localStorage offline queue; no IndexedDB migration.
- Prefer test consolidation over new test category creation.
- Treat local toolchain compatibility as a blocker to developer velocity.

**Output**: [research.md](research.md) updated to reflect closeout decisions, not greenfield investigation.

## Phase 1: Updated Design & Contracts

Design work is now focused on execution control rather than net-new architecture.

Artifacts must document:
- the lean validation model
- the remaining release gates
- the supported local workflow
- the reduced test taxonomy

**Output**:
- [data-model.md](data-model.md) reframed around execution state and validation tiers
- [quickstart.md](quickstart.md) trimmed to the smallest set of end-to-end release checks
- existing contracts retained unless implementation changes require updates

## Execution Order

1. Fix local tooling blockers.
2. Normalize Spec 007 Phase 4 bookkeeping.
3. Resolve any remaining user-facing defects.
4. Run lean validation matrix.
5. Finish minimal release documentation.

## Definition of Done

- `npm run build` passes
- lint passes
- retained critical automated tests pass
- manual release smoke is completed and recorded
- Spec 007 Phase 4 ledger is accurate
- local workflow is documented and supportable
- release notes and monitoring checklist exist

## Out of Scope

- New sync transport or infrastructure changes
- Tablet redesign
- Broad test-suite expansion for already-covered behavior
- New feature work unrelated to current release readiness

## Post-Design Constitution Check

The lean completion plan still satisfies the constitution because it does not remove required validation; it removes redundancy and concentrates testing on core business risk and known regressions.

**Post-Design Gate Status**: ✅ **PASS**
