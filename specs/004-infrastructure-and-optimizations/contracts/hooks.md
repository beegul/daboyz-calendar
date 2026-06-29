# Hook Contracts: Infrastructure and Cost Optimizations

**Feature**: 004-infrastructure-and-optimizations | **Date**: 2026-06-29

**Purpose**: Define the interface contracts for custom React hooks introduced or updated by this feature.

---

## 1. useIdleTimeout Hook (NEW)

**Location**: `public/src/hooks/useIdleTimeout.js`

**Purpose**: Track user activity and determine if application has been idle for 10+ minutes

**Function Signature**:
```javascript
function useIdleTimeout(options = {}) {
  return {
    isIdle: boolean,
    lastActivityTime: number,
    resetIdleTimer: () => void,
    idleThresholdMs: number
  };
}
```

**Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.idleThresholdMs` | number | 600000 | Milliseconds before marking as idle (10 minutes) |
| `options.onIdleStateChange` | (isIdle: boolean) => void | undefined | Optional callback when idle state changes |
| `options.enabled` | boolean | true | Whether to track activity (for testing/disabling) |

**Return Value**:
```javascript
{
  isIdle: boolean,              // true if inactive > idleThresholdMs
  lastActivityTime: number,     // Timestamp (ms) of last activity
  resetIdleTimer: () => void,   // Manually reset the idle timer (for testing)
  idleThresholdMs: number       // Current threshold value (for display/testing)
}
```

**Behavior**:

### Initialization
- On mount: `lastActivityTime = Date.now()`
- `isIdle = false` (assume active initially)
- Attach event listeners: `mousemove`, `keydown`, `touchstart` on `document`
- Set internal timer (check every 1000ms if crossed threshold)

### Event Handling
- `mousemove` event → call `resetIdleTimer()`
- `keydown` event → call `resetIdleTimer()`
- `touchstart` event → call `resetIdleTimer()`

```javascript
function resetIdleTimer() {
  lastActivityTime = Date.now();
  if (isIdle) {
    isIdle = false;
    onIdleStateChange?.(false);  // Notify if callback provided
  }
}
```

### Idle Detection
```javascript
// Check on interval (every 1000ms)
const checkIdle = () => {
  const elapsed = Date.now() - lastActivityTime;
  const shouldBeIdle = elapsed >= idleThresholdMs;
  
  if (shouldBeIdle && !isIdle) {
    isIdle = true;
    onIdleStateChange?.(true);
  } else if (!shouldBeIdle && isIdle) {
    isIdle = false;
    onIdleStateChange?.(false);
  }
};
```

### Cleanup
- On unmount: Remove event listeners (`mousemove`, `keydown`, `touchstart`)
- Clear internal check interval

**Usage Example**:
```javascript
function MyComponent() {
  const { isIdle, lastActivityTime, resetIdleTimer } = useIdleTimeout({
    idleThresholdMs: 600000,
    onIdleStateChange: (idle) => console.log('Idle:', idle)
  });
  
  return (
    <div>
      <p>Idle: {isIdle ? 'Yes' : 'No'}</p>
      <p>Last activity: {new Date(lastActivityTime).toLocaleTimeString()}</p>
      <button onClick={resetIdleTimer}>Reset Timer</button>
    </div>
  );
}
```

**Testing Considerations**:
- Mock timers with `jest.useFakeTimers()` to simulate time passage
- Mock event listeners to trigger activity
- Verify `isIdle` transitions at threshold (600000ms)

**Browser Support**: 
- All modern browsers (mousemove, keydown, touchstart are standard)

**Performance**:
- Event listeners use document-level delegation (not per-component)
- Internal check interval is 1000ms (low frequency, minimal overhead)
- Cleanup properly on unmount to prevent memory leaks

---

## 2. useAvailability Hook (UPDATED)

**Location**: `public/src/hooks/useAvailability.js`

**Purpose**: Fetch and maintain availability data with adaptive polling based on tab visibility and user idle state

**Existing Signature** (preserved):
```javascript
function useAvailability() {
  return {
    entries: AvailabilityEntry[],
    loading: boolean,
    error: string | null,
    refetch: () => Promise<void>
  };
}
```

**New Behavior - Adaptive Polling**:

### Integration with useIdleTimeout
```javascript
const { isIdle } = useIdleTimeout();
```

### Integration with Page Visibility API
```javascript
useEffect(() => {
  const handleVisibilityChange = () => {
    // Visibility state changed, update polling
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

### Polling Frequency Decision Logic
```javascript
let pollingFrequency = 5000; // Default: 5 seconds

if (document.visibilityState === 'hidden') {
  // Stop polling when tab is hidden
  pollingFrequency = 0;  // Disabled
} else if (isIdle) {
  // Throttle to 5 minutes when idle
  pollingFrequency = 300000;
} else {
  // Normal: 5 seconds when visible and active
  pollingFrequency = 5000;
}
```

### Polling Implementation
```javascript
useEffect(() => {
  // Clear any existing interval
  if (pollingIntervalId) {
    clearInterval(pollingIntervalId);
  }
  
  // If frequency is 0 (hidden), don't set interval
  if (pollingFrequency === 0) {
    return;
  }
  
  // Set new interval with calculated frequency
  pollingIntervalId = setInterval(async () => {
    try {
      const response = await fetch('/api/availability');
      const data = await response.json();
      setEntries(data);
    } catch (err) {
      setError(err.message);
    }
  }, pollingFrequency);
  
  return () => clearInterval(pollingIntervalId);
}, [pollingFrequency]);
```

### Return Value (unchanged)
```javascript
{
  entries: Array<{
    date: string,              // YYYY-MM-DD
    name: string,              // Persona name
    color: string,             // Hex color
    isAvailable: boolean       // Availability status
  }>,
  loading: boolean,
  error: string | null,
  refetch: () => Promise<void> // Manual refetch
}
```

**Performance Characteristics**:
- Visible + Active: 5s polling = 12 requests/minute = ~8,640 requests/month
- Visible + Idle (10+ min): 5min polling = 1 request/2.5 min = ~288 requests/month  
- Hidden: 0 requests
- **Estimated savings**: Reduces requests from ~259,200/month (24/7 polling) to ~8,928/month (with visibility + idle protection)

**Cost Impact**:
- Azure Functions Free Tier: 1M invocations/month → Easily within limit with adaptive polling

**Browser Support**:
- Page Visibility API: Chrome 13+, Firefox 10+, Safari 7+
- Fallback for unsupported browsers: Use blur/focus events (less accurate but functional)

**Backward Compatibility**:
- Hook return signature unchanged
- Existing component usage unaffected
- Polling is faster/better by default (cost reduction)

---

## 3. validatePersonaUniqueness Function (UTILITY)

**Location**: `public/src/utils/validation.js`

**Purpose**: Check if a persona name+color combo already exists globally

**Function Signature**:
```javascript
function validatePersonaUniqueness(name, color, allExistingPersonas) {
  return {
    isValid: boolean,
    errorMessage: string | null,
    conflictingPersona: { name: string, color: string } | null
  };
}
```

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Proposed persona name (raw from input field) |
| `color` | string | Proposed color (hex string, e.g., #FF5733) |
| `allExistingPersonas` | Array<{name, color}> | All personas in system (across all months) |

**Return Value**:
```javascript
{
  isValid: boolean,                    // true = safe to create, false = collision detected
  errorMessage: string | null,         // User-facing error or null
  conflictingPersona: {
    name: string,
    color: string
  } | null                             // Details of conflicting persona if exists
}
```

**Algorithm**:
```javascript
function validatePersonaUniqueness(name, color, allExistingPersonas) {
  // Validate inputs
  if (!name || !name.trim()) {
    return {
      isValid: false,
      errorMessage: "Please enter a persona name.",
      conflictingPersona: null
    };
  }
  
  if (!isValidHexColor(color)) {
    return {
      isValid: false,
      errorMessage: "Please select a valid color.",
      conflictingPersona: null
    };
  }
  
  // Normalize input
  const normalizedName = name.trim().toLowerCase();
  
  // Check for collision
  for (const existing of allExistingPersonas) {
    const existingNormalizedName = existing.name.trim().toLowerCase();
    
    if (existingNormalizedName === normalizedName && existing.color === color) {
      // Collision found
      return {
        isValid: false,
        errorMessage: `Name and color combo already taken! ${existing.name} (${existing.color}) already exists.`,
        conflictingPersona: {
          name: existing.name,
          color: existing.color
        }
      };
    }
  }
  
  // No collision
  return {
    isValid: true,
    errorMessage: null,
    conflictingPersona: null
  };
}
```

**Helper Function**:
```javascript
function isValidHexColor(color) {
  // Match: #FFF or #FFFFFF patterns
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color);
}
```

**Validation Rules**:
1. Name must not be empty after trimming
2. Color must be valid hex format (#RGB or #RRGGBB)
3. (name, color) tuple must not exist in allExistingPersonas (case-insensitive name, exact color)

**Usage Example**:
```javascript
const result = validatePersonaUniqueness(
  "  Jack  ",
  "#FF5733",
  [
    { name: "alice", color: "#0000FF" },
    { name: "bob", color: "#FF5733" }
  ]
);

// Result: 
// {
//   isValid: true,
//   errorMessage: null,
//   conflictingPersona: null
// }
```

**Testing Considerations**:
- Test case-insensitive matching: "Jack" vs "jack" vs "JACK"
- Test whitespace trimming: "  Jack  " vs "Jack"
- Test color exact match: Same name but different color = valid
- Test hex color validation: Valid patterns #FFF and #FFFFFF, invalid patterns
- Test collision detection: Exact match should fail

---

## Summary: Hook Contract Interactions

```
User Activity
    ↓ (detected by)
useIdleTimeout
    ↓ (isIdle state consumed by)
useAvailability
    ↓ (combined with Page Visibility API)
Polling Frequency Decision
    ↓ (applies)
Adaptive Polling Interval
    ↓ (fetches)
Availability Data

Form Input (PersonaOnboarding)
    ↓ (validated by)
validatePersonaUniqueness
    ↓ (against)
allExistingPersonas from useAvailability
    ↓ (result shows)
CollisionResult
```

---

**Next Step**: Create component contracts in `contracts/components.md`.
