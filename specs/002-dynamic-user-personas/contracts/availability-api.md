# API Contracts: Availability Endpoints (Updated for Dynamic Personas)

**Purpose**: Define HTTP API contract for persona-aware availability management  
**Version**: 2.0 (Updated from Phase 1 v1.0)  
**Created**: 2026-06-29  
**Base URL**: `http://localhost:7071/api` (development)  

---

## Endpoint: GET /api/availability

Retrieve all availability entries for a specified month.

### Request

**Method**: `GET`  
**URL**: `/api/availability?month={month}`  

**Query Parameters**:
| Parameter | Type | Required | Format | Example | Description |
|-----------|------|----------|--------|---------|-------------|
| month | string | Yes | YYYY-MM | 2026-06 | Month to query |

**Headers**:
```
Content-Type: application/json
```

**Body**: None

### Response

**Status Code**: 200 OK  
**Content-Type**: `application/json`

**Success Response**:
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
    },
    {
      "name": "Alice",
      "color": "#2563eb",
      "date": "2026-06-20",
      "timestamp": "2026-06-29T10:32:00Z"
    }
  ]
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Invalid month format. Expected YYYY-MM",
  "code": "INVALID_MONTH_FORMAT"
}
```

### Behavior

- Returns all availability entries for the requested month
- Entries grouped by (name, color, date) composite key
- Results ordered by date ascending
- No filtering applied; frontend handles display logic

---

## Endpoint: POST /api/availability

Create or update an availability entry (toggle).

### Request

**Method**: `POST`  
**URL**: `/api/availability`  

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "name": "Alice",
  "color": "#2563eb",
  "date": "2026-06-15"
}
```

**Body Parameters**:
| Field | Type | Required | Constraints | Example |
|-------|------|----------|-------------|---------|
| name | string | Yes | 1-50 chars, alphanumeric + spaces | Alice |
| color | string | Yes | Hex format #RRGGBB | #2563eb |
| date | string | Yes | YYYY-MM-DD format, valid date | 2026-06-15 |

### Response

**Status Code**: 201 Created (new entry) or 200 OK (updated entry)  
**Content-Type**: `application/json`

**Success Response**:
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

**Update Response** (entry already exists):
```json
{
  "status": "success",
  "action": "updated",
  "entry": {
    "name": "Alice",
    "color": "#2563eb",
    "date": "2026-06-15",
    "timestamp": "2026-06-29T10:35:00Z"
  }
}
```

**Error Response** (400 Bad Request - Validation):
```json
{
  "error": "Invalid name: must be 1-50 characters",
  "code": "INVALID_NAME"
}
```

**Error Response** (400 Bad Request - Invalid Color):
```json
{
  "error": "Invalid color format. Expected hex #RRGGBB",
  "code": "INVALID_COLOR"
}
```

**Error Response** (400 Bad Request - Invalid Date):
```json
{
  "error": "Invalid date format. Expected YYYY-MM-DD",
  "code": "INVALID_DATE"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Failed to store availability entry",
  "code": "STORAGE_ERROR"
}
```

### Behavior

- **Idempotent**: If entry exists, updates timestamp and returns 200 with "updated" action
- **Creates implicitly**: Personas don't require separate creation endpoint
- **Timestamp**: Auto-generated server-side (not accepted from client)
- **No Delete via POST**: Use DELETE endpoint to remove

---

## Endpoint: DELETE /api/availability

Remove an availability entry.

### Request

**Method**: `DELETE`  
**URL**: `/api/availability?name={name}&color={color}&date={date}`  

**Query Parameters**:
| Parameter | Type | Required | Format | Example | Description |
|-----------|------|----------|--------|---------|-------------|
| name | string | Yes | alphanumeric + spaces | Alice | Persona name |
| color | string | Yes | hex #RRGGBB | #2563eb | Persona color |
| date | string | Yes | YYYY-MM-DD | 2026-06-15 | Date to remove |

**Headers**:
```
Content-Type: application/json
```

**Body**: None

### Response

**Status Code**: 204 No Content (silent success) or 200 OK (with body)  
**Content-Type**: `application/json` (if status 200)

**Success Response** (204 No Content):
```
[empty body]
```

**Success Response** (200 OK):
```json
{
  "status": "success",
  "action": "deleted",
  "name": "Alice",
  "color": "#2563eb",
  "date": "2026-06-15"
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Entry not found",
  "code": "NOT_FOUND"
}
```

**Error Response** (400 Bad Request - Validation):
```json
{
  "error": "Invalid query parameters",
  "code": "INVALID_PARAMS"
}
```

### Behavior

- Deletes entry with matching (name, color, date) composite key
- Returns 404 if entry doesn't exist (or 204 silently)
- No cascade; only deletes the specific entry
- Safe to call multiple times (idempotent)

---

## Endpoint: GET /api/availability/personas

Retrieve distinct personas active in a month (for UI selector).

### Request

**Method**: `GET`  
**URL**: `/api/availability/personas?month={month}`  

**Query Parameters**:
| Parameter | Type | Required | Format | Example |
|-----------|------|----------|--------|---------|
| month | string | Yes | YYYY-MM | 2026-06 |

**Headers**:
```
Content-Type: application/json
```

**Body**: None

### Response

**Status Code**: 200 OK  
**Content-Type**: `application/json`

**Success Response**:
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

**Error Response** (400 Bad Request):
```json
{
  "error": "Invalid month format. Expected YYYY-MM",
  "code": "INVALID_MONTH_FORMAT"
}
```

### Behavior

- Returns unique (name, color) tuples from all availability entries in the month
- Used by frontend to populate persona selector dropdown
- Results ordered by name alphabetically
- Empty array if no personas have entries in the month

---

## Error Response Format (Global)

All error responses follow this structure:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {}  // Optional, for additional context
}
```

**Common Error Codes**:
- `INVALID_MONTH_FORMAT`: Month parameter not YYYY-MM format
- `INVALID_NAME`: Name validation failed
- `INVALID_COLOR`: Color not valid hex
- `INVALID_DATE`: Date not valid YYYY-MM-DD or invalid Gregorian date
- `NOT_FOUND`: Entry doesn't exist
- `STORAGE_ERROR`: Backend storage failure
- `INTERNAL_ERROR`: Unexpected server error

---

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, POST (update), DELETE (with body) |
| 201 | Created | POST creating new entry |
| 204 | No Content | DELETE silent success |
| 400 | Bad Request | Invalid params, validation errors |
| 404 | Not Found | Entry not found (alternative to 400) |
| 500 | Internal Server Error | Storage or unexpected errors |

---

## Rate Limiting & Timeouts

- **No explicit rate limiting** (local dev); production may add 100 req/s per IP
- **Request timeout**: 10 seconds
- **Payload size limit**: 1 MB

---

## CORS & Authentication

- **CORS**: Not required for same-origin requests; enable if needed for cross-origin
- **Authentication**: None (local dev); production may require bearer token
- **Authorization**: None (all personas public); production may require ownership check

---

## Change Log

### v2.0 (2026-06-29) - Dynamic Personas

**Changes**:
- Updated endpoint responses to use `{name, color}` instead of `userId`
- Added new endpoint: `GET /api/availability/personas`
- Updated row key format to composite: `{name}#{color}#{date}`
- Query parameters now use `name`, `color`, `date` fields
- Request bodies now use `name`, `color`, `date` fields
- Personas implicitly created on first availability entry

**Backward Compatibility**: Phase 1 userId entries remain queryable but hidden from UI

### v1.0 (2026-06-15) - Initial Phase 1

**Original endpoints**: GET/POST/DELETE with `userId` field

---

## Related Documents

- [Data Model](../data-model.md) - Entity definitions
- [Specification](../spec.md) - Feature requirements
- [Quickstart](../quickstart.md) - Test scenarios
