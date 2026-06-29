# Contract: Azure Table Storage Schema

The app persists availability state in Azure Table Storage, with cross-device sync enabled via REST API.

## Table: Availability

**Partition Key**: `calendar-{YYYY-MM}` (e.g., `calendar-2026-07`)  
**Row Key**: `{userId}-{date}` (e.g., `alice-2026-07-14`)

### Record Structure

```json
{
  "PartitionKey": "calendar-2026-07",
  "RowKey": "alice-2026-07-14",
  "userId": "alice",
  "date": "2026-07-14",
  "name": "Alice",
  "color": "#2563eb",
  "timestamp": "2026-06-29T15:30:45.123Z"
}
```

## Queries

- **Get all availability for a month**: `PartitionKey = 'calendar-{month}'`
- **Get one user's availability for a month**: `PartitionKey = 'calendar-{month}' AND RowKey.startswith('{userId}')`
- **Toggle availability**: Check if RowKey exists; DELETE if exists, INSERT if not

## Rules

- Partition key ensures efficient monthly queries and auto-archiving of old months
- Row key uniqueness prevents duplicate entries for the same user/date
- Timestamp field enables optimistic concurrency in multi-user scenarios
- Denormalized `name` and `color` fields avoid extra lookups during rendering
- All mutations should check timestamp before write to detect conflicts
