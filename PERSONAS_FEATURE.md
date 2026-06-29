# Dynamic User Personas Feature

## Overview

The Dynamic User Personas feature replaces the hardcoded Alice/Bobby/Carmen user list with a flexible system allowing users to create custom personas with name and color. This enables unlimited user support without code changes and improves onboarding experience.

## Key Features

### 1. **Mandatory Persona Creation on First Load**
- Users cannot access the calendar until they create at least one persona
- Modal overlay blocks calendar access with friendly onboarding form
- Can be reopened via "New Persona" button in persona selector

### 2. **Persona Identity: Composite Key (name, color)**
- **No UUID required** - personas identified by (name, color) tuple
- Enables cross-device synchronization using only name and color
- Simple, user-friendly approach
- Unique constraint: No two personas can have same name + color combination

### 3. **Persona Selector Dropdown**
- Header dropdown showing active persona with color swatch
- List of all personas with quick switch
- "New Persona" button to add more personas
- Closes on outside click for clean UX
- Accessibility: aria-labels, keyboard navigation

### 4. **Availability Management**
- Mark/unmark dates for each persona independently
- Colored badges show available personas for each date
- Click badge to remove persona's availability
- Idempotent toggle (add → remove on repeated clicks)

## Architecture

### Data Model

**Personas Storage (localStorage)**
```javascript
// personas_storage: JSON array
[
  { name: "Sarah", color: "#FF0000" },
  { name: "Marcus", color: "#00FF00" },
  { name: "Elena", color: "#0000FF" }
]

// active_persona: JSON object
{ name: "Sarah", color: "#FF0000" }
```

**Availability Storage (localStorage)**
```javascript
// calendar_availability: JSON array
[
  {
    rowKey: "Sarah#FF0000#2026-07-15",  // Composite key format
    date: "2026-07-15",
    name: "Sarah",
    color: "#FF0000",
    timestamp: "2026-07-01T12:30:45Z"
  }
  // ...
]
```

**Backend Storage (Azure Table Storage)**
- Partition Key: `calendar-{YYYY-MM}` (month-based partitioning)
- Row Key: `{name}#{color}#{date}` (composite key)
- Columns: date, name, color, timestamp

### Component Hierarchy

```
App (persona state management)
├── PersonaOnboarding (first-time setup modal)
├── Header
│   └── PersonaSelector (dropdown for switching personas)
└── Main Calendar
    ├── MonthNavigation
    └── CalendarGrid (pass activePersona)
        └── AvailabilityBadge (display persona name + color)
```

### API Endpoints

**POST /api/availability/toggle**
- Request: `{ name, color, date }`
- Response: `{ action: "added" | "deleted", entry: {...} }`

**DELETE /api/availability**
- Query params: `?name=X&color=Y&date=Z`
- Response: `{ action: "deleted", entry: {...} }`

**GET /api/availability**
- Query params: `?month=2026-07`
- Response: `{ month, entries: [{name, color, date, ...}] }`

**GET /api/availability/personas**
- Query params: `?month=2026-07`
- Response: `{ month, personas: [{name, color}, ...] }`

## User Workflows

### First-Time Onboarding
1. Load app → PersonaOnboarding modal appears
2. Enter persona name (1-50 chars, alphanumeric + spaces)
3. Choose color via HTML5 color picker
4. Click "Create Persona" → stored to localStorage + becomes active
5. Calendar becomes accessible with persona colors/names visible

### Switching Personas
1. Click active persona dropdown in header
2. Select different persona from list
3. Calendar updates to show selected persona's availability
4. Active persona saved to localStorage

### Creating Additional Personas
1. Click "New Persona" in dropdown
2. PersonaOnboarding modal reappears
3. Enter new persona details
4. Added to personas list, becomes active automatically

### Marking Availability
1. Active persona shown in header
2. Click date to toggle availability
3. Badge appears with persona name + color
4. Click badge to remove specific persona's availability
5. Changes sync to backend (or localStorage in mock mode)

## Validation Rules

**Name Validation**
- Minimum: 1 character (after trim)
- Maximum: 50 characters
- Allowed: Letters (a-z, A-Z), numbers (0-9), spaces
- Rejected: Special characters (@, !, #, etc.)

**Color Validation**
- Format: Hex color code (#RRGGBB)
- HTML5 color picker ensures valid format
- Examples: #FF0000, #00FF00, #0000FF

**Composite Key Uniqueness**
- Same name + different color = allowed
- Same color + different name = allowed
- Identical (name, color) = rejected with error

## State Management

### App.jsx
```javascript
const [currentMonth, setCurrentMonth] = useState(today)
const [activePersona, setActivePersona] = useState(null)
const [personas, setPersonas] = useState([])
const [showOnboarding, setShowOnboarding] = useState(false)
```

### useAvailability Hook
```javascript
const {
  entries,                    // Current month's availability
  loading,                    // Fetching state
  error,                      // Error message
  toggleAvailability,         // (name, color, date) → Promise
  deleteAvailability,         // (name, color, date) → Promise
  useMockAPI,                 // Is using mock API fallback?
  refetch
} = useAvailability(month)
```

## Testing

### Unit Tests (PersonaOnboarding.test.jsx)
- Form rendering and validation
- Name validation (empty, invalid chars, max length)
- Color picker functionality
- Submit button enable/disable logic
- Callback invocation with trimmed name

### Integration Tests (personas.integration.test.js)
- Persona creation and persistence
- Storage format verification
- Multiple personas management
- Persona switching
- Availability isolation per persona
- Page refresh persistence
- Onboarding logic verification

### Integration Tests (availability-marking.integration.test.js)
- Mark date creates composite key entry
- Badge displays persona name + color
- Badge click removes entry
- Multiple dates marking/unmarking
- Refresh persistence
- Multiple personas isolation
- Idempotent toggle behavior
- Selective persona removal

## Migration from Old System

### Old Schema
```javascript
users: [
  { id: 'alice', name: 'Alice', color: '#2563eb' },
  { id: 'bobby', name: 'Bobby', color: '#dc2626' },
  { id: 'carmen', name: 'Carmen', color: '#eab308' }
]
// userId field used for availability entries
```

### New Schema
```javascript
personas: [
  { name: 'Alice', color: '#2563eb' },
  { name: 'Bobby', color: '#dc2626' },
  { name: 'Carmen', color: '#eab308' }
]
// (name, color) composite key used for availability
```

### Deleted Components
- UserSelector.jsx (replaced by PersonaSelector.jsx)
- UserLegend.jsx (no longer needed)
- useUsers hook (personas managed in App.jsx)

## Browser Compatibility

- **Chrome/Edge**: ✅ Full support (HTML5 color picker, localStorage)
- **Firefox**: ✅ Full support
- **Safari**: ✅ Full support (color picker available)
- **IE11**: ❌ Not supported (ES6+, modern APIs required)

## Performance Considerations

1. **localStorage Limits**
   - Typical browser: 5-10MB
   - 1 persona = ~50 bytes
   - 1 availability entry = ~80 bytes
   - ~60,000 entries maximum before limits

2. **Network Optimization**
   - Composite key queries are indexed in Azure Table Storage
   - Month-based partitioning enables efficient range queries
   - HMR dev server reduces reload time during development

3. **Re-render Optimization**
   - useAvailability hook memoizes entries
   - CalendarGrid uses useMemo for calendar days calculation
   - PersonaSelector memoizes persona list

## Future Enhancements

1. **Cloud Sync**
   - Replace localStorage with Azure Table Storage for persistence
   - Auto-sync across devices using (name, color) key
   - Conflict resolution for simultaneous edits

2. **Persona Groups**
   - Allow organizing personas into teams/projects
   - Separate calendars per group
   - Group sharing with invitation links

3. **Export/Import**
   - Export calendar as CSV/iCal
   - Import personas from other calendars
   - Bulk persona management

4. **Analytics**
   - Track persona creation patterns
   - Availability trends per persona
   - Monthly activity reports

## Known Limitations

1. **No Automatic Sync**
   - Current: localStorage only (single device)
   - Future: Add backend sync for cross-device access

2. **No Persona Deletion**
   - Can create new personas but cannot delete existing ones
   - Future: Add delete with historical data preservation

3. **No Sharing**
   - Calendars are private to single user
   - Future: Add share links for read-only access

## Debugging

### Check localStorage
```javascript
// Browser DevTools Console
console.log(JSON.parse(localStorage.getItem('personas_storage')))
console.log(JSON.parse(localStorage.getItem('active_persona')))
console.log(JSON.parse(localStorage.getItem('calendar_availability')))
```

### Reset Data
```javascript
localStorage.clear()  // Clear all data
location.reload()     // Reload app - shows onboarding again
```

### Enable Mock API
- If backend unavailable, app auto-falls back to localStorage mock
- Check console for "Using Mock Data" message

## Support

- **Issues**: Report on GitHub issues
- **Questions**: Check integration tests for usage examples
- **Contributing**: See CONTRIBUTING.md for guidelines
