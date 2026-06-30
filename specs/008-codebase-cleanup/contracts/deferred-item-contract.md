# Contract: Deferred Cleanup Item

Defines mandatory metadata for controlled deferrals.

## Required Fields

- `id`: unique deferred item id
- `candidateId`: reference to cleanup candidate
- `owner`: accountable owner
- `reason`: why deferral is necessary
- `targetMilestone`: milestone name or explicit target date
- `status`: `open | resolved`

## Rules

- Deferrals are valid only when all required fields are present.
- `status=open` items must be visible in completion reporting.
- `status` can transition from `open` to `resolved`.

## Outcome Contract

- 100% of deferred items include owner, reason, and target milestone/date.
- No anonymous or unbounded deferrals are permitted.
