# Collision Detection System

**Feature 004 - User Story 2: Collision Safeguards**

## Overview

The collision detection system prevents duplicate personas in the system by detecting name+color tuple collisions during onboarding. It uses case-insensitive, whitespace-trimmed matching to catch variations of the same persona name.

## Problem Statement

**Without Collision Detection**:
- User "Jack" could create persona "Jack" #FF5733
- Another user could create "jack" #FF5733 (lowercase)
- System treats these as different personas
- Causes data inconsistency and display issues

**With Collision Detection**:
- "Jack" == "jack" == "  JACK  " (case-insensitive, whitespace-trimmed)
- "Jack" + "#FF5733" blocks "jack" + "#FF5733"
- "Jack" + "#FF5733" allows "Jack" + "#0000FF" (different color)
- "Jack" + "#FF5733" allows "Sarah" + "#FF5733" (different name)

## Algorithm

### Core Validation Function

**File**: `public/src/utils/validation.js`

```javascript
export function validatePersonaUniqueness(name, color, allPersonas = []) {
  // 1. Validate inputs
  if (!name || typeof name !== "string") {
    return { isValid: false, errorMessage: "Name is required" };
  }

  if (!isValidHexColor(color)) {
    return { isValid: false, errorMessage: "Invalid color format" };
  }

  // 2. Normalize inputs for comparison
  const normalizedInputName = normalizePersonaName(name);
  const normalizedInputColor = color.toLowerCase().replace("#", "");

  // 3. Check against all existing personas
  for (const persona of allPersonas) {
    const normalizedExistingName = normalizePersonaName(persona.name);
    const normalizedExistingColor = persona.color.toLowerCase().replace("#", "");

    // 4. Detect collision (both name AND color match)
    if (
      normalizedInputName === normalizedExistingName &&
      normalizedInputColor === normalizedExistingColor
    ) {
      return {
        isValid: false,
        errorMessage: `Persona "${persona.name}" already exists with this color`,
        conflictingPersona: persona,
      };
    }
  }

  // 5. No collision found
  return {
    isValid: true,
    errorMessage: null,
    conflictingPersona: null,
  };
}
```

### Normalization Strategy

**Function**: `normalizePersonaName(name)`

**Input Transformations**:
1. **Trim whitespace**: `"  Jack  "` → `"Jack"`
2. **Convert to lowercase**: `"Jack"` → `"jack"`
3. **Remove leading/trailing spaces**: Handled by trim

**Result**: All variations of a name are normalized to the same string

**Examples**:
```javascript
normalizePersonaName("Jack")      // → "jack"
normalizePersonaName("  JACK  ")  // → "jack"
normalizePersonaName("jAcK")      // → "jack"
normalizePersonaName("jack ")     // → "jack"
```

### Color Validation

**Function**: `isValidHexColor(color)`

**Accepted Formats**:
- `#RRGGBB` (with hash): `#FF5733`, `#0000FF`
- `RRGGBB` (without hash): `FF5733`, `0000FF`
- `#RGB` (short form): `#F00`, `#00F`

**Rejected Formats**:
- Invalid characters: `#XYZ123`, `#12G456`
- Wrong length: `#FF`, `#FFFFFF00`
- Non-hex: `white`, `red`, `rgb(255,0,0)`

**Normalization**:
```javascript
const normalizedColor = color.toLowerCase().replace("#", "");
// "#FF5733" → "ff5733"
// "ff5733" → "ff5733"
// "#F00" → "f00" (note: 3-digit not expanded)
```

## Integration with UI

### PersonaOnboarding Component

**File**: `public/src/components/PersonaOnboarding.jsx`

**Flow**:
```javascript
const [allPersonas, setAllPersonas] = useState([]);
const [nameError, setNameError] = useState("");
const [colorError, setColorError] = useState("");
const [collisionMessage, setCollisionMessage] = useState("");

// 1. Fetch existing personas on mount
useEffect(() => {
  fetch("/api/personas")
    .then((res) => res.json())
    .then((data) => setAllPersonas(data.personas))
    .catch((err) => console.error("Failed to fetch personas", err));
}, []);

// 2. Debounced validation on name/color change
const performValidation = useCallback((inputName, inputColor) => {
  const validation = validatePersonaUniqueness(inputName, inputColor, allPersonas);

  if (!validation.isValid) {
    setCollisionMessage(validation.errorMessage);
    // UI: Show error, disable submit
  } else {
    setCollisionMessage("");
    // UI: Clear error, enable submit
  }
}, [allPersonas]);

// 3. Debounce to prevent excessive validation calls
const handleNameChange = (e) => {
  const newName = e.target.value;
  setName(newName);

  // Clear and reset debounce timer
  if (validationDebounceRef.current) {
    clearTimeout(validationDebounceRef.current);
  }

  validationDebounceRef.current = setTimeout(() => {
    performValidation(newName, color);
  }, 300); // 300ms debounce
};

// 4. Form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  // Final validation before API call
  const validation = validatePersonaUniqueness(name, color, allPersonas);
  if (!validation.isValid) {
    setCollisionMessage(validation.errorMessage);
    return;
  }

  // API call to create persona
  const response = await fetch("/api/personas", {
    method: "POST",
    body: JSON.stringify({ name: name.trim(), color: color.toLowerCase() }),
  });

  if (response.ok) {
    // Refresh personas list
    const updated = await fetch("/api/personas").then((r) => r.json());
    setAllPersonas(updated.personas);
    
    // Reset form
    setName("");
    setColor("#0000FF");
  }
};
```

### Real-Time Error Display

**UI State Management**:
```javascript
// Collision detected → Show error message
if (collisionMessage) {
  return (
    <div className="error-message">
      <span className="icon">⚠️</span>
      <span>{collisionMessage}</span>
    </div>
  );
}

// Submit button disabled while errors exist
<button disabled={!isValid || collisionMessage !== ""}>
  Create Persona
</button>
```

## Testing Coverage

### Test File

**Location**: `public/src/components/__tests__/PersonaOnboarding.test.jsx`

### Test Scenarios

| Scenario | Test ID | Input | Expected |
|----------|---------|-------|----------|
| Exact collision | T033 | "Jack" #FF5733 (exists) | Error shown, submit disabled |
| Case-insensitive collision | T034 | "jack" #FF5733 (when "Jack" exists) | Error shown, submit disabled |
| Whitespace collision | T035 | "  Jack  " #FF5733 (when "Jack" exists) | Error shown, submit disabled |
| Same name, different color | T036 | "Jack" #0000FF (when "Jack" #FF5733 exists) | Allowed, submit enabled |
| Different name, same color | T037 | "Sarah" #FF5733 (when "Jack" #FF5733 exists) | Allowed, submit enabled |
| Submit disabled on error | T038 | Any validation error | Submit button disabled |
| Debounce timing | T039 | Rapid name changes | Validation called ≤ 2x per 500ms |
| Network error | T040 | Fetch /api/personas fails | Warning shown, form still usable |

### Mock Testing

```javascript
describe("Collision Detection", () => {
  beforeEach(() => {
    // Mock existing personas
    global.fetch.mockResolvedValue({
      json: async () => ({
        personas: [
          { name: "Jack", color: "#FF5733" },
          { name: "Sarah", color: "#0000FF" },
        ],
      }),
    });
  });

  test("blocks exact name+color collision", async () => {
    const { getByText, getByLabelText } = render(<PersonaOnboarding />);

    const nameInput = getByLabelText("Persona name");
    const colorInput = getByLabelText("Persona color picker");

    // Try to create "Jack" #FF5733 (exists)
    await userEvent.type(nameInput, "Jack");
    fireEvent.change(colorInput, { target: { value: "#FF5733" } });

    // Error should appear
    await waitFor(() => {
      expect(getByText(/already exists/i)).toBeInTheDocument();
    });

    // Submit should be disabled
    expect(getByLabelText("Create persona button")).toBeDisabled();
  });

  test("allows same name with different color", async () => {
    const { getByText, getByLabelText, queryByText } = render(
      <PersonaOnboarding />,
    );

    const nameInput = getByLabelText("Persona name");
    const colorInput = getByLabelText("Persona color picker");

    // Try to create "Jack" #0000FF (name exists, but color is different)
    await userEvent.type(nameInput, "Jack");
    fireEvent.change(colorInput, { target: { value: "#0000FF" } });

    // No error should appear
    await waitFor(() => {
      expect(queryByText(/already exists/i)).not.toBeInTheDocument();
    });

    // Submit should be enabled
    expect(getByLabelText("Create persona button")).toBeEnabled();
  });
});
```

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Empty name | Rejected before collision check |
| Invalid color | Rejected before collision check |
| Empty personas list | No collision found, allow creation |
| Rapid name/color changes | Debounced (300ms) to prevent excessive checks |
| Network error fetching personas | Warning shown, form remains usable, no blocking |
| Duplicate in existing list | Catches and displays message |

## Data Consistency

### API Contract

**Endpoint**: `POST /api/personas`

**Request**:
```json
{
  "name": "Jack",
  "color": "#ff5733"
}
```

**Validation (server-side)**: Should also check collision to prevent race conditions

**Response** (success):
```json
{
  "success": true,
  "persona": {
    "id": "persona-123",
    "name": "Jack",
    "color": "#ff5733",
    "createdAt": "2024-06-29T12:00:00Z"
  }
}
```

**Response** (collision):
```json
{
  "success": false,
  "error": "Persona 'Jack' already exists",
  "conflictingPersona": {
    "id": "persona-456",
    "name": "Jack",
    "color": "#ff5733"
  }
}
```

## Performance Impact

| Operation | Time | Impact |
|-----------|------|--------|
| Fetch all personas | ~100-500ms | Once on component mount |
| Validate single persona | ~1ms | On each input change (debounced 300ms) |
| Collision check (10 personas) | ~0.1ms | Linear O(n) search |
| Collision check (100 personas) | ~1ms | Still negligible |

## Future Enhancements

1. **Fuzzy Matching**: Catch similar names ("Jak" vs "Jack")
2. **Unicode Normalization**: Handle accents ("Jäck" vs "Jack")
3. **Custom Color Distances**: Detect visually similar colors (#FF0000 vs #FE0000)
4. **Role-Based Scoping**: Collisions per team/group instead of global
5. **Collision History**: Track attempts and patterns for analytics
