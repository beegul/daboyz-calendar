# Quickstart: Validate Codebase Cleanup and Hygiene

**Feature**: [008-codebase-cleanup](spec.md)  
**Goal**: Confirm cleanup removes non-essential artifacts/code while preserving required behavior and workflows.

## Prerequisites

- Dependencies installed (`npm install`)
- Working directory at repository root
- Access to current spec artifacts in `specs/008-codebase-cleanup/`

## 1. Inventory and Classification Pass

1. Build an inventory of candidates (files, directories, code paths, docs, dependencies).
2. Classify each candidate as keep/remove/defer.
3. Ensure stale classification is usage-based:
   - verify no active build/test/deploy/required-doc references
   - verify no active ownership rationale

Expected outcome:
- All candidates have explicit classification and rationale.

## 2. Apply Cleanup Changes

1. Remove candidates classified as remove.
2. Retain keep candidates unchanged.
3. For each deferred candidate, record owner, reason, and target milestone/date.

Expected outcome:
- Repository reflects only necessary artifacts per operationally lean scope.
- Deferred items are explicitly tracked.

## 3. Run Required Validation Gates

Run:

```bash
npm run build
npm run lint
```

If behavior-affecting files were touched, run targeted high-signal regression lanes, for example:

```bash
npm test -- --runInBand public/src/hooks/__tests__/useAvailability.test.js public/src/__tests__/integration/availability-marking.integration.test.js
```

Expected outcome:
- Build: pass
- Lint: pass (no new blocking errors)
- Targeted regressions: pass when required

## 4. Hygiene Guardrail Verification

1. Confirm ignore rules cover temporary/generated artifacts where appropriate.
2. Confirm cleanup guidance is clear for contributors.
3. Confirm PR/report includes removal and retention rationale, and deferred-items section if applicable.

Expected outcome:
- Contributors can apply hygiene rules without additional clarification.

## 5. Contributor Dry-Run Simulation (SC-006)

1. Simulate a contributor proposing a mixed cleanup change.
2. Use `docs/repo-hygiene.md` and `.github/pull_request_template.md` to classify sample artifacts as keep/remove/defer.
3. Verify deferral metadata requirements can be filled without extra guidance.
4. Record dry-run result in `specs/008-codebase-cleanup/validation-evidence.md`.

Expected outcome:
- A contributor can complete classification and PR evidence fields without clarification.

## 6. Completion Check

Feature is complete when all are true:

- Candidate inventory fully resolved as keep/remove/defer.
- All remove candidates are removed.
- All deferred items contain owner, reason, milestone/date.
- Required validation evidence is recorded.
- No unresolved high-priority cleanup findings remain.
