# Contract: useOfflineQueue Hook

**Feature**: [007-multi-user-sync-mobile-ux](../spec.md)  
**Component**: Frontend React Hook  
**Date**: 2026-06-29  
**Status**: Phase 1 Contract

---

## Hook Signature

```typescript
function useOfflineQueue(): OfflineQueueResult
```

---

## Interface Specification

### Input Parameters

None. Hook reads from localStorage and online status automatically.

### Output (Return Value)

```typescript
interface OfflineQueueResult {
  queue: OfflineQueueItem[]; // Current queue of pending actions
  enqueue: (item: QueueItemInput) => boolean; // Enqueue a new item (returns false if rejected)
  dequeue: (id: string) => void; // Remove item from queue (after successful sync)
  clear: () => void; // Clear entire queue (for reset/logout)
  isOnline: boolean; // true if network available
  pendingCount: number; // Number of pending items in queue
}

interface OfflineQueueItem {
  id: string;
  type: 'mark_available' | 'mark_unavailable' | 'create_persona' | 'delete_persona';
  personaName: string;
  date: string | null;
  value: boolean | null;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  ttl: number;
  nextRetryTime: number;
}

interface QueueItemInput {
  type: OfflineQueueItem['type'];
  personaName: string;
  date?: string | null;
  value?: boolean | null;
}
```

---

## Behavior Specification

### Lifecycle

#### Mount
- Load queue from localStorage: `JSON.parse(localStorage['daboyz_offline_queue_v1'])`
- Filter expired items (TTL < now)
- Set up online/offline event listeners
- If online: Start retry loop for all items
- Initialize `isOnline = navigator.onLine`

#### Enqueue (User Action Offline)
```javascript
const success = enqueue({
  type: 'mark_available',
  personaName: 'DEV',
  date: '2026-06-15',
  value: true
});

// Internally:
if (queue.length >= 100) {
  return false; // Reject (queue full)
}

const item = {
  id: generateUUID(),
  type: 'mark_available',
  personaName: 'DEV',
  date: '2026-06-15',
  value: true,
  timestamp: Date.now(),
  retryCount: 0,
  maxRetries: 3,
  ttl: Date.now() + 24 * 60 * 60 * 1000,
  nextRetryTime: Date.now() // Immediate retry
};

queue.push(item);
localStorage['daboyz_offline_queue_v1'] = JSON.stringify(queue);
return true;
```

#### Persist to localStorage
- After each `enqueue` or `dequeue`: Update localStorage immediately
- Format: `JSON.stringify(queue)`
- Key: `'daboyz_offline_queue_v1'` (versioned)
- Survives browser close, refresh, app restart

#### Retry Loop (When Online)
```javascript
// On mount (if online) or on 'online' event:
async function retryLoop() {
  for (const item of queue) {
    if (item.retryCount < item.maxRetries && Date.now() >= item.nextRetryTime) {
      const success = await sendRequest(item);
      
      if (success) {
        dequeue(item.id); // Remove from queue
      } else {
        item.retryCount++;
        const backoff = getBackoff(item.retryCount);
        item.nextRetryTime = Date.now() + backoff;
        updateLocalStorage(); // Persist retry count
      }
    }
  }
}

// Call retry loop immediately when going online
window.addEventListener('online', retryLoop);
```

#### TTL Enforcement
- On mount: Filter items where `item.ttl > Date.now()`
- Discard expired items silently (no notification)
- If user had pending action > 24h: Auto-fail and notify user

#### Max Size Enforcement
- Check: `queue.length >= 100`
- If full: `enqueue()` returns false
- Caller must handle rejection (show error toast)
- No automatic eviction (FIFO priority)

#### Online/Offline Detection
```javascript
window.addEventListener('online', () => {
  setIsOnline(true);
  retryLoop(); // Immediately retry all pending
});

window.addEventListener('offline', () => {
  setIsOnline(false);
  // Polling pauses; queued items wait until online
});
```

#### Unmount
- Remove event listeners
- Do not clear localStorage (data survives app restart)
- In-memory queue cleared (will reload on next mount)

---

## Retry Logic

### Exponential Backoff

```
Item queued at T=0

Attempt 0: T=0 (immediate, if online)
  → Success: Done
  → Failure: retryCount = 1, nextRetryTime = T + 1s

Attempt 1: T=1s
  → Success: Done
  → Failure: retryCount = 2, nextRetryTime = T + 1s + 2s

Attempt 2: T=3s
  → Success: Done
  → Failure: retryCount = 3, nextRetryTime = T + 1s + 2s + 4s

Attempt 3: T=7s
  → Success: Done
  → Failure: retryCount >= maxRetries
    → Show error: "Failed to sync after 3 attempts"
    → Item remains in queue (< 24h TTL)
    → User can manually retry
```

### Backoff Schedule

```javascript
const backoffMs = [1000, 2000, 4000, 8000]; // 1s, 2s, 4s, 8s

function getBackoff(retryCount) {
  // retryCount starts at 1 after first failure
  return backoffMs[Math.min(retryCount - 1, backoffMs.length - 1)];
}

// Example:
// retryCount = 1: backoffMs[0] = 1000ms
// retryCount = 2: backoffMs[1] = 2000ms
// retryCount = 3: backoffMs[2] = 4000ms
// retryCount >= 4: backoffMs[3] = 8000ms (capped)
```

---

## Error Scenarios

### Enqueue Rejected (Queue Full)
```javascript
const success = enqueue({...});
if (!success) {
  showError("Offline queue is full. Some changes may not sync.");
}
```

### Item Retry Exhausted
```javascript
// After 3 retries (T=7s), all failed
// Item still has TTL > now (< 24h)

// Show persistent error:
showError(
  "Failed to sync 'Mark available on June 15' after 3 attempts. " +
  "Tap to retry manually."
);

// User can tap button to retry immediately
retry(itemId); // Reset retryCount = 0, nextRetryTime = now
```

### Offline → Online Transition
```javascript
// User marks 3 dates while offline
queue = [item1, item2, item3]

// User reconnects
// Retry loop triggers automatically
// All 3 items attempt sync immediately

showSuccess("Synced 3 changes");
```

---

## Integration Points

### App.jsx Usage

**Enqueue when offline**:
```javascript
const { enqueue, isOnline } = useOfflineQueue();

async function handleAvailabilityToggle(date, value) {
  // Optimistic UI update
  setAvailability(prev => ({...prev, [date]: value}));
  
  // Attempt sync
  if (!isOnline) {
    const success = enqueue({
      type: value ? 'mark_available' : 'mark_unavailable',
      personaName: activePersona,
      date,
      value
    });
    
    if (!success) {
      showError("Offline queue is full");
      // Rollback UI
      setAvailability(prev => ({...prev, [date]: !value}));
    }
  } else {
    // Sync online
    POST /api/availability...
  }
}
```

**Show offline indicator**:
```javascript
const { isOnline, pendingCount } = useOfflineQueue();

{!isOnline && <OfflineIndicator pendingCount={pendingCount} />}
```

---

## Performance Considerations

### Bundle Size
- Target: < 1.5 kB gzipped (simple hook, no dependencies)
- Exports: useOfflineQueue function only

### Memory
- Queue in-memory: max 100 items × 200 bytes = 20 KB
- Event listeners: 2 (online/offline)
- No memory leaks on unmount

### Storage
- localStorage quota: 5–10 MB (browsers)
- Queue size: 100 items × 100 bytes = 10 KB
- Headroom: 1000x (easily fits)

---

## Testing Requirements

### Unit Tests (Jest)
- [ ] Enqueue: Item added, serialized to localStorage
- [ ] Dequeue: Item removed, localStorage updated
- [ ] Persist: Data survives JSON roundtrip
- [ ] TTL: Expired items filtered on load
- [ ] Max size: Enqueue returns false at 100 items
- [ ] Retry logic: Exponential backoff calculated correctly
- [ ] Online → Offline: Pause retries, resume when online
- [ ] Unmount: Cleanup occurs

### Integration Tests
- [ ] Offline → mark 3 dates → online → all sync
- [ ] Offline → mark date → refresh page → date still there → retry
- [ ] Multiple items queued → some succeed → some fail → correct state

---

**Contract Complete** ✅  
**Ready for**: Implementation (Phase 2, T078–T087)
