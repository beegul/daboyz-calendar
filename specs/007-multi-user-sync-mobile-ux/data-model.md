# Data Model: Multi-User Real-Time Sync & Mobile UX

**Feature**: [007-multi-user-sync-mobile-ux](spec.md)  
**Date**: 2026-06-29  
**Status**: Phase 1 Design - Data Models

---

## Sync State

### React State Shape

```typescript
// App.jsx state structure
interface AppState {
  personas: {
    [personaName: string]: {
      name: string;
      color: string;
      createdAt: string; // ISO timestamp
    };
  };
  
  activePersona: string | null; // Currently selected persona name
  
  availability: {
    [personaName: string]: {
      [date: string]: boolean; // YYYY-MM-DD => true/false
    };
  };
  
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
  lastSyncTime: number; // milliseconds since epoch
  syncError: string | null; // Error message if syncStatus === 'error'
  
  offlineQueue: OfflineQueueItem[];
  
  showOnboarding: boolean; // If no personas exist
  modals: {
    deletePersona: boolean;
    createPersona: boolean;
  };
}

interface OfflineQueueItem {
  id: string; // UUID
  type: 'mark_available' | 'mark_unavailable' | 'create_persona' | 'delete_persona';
  personaName: string;
  date: string; // YYYY-MM-DD (null if type is create_persona or delete_persona)
  value: boolean; // For availability actions
  timestamp: number; // ms since epoch (when enqueued)
  retryCount: number; // Current attempt
  maxRetries: 3;
  ttl: number; // Expiration timestamp (timestamp + 24h)
}
```

### Sync State Machine

```
State Diagram:

                    ┌─────────────┐
                    │   OFFLINE   │
                    └──────┬──────┘
                           │
                    Network restored
                           │
                           ▼
    ┌──────────────┐  ┌─────────────┐
    │   SYNCED     │  │   SYNCING   │
    └──────┬───────┘  └──────┬──────┘
           │                  │
      Poll/sync          Sync response
      returns success    received (any status)
           │                  │
           ▼                  ▼
      User action      ┌─────────────┐
      (mark date)      │    ERROR    │
           │           └──────┬──────┘
           │                  │
           └──────────────────┘
                    │
                    ▼
             ┌─────────────┐
             │   SYNCING   │
             └─────────────┘
             
            (retry loop with backoff)


State Transitions:

- SYNCED → SYNCING: When polling interval fires (every 1s)
- SYNCING → SYNCED: Response received, HTTP 200, no errors
- SYNCING → ERROR: Response timeout (>2s) or HTTP 5xx
- ERROR → SYNCING: Automatic retry with exponential backoff (1s, 2s, 4s, 8s)
- ERROR → OFFLINE: Network unreachable (navigator.onLine = false)
- SYNCING → OFFLINE: Network unreachable during sync
- OFFLINE → SYNCING: Network restored (online event or navigator.onLine = true)
```

### Conflict Resolution: API-First

**Principle**: Server (API) is source of truth. Local state syncs FROM server.

**Scenario 1: Concurrent mark availability**
```
Client A (online): marks June 15 available
Client B (online): marks June 15 unavailable

→ Both send request simultaneously
→ Server receives both, last-write-wins (based on request arrival time)
→ One update wins (deterministic by server timestamp)
→ Both clients poll, both see same result
Result: ✅ Consistent
```

**Scenario 2: Offline then online**
```
Client A (offline): marks June 15 available
Client B (online): marks June 15 unavailable

→ Client A queues action (offline)
→ Client B sends request (online)
→ Server updates to unavailable
→ Client A comes online, sends queued request
→ Server updates to available (A's request arrives after B's)
Result: ✅ Consistent (A's offline action takes precedence after sync)
```

**Scenario 3: Persona deletion during sync**
```
Client A: marks date on persona "MANAGER"
Client B: deletes persona "MANAGER"

→ A's request arrives: POST /api/availability, persona "MANAGER" does not exist
→ Server returns 404 or error
→ A's client catches error, removes persona from local list, clears availability
→ Both clients poll, both see persona deleted
Result: ✅ Consistent (orphaned data discarded)
```

**Implementation**:
- App.jsx: On polling, API response is always accepted as-is (no local merge logic)
- Offline queue: Items enqueued locally, retried when online
- API errors: Caught and displayed to user, local state rolled back
- Deterministic reconciliation: Server timestamp is single source of truth

### Active Persona Auto-Switch

**When deleted by another user**:
```javascript
// In syncPersonas polling callback
const apiPersonas = await fetchPersonas();
const deletedPersonas = personas.filter(p => !apiPersonas.includes(p.name));

if (deletedPersonas.includes(activePersona)) {
  // Active persona was deleted
  const nextAvailable = apiPersonas[0];
  setActivePersona(nextAvailable); // Auto-switch
  if (!nextAvailable) {
    // No personas left
    showOnboarding();
  }
}
```

**Behavior**:
- Auto-switch happens silently (no modal)
- User sees calendar switch to first available persona
- If no personas left, show onboarding
- User is informed via toast: "Persona 'MANAGER' was deleted by another user"

---

## Offline Queue

### Queue Item Schema

```typescript
interface OfflineQueueItem {
  id: string; // UUID, unique identifier
  
  // Action metadata
  type: 'mark_available' | 'mark_unavailable' | 'create_persona' | 'delete_persona';
  personaName: string; // Target persona (required for all types)
  date: string | null; // YYYY-MM-DD (null for create/delete persona)
  value: boolean | null; // true/false for availability; null for create/delete
  
  // Timing
  timestamp: number; // ms since epoch (when user enqueued)
  ttl: number; // Expiration time (timestamp + 24 * 60 * 60 * 1000)
  
  // Retry logic
  retryCount: number; // Current attempt (0, 1, 2, 3)
  maxRetries: number; // Always 3
  nextRetryTime: number; // ms since epoch (when next retry should happen)
}
```

### Queue Lifecycle

#### 1. **Enqueue** (User action offline)
```
User marks date available while offline
  → Create queue item
  → Push to localStorage queue
  → Update local availability state (optimistic)
  → Show toast: "Offline - changes will sync when online"
```

#### 2. **Persist** (Serialize to localStorage)
```
useOfflineQueue hook:
  → JSON.stringify(queue)
  → localStorage['daboyz_offline_queue_v1'] = JSON.string
  → Survives browser close/refresh
```

#### 3. **Load on App Start**
```
App.jsx useEffect (on mount):
  → const queue = JSON.parse(localStorage['daboyz_offline_queue_v1']) || []
  → Filter expired items (ttl < now)
  → setOfflineQueue(filtered)
  → Begin retry loop (if online)
```

#### 4. **Retry Loop** (When online)
```
useOfflineQueue hook (online listener):
  For each item in queue:
    If retryCount < maxRetries AND now >= nextRetryTime:
      → POST /api/availability or POST /api/users (based on type)
      → If success (200):
        - Remove item from queue
        - Update localStorage
        - Clear item from local state
      → If error (4xx/5xx/timeout):
        - Increment retryCount
        - Calculate nextRetryTime with exponential backoff
        - Show error toast if this is last retry
        - Update localStorage
```

#### 5. **TTL Enforcement** (Discard old items)
```
On app load:
  → const now = Date.now()
  → queue.filter(item => item.ttl > now)
  → If item is discarded, show notification: "Queued action expired (older than 24h)"
```

#### 6. **Max Size Enforcement** (Prevent overflow)
```
useOfflineQueue.enqueue(item):
  If queue.length >= 100:
    → Show error: "Offline queue is full. Some actions may not sync."
    → Return false (reject enqueue)
  Else:
    → queue.push(item)
    → Return true
```

### Queue Retry Logic

**Exponential Backoff**:
```
Retry Schedule:
  Attempt 0: Immediate (on reconnection)
  Attempt 1: Wait 1s
  Attempt 2: Wait 2s
  Attempt 3: Wait 4s
  Max: 3 retries (attempts 0, 1, 2, 3)
  
Total max wait: 1 + 2 + 4 = 7 seconds (after initial offline period)
```

**Error Handling**:
```
If all 3 retries exhausted:
  → Show persistent error banner at top of page
  → Button: "Retry Now" (manual retry)
  → After 30 minutes, auto-dismiss error
  → Item remains in queue (survives reload) until 24h TTL
```

### Queue Lifecycle Example

```
Timeline:

T0: User goes offline, marks June 15 available
    → Item enqueued: { type: 'mark_available', date: '2026-06-15', value: true, retryCount: 0 }
    → Stored in localStorage
    → Show toast: "Offline - changes will sync when online"

T10s: User still offline, marks June 16 available
    → 2nd item enqueued
    → localStorage has 2 items

T30s: User reconnects to network
    → useOfflineQueue detects online
    → Retry loop starts
    → Item 1: POST /api/availability → 200 OK → removed from queue
    → Item 2: POST /api/availability → 200 OK → removed from queue
    → Show toast: "Synced 2 changes"

T31s: Both items synced, queue is empty
    → localStorage queue: []
    → Users see June 15 and 16 marked on all devices within 1-2s polls
```

---

## Mobile Component Tree

### Component Hierarchy

```
<App>
  {isMobile ? (
    <MobileView>
      <MobileHeader
        activePersona={activePersona}
        darkMode={darkMode}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        onToggleDarkMode={toggleDarkMode}
      />
      <MobilePersonaSelector
        personas={personas}
        activePersona={activePersona}
        onSelectPersona={setActivePersona}
        onDeletePersona={handleDeletePersona}
      />
      <MobileCalendarLayout
        activePersona={activePersona}
        availability={availability[activePersona]}
        syncStatus={syncStatus}
        onToggleDate={handleAvailabilityToggle}
      />
      {isOffline && <OfflineIndicator pendingCount={queue.length} />}
    </MobileView>
  ) : (
    <DesktopView>
      {/* Existing desktop layout */}
    </DesktopView>
  )}
</App>
```

### Mobile Components

#### MobileHeader
- **Purpose**: Show active persona, month, sync status, dark mode toggle
- **Layout**: Horizontal flex row, full width, compact spacing
- **Children**: Title (active persona + month) | Sync badge | Dark toggle button
- **Height**: ~44px (touch-friendly)
- **Responsive**: 375px–600px+

#### MobilePersonaSelector
- **Purpose**: List all personas, show active, provide delete option
- **Interaction**: Tap to select, long-press or swipe to reveal delete
- **Delete Visibility**: Always visible (not hover-dependent), small icon
- **Height per item**: ~44px minimum
- **Scrollable**: Yes, if many personas (overflow hidden, vertical scroll)

#### MobileCalendarLayout
- **Purpose**: Show month calendar, allow date marking
- **Grid**: 7 columns (Sun–Sat), weeks as rows
- **Cell Size**: 44x44px minimum (to fit week-view)
- **Cell Content**: Date number (16px+), availability indicator (dot or checkmark)
- **Tap Feedback**: Cell highlight (0ms instant animation)
- **Horizontal Scroll**: Prevented by full-width constraint
- **Month Navigation**: Previous/Next buttons (sticky or floating)

#### SyncStatusBadge
- **Purpose**: Show "Last synced: 10s ago" or "Syncing..." or "Error"
- **Location**: Top-right corner of header
- **Size**: ~32px (icon) + text
- **States**: 
  - Synced: Green checkmark + "10s ago"
  - Syncing: Spinner + "Syncing..."
  - Error: Red icon + "Error - Retry"
  - Offline: Orange icon + "Offline"
- **Update**: Every second if synced, real-time if syncing/error

#### OfflineIndicator
- **Purpose**: Alert user that app is offline
- **Location**: Bottom banner or top banner (configurable)
- **Content**: "You are offline. Changes will sync when online."
- **Visibility**: Shown only if isOffline === true
- **Dismiss**: Auto-dismiss when online, or manual close button

### Responsive Breakpoints

```css
/* Mobile-first Tailwind approach */

/* Small (375–500px) - iPhone SE, Galaxy S21 */
.mobile { /* Default styles */ }

/* Medium (600px) - Acceptable v1 */
@media (min-width: 600px) {
  .mobile { /* Slight adjustments for breathing room */ }
}

/* Large (1000px+) - Desktop fallback to current layout */
@media (min-width: 1000px) {
  .desktop { /* Existing desktop layout */ }
}
```

---

## Data Validation

### Input Validation

**Persona Name**:
- Required: non-empty string
- Max length: 50 characters
- Allowed: alphanumeric, spaces, hyphens
- Unique: across all personas
- Error handling: Return 409 Conflict if duplicate

**Date Format**:
- Required: YYYY-MM-DD (ISO 8601)
- Range: Past 1 year, future 2 years
- Validation: Server-side only (client shows error if invalid)

**Availability Value**:
- Required: true (available) or false (unavailable)
- No other values accepted

### Optimistic UI Updates

**Mark Availability**:
```javascript
// Client-side (immediate visual feedback)
setAvailability(prev => ({
  ...prev,
  [activePersona]: {
    ...prev[activePersona],
    [date]: !prev[activePersona]?.[date]
  }
}));

// Background (async)
POST /api/availability
  .then(success => {
    // Keep local state as-is (already optimistic)
  })
  .catch(error => {
    // Rollback local state
    setAvailability(originalState);
    showError("Failed to update availability");
  });
```

**Benefit**: User sees feedback immediately (< 50ms), actual sync happens in background.

---

## State Transitions Example

```
Initial State:
- personas: { MANAGER: { color: blue }, DEV: { color: green } }
- activePersona: MANAGER
- availability: { MANAGER: { '2026-06-15': true }, DEV: {} }
- syncStatus: synced

User marks June 16 available:
  → setAvailability({ ...prev, MANAGER: { ...prev.MANAGER, '2026-06-16': true } })
  → syncStatus: syncing
  → POST /api/availability
  
Server responds 200:
  → syncStatus: synced
  → lastSyncTime: now()
  
Next poll (1s later):
  → GET /api/users, GET /api/availability
  → No changes detected
  → syncStatus: synced
  → Continue polling every 1s

User A (other client) marks June 16 unavailable:
  → Server updates
  
This client's next poll (1s later):
  → GET /api/availability
  → Detects change for June 16
  → setAvailability({ ...prev, MANAGER: { '2026-06-15': true, '2026-06-16': false } })
  → syncStatus: synced
  → User sees June 16 now marked as unavailable
```

---

## Error Scenarios & Handling

| Scenario | User Impact | Handling |
|----------|-------------|----------|
| Mark available, then network drops | Action queued | Show "Offline" badge, queue persists |
| Mark available, server returns 404 (persona deleted) | Mark reverted | Show error: "Persona was deleted by another user" |
| Mark available, server returns 500 | Mark queued locally, retry | Show "Syncing..." badge, exponential backoff |
| User creates persona with duplicate name | Create fails | Show error: "Persona name already exists" |
| Polling timeout (no response for 2s) | No data lost | Retry immediately, show "Syncing..." |
| App refreshes during offline sync | Queue persists | Queue survives reload, auto-retries |

---

**Phase 1 Status**: Data Models Complete ✅  
**Next**: Create contracts/ documents (polling-contract.md, offline-queue-interface.md, mobile-components-interface.md) and quickstart.md
