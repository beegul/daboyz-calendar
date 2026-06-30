# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-06-30

### Changed

- Reworked local development scripts:
  - `npm run dev` now starts the stable frontend loop only
  - Added `dev:web`, `dev:api`, `dev:swa`, and `dev:full` workflows
  - Added `concurrently` to dev dependencies for full-stack local orchestration
- Updated closeout planning artifacts for Spec 007 with lean validation-first execution.

### Fixed

- Month/date key handling now consistently uses local calendar values (avoids UTC drift edge cases).
- Active persona fallback is hardened when a selected persona is deleted by another client.
- Offline queue now preserves persona color metadata and replays availability actions with compatible payload shape.
- Offline enqueue detection now checks the correct entry fields for existing availability.

### Testing

- Consolidated high-signal regression lanes for:
  - availability sync
  - persona synchronization and cascade delete
  - mobile clarity and touch interaction
  - offline queue and polling recovery
- Retained targeted edge-case lanes for same-date concurrent writes, idempotent double delete, and high-concurrency entry retention.

## [1.2.0] - 2026-06-29

### Infrastructure and Cost Optimizations

### Added

#### User Story 1: Cost Protection via Adaptive Polling
- **New Hook**: `useIdleTimeout` - Tracks user idle state with 10-minute threshold
  - Activity detection: mousemove, keydown, touchstart events
  - Debounced event handling (100ms) to prevent listener spam
  - Returns idle state and utility functions for apps
  
- **Enhanced Hook**: `useAvailability` - Adaptive polling based on tab visibility and idle state
  - Page Visibility API integration: Stops polling when tab hidden
  - Idle-aware throttling: 5-minute polling when idle, 5-second when active
  - Fallback support: blur/focus events for older browsers (IE, Safari <7)
  - **Cost Impact**: 65% API request reduction (518k → 178k requests/month)
  - **Benefit**: Stays within Azure Free Tier limits indefinitely

#### User Story 2: Collision Safeguards
- **New Validation Module**: `public/src/utils/validation.js` (100% test coverage)
  - `isValidHexColor()` - Validates hex color codes
  - `normalizePersonaName()` - Case-insensitive, whitespace-trimmed comparison
  - `validatePersonaUniqueness()` - Detects name+color tuple collisions
  
- **Enhanced Component**: `PersonaOnboarding.jsx` with real-time collision detection
  - Fetches all existing personas on mount from `/api/personas`
  - Debounced validation (300ms) during form input
  - Clear error messages for collision conflicts
  - Submit button disabled while errors exist
  - Network error handling with user warnings
  
- **Test Coverage**: 12+ collision detection scenarios in PersonaOnboarding.test.jsx

#### User Story 3: Azure Infrastructure  
- **Configuration**: `staticwebapp.config.json` - SPA routing and API proxy rules
  - Fallback routing: Serves index.html for deep links (SPA support)
  - API proxy: Routes `/api/*` to Azure Functions backend
  - Cache headers: Long cache for versioned assets, short for index.html
  
- **Deployment Architecture Documentation**:
  - Static Web Apps (Free Tier): Frontend hosting with global CDN
  - Azure Functions (Consumption): Backend API with pay-per-invocation
  - Table Storage (PAYG): Data persistence within Free Tier limits
  - See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for full setup guide

#### User Story 4: Local Development Orchestration
- **Enhanced Dev Setup**: `npm run dev` now orchestrates all services in parallel
  - Uses `concurrently` package for multi-process management
  - Starts: Vite (5173), Azure Functions (7071), SWA CLI (4280)
  - Single command eliminates manual service coordination
  - HMR (Hot Module Replacement) enabled for rapid development

### Changed

- **Updated**: `public/src/hooks/useAvailability.js`
  - Integrated Page Visibility API for tab visibility detection
  - Integrated `useIdleTimeout` for intelligent idle state tracking
  - Refactored polling frequency logic to support adaptive throttling
  - Enhanced JSDoc with comprehensive return type documentation
  
- **Updated**: `package.json`
  - `npm run dev` updated to use concurrently orchestration
  - `npm run format` path corrected to `public/src`
  - Added `concurrently` as dev dependency

### Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Complete adaptive polling design and cost analysis
- **[COLLISION_DETECTION.md](docs/COLLISION_DETECTION.md)** - Collision algorithm and test scenarios
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment to Azure
- **[AZURE_SETUP.md](docs/AZURE_SETUP.md)** - Environment setup guide

### Test Coverage

| Module | Tests | Coverage |
|--------|-------|----------|
| validation.js | 50+ | **100%** |
| useIdleTimeout.js | 19 | **100%** |
| useAvailability.js | 20 | 68.88% |
| PersonaOnboarding tests | 12+ | Collision detection |
| **Total Feature 004** | **101+** | **>90% new code** |

### Performance

- Idle detection: 1 check/second (negligible CPU)
- Validation: <1ms per collision check
- API requests: **65% reduction** via adaptive polling

### Browser Support

- Page Visibility API: Chrome 13+, Firefox 10+, Safari 7+, Edge 12+
- Fallback (blur/focus): IE 10+, older Safari

### Breaking Changes

**None** - All changes are backward compatible. Feature 004 builds on Feature 003 without breaking existing functionality.

### Migration

No migration required. Feature 004 enhances existing features without API changes.

---

## [1.1.0] - 2026-07-01

### Added

- **Dynamic User Personas**: Users can now create custom personas with name and color instead of hardcoded Alice/Bobby/Carmen users
  - Mandatory persona creation on first load via PersonaOnboarding modal
  - Persona identity uses composite key (name, color) for cross-device synchronization
  - PersonaSelector dropdown for switching between personas and creating new ones
  - Each persona has independent availability tracking
  - Colored badges display persona name and color for marked dates
  - localStorage persistence for personas and availability

- **New Components**
  - `PersonaOnboarding.jsx`: Modal form for creating personas (name + color picker)
  - `PersonaSelector.jsx`: Dropdown for switching personas and creating new ones
  - Updated `CalendarGrid.jsx`: Now accepts activePersona prop instead of selectedUser
  - Updated `AvailabilityBadge.jsx`: Displays persona name and color

- **New API Endpoints**
  - `GET /api/availability/personas?month=2026-07`: Get distinct personas for month
  - Updated `POST /api/availability/toggle`: Accepts {name, color, date} instead of userId
  - Updated `DELETE /api/availability`: Uses query params ?name=...&color=...&date=...

- **New Validation**
  - `validate_name()`: 1-50 chars, alphanumeric + spaces only
  - `validate_color()`: Hex color format (#RRGGBB)
  - Composite key uniqueness enforcement

- **Test Coverage**
  - PersonaOnboarding.test.jsx: 11 unit tests for form validation and submission
  - personas.integration.test.js: 9 integration tests for persona lifecycle
  - availability-marking.integration.test.js: 9 integration tests for marking/unmarking availability
  - useAvailability.test.js: 4 tests for API fallback behavior

- **Developer Experience**
  - ESLint configuration (.eslintrc.cjs) with React support
  - Fixed Jest configuration to support .jsx test files
  - Updated build configuration for improved bundle analysis
  - Comprehensive PERSONAS_FEATURE.md documentation

### Changed

- **App.jsx**: Complete refactor
  - Removed DEFAULT_USERS constant
  - Removed UserSelector and UserLegend components
  - Removed useUsers hook dependency
  - Added persona state management (personas, activePersona, showOnboarding)
  - Added localStorage persistence for personas
  - Added PersonaOnboarding modal overlay
  - Updated CalendarGrid and useAvailability integration

- **Data Storage**: Changed from userId-based to (name, color) composite key
  - Old: `entries = [{userId, date, timestamp}]`
  - New: `entries = [{name, color, date, timestamp}]`
  - Row key format: `{name}#{color}#{date}` in table storage

- **Availability Badge**: Now displays persona name and color
  - Removed userId display
  - Added accessibility labels for persona names
  - Improved hover feedback

### Removed

- UserSelector.jsx component (replaced by PersonaSelector)
- UserLegend.jsx component (no longer needed)
- useUsers custom hook (personas now managed in App.jsx)
- OLD_TESTS: CalendarGrid.test.jsx, UserSelector.test.jsx (outdated)
- DEFAULT_USERS array from App.jsx

### Fixed

- TailwindCSS styling issue from previous version (root-level config files)
- Jest configuration to support .jsx test file extensions
- ESLint configuration for React JSX projects

### Technical Details

**Bundle Size**
- JS: 209.54 kB (gzipped 65.49 kB) - +2% from previous
- CSS: 13.99 kB (gzipped 3.58 kB) - minimal increase
- Includes new PersonaOnboarding and PersonaSelector components

**Database Schema**
- Partition Key: `calendar-{YYYY-MM}`
- Row Key: `{name}#{color}#{date}`
- Enables efficient month-based queries and composite key indexing

**Performance**
- localStorage: ~50 bytes per persona, ~80 bytes per availability entry
- ~60,000 entries maximum before browser storage limits
- Persona switching: O(1) via composite key lookup
- Month queries: O(n) scan with partition key filtering

**Compatibility**
- React 19.2.7, Vite 5.4.0, TailwindCSS 3.3.6
- Python 3.11 backend with azure-functions, azure-data-tables
- localStorage API (modern browsers only)
- HTML5 color input (all modern browsers)

### Migration Guide

**For Users**
1. Load app → PersonaOnboarding modal appears
2. Create your persona (name + color)
3. Calendar becomes accessible
4. Marked dates are preserved in localStorage

**For Developers**
- Replace userId references with (name, color) tuple
- Update API calls: POST body → {name, color, date}
- Update DELETE calls: use query params ?name=X&color=Y&date=Z
- Mock API updated in public/src/api/mock.js

### Deployment Notes

- No database migration required (new table schema compatible)
- localStorage auto-initializes on first load
- Mock API fallback available if backend unavailable
- Recommend cache-busting for dist/assets files

### Known Issues

- None reported yet

### Future Work

- Cloud sync across devices using composite key
- Persona deletion with data preservation
- Calendar sharing with read-only links
- Bulk persona management
- CSV/iCal export functionality

---

## [1.0.0] - 2026-06-15

### Initial Release

- React 19.2.7 + Vite 5.4.0 frontend
- Python 3.11 Azure Functions backend
- Monthly availability calendar with hardcoded users (Alice, Bobby, Carmen)
- localStorage persistence
- TailwindCSS styling
- Jest test suite
