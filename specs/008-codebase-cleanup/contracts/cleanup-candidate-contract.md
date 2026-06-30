# Contract: Cleanup Candidate Classification

Defines the required schema for candidate classification output.

## Required Fields

- `id`: unique candidate id
- `path`: repository-relative path or symbol location
- `candidateType`: `file | directory | code-path | dependency | document`
- `classification`: `keep | remove | defer`
- `rationale`: concise reason for classification
- `staleByUsage`: `true | false`
- `workflowReferences`: list of matching active workflows (`build`, `test`, `deploy`, `required-doc`)
- `ownershipRationale`: optional owner/justification
- `riskLevel`: `low | medium | high`
- `touchedBehavior`: `true | false`

## Rules

- `classification=remove` requires explicit removal rationale.
- `classification=defer` requires linkage to deferred-item record.
- `staleByUsage=true` requires both:
  - no active workflow references
  - no active ownership rationale

## Outcome Contract

- 100% of candidates must be classified.
- No candidate may remain unclassified at feature completion.
