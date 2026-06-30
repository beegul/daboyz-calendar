# Data Model: Codebase Cleanup and Hygiene

**Feature**: [008-codebase-cleanup](spec.md)  
**Date**: 2026-06-30

## Entity: CleanupCandidate

Represents a file/directory/code-path candidate evaluated during cleanup.

- id: unique identifier (string)
- path: repository-relative path (string)
- candidateType: file | directory | code-path | dependency | document
- classification: keep | remove | defer
- staleByUsage: true | false
- workflowReferences: list of workflow references (build/test/deploy/docs)
- ownershipRationale: optional rationale for active ownership
- riskLevel: low | medium | high
- touchedBehavior: true | false
- notes: optional string

Validation rules:
- classification is required.
- classification=remove requires removalReason.
- classification=defer requires DeferredItem linkage.
- staleByUsage=true requires evidence of missing active workflow references.

## Entity: RemovalRecord

Tracks what was removed and why.

- id: unique identifier
- candidateId: reference to CleanupCandidate
- removedBy: owner identifier
- removedOn: timestamp/date
- removalReason: concise explanation
- rollbackHint: optional restoration hint

Validation rules:
- removalReason required.
- candidate classification must be remove.

## Entity: DeferredItem

Tracks explicitly deferred cleanup work.

- id: unique identifier
- candidateId: reference to CleanupCandidate
- owner: required owner
- reason: required reason
- targetMilestone: required milestone or date
- status: open | resolved

Validation rules:
- owner, reason, and targetMilestone are mandatory.
- status transitions:
  - open -> resolved
  - resolved is terminal for this feature scope.

## Entity: HygieneRule

Captures guardrails preventing junk-code/junk-file reintroduction.

- id: unique identifier
- ruleText: actionable rule statement
- enforcementPoint: pre-commit | review-checklist | docs | ignore-rules
- appliesTo: artifact classes/patterns
- exceptionPolicy: optional exception handling

Validation rules:
- ruleText and enforcementPoint are required.

## Entity: ValidationEvidence

Records quality-gate proof for cleanup changes.

- id: unique identifier
- changeScope: artifact-only | behavior-affecting
- buildResult: pass | fail
- lintResult: pass | fail
- targetedRegressionResult: pass | fail | not-required
- evidenceReference: command output summary or file link

Validation rules:
- buildResult and lintResult required for all scopes.
- targetedRegressionResult required when changeScope=behavior-affecting.
