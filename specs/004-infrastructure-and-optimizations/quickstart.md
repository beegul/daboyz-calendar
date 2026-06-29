# Quickstart Validation Guide: Infrastructure and Cost Optimizations

**Feature**: 004-infrastructure-and-optimizations | **Date**: 2026-06-29

**Purpose**: Runnable validation scenarios to verify all features work end-to-end before implementation.

---

## Scenario 1: Cost Protection - Tab Visibility Polling

**Objective**: Verify that API polling stops when tab is hidden and resumes when visible

**Prerequisites**:
- Vite dev server running (`npm run dev`)
- App open in browser at `http://localhost:5173`
- DevTools open on Network tab
- Two browser tabs ready

**Setup**:
```bash
# Terminal 1: Start development server
npm run dev

# Navigate to http://localhost:5173 in two different browser tabs
# Open DevTools (F12) on first tab, switch to Network tab
```

**Test Steps**:
1. **Foreground tab - Normal polling**:
   - Keep Tab A visible and focused
   - Observe Network tab → Count API requests to `/api/availability`
   - Wait 15 seconds
   - **Expected**: ~3 requests (5-second interval: 15s ÷ 5s = 3 requests)

2. **Background tab - Polling stops**:
   - Switch to Tab B (different browser tab)
   - Keep Tab A in background (tab is hidden)
   - Observe Network tab in Tab A (if you can, or check DevTools metrics)
   - Wait 15 seconds
   - **Expected**: 0 new requests (polling stopped when tab hidden)

3. **Return to foreground - Polling resumes**:
   - Click on Tab A to bring it to foreground
   - Observe Network tab immediately after switch
   - Wait 5 seconds
   - **Expected**: Polling resumes within 1 second, next request appears within 5 seconds

4. **Page refresh - Same behavior on fresh page**:
   - Refresh page (Ctrl+R)
   - Switch to Tab B
   - Switch back to Tab A
   - **Expected**: Polling stops/resumes same as before

**Validation Criteria**:
- ✅ Polling stops within 500ms of tab hidden (no requests during 15s hidden period)
- ✅ Polling resumes within 1 second of tab becoming visible
- ✅ Polling frequency is consistently ~5 seconds (foreground, not idle)

**Failure Scenarios**:
- ❌ Polling continues while tab is hidden → Page Visibility API not working
- ❌ Polling takes >2 seconds to resume → Event listener not firing
- ❌ Polling requests more frequent than 5s → Polling interval not set correctly

---

## Scenario 2: Cost Protection - Idle Throttling

**Objective**: Verify that polling throttles from 5 seconds to 5 minutes after 10 minutes of inactivity

**Prerequisites**:
- Vite dev server running
- App open in browser
- DevTools Network tab visible
- No automatic mouse/keyboard/touch events

**Setup**:
```bash
# Terminal: Ensure dev server running
npm run dev

# Navigate to app, open DevTools Network tab
# Ensure no automatic mouse movement or key presses
```

**Test Steps**:
1. **Initial state - Normal polling**:
   - App just loaded, 0 minutes idle
   - Observe Network tab → requests every ~5 seconds
   - Wait 30 seconds
   - **Expected**: ~6 requests (30s ÷ 5s)
   - Clear Network history

2. **Idle for 10+ minutes**:
   - Start timer when Network history cleared
   - Keep hands OFF keyboard and mouse (no movement)
   - Wait exactly 10 minutes (600 seconds)
   - After 10 minutes: Move mouse or type (reset idle timer)
   - Immediately observe Network tab timestamps
   - **Expected after 10 min**: Next request appears at 10min mark OR shortly after (within 30s)

3. **Throttled polling - 5 minute frequency**:
   - After moving mouse, observe next request
   - Note timestamp of first request after idle
   - Wait another 5 minutes (300 seconds) without moving/typing
   - Observe next request appears
   - **Expected**: Second request appears ~5 minutes after first (300s interval)

4. **Resume to normal polling**:
   - Move mouse or press key
   - Observe next request within 5 seconds
   - Wait 10 seconds more
   - **Expected**: Requests resume 5-second frequency immediately

**Validation Criteria**:
- ✅ Polling is ~5 seconds initially
- ✅ After 10 minutes no activity → Throttle to ~5 minutes (300 seconds)
- ✅ After activity resumed → Throttle back to ~5 seconds
- ✅ Idle state change from false → true → false is smooth

**Failure Scenarios**:
- ❌ No throttling after 10 minutes → Idle detection not working
- ❌ Throttle happens before 10 minutes → Threshold too low
- ❌ Throttle never stops (stays at 5min even after activity) → Idle state reset not working

**Testing Shortcut** (for faster manual validation):
```javascript
// In DevTools Console, temporarily reduce idle threshold to 30 seconds for testing:
// Note: This requires hooking into the component, may not be directly accessible
// Instead, use debug mode or unit tests for faster iteration
```

---

## Scenario 3: Onboarding - Collision Detection

**Objective**: Verify that duplicate (name, color) tuples are blocked with clear error messages

**Prerequisites**:
- Vite dev server running
- App open with existing persona ("Jack", "#FF5733")
- PersonaOnboarding form accessible

**Setup**:
```bash
# Ensure sample data exists with persona:
# Name: Jack, Color: #FF5733

# Or create it:
# 1. Open app
# 2. Navigate to onboarding form
# 3. Create persona: Name="Jack", Color=#FF5733
# 4. Close form
```

**Test Steps**:

### Test 3A: Exact duplicate blocked
1. Open PersonaOnboarding form
2. Enter Name: "Jack"
3. Select Color: #FF5733 (same as existing)
4. **Expected**: Error message appears: "Name and color combo already taken! Jack (#FF5733) already exists."
5. Submit button is disabled
6. Attempt to submit anyway (shouldn't work)
7. **Expected**: Form does not submit

### Test 3B: Same name, different color allowed
1. In PersonaOnboarding form
2. Enter Name: "Jack"
3. Select Color: #0000FF (blue, different from existing)
4. **Expected**: No error message
5. Submit button is enabled
6. Click Submit
7. **Expected**: Form submits, new persona created with (Jack, #0000FF)

### Test 3C: Different name, same color allowed
1. In PersonaOnboarding form
2. Enter Name: "Alice" (new name)
3. Select Color: #FF5733 (same as existing Jack)
4. **Expected**: No error message
5. Submit button is enabled
6. Click Submit
7. **Expected**: Form submits, new persona created with (Alice, #FF5733)

### Test 3D: Case-insensitive matching
1. In PersonaOnboarding form
2. Enter Name: "JACK" or "jack" (uppercase/lowercase variant)
3. Select Color: #FF5733 (same as existing "Jack")
4. **Expected**: Error message appears (case-insensitive collision detected)
5. Submit button is disabled

### Test 3E: Whitespace trimming
1. In PersonaOnboarding form
2. Enter Name: "  Jack  " (leading/trailing spaces)
3. Select Color: #FF5733
4. **Expected**: Error message appears (whitespace trimmed before comparison)
5. Submit button is disabled

**Validation Criteria**:
- ✅ Duplicate (name, color) tuples are blocked with clear error
- ✅ Same name + different color is allowed
- ✅ Different name + same color is allowed
- ✅ Case-insensitive name matching works (JACK = jack = Jack)
- ✅ Whitespace is trimmed ("  Jack  " = "Jack")
- ✅ Submit button is disabled when error present
- ✅ Error clears when form is corrected

**Failure Scenarios**:
- ❌ Duplicate allowed → Collision detection not working
- ❌ Case-sensitive matching (JACK ≠ jack) → Name normalization not working
- ❌ Whitespace not trimmed → Normalization incomplete
- ❌ Submit button enabled despite error → Validation not blocking submission

---

## Scenario 4: Local Development Setup - SWA CLI Orchestration

**Objective**: Verify that `npm run dev` starts all services (frontend, backend, SWA proxy) with proper configuration

**Prerequisites**:
- Node.js 18+ installed
- Azure Functions Core Tools installed (`func` CLI available)
- Azure Static Web Apps CLI installed (`swa` CLI available)
- concurrently package installed (or `npm install concurrently --save-dev`)
- Port 5173, 7071, 3000 available (or next available if in use)

**Setup**:
```bash
# Install dependencies if not already done
npm install

# Verify CLIs are available
func --version      # Should show Azure Functions version
swa --version       # Should show SWA CLI version
```

**Test Steps**:

### Step 1: Start dev environment
```bash
npm run dev
```

### Step 2: Monitor console output
**Expected console output** (within first 10 seconds):
```
[frontend] Vite v5.4.0 building ...
[frontend] ✓ built in 245ms
[frontend] 
[frontend] ➜  Local:   http://localhost:5173/
[frontend] ➜  press h + enter to show help

[backend] Azure Functions Core Tools
[backend] Version 4.x.x
[backend] Running "func start"
[backend] Now listening on: http://localhost:7071/
[backend] Listening for file changes per reconfiguration of your host...

[swa] INFO: Starting Static Web Apps CLI v1.x.x
[swa] INFO: Serving Static Web Apps at http://localhost:3000
[swa] INFO: API requests to '/api/*' will be proxied to http://localhost:7071
```

**Validation**: All three services show healthy startup messages

### Step 3: Test port allocation (if ports already in use)
**Scenario A**: If port 5173 already in use:
- Terminal should show: `Frontend allocated port 5174 (5173 in use)`
- Vite should be running on http://localhost:5174
- Check: `npm run dev` output should clearly state which port was chosen

**Scenario B**: If port 7071 already in use:
- Terminal should show: `Backend allocated port 7072 (7071 in use)`
- func start should be running on http://localhost:7072
- Check: `npm run dev` output should clearly state which port was chosen

### Step 4: Test API routing
```bash
# In another terminal:
curl http://localhost:5173/api/availability
# This should proxy to backend and return data (or 404/error if no data, but no CORS error)

# Or in browser console:
fetch('/api/availability')
  .then(r => r.json())
  .then(data => console.log(data))
  // Should succeed without CORS errors
```

**Validation**: API calls work without CORS errors

### Step 5: Test hot reload
```bash
# While dev server running, modify a React component file
# Save the file
# Frontend should hot-reload within 1 second (Vite HMR)
# Browser should update without full page refresh
```

**Validation**: HMR works correctly

### Step 6: Stop and verify cleanup
```bash
# Press Ctrl+C in terminal to stop npm run dev
# All three services should stop cleanly
# Terminal should show no lingering processes
```

**Validation**: All services stop gracefully

**Validation Criteria**:
- ✅ `npm run dev` starts all three services (frontend, backend, SWA proxy)
- ✅ All services show healthy startup in console
- ✅ Port allocation is clear and logged
- ✅ API requests to `/api/*` proxy to backend without CORS errors
- ✅ Hot reload (HMR) works on file save
- ✅ Services stop cleanly on Ctrl+C

**Failure Scenarios**:
- ❌ `npm run dev` fails to start → Script configuration wrong
- ❌ Only frontend starts, backend missing → concurrently not running all processes
- ❌ Services start on wrong ports without clear logging → Port allocation not obvious
- ❌ API calls fail with CORS errors → SWA proxy not routing correctly
- ❌ Port in use but not auto-allocated → Port detection not working

---

## Scenario 5: Cost Impact Validation

**Objective**: Verify that cost protection reduces API calls to stay within Azure Free Tier limits

**Prerequisites**:
- Cost protection and idle throttling implemented and working
- Analytics or logging to track API call count

**Assumptions**:
- User opens app once per day
- App stays open for 8 hours per day
- All 8 hours is foreground tab (most conservative case)
- Polling: 5s when active, 5min when idle after 10min inactivity

**Calculation**:

Without cost protection (continuous 5s polling 24/7):
```
5-second polling = 12 requests/minute
24 hours × 60 min × 12 req = 17,280 requests/day
30 days × 17,280 = 518,400 requests/month
```

With cost protection (active 8h, idle 16h):
```
Active 8h (5s polling):
  8 hours × 60 min × 12 req = 5,760 requests

Idle 16h (5min polling):
  16 hours × 60 min ÷ 5min = 192 requests

Per day: 5,760 + 192 = 5,952 requests
Per month: 5,952 × 30 = 178,560 requests
```

**Cost Impact**:
- Without protection: 518,400/month (5.2× the Free Tier limit of 1M invocations requires paid)
- With protection: 178,560/month (well within Free Tier)
- **Savings**: ~65% reduction in API calls, staying within Free Tier

**Test Validation**:
Measure actual API call count with:
- 8-hour app session (1 day)
- Monitor `/api/availability` requests
- **Expected**: ~5,960 requests in 8 hours (if idle for 6+ hours)
- **If less**: Idle detection working even better

---

## Summary Checklist

| Scenario | Status | Notes |
|----------|--------|-------|
| **1. Tab Visibility** | ⏳ To Be Tested | Polling stops when hidden, resumes when visible |
| **2. Idle Throttling** | ⏳ To Be Tested | 10min idle → 5min polling, activity resumes 5s |
| **3. Collision Detection** | ⏳ To Be Tested | Duplicates blocked, same-name-diff-color allowed |
| **4. Dev Orchestration** | ⏳ To Be Tested | `npm run dev` starts all services, port allocation working |
| **5. Cost Impact** | ⏳ To Be Tested | Call count reduced, within Free Tier limits |

**Next Steps**:
1. Implement feature following design artifacts
2. Run unit tests for each component/hook
3. Execute this quickstart validation before release
4. Document any deviations from expected behavior

---

**Done When**: All scenarios pass ✅
