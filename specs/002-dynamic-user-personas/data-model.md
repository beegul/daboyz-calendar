# Data Model: Dynamic User Personas

**Purpose**: Define entities, relationships, and data structures for persona support  
**Version**: 1.0  
**Created**: 2026-06-29  

---

## Entity: Availability (Updated)

Stores availability markings with persona identity embedded as composite key.

```
Availability {
  name: string              # Persona name (1-50 chars, required, trimmed)
  color: string             # Hex color code #RRGGBB (required, valid hex)
  date: string              # ISO date YYYY-MM-DD (required)
  timestamp: string         # ISO 8601 timestamp (auto-set on creation, updated on modification)
}
```

### Primary Key
**Composite Key**: `(name, color, date)`
- Uniquely identifies a persona's availability for a specific date
- Across all devices: same name + same color = same persona
- Different color with same name = different persona

### Storage Schema (Azure Table Storage)
- **Partition Key**: `calendar-{YYYY-MM}` (unchanged from Phase 1)
- **Row Key**: `{name}#{color}#{date}`
  - Example: `"Alice#2563eb#2026-06-15"`
  - Format allows queries by prefix (month already in partition key)
  - Safe: name/color/date URLs encoded before # insertion

### Query Patterns
1. **Get all availability for month**:
   - Query: PartitionKey == "calendar-2026-06"
   - Returns: All {name, color, date, timestamp} tuples

2. **Get availability by persona (name, color)**:
   - Query: PartitionKey == "calendar-2026-06" AND RowKey.startswith("{name}#{color}#")
   - Returns: All dates for that (name, color) persona

3. **Get distinct personas in a month**:
   - Query: PartitionKey == "calendar-2026-06"
   - Group results by (name, color)
   - Returns: Unique {name, color} tuples

### Data Validation Rules

| Field | Type | Min | Max | Format | Rule |
|-------|------|-----|-----|--------|------|
| name | string | 1 | 50 | alphanumeric + spaces | Trimmed, no leading/trailing spaces, no special chars |
| color | string | 7 | 7 | hex | Format: #RRGGBB, valid hex digits |
| date | string | 10 | 10 | ISO date | Format: YYYY-MM-DD, valid Gregorian date |
| timestamp | string | 20 | 30 | ISO 8601 | Format: 2026-06-29T12:34:56Z, UTC |

### Indexes (Recommended)

No secondary indexes required. Partition key + prefix queries on row key provide sufficient performance.

---

## Session Storage: Active Persona (Client-Side)

Stores the active persona in browser session storage.

### localStorage Keys
```
"personas_storage" = [
  {name: "Alice", color: "#2563eb"},
  {name: "Bobby", color: "#f59e0b"},
  {name: "Carmen", color: "#10b981"}
]

"active_persona" = {name: "Alice", color: "#2563eb"}
```

### Scope
- **Per-browser**: Each browser maintains its own list
- **Per-session**: Cleared only on explicit sign-out or browser cache clear
- **Persistent**: Survives page refresh and navigation

### Size Estimate
- Personas list: ~50 bytes per persona × 20 personas = 1KB typical
- Active persona: ~50 bytes
- **Total**: ~1-2 KB
- **Limit**: localStorage ~5-10 MB available; no concern for typical usage

---

## API Response Schema (Updated)

### GET /api/availability?month=YYYY-MM

```json
{
  "status": "success",
  "month": "2026-06",
  "entries": [
    {
      "name": "Alice",
      "color": "#2563eb",
      "date": "2026-06-15",
      "timestamp": "2026-06-29T10:30:00Z"
    },
    {
      "name": "Bobby",
      "color": "#f59e0b",
      "date": "2026-06-15",
      "timestamp": "2026-06-29T10:31:00Z"
    }
  ]
}
```

### POST /api/availability (Create/Update)

**Request**:
```json
{
  "name": "Alice",
  "color": "#2563eb",
  "date": "2026-06-15"
}
```

**Response** (201 Created or 200 OK):
```json
{
  "status": "success",
  "action": "created",
  "entry": {
    "name": "Alice",
    "color": "#2563eb",
    "date": "2026-06-15",
    "timestamp": "2026-06-29T10:30:00Z"
  }
}
```

### DELETE /api/availability?name={name}&color={color}&date={date}

**Response** (204 No Content or 200 OK):
```json
{
  "status": "success",
  "action": "deleted",
  "name": "Alice",
  "color": "#2563eb",
  "date": "2026-06-15"
}
```

### GET /api/availability/personas?month=YYYY-MM (New Endpoint)

Returns distinct personas active in a month (for persona selector).

**Response**:
```json
{
  "status": "success",
  "month": "2026-06",
  "personas": [
    {"name": "Alice", "color": "#2563eb"},
    {"name": "Bobby", "color": "#f59e0b"},
    {"name": "Carmen", "color": "#10b981"}
  ]
}
```

---

## Migration Strategy

### Handling Phase 1 Data
- Phase 1 entries use `userId` field (Alice, Bobby, Carmen)
- Phase 2 entries use `(name, color)` composite key
- **Coexistence**: Both schemas can coexist during transition
- **Cleanup**: Optional one-time migration script to transform old userId entries to (name, color) tuples
- **No Data Loss**: Existing availability data preserved; old entries queryable by original user IDs

### Transition Flow
1. Deploy Phase 2 backend (accepts both old and new schemas)
2. Deploy Phase 2 frontend (reads (name, color) entries)
3. Users create personas → new entries stored with (name, color) keys
4. Old entries remain but not displayed (require userId which is no longer in UI)
5. Optional: Batch job to transform old entries if full cleanup needed

---

## Assumptions & Constraints

1. **Persona identity is (name, color), not UUID**
   - Enables cross-device sync without centralized ID registry
   - Implicit persona creation on first availability entry

2. **No separate Personas table**
   - Personas metadata lives in Availability entries
   - Reduces schema complexity
   - Personas don't exist without availability data

3. **Name validation is basic**
   - 1-50 characters, alphanumeric + spaces, no special chars
   - No reserved words or length limits beyond 50 chars

4. **Color validation requires valid hex**
   - HTML `<input type="color">` ensures valid format from UI
   - Backend validates format for API calls

5. **Timestamp is server-generated**
   - Not accepted from client
   - Prevents clock-skew issues
   - Azure Table Storage server timestamp used

---

## Testing Data

### Test Fixtures

```python
# Test personas
FIXTURE_PERSONAS = [
    {"name": "Alice", "color": "#2563eb"},
    {"name": "Bobby", "color": "#f59e0b"},
    {"name": "Carmen", "color": "#10b981"},
    {"name": "David", "color": "#8b5cf6"},
]

# Test entries
FIXTURE_AVAILABILITY = [
    {"name": "Alice", "color": "#2563eb", "date": "2026-06-15"},
    {"name": "Alice", "color": "#2563eb", "date": "2026-06-20"},
    {"name": "Bobby", "color": "#f59e0b", "date": "2026-06-15"},
]
```

---

## Related Documents

- [Specification](../spec.md) - Feature requirements
- [API Contracts](./contracts/availability-api.md) - Endpoint specifications
- [Quickstart](../quickstart.md) - Validation test scenarios
