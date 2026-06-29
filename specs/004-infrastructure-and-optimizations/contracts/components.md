# Component Contracts: Infrastructure and Cost Optimizations

**Feature**: 004-infrastructure-and-optimizations | **Date**: 2026-06-29

**Purpose**: Define the interface contracts and responsibilities for React components modified or created by this feature.

---

## 1. PersonaOnboarding Component (UPDATED)

**Location**: `public/src/components/PersonaOnboarding.jsx`

**Purpose**: Form component to create new personas with collision detection safeguards

**Existing Props** (preserved):
```javascript
{
  onPersonaCreate: (persona: {name: string, color: string}) => void,
  [other existing props...]
}
```

**Existing Behavior** (preserved):
- Render form with name input and color picker
- Submit button to create persona
- Success notification on creation
- [other existing features]

**New Behavior - Collision Detection**:

### Enhanced Component State
```javascript
const [validationState, setValidationState] = useState({
  nameError: null,       // Error message for name field
  colorError: null,      // Error message for color field
  isValidating: false,   // Debounce validation calls
  allPersonas: []        // Cache of all existing personas
});
```

### Fetch allExistingPersonas
```javascript
// On mount or when needed
useEffect(() => {
  const fetchAllPersonas = async () => {
    try {
      const response = await fetch('/api/personas');
      const personas = await response.json();
      setValidationState(prev => ({
        ...prev,
        allPersonas: personas
      }));
    } catch (err) {
      console.error('Failed to fetch personas:', err);
      // Show warning to user, but allow creation attempt
    }
  };
  
  fetchAllPersonas();
}, []);
```

### Real-Time Validation
```javascript
// Called on every name or color change (debounced)
const handleFieldChange = debounce((name, color) => {
  setValidationState(prev => ({ ...prev, isValidating: true }));
  
  const result = validatePersonaUniqueness(name, color, validationState.allPersonas);
  
  setValidationState(prev => ({
    ...prev,
    nameError: result.isValid ? null : result.errorMessage,
    isValidating: false
  }));
}, 300); // 300ms debounce
```

### Form Submission Logic
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Get current form values
  const name = formRef.current.nameInput.value;
  const color = formRef.current.colorInput.value;
  
  // Validate before submit
  const result = validatePersonaUniqueness(name, color, validationState.allPersonas);
  
  if (!result.isValid) {
    // Show error, block submission
    setValidationState(prev => ({
      ...prev,
      nameError: result.errorMessage
    }));
    return;
  }
  
  // Validation passed, proceed with creation
  try {
    const response = await fetch('/api/personas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    });
    
    if (response.ok) {
      const newPersona = await response.json();
      
      // Refresh personas cache
      setValidationState(prev => ({
        ...prev,
        allPersonas: [...prev.allPersonas, newPersona]
      }));
      
      // Notify parent
      onPersonaCreate?.(newPersona);
      
      // Reset form
      formRef.current.reset();
      setValidationState(prev => ({
        ...prev,
        nameError: null
      }));
    }
  } catch (err) {
    setValidationState(prev => ({
      ...prev,
      nameError: 'Failed to create persona. Please try again.'
    }));
  }
};
```

### Form Rendering
```javascript
return (
  <form onSubmit={handleSubmit} ref={formRef}>
    <div>
      <label>Name</label>
      <input
        ref={nameInputRef}
        type="text"
        placeholder="Enter persona name"
        onChange={(e) => handleFieldChange(e.target.value, colorInputRef.current.value)}
        aria-invalid={!!validationState.nameError}
        aria-describedby={validationState.nameError ? 'name-error' : undefined}
      />
      {validationState.nameError && (
        <p id="name-error" role="alert" className="error">
          {validationState.nameError}
        </p>
      )}
    </div>
    
    <div>
      <label>Color</label>
      <input
        ref={colorInputRef}
        type="color"
        onChange={(e) => handleFieldChange(nameInputRef.current.value, e.target.value)}
        aria-invalid={!!validationState.colorError}
        aria-describedby={validationState.colorError ? 'color-error' : undefined}
      />
      {validationState.colorError && (
        <p id="color-error" role="alert" className="error">
          {validationState.colorError}
        </p>
      )}
    </div>
    
    <button
      type="submit"
      disabled={validationState.isValidating || !!validationState.nameError}
    >
      {validationState.isValidating ? 'Checking...' : 'Create Persona'}
    </button>
  </form>
);
```

**New Props** (optional):
```javascript
{
  onValidationChange?: (isValid: boolean) => void,  // Callback when validation state changes
  fetchPersonasEndpoint?: string                     // Custom API endpoint (default: /api/personas)
}
```

**Side Effects**:
1. On mount: Fetch all existing personas for collision detection
2. On name/color change: Validate in real-time (debounced, 300ms)
3. On submit: Final validation before POST
4. On success: Refresh personas cache, reset form, notify parent

**Error Handling**:
- Network error fetching personas → Show warning, allow user to attempt creation
- Validation error on submit → Show error message, block submission
- Creation failure → Show error message, allow retry

**Accessibility**:
- Use `aria-invalid` on inputs with errors
- Use `aria-describedby` to link error messages to inputs
- Use `role="alert"` on error messages
- Disable submit button during validation/submission

**Performance**:
- Debounce validation calls (300ms) to avoid excessive recalculation
- Cache allPersonas at component level (refetch only when needed)
- Memoize validatePersonaUniqueness result if needed

**Testing Expectations**:
- Test: Valid name + color without collision → Form submits
- Test: Name + color collision detected → Error shown, form blocked
- Test: Case-insensitive collision (Jack vs jack) → Error shown
- Test: Same name, different color → Form submits (no collision)
- Test: Whitespace trimming ("  Jack  " matches "jack") → Error shown
- Test: Real-time validation debounce works → Validation called once per 300ms max
- Test: Network error fetching personas → Warning shown, form still functional

---

## 2. CalendarGrid Component (INTEGRATION)

**Location**: `public/src/components/CalendarGrid.jsx`

**Purpose**: Display calendar with availability badges (unmodified, but uses enhanced useAvailability)

**Impact from Feature 004**:
- `useAvailability` hook now includes adaptive polling
- No changes to CalendarGrid itself
- Automatically benefits from cost protection (fewer API calls when idle/hidden)

**Behavior Change** (transparent to component):
- Polling frequency adjusts based on visibility + idle state
- No visual changes
- Same data contract (entries, loading, error, refetch)

---

## 3. App Component (INTEGRATION)

**Location**: `public/src/App.jsx`

**Purpose**: Root component (unmodified)

**Impact from Feature 004**:
- useIdleTimeout initialized at app level (top-level hook)
- useAvailability uses idle state automatically
- No changes to App.jsx needed if using hooks properly
- Performance improves automatically with cost protection

**Optional Enhancement**:
```javascript
// If want to display idle state for debugging (optional):
const { isIdle } = useIdleTimeout();

return (
  <div>
    {process.env.NODE_ENV === 'development' && isIdle && (
      <div className="debug-idle-indicator">Idle mode active</div>
    )}
    {/* Rest of App */}
  </div>
);
```

---

## 4. New Utility Function - validatePersonaUniqueness

**Location**: `public/src/utils/validation.js`

**Purpose**: Pure function to validate persona uniqueness

**See**: [Hook Contracts - validatePersonaUniqueness](./hooks.md#3-validatepersonauniqueness-function-utility)

---

## Component Dependency Graph

```
App
├── PersonaOnboarding (UPDATED with collision detection)
│   └── validatePersonaUniqueness (NEW utility)
├── CalendarGrid (unchanged, benefits from enhanced useAvailability)
│   ├── useAvailability (UPDATED with adaptive polling)
│   │   └── useIdleTimeout (NEW hook)
│   │       └── Page Visibility API (browser native)
│   └── [other sub-components]
└── [other components]
```

---

## Update Summary

| Component/File | Change | Impact | Testing |
|---|---|---|---|
| **PersonaOnboarding.jsx** | Add collision detection validation, real-time error display | Prevents duplicate (name, color) tuples | Form validation tests, collision edge cases |
| **useAvailability.js** | Add Page Visibility API listener, idle state integration | Adaptive polling frequency, cost reduction | Polling frequency transitions, network spy |
| **useIdleTimeout.js** | NEW hook | Track user activity, enable idle detection | Activity tracking, threshold crossing |
| **validation.js** | NEW utility | Centralized collision detection logic | Unit tests for validation rules |
| **CalendarGrid.jsx** | No changes | Benefits from cost protection indirectly | Integration test (polling should be throttled when idle) |
| **App.jsx** | No changes | Optional debug display (optional enhancement) | No breaking changes |

---

**Next Step**: Create quickstart validation guide in `quickstart.md`.
