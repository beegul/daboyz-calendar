# Contract: REST API Endpoints

The backend exposes REST endpoints via Azure Functions for availability state management and cross-device sync.

## Base URL

```
https://<static-web-app-name>.azurestaticapps.net/api
```

Local development:
```
http://localhost:7071/api
```

## Endpoints

### 1. Get Availability by Month

**Endpoint**: `GET /availability?month={YYYY-MM}`

**Query Parameters**:
- `month` (required): ISO month string, e.g., `2026-07`

**Response** (200 OK):

```json
{
  "month": "2026-07",
  "entries": [
    {
      "userId": "alice",
      "date": "2026-07-14",
      "name": "Alice",
      "color": "#2563eb"
    },
    {
      "userId": "carmen",
      "date": "2026-07-14",
      "name": "Carmen",
      "color": "#10b981"
    }
  ]
}
```

**Error** (400 Bad Request):
```json
{ "error": "Invalid month format. Use YYYY-MM." }
```

---

### 2. Toggle User Availability on Date

**Endpoint**: `POST /availability`

**Request Body**:

```json
{
  "userId": "alice",
  "date": "2026-07-14",
  "name": "Alice",
  "color": "#2563eb"
}
```

**Response** (200 OK):

```json
{
  "action": "added" | "removed",
  "entry": {
    "userId": "alice",
    "date": "2026-07-14",
    "name": "Alice",
    "color": "#2563eb"
  }
}
```

**Error** (400 Bad Request):
```json
{ "error": "Invalid date format. Use YYYY-MM-DD." }
```

---

### 3. Delete Availability Entry

**Endpoint**: `DELETE /availability/{userId}/{date}`

**Path Parameters**:
- `userId`: User identifier
- `date`: ISO date string (YYYY-MM-DD)

**Response** (204 No Content)

**Error** (404 Not Found):
```json
{ "error": "Entry not found." }
```

---

### 4. Get or Create User List

**Endpoint**: `GET /users`

**Response** (200 OK):

```json
{
  "users": [
    { "id": "alice", "name": "Alice", "color": "#2563eb" },
    { "id": "bobby", "name": "Bobby", "color": "#f59e0b" },
    { "id": "carmen", "name": "Carmen", "color": "#10b981" }
  ]
}
```

---

### 5. Add or Update User

**Endpoint**: `POST /users`

**Request Body**:

```json
{
  "id": "alice",
  "name": "Alice",
  "color": "#2563eb"
}
```

**Response** (200 OK):

```json
{
  "user": {
    "id": "alice",
    "name": "Alice",
    "color": "#2563eb"
  }
}
```

---

## Error Handling

All endpoints return error responses with HTTP status codes:
- **400 Bad Request**: Malformed request or invalid parameters
- **404 Not Found**: Resource does not exist
- **409 Conflict**: Optimistic concurrency conflict (timestamp mismatch)
- **500 Internal Server Error**: Server-side error

Error response format:
```json
{
  "error": "Description of the error",
  "code": "ERROR_CODE",
  "timestamp": "2026-06-29T15:30:45.123Z"
}
```

---

## Rate Limiting

- **Free Tier**: 1 million requests per month included
- **Consumption Tier**: ~$0.20 per million requests after free tier
- No rate limiting enforced per IP; rely on Azure Functions platform limits

---

## Security Notes

- CORS: Static Web Apps automatically handle same-origin requests
- Auth: v1 uses no authentication; add Azure AD later if multi-tenant
- Payload size limit: 100 MB (Azure Functions default)
- Function timeout: 5 minutes default (adjust if needed for batch operations)
