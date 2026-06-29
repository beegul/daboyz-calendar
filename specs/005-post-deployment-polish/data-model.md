# Data Model: Post-Deployment Polish

**Feature**: 005-post-deployment-polish | **Date**: 2026-06-29

---

## Core Entities

### Persona

**What it represents**: A unique user/person in the calendar (e.g., "Jack", "Sarah", "Alex")

**Immutability**: Personas are immutable after creation EXCEPT for deletion (no rename, no color change after creation)

**Attributes**:
- `name`: string, 1-50 chars, alphanumeric + spaces, case-insensitive for uniqueness
- `color`: string, hex format (e.g., "#FF0000"), chosen at creation
- `created_at`: timestamp, when persona was first created

**Composite Key** (unique identifier):
- PartitionKey: YYYY-MM (month for querying by month)
- RowKey: `{persona_name}#{YYYY-MM-DD}` (for availability entries)
- Note: Personas themselves aren't stored separately; they exist through their availability entries

**Storage**: Azure Table Storage (DaboyzAvailability table)

**Validation Rules**:
- Name must not duplicate existing personas (case-insensitive check)
- Color must be valid hex format (case-insensitive)
- Both required fields

---

### Availability

**What it represents**: A day-off entry - one date when a persona is unavailable

**Attributes**:
- `persona_name`: string (matches Persona.name)
- `persona_color`: string (matches Persona.color)
- `date`: YYYY-MM-DD format
- `status`: "unavailable" (future: could extend to "available", "maybe", etc.)
- `timestamp`: ISO 8601 timestamp when entry was created/modified

**Composite Key**:
- PartitionKey: YYYY-MM (extracted from date for efficient month queries)
- RowKey: `{persona_name}#{YYYY-MM-DD}` (unique per persona per date)

**Relationships**:
- One Availability entry can only belong to one Persona (1-to-N relationship)
- One Persona can have many Availability entries (up to 365+ per year)
- Deleting a Persona MUST cascade-delete all its Availability entries

**Cascade Deletion Rule**:
- When DELETE /api/personas/{name} executes:
  1. Delete persona row (if stored separately, else skip)
  2. Delete ALL availability rows WHERE persona_name = {name}
  3. Both operations MUST be atomic (single transaction)

**Storage**: Azure Table Storage (DaboyzAvailability table)

---

### UI State (Application-Level)

**What it represents**: Transient client-side state that drives rendering

**Key State Variables**:
- `entries`: Availability[] - current month's availability entries
- `loading`: boolean - true during API fetch
- `error`: string | null - error message if fetch fails
- `lastSync`: ISO 8601 timestamp - when data was last synced
- `conflicts`: Array - detected sync conflicts (same persona/date, different timestamp)
- `useMockAPI`: boolean - true if API unavailable, using localStorage
- `visibility`: "visible" | "hidden" - page visibility state (via Page Visibility API)
- `isIdle`: boolean - true if user idle > 10 minutes (from useIdleTimeout hook)

**Hydration Strategy**:
- On page load: Initialize state from localStorage (instant, no API call)
- In background: Fetch fresh data from API
- On API response: Update state (silent update, no flicker)
- If API fails: Keep localStorage state, show offline warning

---

## Data Flow Diagrams

### User Story 1: Remove Mock Data Label

```
User creates persona
  ↓
App uses real API (mounted)
  ↓
API responds successfully
  ↓
App sets useMockAPI = false
  ↓
Mock label NOT rendered (hides or removes DOM element)
  ↓
On-screen: No "Using Mock Data" text
  ↓
[If API fails]
  ↓
App catches error, falls back to localStorage
  ↓
App sets useMockAPI = true
  ↓
OFFLINE WARNING BANNER appears (not mock data label)
```

---

### User Story 2: Eliminate Page Flicker on Refresh

```
User presses F5 (refresh page)
  ↓
React App mounts
  ↓
[Parallel]:
  - Load state from localStorage (instant)
  - Render UI with cached data
  - Fetch fresh data from API (background)
  ↓
User sees calendar IMMEDIATELY with cached data (NO FLICKER)
  ↓
API response arrives
  ↓
Update state with fresh data (silent)
  ↓
Component re-renders with latest data
  ↓
Result: Smooth load, no state transitions visible
```

---

### User Story 3: Delete Personas & Cascade

```
User clicks three-dot menu on persona
  ↓
User clicks "Delete" option
  ↓
Confirmation modal appears
  ↓
User confirms deletion
  ↓
DELETE /api/personas/{name} request sent
  ↓
[Backend - Atomic Transaction]:
  1. Delete persona entry
  2. Delete ALL availability entries WHERE persona_name = {name}
  ↓
API responds 204 No Content
  ↓
Frontend updates state:
  - Remove persona from UI
  - Remove all dates for that persona from calendar
  ↓
Calendar re-renders (shows only remaining personas)
  ↓
Result: Persona + all dates gone in <2 seconds
```

---

## Conflict Detection & Resolution

**Scenario**: Two devices edit simultaneously (mobile + PC)

**Detection Logic** (in useAvailability hook):
```javascript
// Compare old entries vs. new entries
for (each new entry from API) {
  find old entry with same (name, color, date)
  if found and timestamps differ → CONFLICT
}
```

**Resolution** (user is aware, no silent merge):
- Log conflicts to console (dev debugging)
- Store conflicts in state
- Display conflict count in UI (optional banner)
- User can manually resolve (refresh page, re-toggle availability)

**Future Enhancement**: 
- WebSocket push notifications (out of scope for Feature 005)
- Server-side conflict resolution (out of scope)

---

## Performance Considerations

### Storage Access Patterns

| Query | Partition Key | Row Key | Cost | Frequency |
|-------|--|--|--|--|
| Get month entries | YYYY-MM | * | 1 transaction (batch) | Every 2s (polling) |
| Add availability | YYYY-MM | persona#{date} | 1 transaction | Per user toggle |
| Delete availability | YYYY-MM | persona#{date} | 1 transaction | Per date removal |
| Delete persona cascade | YYYY-MM | persona#* | N transactions (N = num dates) | Per persona deletion |

**Free Tier Limit**: 100 table transactions/5 minutes (plenty for < 10 users)

### Polling Strategy (Real-Time Sync)

| State | Polling Interval | Reason |
|-------|--|--|
| Tab visible, user active | 2 seconds | Aggressive sync (user is watching) |
| Tab visible, user idle | 5 minutes | Cost protection (not watching) |
| Tab hidden | 0 (stopped) | Cost protection + battery savings |
| Tab becomes visible | Immediate fetch | Instant sync on tab switch |
| Window gets focus | Immediate fetch | Instant sync on window click |
| After user action | +100ms then fetch | Ensures other devices see change |

**Result**: Cross-device sync within 2-3 seconds max; instant on user interaction

---

## Constraints & Edge Cases

### Edge Case: Delete Only Remaining Persona

**Scenario**: Calendar has only one persona, user deletes it

**Behavior**:
1. DELETE request succeeds
2. Frontend updates state: entries = []
3. UI shows empty calendar
4. App prompts: "Create a persona to get started"

**No crash, graceful degradation**

---

### Edge Case: Cascade Delete with Hundreds of Dates

**Scenario**: Persona with entries for every day of the year (365 dates)

**Concern**: Does Azure Table Storage handle large batch delete?

**Mitigation**: 
- Use atomic transaction (single operation)
- Azure handles up to 100 items per transaction (spec: check limits)
- If > 100 dates: Loop through transactions (still atomic from user perspective)

**Future optimization**: Batch API for delete (out of scope Feature 005)

---

### Edge Case: Offline During Deletion

**Scenario**: User clicks delete, network drops before response

**Behavior**:
1. DELETE request fails (network error)
2. Frontend catches error
3. Error modal: "Failed to delete. Retry?"
4. User clicks Retry or Cancel
5. Persona remains until deletion succeeds

**No data loss, safe failure**

---

## Data Consistency Model

**Consistency Level**: Eventual consistency (Azure Table Storage default)

**Sync Strategy**: 
- Aggressive polling (2s) ensures "recent" consistency
- Immediate refresh on visibility/focus ensures quick sync
- No real-time notifications (cost consideration)

**Acceptable Latency**: 2-3 seconds max (casual app between mates)

---

## Testing Strategy (from Constitution II)

### Unit Tests
- Hydration logic (localStorage → state)
- Conflict detection (old vs. new entries)
- Cascade delete logic (verify all dates removed)
- Offline warning banner (appears/disappears on API error)

### Integration Tests
- Full persona deletion flow (click → confirm → deleted)
- Cross-device sync (change on one device, see on another within 2-3s)
- Page refresh (no flicker, cached data appears immediately)

### E2E Tests
- User creates persona, refreshes page, sees no flicker
- User marks date on phone, sees update on PC within 2s
- User deletes persona on PC, sees it gone on phone within 3s
