# Contract: Cleanup Validation Evidence

Defines required gate evidence for cleanup changes.

## Required Fields

- `changeScope`: `artifact-only | behavior-affecting`
- `buildResult`: `pass | fail`
- `lintResult`: `pass | fail`
- `targetedRegressionResult`: `pass | fail | not-required`
- `evidenceSummary`: concise command/result summary

## Rules

- Build and lint are mandatory for all cleanup changes.
- Targeted high-signal regression evidence is mandatory when `changeScope=behavior-affecting`.
- `targetedRegressionResult=not-required` is valid only for `artifact-only` scope.

## Outcome Contract

- Every cleanup PR includes required validation evidence.
- No behavior-affecting cleanup may merge without targeted regression proof.
