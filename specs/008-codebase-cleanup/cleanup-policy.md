# Cleanup Policy (Operationally Lean)

## Policy Statement

Retain runtime code and assets required for build, test, deploy, governance, and active feature documentation. Remove generated, temporary, and stale artifacts that are not required for those outcomes.

## Classification Categories

- keep: required by active workflows or governance
- remove: unreferenced by active workflows and lacking ownership rationale
- defer: unresolved but bounded with owner/reason/milestone

## Non-Negotiable Constraints

- No feature expansion in cleanup tasks.
- No removal without rationale evidence.
- No deferred item without owner, reason, and target milestone/date.
