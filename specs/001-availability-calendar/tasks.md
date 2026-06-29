# Tasks: Shared Availability Calendar (React + Azure Serverless)

**Input**: Design documents from `/specs/001-availability-calendar/`

**Architecture**: React 19 + Vite + TailwindCSS frontend on Azure Static Web Apps; Python Azure Functions backend with Azure Table Storage

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api-endpoints.md, contracts/localStorage-schema.md

## Phase 1: Frontend Scaffold (React + Vite + TailwindCSS)

- [x] T001 Create `public/` directory structure with `src/`, `src/components/`, `src/api/` folders
- [x] T002 Initialize Vite React project with `vite.config.js` and `package.json` (React 19, TailwindCSS)
- [x] T003 Create `public/index.html` with React root element and Vite script references
- [x] T004 Set up `public/src/main.jsx` as Vite entry point with React StrictMode
- [x] T005 Initialize TailwindCSS in `public/tailwind.config.js` and `public/src/index.css`
- [x] T006 Add npm scripts to `package.json`: `dev`, `build`, `preview`

## Phase 2: Backend Scaffold (Azure Functions + Table Storage)

- [x] T007 Create `api/` directory structure with `routes/`, `models/`, and `__init__.py`
- [x] T008 Initialize Azure Functions project with `function_app.py` and Python 3.11 runtime config
- [x] T009 Create `api/requirements.txt` with dependencies: azure-functions, azure-data-tables, python-dateutil
- [x] T010 Set up `api/models/table_storage.py` client for Azure Table Storage connectivity
- [x] T011 Create `staticwebapp.config.json` at repo root for Static Web Apps routing and API proxy

## Phase 3: API Endpoints Implementation

**Goal**: Implement REST endpoints for availability state management and cross-device sync

- [x] T012 [P] Implement `GET /api/users` endpoint in `api/routes/users.py` to return user list
- [x] T013 [P] Implement `POST /api/users` endpoint in `api/routes/users.py` to add/update user
- [x] T014 [P] Implement `GET /api/availability?month={YYYY-MM}` endpoint in `api/routes/availability.py`
- [x] T015 [P] Implement `POST /api/availability` endpoint to toggle user availability on date
- [x] T016 [P] Implement `DELETE /api/availability/{userId}/{date}` endpoint to remove availability entry
- [x] T017 Create `api/models/availability.py` with data validation and transformation helpers
- [x] T018 Add error handling and HTTP status codes to all endpoints (400, 404, 409, 500)
- [x] T019 Test all API endpoints locally using curl or Postman against `http://localhost:7071/api`

## Phase 4: React Components & State Management

**Goal**: Build React UI components for calendar, user selection, and availability marking

- [x] T020 [US1] Create `CalendarGrid.jsx` component for rendering monthly date cells with TailwindCSS
- [x] T021 [US1] Create `UserSelector.jsx` component for session user selection dropdown
- [x] T022 [US1] Create `AvailabilityBadge.jsx` component to display user availability markers with colors
- [x] T023 [US1] Create `MonthNavigation.jsx` component with Previous/Next month buttons
- [x] T024 [US2] Create `UserLegend.jsx` component to display user list and color mapping
- [x] T025 [P] Create `App.jsx` root component that manages global state (currentMonth, selectedUser, availability)
- [x] T026 [P] Implement React hooks for API calls: `useAvailability()`, `useUsers()` custom hooks
- [x] T027 [P] Add loading and error state handling to all components

## Phase 5: Frontend-Backend Integration

**Goal**: Connect React components to Azure Functions API endpoints

- [x] T028 Create `public/src/api/client.js` with HTTP client for API calls (fetch wrapper)
- [x] T029 Implement availability toggle handler to call `POST /api/availability` on date click
- [x] T030 Implement month navigation to fetch new month data via `GET /api/availability?month={month}`
- [x] T031 Implement user selector to call `POST /api/users` and update global state
- [x] T032 Add optimistic UI updates for availability toggles (instant feedback before API response)
- [x] T033 Implement error recovery and retry logic for failed API calls
- [x] T034 Add loading skeletons or spinners for async operations

## Phase 6: Cross-Device Sync & Polling

**Goal**: Enable real-time availability updates across multiple browsers/devices

- [x] T035 Implement polling mechanism in `useAvailability()` hook (e.g., poll every 5 seconds)
- [x] T036 Add refresh button to manually trigger availability data sync
- [x] T037 Detect and merge conflicts when same date is toggled across devices (timestamp-based)
- [x] T038 Display last-sync timestamp in UI to show data freshness
- [x] T039 Add debouncing to prevent rapid successive API calls on month navigation

## Phase 7: Testing (Unit & Integration)

**Goal**: Validate React components and API endpoints

- [x] T040 Write unit tests for `CalendarGrid` component rendering (Jest + React Testing Library)
- [x] T041 Write unit tests for availability toggle logic and state updates
- [x] T042 Write integration tests for API client calling Azure Functions endpoints
- [x] T043 Write tests for date validation and month boundary handling
- [x] T044 Test error scenarios: invalid dates, network failures, API timeouts
- [x] T045 Test localStorage fallback or SessionStorage for offline state persistence
- [x] T046 Run all tests locally: `npm test`

## Phase 8: Styling & Responsive Design

**Goal**: Polish UI with TailwindCSS and ensure mobile/desktop compatibility

- [x] T047 [P] Apply TailwindCSS utility classes to all components for consistent design
- [x] T048 [P] Ensure responsive grid layout for mobile (sm), tablet (md), and desktop (lg) screens
- [x] T049 [P] Add hover/focus states to interactive elements (buttons, date cells)
- [x] T050 [P] Test accessibility: keyboard navigation, ARIA labels, color contrast
- [x] T051 [P] Optimize bundle size: tree-shake unused TailwindCSS, code-split components

## Phase 9: Azure Deployment Setup

**Goal**: Configure resources and CI/CD for production deployment

- [ ] T052 Create Azure resource group and Function App (Consumption Tier)
- [ ] T053 Create Azure Storage Account and Table Storage container
- [ ] T054 Create Azure Static Web Apps resource (Free Tier)
- [ ] T055 Configure GitHub Actions workflow for frontend build and deploy
- [ ] T056 Configure GitHub Actions workflow for backend deployment to Function App
- [ ] T057 Set environment variables in Azure: `AzureWebJobsStorage` connection string
- [ ] T058 Link Static Web Apps to Function App for `/api/*` routing

## Phase 10: Documentation & Launch

**Goal**: Finalize guides and prepare for production

- [ ] T059 Update `specs/001-availability-calendar/quickstart.md` with deployment steps
- [ ] T060 Create `api/README.md` documenting backend setup, local dev, and deployment
- [ ] T061 Create `public/README.md` documenting frontend setup and development
- [ ] T062 Document API error responses and rate limits in `contracts/api-endpoints.md`
- [ ] T063 Test end-to-end flow: create resources → deploy frontend → deploy backend → verify sync
- [ ] T064 Performance testing: measure API response times, React render performance
- [ ] T065 Security review: validate CORS settings, input sanitization, Table Storage access controls

## Phase 11: Polish & Cross-Cutting Concerns

**Goal**: Final QA and optimization

- [ ] T066 [P] Add loading states and spinners for all async operations
- [ ] T067 [P] Implement user feedback (toast notifications for success/error)
- [ ] T068 [P] Add keyboard shortcuts (e.g., arrow keys for month navigation)
- [ ] T069 [P] Optimize React performance: memoization, useCallback, useMemo
- [ ] T070 [P] Archive old/historical calendar data (optional future enhancement)

## Dependencies & Execution Order

- **Phase 1**: Can start immediately
- **Phase 2**: Can run in parallel with Phase 1
- **Phase 3**: Depends on Phase 2; can start once backend scaffold is ready
- **Phase 4**: Depends on Phase 1; can start once React scaffold is ready
- **Phase 5**: Depends on Phase 3 and Phase 4; requires both API and components
- **Phase 6**: Depends on Phase 5; requires working frontend-backend integration
- **Phase 7**: Runs in parallel with Phases 4–6 (test as you build)
- **Phase 8**: Depends on Phase 4; can start once components are created
- **Phase 9**: Can start once Phase 5 is ready (testing Phase 9 tasks locally first)
- **Phase 10**: Depends on Phase 9; final step before launch
- **Phase 11**: Final polish after all functional phases complete

## Parallel Opportunities

- `T001`–`T006` (frontend scaffold) can run in parallel with `T007`–`T011` (backend scaffold)
- `T012`–`T016` (API endpoints) can be implemented in parallel by different developers
- `T020`–`T024` (React components) are independent and can be built in parallel
- `T040`–`T046` (testing) can run concurrently with development if test files are created alongside components
- `T052`–`T058` (Azure setup) can be done in parallel with Phase 8 (styling)

## Implementation Strategy

1. **Week 1**: Complete Phases 1–2 (scaffolding) and start Phase 3 (API endpoints)
2. **Week 2**: Complete Phase 3–5 (backend API and frontend integration); begin Phase 4 (components)
3. **Week 3**: Finish Phase 4–6 (React components and cross-device sync)
4. **Week 4**: Phases 7–8 (testing and styling); begin Phase 9 (Azure setup)
5. **Week 5**: Complete Phase 9–11 (deployment, docs, polish); production launch

## Total Tasks: 70

- Frontend: 18 tasks
- Backend: 12 tasks
- Integration: 7 tasks
- Testing: 7 tasks
- Deployment: 7 tasks
- Documentation: 7 tasks
- Polish: 5 tasks
