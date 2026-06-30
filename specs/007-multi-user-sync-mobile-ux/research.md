# Research: Lean Closeout Decisions for Spec 007

**Feature**: [007-multi-user-sync-mobile-ux](spec.md)
**Date**: 2026-06-30
**Status**: Updated for closeout planning

This document replaces greenfield research assumptions with decisions tailored to the current repository state: major feature work is already shipped, and the remaining challenge is completing Phase 4 with less churn, less duplicate testing, and fewer toolchain blockers.

---

## Decision 1: Use a Risk-Based Validation Matrix

**Decision**: Reduce Phase 4 validation to a smaller set of high-signal automated tests plus manual smoke checks for layout and accessibility.

**Rationale**:
- The existing backlog over-indexes on test count rather than failure risk.
- Redundant tests across unit, integration, and manual layers increase maintenance cost and slow delivery.
- The remaining high-risk surfaces are well-defined: sync correctness, persona deletion safety, offline queue behavior, build/lint health, and mobile clarity.

**Alternatives considered**:
- Keep the full original test expansion: rejected because it increases development time and conflict surface without equivalent risk reduction.
- Remove most testing and rely on manual validation only: rejected because it would violate the constitution and leave regressions unprotected.

---

## Decision 2: Treat Local Tooling as a Closeout Blocker

**Decision**: Resolve or explicitly document the local workflow before expanding Phase 4 validation.

**Rationale**:
- The default `npm run dev` loop is now frontend-only to stay reliable on partially configured machines.
- Full-stack local validation is available through `npm run dev:full` when tooling is installed (`concurrently`, Azure Functions Core Tools, SWA CLI).
- A repo that cannot be run predictably makes every subsequent fix or test slower and less reliable.
- Toolchain repair yields immediate value across all remaining workstreams.

**Alternatives considered**:
- Defer local tooling and validate only against deployed environments: rejected because it slows iteration and raises the cost of each fix.
- Replace the local backend workflow entirely: rejected for now because small compatibility fixes are lower risk than architectural dev-workflow changes.

---

## Decision 3: Normalize the Spec Ledger Before More Execution

**Decision**: Clean up Spec 007 task numbering, stale totals, and already-completed bugfix entries before using Phase 4 as the source of truth.

**Rationale**:
- The current task file mixes new bugfix entries with older numbering, creating duplicate IDs and stale counts.
- Execution becomes noisy when the ledger cannot be trusted.
- Backlog normalization is cheap and removes coordination friction.

**Alternatives considered**:
- Ignore the task file and track remaining work ad hoc: rejected because it undermines visibility and makes completion harder to audit.
- Rewrite every historical spec file immediately: rejected because only active Spec 007 must be normalized now.

---

## Decision 4: Keep the Existing Product Architecture

**Decision**: Preserve 1-second polling, optimistic UI, and localStorage-backed offline queue as the release architecture.

**Rationale**:
- These systems are already implemented and deployed.
- Current remaining work is validation and polish, not architectural redesign.
- Reopening infrastructure decisions would add scope without addressing the current bottlenecks.

**Alternatives considered**:
- Introduce WebSockets: rejected as unnecessary for the current finish line.
- Replace localStorage queue with IndexedDB: rejected as unnecessary complexity for the current workload.

---

## Decision 5: Prefer Manual Checks for Pure Presentation Risk

**Decision**: Keep automated tests for logic and sync behavior; prefer manual checks for tap targets, readability, focus visibility, and cross-device layout confirmation.

**Rationale**:
- UI presentation checks often become brittle when asserted at multiple layers.
- These checks are faster to confirm in targeted smoke runs than to encode and maintain across an oversized suite.
- The user specifically wants a leaner pathway that reduces code-test conflicts.

**Alternatives considered**:
- Automate every UX acceptance scenario: rejected due to maintenance overhead and low marginal value.
- Skip UX checks entirely: rejected because mobile clarity and accessibility are core parts of the feature.

---

## Decision 6: Documentation Should Be Minimal and Operational

**Decision**: Limit remaining documentation to what supports local development, release handoff, and monitoring.

**Rationale**:
- The repo already contains substantial feature documentation.
- Additional narrative docs would not materially improve release readiness.
- Minimal docs reduce drift and are more likely to stay accurate.

**Alternatives considered**:
- Add broad retrospective documentation: rejected as low value for closeout.
- Add no documentation: rejected because tooling and release operation still need concise guidance.

---

## Closeout Implications

The logical completion pathway is now:

1. Repair or document the supported local workflow.
2. Normalize active Spec 007 bookkeeping.
3. Fix any remaining user-visible bugs.
4. Validate only the highest-risk flows with a lean matrix.
5. Ship concise operational documentation.

This path preserves quality while materially reducing development time and the chances that tests become the main blocker instead of the code.
