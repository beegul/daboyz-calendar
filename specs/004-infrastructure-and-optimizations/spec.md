# Feature Specification: Infrastructure and Cost Optimizations

**Feature Branch**: `004-infrastructure-and-optimizations`

**Created**: 2026-06-29

**Status**: Draft

**Input**: User description: "Set up Azure deployment architecture with cost protection throttling for Free Tiers, add client-side identity collision safeguards during onboarding, implement adaptive polling using Page Visibility API and idle tracking, and establish local development orchestration using SWA CLI proxy with concurrently."

## Clarifications

### Session 2026-06-29

- Q: Collision detection data scope - check only current month or all personas ever created? → A: Check all existing personas regardless of month (prevents any duplicates in the system)
- Q: Page Visibility API fallback for older browsers? → A: Fallback to window.blur/focus events (blur/focus events fire when window loses/gains focus but not tab switches, documented limitation)
- Q: Azure Table Storage partition/row key strategy? → A: PartitionKey=YYYY-MM (month), RowKey=persona_name#YYYY-MM-DD (optimized for month-view calendar queries)
- Q: Azure Functions port conflict handling? → A: Auto-find next available port and log which port was used prominently (transparent, convenient, CI-friendly)
- Q: Browser compatibility target? → A: Modern browsers only (Chrome/Firefox/Safari last 2 versions, IE 9 and older not supported)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cost Protection via Adaptive API Polling (Priority: P1)

Users have the app open in multiple tabs or leave tabs idle in the background. Without cost protection, continuous API polling in background tabs causes unnecessary Azure Function invocations and Table Storage transactions, accumulating costs even when the app is not actively used. This story implements intelligent polling that stops when the tab is hidden and throttles to a slower rate when the user is idle.

**Why this priority**: Cost protection directly impacts whether the app remains within Azure Free Tier limits. Every background API call incurs cost. This is critical for keeping operations sustainable without manual intervention.

**Independent Test**: Open app in two browser tabs (one visible, one in background). Monitor network tab: Visible tab polls every 5 seconds. Switch to background tab: polling stops immediately (no requests for 10+ seconds). Switch back to foreground: polling resumes within 1 second. Open app and idle for 10+ minutes with no mouse/keyboard/touch: polling throttles from 5 seconds to 5 minutes. Interact with page: polling resumes 5-second rate. Refresh page and verify same behavior.

**Acceptance Scenarios**:

1. **Given** the app is open in a browser tab, **When** user switches to another tab (tab becomes hidden), **Then** all API polling requests MUST stop immediately (within 500ms)
2. **Given** the app is in a hidden tab (not visible), **When** user switches back to the app tab (tab becomes visible), **Then** polling MUST resume within 1 second
3. **Given** the app is visible and user has not moved mouse, typed, or touched for 10 minutes, **When** idle timeout is reached, **Then** polling frequency MUST throttle from 5 seconds to 5 minutes
4. **Given** polling is throttled to 5-minute intervals due to idle timeout, **When** user moves mouse, types, or touches the screen, **Then** polling frequency MUST resume 5-second intervals within 500ms
5. **Given** user closes browser and reopens app in a new tab, **When** page loads, **Then** polling MUST start at normal 5-second rate (idle timer resets)
6. **Given** multiple tabs of the app are open, **When** one tab is in foreground and another in background, **Then** background tab polling MUST be stopped while foreground tab continues normal polling

---

### User Story 2 - Onboarding Collision Safeguards (Priority: P1)

Users create persona names (like "Jack" or "Alex") and assign colors. Without safeguards, two users in the same group could accidentally create personas with identical names and colors, causing display collisions in availability badges and modals. This story adds client-side validation that prevents duplicate (name, color) tuples.

**Why this priority**: Duplicate personas break the core availability visualization feature (multiple people shown as one). This should be caught immediately during form submission, not discovered after save. Client-side validation provides instant feedback and a better user experience.

**Independent Test**: Create a persona named "Jack" with color #FF5733. Try to create another persona named "Jack" with the same #FF5733 color: validation blocks submission and shows "Name and color combo already taken!" message. Create another persona named "jack" (lowercase) with #FF5733: validation blocks submission (case-insensitive check). Create "Jack" with different color #0000FF: submission succeeds (only name match is OK, only color match is OK, but name+color tuple must be unique). Create a persona named "Jack " (with trailing space) and color #FF5733: system trims whitespace before comparison, validation blocks if "Jack" + #FF5733 tuple exists.

**Acceptance Scenarios**:

1. **Given** user has created a persona "Jack" with color #FF5733, **When** they attempt to create another persona with name "Jack" and same color #FF5733, **Then** form submission MUST be blocked and error message "Name and color combo already taken!" is displayed
2. **Given** existing persona "Jack" with color #FF5733, **When** user attempts to create "jack" (different case) with color #FF5733, **Then** form submission MUST be blocked (case-insensitive name comparison) and same error message displayed
3. **Given** existing persona "Jack" with color #FF5733, **When** user attempts to create "Jack" with different color #0000FF, **Then** form submission MUST succeed (tuple is different even though name matches)
4. **Given** user enters persona name with leading/trailing whitespace like "  Jack  " and color #FF5733, **When** they submit form, **Then** system MUST trim whitespace before validation comparison
5. **Given** existing persona "Alexandra" with color #FF5733, **When** user attempts to create "Alex" with same color #FF5733, **Then** form submission MUST succeed (different names, even if one is prefix of other)
6. **Given** user has multiple personas already created across multiple months, **When** they open the new persona form, **Then** validation logic MUST check against all personas ever created (across all months, not just current month)

---

### User Story 3 - Production Azure Infrastructure Mapping (Priority: P1)

Development team needs to deploy the calendar app to production with minimal cost. Azure has free tier options (Static Web Apps, Functions consumption tier) but requires explicit architecture mapping and configuration. This story documents the production infrastructure and provides configuration templates.

**Why this priority**: Without explicit production architecture, deployment is ad-hoc and costly. This defines the target infrastructure that keeps the app within free tier budgets while remaining scalable. Enables confident, repeatable deployments.

**Independent Test**: Verify staticwebapp.config.json exists in repo with correct routing rules. Verify Azure Functions are configured for Consumption Tier (not always-on). Verify Table Storage connection string is documented. Verify pricing calculator shows all services qualify for free tier. Verify deployment can be triggered and completes without manual configuration steps beyond secrets.

**Acceptance Scenarios**:

1. **Given** a production deployment target, **When** `staticwebapp.config.json` is created, **Then** it MUST route `/api/*` requests to the backend Azure Functions
2. **Given** the SWA configuration, **When** a request to `/api/availability` is made, **Then** it MUST forward to the Azure Functions backend at the specified location
3. **Given** a user navigates to a nested route like `/availability/2026-06`, **When** the route does not match an existing static file, **Then** the SWA MUST fall back to serving `index.html` (single-page app support)
4. **Given** Azure Functions are deployed in Consumption Tier, **When** no requests arrive for 10 minutes, **Then** the function app MUST scale down to 0 instances (incurring no cost)
5. **Given** requests arrive to a scaled-down function app, **When** a cold start occurs, **Then** the response time MAY be 5-10 seconds (acceptable for this app's usage pattern)
6. **Given** availability data is stored in Azure Table Storage table named "DaboyzAvailability", **When** queries are executed for a user's availability, **Then** results MUST be retrieved with partition key = month and row key = persona+date
7. **Given** all three services (Static Web Apps Free, Functions Consumption, Table Storage PAYG), **When** usage is within free tier limits (125 requests/month to Static Web Apps, 1M free function executions/month, minimal Table Storage reads/writes), **Then** monthly cost MUST remain $0

---

### User Story 4 - Local Development Orchestration (Priority: P2)

Developers need to run the full app locally (frontend + backend + API emulation) without manual port management or CORS workarounds. Currently, developers might use separate terminals or incorrect CORS configurations. This story establishes a unified development environment using SWA CLI and concurrently.

**Why this priority**: Improves developer experience and ensures local dev environment matches production (SWA proxy behavior). Secondary because it doesn't impact production, but critical for team productivity.

**Independent Test**: Run `npm run dev` command. Verify Vite frontend starts at http://localhost:5173. Verify Azure Functions Core Tools start at http://localhost:7071 (or next available port). Verify SWA emulator starts and routes requests correctly. Make API call from frontend to `/api/availability`: verify it reaches the backend without CORS errors. Verify all three processes log output in the same terminal. Stop and restart: all services restart together.

**Acceptance Scenarios**:

1. **Given** a developer clones the repo, **When** they run `npm run dev`, **Then** Vite frontend, Azure Functions, and SWA emulator MUST all start simultaneously without manual intervention
2. **Given** the app is running locally, **When** a frontend request is made to `/api/availability`, **Then** the SWA CLI proxy MUST route the request to `http://localhost:7071/api/availability` (backend functions) without CORS errors
3. **Given** the Vite dev server at http://localhost:5173, **When** a developer makes changes to React component code, **Then** hot module replacement (HMR) MUST reload the component without full page reload
4. **Given** the Azure Functions backend at http://localhost:7071, **When** a developer makes changes to function code, **Then** the functions MUST restart automatically (via func watch or similar)
5. **Given** all three services are running together, **When** the developer presses Ctrl+C in the terminal, **Then** all three processes MUST terminate cleanly without orphaned processes
6. **Given** a specific port (e.g., 5173) is already in use, **When** the dev command runs, **Then** the system MUST automatically find the next available port and log prominently which port is being used (e.g., "Frontend running at http://localhost:5174")

---

### Edge Cases

- What happens if a user disables JavaScript on their device? (Polling and idle tracking won't work; collision detection won't work. App will be non-functional - acceptable, as it's a JavaScript SPA.)
- How does the app behave if Page Visibility API is not supported by older browsers? (Polling continues normally; idle tracking provides fallback protection. Some cost optimization is lost but app remains functional.)
- What if user's local machine clock is significantly off (e.g., 1 hour behind)? (Idle tracking uses wall-clock time from Date.now(); collision validation uses current data. Minor timing skew is acceptable; severe skew could cause unexpected idle throttling but won't break app.)
- What if a user creates 100+ personas in a single session? (Collision validation is O(n) per submission; acceptable performance. If collision check becomes slow, optimize with Map data structure.)
- What if network is slow and an availability poll takes 30 seconds to complete? (Idle tracking timer continues independently; next poll won't start until previous completes. Could result in gaps in polling, but app remains functional.)
- What if user has app in two tabs and closes one unexpectedly? (Other tab's polling continues independently; no adverse effect.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST monitor document.visibilityState and stop all API polling when document.hidden becomes true
- **FR-002**: System MUST resume API polling within 1 second when document.hidden becomes false (tab regains focus)
- **FR-003**: System MUST implement idle tracking by listening to mousemove, keydown, and touchstart events
- **FR-004**: System MUST throttle API polling frequency from 5 seconds to 5 minutes after user idle time exceeds 10 minutes
- **FR-005**: System MUST resume normal 5-second polling frequency when user generates activity (mouse, keyboard, or touch) after idle period
- **FR-006**: System MUST reset idle timer to 0 whenever user activity is detected
- **FR-007**: When user creates a persona, system MUST validate (case-insensitive, whitespace-trimmed) name and color against **all existing personas** (across all months, not just active month)
- **FR-008**: System MUST prevent persona form submission if name+color tuple already exists, displaying error message "Name and color combo already taken!"
- **FR-009**: System MUST compare persona names case-insensitively (e.g., "Jack" and "jack" are treated as same name)
- **FR-010**: System MUST trim leading/trailing whitespace from persona names before comparison
- **FR-011**: staticwebapp.config.json configuration file MUST exist in repository root with routing rules for `/api/*` → backend functions
- **FR-012**: SWA configuration MUST include index.html fallback for single-page app navigation
- **FR-013**: Azure Functions MUST be configured for Consumption Tier (not App Service Plan)
- **FR-014**: Availability data MUST be persisted to Azure Table Storage in table named "DaboyzAvailability" with PartitionKey=YYYY-MM (month) and RowKey=persona_name#YYYY-MM-DD
- **FR-015**: System MUST support concurrent execution of Vite dev server, Azure Functions Core Tools, and SWA CLI emulator
- **FR-016**: Local development setup MUST NOT require manual CORS configuration (SWA CLI proxy handles routing)
- **FR-017**: npm run dev command MUST start all three services (frontend, backend, SWA proxy) with output from all processes visible in single terminal, and if default port is in use, automatically find next available port and log it prominently

### Key Entities

- **VisibilityState**: Browser's document.visibilityState property. Values: "visible" (tab is active), "hidden" (tab is inactive). Used to control polling lifecycle.
- **IdleState**: Tracks user inactivity duration. Properties: lastActivityTime (timestamp), isIdle (boolean), idleThresholdMs (10 minutes = 600000ms). Used to throttle polling.
- **PollingControl**: Manages API polling interval. Properties: intervalId, frequency (5 seconds normal, 5 minutes when idle), isActive (boolean). Reads visibility and idle state to decide start/stop.
- **PersonaValidationPayload**: Input to collision detection. Properties: name (string), color (hex string), activeMonthPersonas (array of {name, color} tuples). Used to validate uniqueness.
- **CollisionResult**: Output of validation. Properties: isValid (boolean), errorMessage (string or null, e.g., "Name and color combo already taken!"). Used to block or allow form submission.
- **AzureInfrastructure**: Deployment target specification. Components: StaticWebApp (Free Tier, hosts frontend), AzureFunctions (Consumption Tier, runs backend API), TableStorage (PAYG, stores availability). Configuration in staticwebapp.config.json.
- **DevEnvironment**: Local development orchestration. Components: ViteFrontend (port 5173), AzureFunctionsCore (port 7071), SWAEmulator (routes /api requests to functions). Managed by concurrently command.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: API polling stops within 500ms when tab becomes hidden (Page Visibility API fires immediately)
- **SC-002**: API polling resumes within 1 second when tab becomes visible (measured via browser DevTools network tab)
- **SC-003**: Idle detection activates after exactly 10 minutes of no user activity (mousemove, keydown, touchstart)
- **SC-004**: Polling frequency throttles to 5-minute intervals when idle is detected
- **SC-005**: Any user activity (mouse, keyboard, touch) resumes 5-second polling within 500ms
- **SC-006**: Persona collision detection blocks 100% of duplicate name+color submissions on first attempt
- **SC-007**: Collision detection is case-insensitive (matches "Jack" and "jack" as same)
- **SC-008**: Collision detection accounts for whitespace (trims before comparison)
- **SC-009**: staticwebapp.config.json routes all `/api/*` requests to backend functions without manual CORS headers
- **SC-010**: SWA CLI emulator in local dev serves frontend via proxy without requiring developer to configure CORS
- **SC-011**: `npm run dev` command starts all three services (frontend, backend, SWA proxy) with single command
- **SC-012**: Monthly cost of production deployment remains $0 when usage stays within free tier limits
- **SC-013**: Azure Functions cold start time acceptable (5-10 seconds) after scale-down from 0 instances
- **SC-014**: Table Storage queries complete in under 500ms for typical availability requests (partition + row key lookup)
- **SC-015**: Local development environment matches production routing behavior (same SWA proxy used in both)

## Assumptions

- **Browser Compatibility**: Target modern browsers only (Chrome, Firefox, Safari last 2 versions). IE 9 and older are not supported. Modern browsers all support Page Visibility API natively. For browsers without Page Visibility API support (fallback coverage in MVP), window.blur/focus events fallback is implemented but provides degraded cost protection (blur/focus fires on window focus loss, not tab switches). This fallback is included in scope with documented limitation noted.
- **User Idle Definition**: Idle is defined as absence of mousemove, keydown, or touchstart events for 10 minutes. This may not capture other user activities (e.g., scrolling, clicking on elements). Acceptable for this use case.
- **Azure Free Tier Stability**: Assumes Azure free tier services remain available and free (historically stable but subject to service discontinuance). If discontinued, team will need alternative hosting.
- **Local Development**: Assumes developers have Node.js, npm, Azure Functions Core Tools, and SWA CLI installed locally. Installation and setup documentation required separately.
- **Collision Detection Scope & Data**: Collision detection only applies to onboarding (persona creation). Editing existing personas is out of scope for this feature. Validation checks against ALL existing personas (all months), not just active month, to prevent duplicates across time.
- **Table Storage Data Model**: Availability data uses PartitionKey=YYYY-MM (month) and RowKey=persona_name#YYYY-MM-DD for optimal calendar-view queries. This partitioning strategy enables efficient retrieval of "all personas for a given month" queries (typical calendar use case).
- **Port Allocation**: When `npm run dev` runs and default ports are in use, the system automatically allocates the next available ports (5174, 5175, etc. for frontend; 7072, 7073, etc. for functions) and logs which ports are active prominently in terminal output.
- **Data Consistency**: Assumes availability data is eventually consistent (no distributed transactions required). Table Storage is eventually consistent; acceptable for this app.
- **Concurrently Tool**: Assumes `concurrently` npm package is used for process orchestration. Alternative tools (e.g., npm-run-all, foreman) could work with appropriate configuration.
- **staticwebapp.config.json**: Assumes Microsoft SWA documentation and examples are accurate and stable. May require updates if SWA product changes.
