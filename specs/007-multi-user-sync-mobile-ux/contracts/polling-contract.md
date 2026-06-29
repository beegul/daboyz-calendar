# Contract: usePolling Hook

**Feature**: [007-multi-user-sync-mobile-ux](../spec.md)  
**Component**: Frontend React Hook  
**Date**: 2026-06-29  
**Status**: Phase 1 Contract

---

## Hook Signature

```typescript
function usePolling(
  endpoint: string,
  options?: PollingOptions
): PollingResult
```

---

## Interface Specification

### Input Parameters

```typescript
interface PollingOptions {
  interval?: number; // Polling interval in milliseconds (default: 1000ms)
  retryConfig?: RetryConfig;
  onlineDetection?: boolean; // Use navigator.onLine + timeout to detect offline (default: true)
  timeout?: number; // Request timeout in milliseconds (default: 2000ms)
}

interface RetryConfig {
  maxRetries?: number; // Maximum retry attempts (default: 3)
  backoffMs?: number[]; // Backoff delays in milliseconds (default: [1000, 2000, 4000, 8000])
}
```

**Defaults**:
```javascript
{
  interval: 1000,
  retryConfig: {
    maxRetries: 3,
    backoffMs: [1000, 2000, 4000, 8000]
  },
  onlineDetection: true,
  timeout: 2000
}
```

### Output (Return Value)

```typescript
interface PollingResult {
  data: any; // Fetched data from endpoint (null until first successful poll)
  loading: boolean; // true if poll in progress
  error: Error | null; // Error object if poll failed (cleared on success)
  lastSync: number; // Timestamp (ms since epoch) of last successful poll
  isOnline: boolean; // true if online, false if offline
  retry: () => Promise<void>; // Manual retry function
}
```

---

## Behavior Specification

### Lifecycle

#### Mount
- Initialize polling state: `data = null`, `loading = false`, `error = null`, `isOnline = true`
- Set up interval for polling (every `interval` ms)
- Check online status: `navigator.onLine`
- Start first poll immediately

#### Active Polling
- Every `interval` ms:
  - If `isOnline`: Fetch `endpoint` with `timeout` setting
  - If offline: Skip poll, wait for online event
- Store response in `data`
- Update `lastSync` timestamp

#### Error Handling
- If fetch times out (> `timeout` ms): Error, retry with backoff
- If response is non-2xx: Error, retry with backoff
- If all retries exhausted: Set `error`, stop polling
- If manual retry triggered: Attempt again with `retryConfig.backoffMs[0]`

#### Online/Offline Detection
- Listen to `online` and `offline` events
- When online event fires: Immediately attempt poll (don't wait for next interval)
- When offline event fires: Set `isOnline = false`, pause polling until online

#### Unmount
- Clear polling interval
- Remove event listeners
- Do not cancel pending requests

---

## Error Scenarios

### Timeout
```javascript
// Request takes > 2000ms (timeout)
Result:
- error = new Error("Request timeout")
- loading = false
- Retry in 1s (backoffMs[0])
```

### Network Error
```javascript
// Network unreachable
Result:
- error = new Error("Failed to fetch")
- isOnline = false
- Pause polling until online
```

### Non-2xx Response
```javascript
// Server returns 500
Result:
- error = new Error("Server error: 500")
- loading = false
- Retry in 1s, then 2s, then 4s
- After 3 retries, stop and show error
```

### Successful Response
```javascript
// Server returns 200, data = { personas: [...] }
Result:
- data = { personas: [...] }
- error = null
- loading = false
- lastSync = Date.now()
- Next poll in 1s
```

---

## Integration Points

### App.jsx Usage

**Polling /api/users** (personas):
```javascript
const {
  data: personas,
  loading: personasLoading,
  error: personasError,
  lastSync: personasLastSync,
  isOnline
} = usePolling('/api/users', { interval: 1000 });

useEffect(() => {
  if (personas) {
    setPersonas(personas); // Update app state
    checkForDeletedActivePersona(personas);
  }
}, [personas]);
```

**Polling /api/availability** (dates):
```javascript
const {
  data: availabilityData,
  loading: availabilityLoading,
  lastSync: availabilityLastSync
} = usePolling('/api/availability', { interval: 1000 });

useEffect(() => {
  if (availabilityData) {
    setAvailability(availabilityData);
  }
}, [availabilityData]);
```

**Sync Status Component**:
```javascript
<SyncStatusBadge
  syncStatus={
    personasLoading || availabilityLoading ? 'syncing' : 'synced'
  }
  lastSyncTime={Math.max(personasLastSync, availabilityLastSync)}
  isOnline={isOnline}
/>
```

---

## Performance Considerations

### Bundle Size
- Target: < 1 kB gzipped (simple hook, no dependencies)
- Exports: usePolling function only

### Memory
- No persistent data structures
- Cleanup on unmount (no memory leaks)
- Interval cleared properly

### Network
- 1-second interval: 86,400 requests per day per client
- 5 concurrent clients: 432,000 requests per day
- Payload per request: 1–10 KB
- Total bandwidth: ~4–40 MB per day (acceptable)

---

## Testing Requirements

### Unit Tests (Jest)
- [ ] Happy path: Successful polling every 1s, data updates
- [ ] Offline detection: Pauses polling when offline, resumes when online
- [ ] Retry logic: Exponential backoff works correctly
- [ ] Timeout: Handles fetch timeout gracefully
- [ ] Error recovery: Error is cleared on successful retry
- [ ] Unmount: Cleanup occurs (intervals cleared, listeners removed)

### Integration Tests
- [ ] Two polling hooks (users + availability) work simultaneously
- [ ] Offline → Online transition triggers immediate poll
- [ ] Manual retry function works

---

**Contract Complete** ✅  
**Ready for**: Implementation (Phase 2, T071–T077)
