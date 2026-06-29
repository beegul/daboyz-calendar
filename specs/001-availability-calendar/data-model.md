# Data Model: Shared Availability Calendar (Azure Backend)

## Entities

### User (Application State)
- `id`: string (UUID, unique user identifier)
- `name`: string (display name shown in the UI)
- `color`: string (CSS hex color assigned for availability markers)
- `createdAt`: timestamp (when user was first created in the calendar)

### AvailabilityEntry (Persisted in Azure Table Storage)
- `partitionKey`: string (`calendar-{month}`, e.g., `calendar-2026-07`)
- `rowKey`: string (`{userId}-{date}`, e.g., `user-1-2026-07-14`)
- `userId`: string (references User.id)
- `date`: string (ISO 8601 date, e.g., `2026-07-14`)
- `name`: string (denormalized user display name for quick reads)
- `color`: string (denormalized user color for rendering)
- `timestamp`: datetime (server timestamp for conflict resolution)

### CalendarSession (Client State)
- `currentMonth`: string (ISO month format, e.g., `2026-07`)
- `selectedUserId`: string (active user in session)
- `users`: `User[]` (pulled from backend on app load)
- `availability`: `AvailabilityEntry[]` (fetched per month)

## Relationships

- A `CalendarSession` contains many `User` entities retrieved from backend
- Each `AvailabilityEntry` references one `User` via `userId`
- Multiple entries can exist for the same date (representing different users)
- Table Storage partitioning by month enables efficient monthly queries

## Validation Rules

- Each user must have a unique `id` and distinct `color`
- Dates must be valid for the target month
- Duplicate entries for the same `userId` and `date` are toggled (insert or delete)
- All backend mutations require optimistic concurrency via `timestamp`
- Frontend should validate dates client-side before sending to backend
