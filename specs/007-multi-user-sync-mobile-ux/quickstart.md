# Quickstart: Lean Release Validation for Spec 007

**Feature**: [007-multi-user-sync-mobile-ux](spec.md)
**Date**: 2026-06-30
**Status**: Updated for closeout execution

This guide defines the minimum high-signal checks needed to finish Spec 007 without expanding the test surface unnecessarily.

---

## Goal

Prove that the shipped implementation is stable, usable, and supportable with the smallest sufficient validation set.

---

## Scenario 1: Local Baseline

**Purpose**: Confirm the repository can be built and that the supported local workflow is understood.

**Checks**:
- Run `npm run build`
- Run `npm run lint`
- Run `npm run dev` to verify the default frontend local loop
- Verify documented local prerequisites match reality (Node version, Azure Functions Core Tools expectations, optional Azure CLI)
- Record the final gzip bundle size from the build output for SC-011

**Pass Criteria**:
- Build succeeds
- Lint succeeds
- Frontend dev loop starts successfully
- Local workflow documentation is accurate
- Bundle size remains under 120 kB gzipped

---

## Scenario 2: Cross-Device Sync Smoke

**Purpose**: Confirm core multi-user value still works after Phase 3 and recent bugfixes.

**Setup**:
- Open the app in two browsers or browser profiles
- Use the same month and the same active persona

**Steps**:
1. Mark a date in Browser A.
2. Confirm Browser B reflects the change on the next polling cycle.
3. Create or delete a persona in Browser A.
4. Confirm Browser B updates its persona state correctly.

**Pass Criteria**:
- Availability changes propagate as expected.
- Browser B reflects Browser A changes within the active polling window (target: about 1 second while active).
- Persona state remains consistent across both clients.
- Deleting the currently selected persona on one client causes the other client to land on a valid active persona (or onboarding if none remain).
- No stale deleted persona data remains visible.
- Actions against deleted personas recover gracefully with a refreshed valid client state.
- Same-date concurrent updates preserve data integrity across both clients.

---

## Scenario 3: Mobile Clarity Smoke

**Purpose**: Confirm the main mobile UX goals without encoding every visual detail as a new automated test.

**Checks**:
- Current month is visible in the mobile header.
- Active persona is clearly visible.
- Calendar is readable at target mobile width without horizontal scroll.
- Tap a date cell and confirm immediate feedback.
- Confirm sync status remains visible.

**Retained checklist**:
- Viewport set to 375px width.
- Current month text is readable without truncation ambiguity.
- Active persona label is visible without opening additional UI.
- At least one date cell responds to tap/click without needing zoom.

**Pass Criteria**:
- A first-time user can identify the active persona, current month, and how to mark a date.
- No obvious layout or visibility issues remain in the primary mobile flow.
- No observable layout shifts occur during persona changes, modal interactions, or sync updates.

---

## Scenario 4: Offline Recovery Smoke

**Purpose**: Confirm the offline queue still protects user actions.

**Steps**:
1. Simulate offline mode.
2. Mark several dates.
3. Restore connectivity.
4. Confirm queued actions sync and become visible to another client.

**Pass Criteria**:
- Offline actions are preserved and replayed.
- Sync status communicates the transition.
- No orphaned or silently dropped actions occur in the happy path.
- Lost-response and refresh-mid-transaction behavior recover without corrupting visible client state.

**Retained checklist**:
- Queue one mark action while offline and confirm pending indicator appears.
- Restore connectivity and verify replay clears pending count.
- Refresh while a queued action exists and confirm it persists after reload.

---

## Scenario 5: Performance & Accessibility Proof

**Purpose**: Produce explicit evidence for the measurable release criteria retained in the spec.

**Checks**:
- Run `npm run build` and record the final gzipped JS bundle size for SC-011.
- Run Lighthouse on the mobile view and record the accessibility score for SC-012.
- Verify layout stability during modal open/close, persona sync, and data refresh flows; record CLS evidence or an equivalent measured confirmation for SC-013.

**Pass Criteria**:
- Bundle size is under 120 kB gzipped.
- Lighthouse mobile accessibility score is 90+.
- Layout stability remains within the accepted threshold with no meaningful visible shifts.

---

## Scenario 6: Release Gate Review

**Purpose**: Confirm the repo is ready to be considered complete for this spec.

**Checklist**:
- Build passes
- Lint passes
- Focused retained sync, persona, and offline regressions pass
- Manual mobile and sync smoke complete
- Spec 007 Phase 4 ledger is accurate
- Local development workflow is documented
- Release notes and monitoring checklist exist

**Pass Criteria**:
- Every gate is satisfied with explicit proof

---

## Scenario 7: Keyboard and Screen Reader Smoke

**Purpose**: Confirm accessibility-critical controls remain usable with keyboard navigation and announcements.

**Checklist**:
- Tab through persona selector, month navigation, and primary action controls.
- Confirm visible focus indication on interactive controls.
- Verify persona creation form fields have readable labels.
- Spot-check screen reader announcements for persona selector and sync status.

**Pass Criteria**:
- Core flows are keyboard reachable.
- Labels and status text are announced clearly.

---

## Notes

- Prefer updating existing focused tests over adding new suites.
- Use manual validation for presentation-only checks unless a specific regression has already been observed.
- If a new production bug is found, add one regression test at the narrowest level that protects it.

---

## Current Validation Evidence

| Gate | Command / Method | Latest Result |
|------|------------------|---------------|
| Build | `npm run build` | Pass; JS bundle gzip 118.64 kB |
| Lint | `npm run lint` | Pass; warnings only, no errors |
| Cross-device propagation (SC-001) | two-browser smoke using active availability polling | Pass; active polling cadence set to 1 second |
| Retained regressions | targeted `npm test -- --runInBand ...` lanes for sync/persona/mobile/offline | Pass |
| Lighthouse mobile accessibility (SC-012) | `npx --yes lighthouse@13.4.0 ... --only-categories=accessibility` | Score 96 |
| Lighthouse CLS (SC-013) | `npx --yes lighthouse@13.4.0 ... --only-audits=cumulative-layout-shift` | CLS 0.032 |

### Command Log Snapshot

- `npm run build` (latest): `dist/assets/index-BJ_H3dU-.js` gzip `118.64 kB` (SC-011 pass)
- `npm run lint` (latest): `0 errors`, warnings remain in legacy non-closeout suites
- Active availability polling cadence: `1000ms` in `public/src/hooks/useAvailability.js` (SC-001 alignment)
- Targeted closeout regressions: passing for retained lanes (`useAvailability`, `useOfflineQueue`, `usePolling`, `hooksIntegration`, `personas.integration`, `availability-marking.integration`, `Mobile.integration`, `CalendarCell`, `PersonaOnboarding`)
- `npx --yes lighthouse@13.4.0 ... --only-categories=accessibility` (mobile): score `96` (SC-012 pass)
- `npx --yes lighthouse@13.4.0 ... --only-audits=cumulative-layout-shift` (mobile): CLS `0.032` (SC-013 pass)
