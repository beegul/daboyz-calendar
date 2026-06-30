# Research: Codebase Cleanup and Hygiene

**Feature**: [008-codebase-cleanup](spec.md)  
**Date**: 2026-06-30  
**Status**: Finalized for planning

## Decision 1: Use Operationally Lean Cleanup Scope

- Decision: Retain runtime code plus artifacts required for build, test, deploy, governance, and active feature documentation.
- Rationale: The user requested aggressive cleanup, but repository health requires preserving workflow-critical and governance-critical files.
- Alternatives considered:
  - Runtime-only retention: rejected due to operational risk and loss of maintainability context.
  - Conservative keep-most approach: rejected because it would not materially reduce junk artifacts.

## Decision 2: Use Risk-Based Validation Gates

- Decision: Require build + lint for all cleanup changes; require targeted high-signal regression lanes when behavior-affecting files are touched.
- Rationale: Matches constitution principle of risk-based testing while avoiding low-value over-testing.
- Alternatives considered:
  - Full-suite validation on every cleanup change: rejected as slower than needed for low-risk hygiene work.
  - Build/lint only: rejected because behavior-affecting cleanups need regression proof.

## Decision 3: Allow Controlled Deferrals Only

- Decision: Deferred cleanup items are allowed only with owner, reason, and target milestone/date.
- Rationale: Prevents backlog decay and preserves accountability.
- Alternatives considered:
  - No deferrals: rejected as too rigid for ambiguous or cross-team ownership items.
  - Flexible deferrals without target date: rejected because unresolved debt can persist indefinitely.

## Decision 4: Use Usage-Based Stale Classification

- Decision: Mark artifacts stale only when unreferenced by active build/test/deploy/required-doc workflows and lacking active ownership rationale.
- Rationale: Avoids false positives caused by age-based approaches.
- Alternatives considered:
  - Age-only policy: rejected because low-change but required files would be misclassified.
  - Hybrid age + usage policy: rejected as unnecessary complexity for current scope.

## Decision 5: Keep Cleanup Incremental and Reversible

- Decision: Execute cleanup in small slices with immediate validation and clear removal/retention records.
- Rationale: Reduces blast radius and makes rollback straightforward.
- Alternatives considered:
  - One-shot full-repo cleanup: rejected due to higher merge conflict and regression risk.

## Planning Implications

- Deliverables must include:
  - Inventory and classification records (keep/remove/defer)
  - Deferred-item tracking fields (owner, reason, milestone/date)
  - Hygiene guardrails to prevent reintroduction
  - Validation evidence tied to touched-risk level
