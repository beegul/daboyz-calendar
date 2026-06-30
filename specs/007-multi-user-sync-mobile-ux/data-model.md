# Data Model: Lean Completion Model for Spec 007

**Feature**: [007-multi-user-sync-mobile-ux](spec.md)
**Date**: 2026-06-30
**Status**: Updated for Phase 4 closeout

This artifact no longer models greenfield implementation details. It models the state required to complete, validate, and release the already-built feature with minimal waste.

---

## Entity: Completion Work Item

Represents one remaining unit of work that must be tracked to close Spec 007.

```typescript
interface CompletionWorkItem {
  id: string;                 // Unique task identifier
  stream: 'tooling' | 'ledger' | 'bugfix' | 'validation' | 'docs';
  title: string;
  priority: 'critical' | 'high' | 'medium';
  automationTier: 'automated' | 'manual' | 'none';
  status: 'todo' | 'in-progress' | 'done' | 'deferred';
  blocking: boolean;
  proof: string | null;       // build output, test name, manual note, etc.
}
```

### Rules

- Each remaining Phase 4 item must map to one workstream.
- Each item must have exactly one primary proof surface.
- If a manual check fully proves an item, a duplicate automated test is not required unless the risk is regression-prone.

---

## Entity: Validation Tier

Represents the minimum acceptable proof for a behavior.

```typescript
interface ValidationTier {
  name: 'build-lint' | 'logic-regression' | 'integration-regression' | 'manual-smoke';
  purpose: string;
  appliesTo: string[];
  required: boolean;
}
```

### Tier Definitions

1. **build-lint**
   - Proves the code compiles and satisfies static quality checks.

2. **logic-regression**
   - Covers hooks or utility logic where failures cause incorrect sync/offline behavior.

3. **integration-regression**
   - Covers full user flows that are expensive to break: multi-user sync, persona deletion safety, offline queue recovery.

4. **manual-smoke**
   - Covers presentation and operational checks: mobile clarity, focus visibility, tap targets, two-browser verification, deployment smoke.

---

## Entity: Release Gate

Represents a must-pass condition before calling Spec 007 complete.

```typescript
interface ReleaseGate {
  code: string;
  description: string;
  proofType: 'command' | 'test' | 'manual' | 'document';
  ownerSurface: string;
  satisfied: boolean;
}
```

### Required Release Gates

| Gate | Description | Proof Type | Owner Surface |
|------|-------------|------------|---------------|
| RG-01 | Build succeeds | command | `npm run build` |
| RG-02 | Lint succeeds | command | `npm run lint` |
| RG-03 | Critical sync/offline regressions pass | test | retained focused tests |
| RG-04 | Mobile smoke confirms clarity and tap usability | manual | real device or responsive browser pass |
| RG-05 | Active Phase 4 ledger is accurate | document | `tasks.md` |
| RG-06 | Local workflow is documented and supportable | document | `README.md` or local-dev section |
| RG-07 | Release notes and monitoring checklist exist | document | changelog + monitoring note |

---

## Mapping Remaining Work to Validation

| Workstream | Typical Proof |
|------------|---------------|
| tooling | command output + doc update |
| ledger | spec/task file update |
| bugfix | focused validation for the touched slice |
| validation | retained test or manual smoke |
| docs | concise operational artifact |

For local workflow proof, frontend-only validation is acceptable when full local API emulation tools are unavailable, as long as skipped checks are explicitly documented.

---

## Pruning Rules

These rules keep the project lean while remaining constitution-compliant.

1. Do not add a new automated test if an existing retained test plus manual smoke already proves the behavior.
2. Do not create both a unit and integration test for the same trivial presentation detail.
3. Prefer updating one existing high-signal regression test over creating a new parallel suite.
4. Convert presentation-only backlog items to manual checks unless they protect a known recurring defect.
5. Treat documentation as complete when it enables local execution, release understanding, and monitoring; no extra narrative docs are required.

---

## Closeout State Transitions

```text
tooling blocked
  -> tooling validated
  -> ledger normalized
  -> critical bugs resolved
  -> lean validation passed
  -> release docs finished
  -> spec complete
```

This is the target state machine for the rest of Spec 007.
