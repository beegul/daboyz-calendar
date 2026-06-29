# Data Model: Infrastructure and Cost Optimizations

**Feature**: 004-infrastructure-and-optimizations | **Date**: 2026-06-29

**Purpose**: Define all entities, data structures, and state models used in this feature.

---

## 1. VisibilityState (Browser-Provided)

**Scope**: Global browser state, read from `document.visibilityState`

**Purpose**: Detect when user tab becomes hidden or visible

**Type Definition**:
```javascript
// Read-only from Page Visibility API
const visibilityState = document.visibilityState; // 'visible' | 'hidden'
```

**Properties**:
| Property | Type | Source | Description |
|----------|------|--------|-------------|
| `visibilityState` | 'visible' \| 'hidden' | `document.visibilityState` | Current tab visibility state |
| `visibilitychange` | Event | Browser | Fires when user switches tabs, minimizes window, or activates a different tab |

**Lifecycle**:
1. User switches to app tab → `visibilityState = 'visible'`
2. User switches to different tab → `visibilityState = 'hidden'`
3. User returns to app tab → `visibilityState = 'visible'`

**Integration Point**: Consumed by `useAvailability` hook to control polling lifecycle

**Browser Support**: 
- ✅ Chrome 13+, Firefox 10+, Safari 7+, Edge 12+
- ⚠️ Fallback: blur/focus events for edge cases (documented limitation in spec)

---

## 2. IdleState (Application-Managed)

**Scope**: Application-level state tracking user activity

**Purpose**: Detect when user is inactive (no mouse, keyboard, or touch for 10+ minutes)

**Type Definition**:
```javascript
{
  lastActivityTime: number,           // Timestamp (ms) of last mouse/keyboard/touch event
  isIdle: boolean,                    // true if (now - lastActivityTime) >= 600000ms
  idleThresholdMs: 600000,            // 10 minutes in milliseconds (const)
  hasResetThisSession: boolean        // true if user ever resumed from idle state
}
```

**Properties**:
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `lastActivityTime` | number | `Date.now()` on mount | Millisecond timestamp of last activity |
| `isIdle` | boolean | false (initially) | Derived: `(Date.now() - lastActivityTime) >= 600000` |
| `idleThresholdMs` | number | 600000 | 10 minutes (read-only constant) |
| `hasResetThisSession` | boolean | false | Flag to track if user ever resumed from idle |

**Activity Events**:
- `mousemove` - User moving mouse
- `keydown` - User typing on keyboard
- `touchstart` - User touching screen (mobile)

**Calculation**:
```javascript
const isIdle = (Date.now() - lastActivityTime) >= 600000;
```

**Edge Cases**:
| Case | Behavior |
|------|----------|
| User idles for 10min, then moves mouse | `isIdle` becomes false, polling resumes 5s rate |
| App hidden while idle | Both visibility + idle throttle apply (most restrictive: polling stopped) |
| Page refresh while idle | Timer resets to `Date.now()` on new mount |
| Tab switches from hidden to visible while idle | Polling still throttled to 5min until user activity |

**Integration Point**: Produced by `useIdleTimeout` hook, consumed by `useAvailability` hook

---

## 3. PollingControl (Hook State)

**Scope**: Internal state to `useAvailability` hook

**Purpose**: Manage polling interval lifecycle based on visibility + idle state

**Type Definition**:
```javascript
{
  intervalId: number | null,          // setInterval ID for clearing interval
  frequency: 5000 | 300000,           // Milliseconds between polls (5s or 5min)
  isActive: boolean,                  // true if polling currently running
  lastPollTime: number,               // Timestamp of last successful poll
  pollCount: number                   // Number of polls executed this session
}
```

**State Machine**:
```
Initial: intervalId=null, frequency=5000, isActive=false

Foreground + Active:
  → frequency = 5000 (5 seconds)
  → setInterval() → intervalId != null
  → isActive = true
  → poll every 5 seconds

Foreground + Idle:
  → frequency = 300000 (5 minutes)
  → clear existing interval
  → setInterval(pollFunction, 300000) → update intervalId
  → isActive = true
  → poll every 5 minutes

Hidden (any idle state):
  → frequency = 0 (disabled)
  → clear interval → intervalId = null
  → isActive = false
  → no polling
```

**Decision Logic** (pseudocode):
```javascript
if (visibilityState === 'hidden') {
  // Stop polling
  clearInterval(intervalId);
  intervalId = null;
  isActive = false;
} else if (visibilityState === 'visible') {
  if (isIdle) {
    frequency = 300000;  // 5 minutes
  } else {
    frequency = 5000;    // 5 seconds
  }
  // Set/update interval with new frequency
  clearInterval(intervalId);
  intervalId = setInterval(pollFunction, frequency);
  isActive = true;
}
```

**Integration Point**: Managed by `useAvailability` hook using `useIdleTimeout` + `useVisibility`

---

## 4. PersonaValidationPayload (Form Input)

**Scope**: Data model for persona creation form

**Purpose**: Validate new persona name+color combo against existing personas

**Type Definition**:
```javascript
{
  name: string,                       // Raw input from form field
  color: string,                      // Hex color string (e.g., #FF5733)
  allExistingPersonas: Array<{
    name: string,
    color: string
  }>
}
```

**Validation Rules**:
1. **Name normalization**: Trim leading/trailing whitespace, lowercase for comparison
   - Example: "  Jack  " → "jack"
   - Case-insensitive matching (Jack ≠ jack for display, but same for collision detection)

2. **Color format**: Must be valid hex (e.g., #FF5733, #FFF, #0)
   - Validate with regex: `/^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/`

3. **Collision detection**: Check if (name, color) tuple already exists
   - Normalize: `inputName.trim().toLowerCase()` vs `existingName.trim().toLowerCase()`
   - Check: No existing persona with both same name AND same color

**Input Sources**:
- Name input field: Raw string from `<input>`
- Color picker: Hex string from color input or palette
- All personas: Fetched from API or component prop

**Example**:
```javascript
// Input
{
  name: "  Jack  ",
  color: "#FF5733",
  allExistingPersonas: [
    { name: "jack", color: "#FF5733" },    // Exact match (normalized)
    { name: "JACK", color: "#0000FF" },    // Same name, different color
    { name: "alice", color: "#FF5733" }    // Different name, same color
  ]
}

// Result: COLLISION DETECTED (first persona matches after normalization)
```

---

## 5. CollisionResult (Validation Output)

**Scope**: Result of collision detection validation

**Purpose**: Signal to form whether persona can be created or should show error

**Type Definition**:
```javascript
{
  isValid: boolean,                   // true = allowed to create, false = blocked
  errorMessage: string | null,        // User-facing error message or null if valid
  conflictingPersona: {               // Details of conflicting persona (if exists)
    name: string,
    color: string
  } | null
}
```

**Valid State**:
```javascript
{
  isValid: true,
  errorMessage: null,
  conflictingPersona: null
}
```

**Invalid State**:
```javascript
{
  isValid: false,
  errorMessage: "Name and color combo already taken! Jack (#FF5733) already exists.",
  conflictingPersona: {
    name: "jack",
    color: "#FF5733"
  }
}
```

**Error Messages**:
| Condition | Message |
|-----------|---------|
| Exact match exists | `"Name and color combo already taken! {name} ({color}) already exists."` |
| Name empty or only whitespace | `"Please enter a persona name."` |
| Color invalid format | `"Please select a valid color."` |

**Integration Point**: Produced by `validatePersonaUniqueness()` utility, consumed by `PersonaOnboarding` component form validation

---

## 6. AzureInfrastructure (Storage Model)

**Scope**: Data persistence in Azure Table Storage (production)

**Purpose**: Model how availability entries are stored and queried

**Type Definition**:
```javascript
{
  PartitionKey: string,               // Format: YYYY-MM (month, e.g., "2026-06")
  RowKey: string,                     // Format: persona_name#YYYY-MM-DD (unique ID)
  timestamp: string,                  // ISO 8601 timestamp from Table Storage
  personaName: string,                // Denormalized: persona display name
  date: string,                       // ISO format: YYYY-MM-DD
  isAvailable: boolean,               // true = available, false = not available
  color: string,                      // Denormalized: persona color (#RRGGBB)
}
```

**Partitioning Strategy**:
- **PartitionKey**: `YYYY-MM` (month)
  - Example: `"2026-06"` for June 2026
  - Optimized for: "Get all personas for June" queries (most common calendar use case)
  - Enables efficient month-view rendering

- **RowKey**: `persona_name#YYYY-MM-DD`
  - Example: `"Jack#2026-06-29"`
  - Ensures uniqueness: (name, date) pair identifies one entry
  - Example table entry:
    ```
    PartitionKey: "2026-06"
    RowKey: "Jack#2026-06-29"
    personaName: "Jack"
    date: "2026-06-29"
    isAvailable: true
    color: "#FF5733"
    timestamp: "2026-06-29T14:32:00Z"
    ```

**Query Patterns**:
1. **Get all personas for a month** (primary use case):
   ```
   Table: "DaboyzAvailability"
   Query: PartitionKey == "2026-06"
   Result: All (persona, date) entries for June 2026
   ```

2. **Get persona availability for a date**:
   ```
   RowKey filter: Contains date suffix (e.g., "#2026-06-29")
   Result: All personas available on 2026-06-29
   ```

3. **Get one persona's availability for one date**:
   ```
   PartitionKey: "2026-06"
   RowKey: "Jack#2026-06-29"
   Result: Single row (if exists)
   ```

**Collision Detection Scope**:
- Query ALL rows in table (all PartitionKeys, all months)
- Extract unique (persona_name, color) tuples
- Check if new persona matches any existing (name, color) combo
- Result: Prevents duplicates across entire system, not month-scoped

**Cost Optimization**:
- Partitioning by month minimizes query scope for calendar views
- Row key includes date for unique index (prevents duplicates)
- Denormalized fields (personaName, color) prevent additional lookups
- Reduces transactions and improves query performance

---

## 7. DevEnvironment (Local Development)

**Scope**: Configuration for local development orchestration

**Purpose**: Define ports and service coordination for `npm run dev`

**Type Definition**:
```javascript
{
  frontend: {
    port: 5173,                       // Vite default
    url: "http://localhost:5173",
    service: "vite dev"
  },
  backend: {
    port: 7071,                       // Azure Functions default
    url: "http://localhost:7071",
    service: "func start"
  },
  proxy: {
    port: number,                     // Auto-allocated if 3000 in use
    url: "string",
    service: "swa start"
  }
}
```

**Initialization Flow**:
1. Check if ports 5173, 7071 are available
2. If any port in use: Auto-find next available port
3. Start all services via `concurrently`
4. Log to terminal:
   ```
   Frontend running at http://localhost:5173
   Backend running at http://localhost:7071
   SWA proxy running at http://localhost:3000
   All services healthy. Ready for development.
   ```

**Port Allocation Logic**:
```javascript
// If port busy, increment and check next
checkPort(5173) → available? use 5173 : check 5174 : check 5175...
checkPort(7071) → available? use 7071 : check 7072 : check 7073...
checkPort(3000) → available? use 3000 : check 3001 : check 3002...
```

**Integration Point**: Configured in `package.json` scripts section with concurrently

---

## Summary: Entity Relationships

```
VisibilityState
    ↓ (read by)
useAvailability Hook
    ↑ (input from)
IdleState (from useIdleTimeout)
    ↓ (combined into)
PollingControl
    ↓ (manages)
API Polling Frequency
    ↓ (fetches)
AzureInfrastructure (from Table Storage)

PersonaValidationPayload
    ↓ (validated against)
AzureInfrastructure (collision detection)
    ↓ (produces)
CollisionResult
    ↓ (displayed in)
PersonaOnboarding Component

DevEnvironment
    ↓ (configured via)
package.json scripts
    ↓ (orchestrated by)
concurrently package
```

---

**Next Step**: Create hook and component contracts in `contracts/` directory.
