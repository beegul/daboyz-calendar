# Research: Post-Deployment Polish

**Feature**: 005-post-deployment-polish | **Date**: 2026-06-29

## Technical Decisions & Rationale

### 1. Remove Mock Data Label

**Decision**: Remove "Using Mock Data (localStorage)" text entirely from production UI.  
**Rationale**: Users need confidence that their data is persisted to real backend. Label creates confusion about data reliability.  
**Implementation**: 
- Search for "mock" text in components (likely in header/banner)
- Replace with conditional offline warning banner (appears only when API fails)
- Banner text: "Offline Mode: Using local data" (only shown on API error, not during initial load)

**Dependencies**: 
- Requires understanding of current mock data flag location
- Needs error handling improvement to detect API failures

---

### 2. Fix Page Flicker on Refresh

**Decision**: Implement hybrid hydration strategy - load from localStorage first, then fetch fresh data in background.  
**Rationale**: This prevents visual flicker and provides instant UI while ensuring fresh data syncs silently.  
**Implementation Pattern**:
```javascript
// On page load:
1. Initialize state from localStorage (instant render)
2. Start fetching fresh data from API (background)
3. Update state when API responds (silent update, no flicker)
```

**Why This Works**:
- Immediate render from cache prevents blank screen
- No state initialization → fetch → render → update flicker
- User sees final data immediately, fresh data silently updates behind the scenes

**Dependencies**:
- useAvailability hook needs hydration logic
- localStorage must be synchronized with API data structure
- Need skeleton/loading state during background fetch

---

### 3. Delete Personas & Cascade Deletion

**Decision**: Add `DELETE /api/personas/{name}` endpoint that atomically deletes persona + all availability entries.  
**Rationale**: 
- Single atomic endpoint prevents partial state (no orphaned dates)
- Simplest implementation vs. two separate calls
- Transactional consistency at database level

**Frontend UI Pattern** (from clarification):
- Three-dot menu on each persona row
- Click → "Delete [name]" option
- Confirmation modal: "Delete [name] and all calendar entries?"
- Loading spinner during deletion
- Error message with retry if deletion fails

**Backend Implementation** (tbd in tasks):
- New DELETE handler in api/function_app.py
- Parameter: persona name (from URL)
- Query: Delete persona row + all availability rows where persona_name matches
- Return: 204 No Content on success, error JSON on failure
- Must be atomic (single transaction)

**Dependencies**:
- API endpoint implementation (delete.py handler)
- Frontend DeletePersona button/menu component
- Confirmation modal component
- Error handling & retry logic

---

### 4. Real-Time Cross-Device Sync

**Context**: User reported sync latency between phone and PC (changes not visible immediately).  
**Decision**: Implemented aggressive polling (2s) + immediate refresh triggers.  
**Already Deployed** (commit 7eca582):
- Polling: 5s → 2s when active (cost-acceptable for real-time)
- Immediate refresh when tab becomes visible (visibilitychange event)
- Immediate refresh when window gains focus (focus event)
- Immediate refresh after any change (toggle/delete) completes

**Result**: Cross-device sync now within 2-3 seconds max, instant when user switches tabs.  
**Note**: Feature 005 spec should be updated to document this sync behavior.

---

## Technology Stack (Confirmed)

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.2.7 |
| Frontend Build | Vite | 5.4.0 |
| Backend API | Python Azure Functions | v1 |
| Storage | Azure Table Storage | - |
| Deployment | Azure Static Web App | Free Tier |
| HTTP | REST (no WebSocket) | - |

**Constraints Honored**:
- ✅ Cost: All 3 features stay within Free Tier (no new services)
- ✅ Offline: localStorage fallback already working
- ✅ Accessibility: ARIA live regions + aria-busy for state changes
- ✅ Performance: No render flicker, 2s max sync latency
- ✅ Code Quality: Existing tests pass, new code must follow constitution

---

## Implementation Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| localStorage hydration causes stale data | Low | Fetch fresh in background, merge logic if needed |
| Delete cascade misses some dates | Medium | Use atomic transaction at DB level, test thoroughly |
| Cross-device sync still too slow | Low | Already implemented 2s polling + immediate refreshes |
| Flicker reappears on slow networks | Low | Loading state (skeleton UI) prevents visual jarring |
| Accessibility breaks with ARIA | Low | Test with screen reader, follow WAI-ARIA patterns |

---

## Success Criteria (from spec, confirmed achievable)

- ✅ **SC-001**: Mock label doesn't appear with working API
- ✅ **SC-002**: Zero flicker on refresh (localStorage hydration)
- ✅ **SC-003**: Delete persona within 2 seconds
- ✅ **SC-004**: 100% cascade deletion (atomic endpoint)
- ✅ **SC-005**: No console errors
- ✅ **SC-006**: Delete modal appears instantly (<100ms)
- ✅ **SC-007**: ARIA announces state changes

---

## Phase 1 Prerequisites Met

✅ All clarifications resolved (5/5)  
✅ Technical approach confirmed  
✅ Dependencies identified  
✅ Risks mitigated  
✅ Ready for design (data-model, contracts, quickstart)
