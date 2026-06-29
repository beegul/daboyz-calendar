# API Contract: DELETE /api/personas/{name}

**Feature**: 005-post-deployment-polish | **Date**: 2026-06-29 | **Status**: Specification (not yet implemented)

---

## Overview

The DELETE endpoint removes a persona and cascade-deletes all associated availability entries atomically. This ensures data consistency: a persona cannot exist without all its dates being removed.

---

## Endpoint Specification

### Request

```http
DELETE /api/personas/{name} HTTP/1.1
Host: https://purple-mud-0c6ae6c0f.7.azurestaticapps.net
Content-Type: application/json
```

**Path Parameters**:
- `name` (string, required): Persona name to delete (case-insensitive)
  - Example: "Jack", "Sarah", "Alex"
  - Constraints: 1-50 chars, alphanumeric + spaces

**Request Body**: None (DELETE endpoint, no body)

**Example Request**:
```bash
curl -X DELETE "https://purple-mud-0c6ae6c0f.7.azurestaticapps.net/api/personas/Jack"
```

---

### Response

#### Success Response (204 No Content)

```http
HTTP/1.1 204 No Content
```

**Body**: Empty (no JSON response)

**Behavior**:
- Persona deleted from storage (if stored separately)
- All availability entries WHERE persona_name = "Jack" deleted
- Both operations atomic (single transaction)
- Result visible to all clients within 2-3 seconds (via polling)

---

#### Error Responses

#### 400 Bad Request

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid persona name",
  "details": "Name must be 1-50 characters"
}
```

**Trigger**: 
- Name is empty string
- Name exceeds 50 characters
- Name contains invalid characters (not alphanumeric + spaces)

---

#### 404 Not Found

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Persona not found",
  "details": "No persona named 'InvalidName' exists"
}
```

**Trigger**: 
- Persona name does not exist in storage
- No availability entries found for persona

---

#### 500 Internal Server Error

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "Failed to delete persona",
  "details": "Database transaction failed: [error message]"
}
```

**Trigger**:
- Database connection fails
- Atomic transaction fails (partial delete)
- Unexpected server error

---

## Implementation Details

### Cascade Deletion Logic

```python
def delete_persona(name: str):
    """
    Atomically delete persona and all associated availability entries.
    
    Steps:
    1. Validate name (non-empty, valid format)
    2. Check if persona exists (at least one availability entry with this name)
    3. Begin atomic transaction
    4. Delete all availability entries WHERE persona_name = name
    5. Commit transaction
    
    Returns:
    - 204 No Content on success
    - 404 Not Found if no entries exist for persona
    - 400 Bad Request if name invalid
    - 500 Internal Server Error if transaction fails
    """
```

### Atomic Transaction Requirement

**Database**: Azure Table Storage

**Challenge**: Table Storage does not natively support multi-row transactions across different row keys

**Solution**: 
- Use batch operations (up to 100 entities per batch)
- If persona has > 100 dates, use multiple batches
- Each batch is atomic within itself
- From user perspective, deletion is atomic (wait for all batches to complete)

**Implementation Pattern**:
```python
# Pseudo-code
with TableStorageTransaction():
    # Get all rows WHERE persona_name = name
    rows = get_rows_by_persona(name)
    
    # Delete in batches (100 per batch)
    for batch in chunks(rows, 100):
        table_storage.batch_delete(batch)
    
    # If any batch fails, entire transaction fails
    # (connection handles rollback logic)
```

---

## Data Consistency Guarantees

| Scenario | Guarantee |
|--|--|
| **Delete succeeds** | All persona data gone; no orphaned dates |
| **Delete fails mid-transaction** | Entire transaction rolled back; persona untouched |
| **Delete fails after transaction** | All data deleted; client retries receive 404 (idempotent) |
| **Network timeout** | Client cannot determine state; should retry or show error |

**Idempotency**:
- Calling DELETE twice with same {name} is safe
- First call: 204 No Content (deleted)
- Second call: 404 Not Found (already gone)
- No side effects from duplicate deletes

---

## Integration with Frontend

### Frontend Flow (DeletePersonaModal Component)

```javascript
// User clicks "Delete" button in modal
async function handleDeletePersona(name) {
  try {
    // Show loading spinner
    setLoading(true);
    
    // Call DELETE endpoint
    const response = await fetch(`/api/personas/${name}`, {
      method: 'DELETE'
    });
    
    if (response.status === 204) {
      // Success: Remove persona from state
      setEntries(entries.filter(e => e.persona_name !== name));
      
      // Trigger immediate sync on all devices
      await fetchAvailability();
      
      // Show success toast
      showToast(`Persona '${name}' deleted`);
    } else if (response.status === 404) {
      // Already deleted (by another device)
      showToast(`Persona '${name}' was already deleted`);
      setEntries(entries.filter(e => e.persona_name !== name));
    } else {
      // Error
      const error = await response.json();
      showError(`Failed to delete: ${error.details}`);
    }
  } catch (err) {
    // Network error or timeout
    showError(`Delete failed: ${err.message}`);
  } finally {
    setLoading(false);
  }
}
```

### Retry Logic

If delete fails:
- Show error modal with "Retry" button
- User can retry or cancel
- No automatic retry (user decision)

---

## Cross-Device Sync Behavior

When DELETE succeeds on one device:

**Device A** (performs delete):
1. Delete succeeds (204)
2. UI updates immediately (persona + dates removed)

**Device B** (other client):
1. Next polling cycle (within 2-3 seconds)
2. Fetches latest data from /api/availability
3. Notices persona no longer exists
4. Updates UI to remove persona + dates
5. No polling latency, all clients within 3s

---

## Related Endpoints (Reference)

| Method | Endpoint | Purpose |
|--|--|--|
| GET | /api/personas | Get list of all personas (already implemented ✅) |
| POST | /api/availability | Add availability entry |
| DELETE | /api/availability | Remove single date entry |
| DELETE | /api/personas/{name} | **THIS ENDPOINT** - cascade delete persona |

---

## Testing Strategy

### Unit Test: Valid Deletion

```javascript
test('DELETE /api/personas/{name} removes persona and dates', async () => {
  // Setup: Create persona with 3 dates
  await createPersona('Jack');
  await createAvailability('Jack', '2026-07-01');
  await createAvailability('Jack', '2026-07-02');
  await createAvailability('Jack', '2026-07-03');
  
  // Execute: Delete persona
  const response = await fetch('/api/personas/Jack', { method: 'DELETE' });
  
  // Verify: 204 No Content
  expect(response.status).toBe(204);
  
  // Verify: No entries for 'Jack' remain
  const availabilities = await getAvailabilities();
  expect(availabilities.filter(e => e.persona_name === 'Jack')).toHaveLength(0);
});
```

### Unit Test: Persona Not Found

```javascript
test('DELETE /api/personas/{name} returns 404 if persona not found', async () => {
  const response = await fetch('/api/personas/NonExistent', { method: 'DELETE' });
  expect(response.status).toBe(404);
  const error = await response.json();
  expect(error.error).toBe('Persona not found');
});
```

### Integration Test: Cross-Device Sync

```javascript
test('Deletion on Device A reflected on Device B within 3s', async () => {
  // Device A: Create and delete
  await createPersona('Jack');
  await fetch('/api/personas/Jack', { method: 'DELETE' });
  
  // Device B: Wait for polling cycle
  await new Promise(r => setTimeout(r, 2500));
  
  // Device B: Fetch latest data
  const data = await fetchAvailabilities();
  
  // Verify: 'Jack' gone from Device B's view
  expect(data.personas).not.toContain('Jack');
});
```

---

## Future Extensions (Out of Scope)

- Soft delete (mark as deleted, don't remove)
- Undo deletion (restore within 30 days)
- Batch delete (remove multiple personas in one request)
- Async deletion (long-running task for massive personas)
