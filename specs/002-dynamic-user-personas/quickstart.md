# Quickstart & Validation Guide: Dynamic User Personas

**Purpose**: End-to-end validation scenarios to confirm feature completeness  
**Version**: 1.0  
**Created**: 2026-06-29  

---

## Prerequisites

- Node.js 26.4.0+ with npm 11.17.0+
- Development server running: `npm run dev`
- Backend running (optional, uses mock API if unavailable)
- Modern browser (Chrome, Firefox, Safari, Edge)

---

## Quick Start: 30-Second Test

**Goal**: Verify persona creation and availability marking work end-to-end

### Steps

1. **Open the app**
   ```
   http://localhost:5175/
   ```
   Expected: Persona creation form displayed (calendar blocked)

2. **Create a persona**
   - Enter name: `"Alex"`
   - Click color picker, select blue
   - Click "Create Persona"
   Expected: Form disappears, calendar visible, "Alex" shown in header

3. **Mark a date**
   - Click June 15 on calendar
   Expected: Blue badge "Alex" appears on June 15

4. **Verify persistence**
   - Refresh the page (F5)
   Expected: "Alex" still active, June 15 still marked

✅ **Success**: Feature works end-to-end in < 30 seconds

---

## Scenario 1: First-Time User Onboarding

**Goal**: Verify mandatory persona creation flow  
**Duration**: ~2 minutes

### Setup
- Open app in fresh browser (clear localStorage if needed)
- `localStorage.clear()` in DevTools console

### Steps

1. **Persona creation form visible**
   - Calendar is completely hidden
   - Form shows 2 inputs: name field + color picker
   - "Create Persona" button is disabled until name entered

2. **Enter invalid name (empty)**
   - Leave name field empty
   - Click color picker (green)
   - Click "Create Persona"
   Expected: Button disabled, or error shown

3. **Enter valid name and color**
   - Enter: `"Sarah"`
   - Pick color: red (#ff0000 or similar)
   - Click "Create Persona"
   Expected: 
     - Form disappears smoothly
     - Calendar grid appears
     - Header shows "Sarah" in dropdown
     - Calendar interactive

4. **Name persists**
   - Verify localStorage contains persona:
     ```javascript
     JSON.parse(localStorage.getItem('personas_storage'))
     // Should include: {name: "Sarah", color: "#ff0000"}
     ```

✅ **Pass**: Onboarding blocks calendar, persona stored

---

## Scenario 2: Mark & Unmark Availability

**Goal**: Verify core calendar interaction with custom persona  
**Duration**: ~3 minutes

### Setup
- Have active persona "Sarah" from Scenario 1

### Steps

1. **Mark single date**
   - Click June 10 on calendar
   Expected: Red badge "Sarah" appears on June 10

2. **Mark multiple dates**
   - Click June 11, 12, 15, 20
   Expected: Red "Sarah" badges appear on all 5 dates

3. **Verify badge content**
   - Hover over badge on June 10
   Expected: Tooltip or label shows "Available - Sarah"

4. **Unmark a date**
   - Click June 12 (badge already marked)
   Expected: Badge disappears, June 12 now empty

5. **Verify data persistence**
   - Refresh page
   Expected: Badges on June 10, 11, 15, 20 remain; June 12 empty

✅ **Pass**: Marking/unmarking works, data persists

---

## Scenario 3: Create & Switch Personas

**Goal**: Verify multiple persona creation and switching  
**Duration**: ~4 minutes

### Setup
- Have active persona "Sarah" (red) with June 10 marked

### Steps

1. **Click header dropdown**
   - Look for persona selector showing "Sarah"
   - Find "➕ New Persona" option at bottom
   Expected: Dropdown visible, Sarah highlighted

2. **Create second persona**
   - Click "➕ New Persona"
   - Form appears (inline or modal)
   - Enter name: `"Jordan"`
   - Pick color: blue
   - Click "Create Persona"
   Expected: Dropdown now shows both "Sarah" and "Jordan"

3. **Verify persona switch**
   - Dropdown now shows "Jordan" active (highlighted)
   - Calendar badges should now show only Jordan's data
   - June 10 should be empty (Jordan hasn't marked it)

4. **Mark dates as Jordan**
   - Click June 15, 20, 25
   Expected: Blue "Jordan" badges appear on those dates

5. **Switch back to Sarah**
   - Click dropdown → select "Sarah"
   Expected:
     - Sarah highlighted in dropdown
     - Calendar shows red "Sarah" on June 10, 11, 15, 20
     - Blue "Jordan" badges no longer visible

6. **Switch to Jordan again**
   - Click dropdown → select "Jordan"
   Expected:
     - Jordan highlighted
     - Red "Sarah" no longer visible
     - Blue "Jordan" on June 15, 20, 25 visible

7. **Verify both personas in localStorage**
   ```javascript
   JSON.parse(localStorage.getItem('personas_storage'))
   // Should contain both:
   // [{name: "Sarah", color: "#ff0000"}, {name: "Jordan", color: "#0000ff"}]
   ```

✅ **Pass**: Multiple personas created, switching works instantly

---

## Scenario 4: Users Section Removed

**Goal**: Verify static "Users" legend is gone  
**Duration**: ~1 minute

### Setup
- App with any persona created

### Steps

1. **Check UI layout**
   - Look for "Users" section or legend
   - Look for "Alice", "Bobby", "Carmen" labels
   Expected: **NOT found** - section completely removed

2. **Verify no hardcoded colors**
   - Only persona colors shown: those in dropdown + badge colors
   Expected: No reference to Alice (blue), Bobby (orange), Carmen (green)

3. **Check header area**
   - Only persona dropdown and refresh button visible
   - No separate user selector
   Expected: Clean header with just persona controls

✅ **Pass**: Users section removed, replaced with dynamic selector

---

## Scenario 5: Cross-Device Sync (Backend Required)

**Goal**: Verify availability syncs across devices/tabs  
**Duration**: ~2 minutes  
**Requirements**: Backend running on localhost:7071

### Setup
- Backend running: `func start` (Azure Functions)
- Two browser tabs or windows open to http://localhost:5175

### Steps

1. **Device A: Create persona & mark date**
   - Tab A: Create persona "Pat" (green)
   - Mark June 15
   - Verify green badge on June 15

2. **Device B: See synced persona**
   - Tab B: Refresh page
   - Dropdown should show "Pat"
   - June 15 should show green "Pat" badge
   Expected: Automatic sync without manual action

3. **Device B: Create second persona**
   - Tab B: Create "Casey" (purple)
   - Mark June 18

4. **Device A: See new persona**
   - Tab A: Refresh page
   - Dropdown now shows both "Pat" and "Casey"
   - June 18 shows purple "Casey"

5. **Check backend data**
   - Call GET /api/availability?month=2026-06 in browser console
   - Verify response contains both personas' entries

✅ **Pass**: Personas sync across devices (if backend available)

---

## Scenario 6: Color Picker Functionality

**Goal**: Verify HTML color picker works correctly  
**Duration**: ~2 minutes

### Setup
- App with persona creation form open

### Steps

1. **Click color picker input**
   - Click on the color input field
   Expected: Native browser color picker opens (platform-specific UI)

2. **Select various colors**
   - Pick: red, blue, green, yellow, custom hex
   Expected: All colors selectable, hex values valid

3. **Verify color display**
   - Create personas with different colors: red, blue, green
   - Check badges on calendar
   Expected: Badges display correct colors

4. **Check localStorage**
   ```javascript
   JSON.parse(localStorage.getItem('personas_storage')).forEach(p => {
     console.log(p.name, p.color)
     // Verify hex format: #RRGGBB
   })
   ```
   Expected: All colors stored as hex strings

✅ **Pass**: Color picker intuitive, colors stored correctly

---

## Scenario 7: Data Validation

**Goal**: Verify form validation works  
**Duration**: ~2 minutes

### Setup
- App with persona creation form open

### Steps

1. **Empty name**
   - Leave name blank
   - Pick color
   - Try to submit
   Expected: Button disabled or error, can't proceed

2. **Name too long**
   - Enter 51 characters
   Expected: Text truncated to 50, or error shown

3. **Name with special characters**
   - Enter: `"Sarah @#$%"`
   - Try to submit
   Expected: Error or stripped of special chars, only alphanum + spaces allowed

4. **Invalid color**
   - This shouldn't happen with native color picker
   - Manual: Call API with invalid hex
   - E.g., POST to /api/availability with `{color: "not-hex"}`
   Expected: Server returns 400 error

✅ **Pass**: Validation prevents invalid data

---

## Scenario 8: Performance & Responsiveness

**Goal**: Verify UI remains responsive  
**Duration**: ~3 minutes

### Setup
- App with 10+ personas created
- Marked dates across multiple months

### Steps

1. **Persona dropdown opens instantly**
   - Click dropdown
   - With 10 personas, should open in < 100ms
   Expected: No lag, smooth

2. **Persona switching instant**
   - Switch between personas rapidly (5+ times)
   - Calendar should update immediately
   Expected: No flicker, instant visual update

3. **Month navigation smooth**
   - Click Previous/Next buttons 5-10 times
   - Calendar should navigate smoothly
   Expected: No lag, responsive

4. **DevTools Performance check**
   - Open DevTools → Performance
   - Record: Create persona → mark dates → switch persona
   - Check frame rate
   Expected: 60 FPS, no jank, < 16ms per frame

✅ **Pass**: App remains responsive with multiple personas

---

## Scenario 9: Error Handling (Optional)

**Goal**: Verify graceful error handling  
**Duration**: ~2 minutes

### Setup
- Backend NOT running (mock API active)
- Open DevTools Console

### Steps

1. **Mock API displays message**
   - Look for "Using Mock Data (localStorage)" indicator
   Expected: Message visible

2. **Mark dates with mock API**
   - Create persona, mark dates
   - Check DevTools Network tab
   Expected: Requests fail (404 connecting to backend), but UI updates correctly via mock

3. **No error messages in UI**
   - User shouldn't see network errors
   - Data still marks/unmarks correctly
   Expected: Seamless fallback, mock API transparent

✅ **Pass**: Errors handled gracefully, mock API fallback works

---

## Acceptance Checklist

Use this checklist to confirm feature is production-ready:

### Functional
- [ ] Persona creation blocks calendar (mandatory)
- [ ] Name validation prevents empty strings
- [ ] Color picker works on all browsers (desktop + mobile)
- [ ] Multiple personas can be created (3+ test)
- [ ] Persona switching updates calendar instantly
- [ ] Availability marking works per-persona
- [ ] Availability unmarts works per-persona
- [ ] Users section completely removed
- [ ] No "Alice", "Bobby", "Carmen" hardcoded labels

### Data Persistence
- [ ] Personas stored in localStorage
- [ ] Personas persist across page refresh
- [ ] Availability entries sync to backend (if running)
- [ ] Composite key (name, color) unique per persona

### UX/Accessibility
- [ ] Onboarding form accessible (keyboard navigation)
- [ ] Color picker accessible (tab, arrow keys)
- [ ] Dropdown accessible (keyboard, screen reader)
- [ ] Badge tooltips show persona name
- [ ] Responsive on mobile, tablet, desktop

### Performance
- [ ] Persona creation < 100ms
- [ ] Persona switching instant (< 50ms visual update)
- [ ] Dropdown renders smoothly (10+ personas)
- [ ] No jank or flicker during interactions

### Code Quality
- [ ] All code passes linting: `npm run lint`
- [ ] All code passes formatting: `npm run format`
- [ ] No console errors in DevTools
- [ ] No unused imports or variables

### Tests
- [ ] Unit tests for persona creation
- [ ] Unit tests for validation
- [ ] Integration tests for calendar marking
- [ ] Mock API tests for composite key support
- [ ] Test coverage ≥ 60%

---

## Troubleshooting

| Issue | Symptom | Solution |
|-------|---------|----------|
| Persona dropdown not visible | Only refresh button in header | Clear localStorage, reload |
| Color picker not opening | Click does nothing | Check browser support (modern only) |
| Personas not persisting | Lost on refresh | Check localStorage in DevTools |
| Badges not showing persona name | Only color, no text | Verify component passes name prop |
| Multiple personas switching is laggy | Slow visual updates | Check DevTools Performance, optimize render |
| Users section still visible | "Alice", "Bobby", "Carmen" shown | Verify UserLegend removed from App.jsx |

---

## Sign-Off

✅ **Feature Validation Complete**: All scenarios pass when:
1. All functional checks pass
2. All data persistence checks pass  
3. All UX/accessibility checks pass
4. All performance checks pass
5. Code passes linting and tests

---

## Related Documents

- [Specification](../spec.md) - Full feature requirements
- [Data Model](../data-model.md) - Entity definitions
- [API Contracts](./contracts/availability-api.md) - Endpoint specs
- [Plan](../plan.md) - Implementation plan
