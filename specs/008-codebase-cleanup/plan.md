# Implementation Plan: Codebase Cleanup and Hygiene

**Branch**: `[008-codebase-cleanup]` | **Date**: 2026-06-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-codebase-cleanup/spec.md`

## Summary

Perform an operationally lean cleanup pass across the repository to remove non-essential artifacts and redundant/dead code, while preserving runtime behavior and workflow-critical assets (build/test/deploy/governance/active feature docs). The execution strategy is incremental and risk-based: classify candidates as keep/remove/defer, enforce controlled deferrals with ownership metadata, and validate each change scope using required gates.

## Technical Context

**Language/Version**: JavaScript/JSX (React 19 + Vite 5), Python (Azure Functions runtime), Markdown/docs

**Primary Dependencies**: React, Vite, Jest, ESLint, Azure Functions Core Tools, SWA CLI

**Storage**: Azure Table Storage for app runtime data; repository files for cleanup targets

**Testing**: Jest + React Testing Library for frontend; risk-based targeted regression lanes; lint/build gates

**Target Platform**: Web frontend + Azure Functions backend; local dev on Windows/macOS/Linux

**Project Type**: Web application with frontend + serverless API + repository documentation/spec artifacts

**Performance Goals**:
- Preserve existing release baseline (bundle budget under current threshold)
- No performance regression from cleanup-induced code changes

**Constraints**:
- No active feature expansion in this scope
- Cleanup must preserve deployability and maintainability
- Stale classification must be usage-based, not age-only
- Deferrals require owner + reason + target milestone/date

**Scale/Scope**:
- Whole-repository hygiene pass
- Includes file artifacts, docs footprint, and code-path simplification
- Excludes new product features and architectural rewrites

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate Review

- Code Quality: PASS (cleanup explicitly targets removal of junk and simplification)
- Test Standards: PASS (risk-based validation defined in spec clarification)
- UX Consistency: PASS (no net-new UX behavior planned; behavior-preserving cleanup)
- Performance Requirements: PASS (no regression policy and existing baseline preservation)
- Simplicity: PASS (incremental, reversible cleanup strategy)

**Pre-Design Gate Status**: PASS

### Post-Design Gate Review

- Research, data model, contracts, and quickstart preserve constitution requirements.
- Validation contract explicitly enforces build/lint for all changes and targeted regressions when behavior is touched.
- No constitution violations identified.

**Post-Design Gate Status**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/008-codebase-cleanup/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cleanup-candidate-contract.md
│   ├── deferred-item-contract.md
│   └── validation-evidence-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
api/
├── function_app.py
├── routes/
├── models/
└── requirements.txt

public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── context/
│   ├── api/
│   ├── utils/
│   └── __tests__/
└── index.html

docs/
infra/
tests/
specs/
```

**Structure Decision**: Keep existing web + serverless structure and focus this feature on repository hygiene decisions (keep/remove/defer) rather than structural migration.

## Phase 0: Research Output

Research completed in [research.md](research.md):

- Operationally lean cleanup scope selected
- Risk-based validation gates selected
- Controlled deferral policy selected
- Usage-based stale classification selected
- Incremental and reversible execution selected

All prior clarification points are resolved.

## Phase 1: Design Output

Design artifacts created:

- Data model: [data-model.md](data-model.md)
- Contracts:
  - [contracts/cleanup-candidate-contract.md](contracts/cleanup-candidate-contract.md)
  - [contracts/deferred-item-contract.md](contracts/deferred-item-contract.md)
  - [contracts/validation-evidence-contract.md](contracts/validation-evidence-contract.md)
- Quickstart validation guide: [quickstart.md](quickstart.md)

## Implementation Strategy (for tasks phase)

1. Inventory repository candidates and classify keep/remove/defer.
2. Apply low-risk artifact removals first.
3. Apply code cleanup in small slices.
4. Validate each slice with required gates.
5. Record removal/retention rationale and controlled deferrals.
6. Final hygiene guardrail pass and completion report.

## Complexity Tracking

No constitution violations requiring justification.
