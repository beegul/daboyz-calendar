# Usage-Based Stale Classification

## Rule

An artifact is stale only if both conditions are true:

1. It is not referenced by active build/test/deploy/required-doc workflows.
2. It has no active ownership rationale requiring retention.

## Evidence Checklist

- Build/test/deploy script reference check
- Required documentation map check
- Ownership rationale check

## Classification Outcomes

- stale=true: eligible for remove or controlled defer
- stale=false: keep

## Notes

- Age alone is not sufficient for stale classification.
- One-time status output documents are stale if no active workflow references remain.
