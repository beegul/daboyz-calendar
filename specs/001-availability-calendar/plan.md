# Implementation Plan: Shared Availability Calendar

**Branch**: `001-availability-calendar` | **Date**: 2026-06-29 | **Spec**: `specs/001-availability-calendar/spec.md`

**Input**: Feature specification from `/specs/001-availability-calendar/spec.md`

**Note**: This plan implements the specification as of 2026-06-29, which requires React 19 + Azure serverless backend for cross-device sync (see spec.md FR-005, FR-007, and new Cross-Device Synchronization section).

## Summary

Build a cost-optimized calendar app for Azure using React 19 + Vite + TailwindCSS on the frontend, hosted on Azure Static Web Apps (Free Tier). Backend state persistence uses serverless Python Azure Functions (Consumption Tier) and Azure Table Storage for cross-device availability sharing. The architecture separates frontend (public/) from serverless API routes (api/) to enable independent scaling and minimal operational costs.

## Technical Context

**Frontend Stack**: React 19, Vite, TailwindCSS (ES2024-compatible)

**Backend Stack**: Python Azure Functions (Consumption Tier), Azure Table Storage

**Primary Dependencies**: 
- Frontend: vite, react, tailwindcss
- Backend: azure-functions, azure-data-tables

**Storage**: Azure Table Storage for cross-device persistence (replaces localStorage)

**Testing**: Unit tests for React components and Azure Functions; integration tests for API endpoints

**Target Platform**: Azure Static Web Apps (Free Tier for frontend), Azure Functions (Consumption Tier for API), Azure Table Storage (pay-per-operation)

**Project Type**: Static web app with serverless backend

**Performance Goals**: Fast initial React load, instant client interactions, sub-100ms API response times

**Cost Optimization**: Free Static Web Apps hosting, serverless-only backend (no always-on compute), Table Storage pay-as-you-go pricing

**Constraints**: No traditional database server; all backend compute is serverless; frontend API calls must be efficient; Cold start times acceptable for v1

**Scale/Scope**: Small friend groups (up to 100 concurrent users), monthly calendar views, real-time multi-user sync via Table Storage polling or webhooks

## Constitution Alignment

The repository constitution file `.specify/memory/constitution.md` defines quality and governance principles that apply to this feature:

### Principle I: Code Quality
- All React components use functional components with hooks
- ESLint configured with `eslint:recommended` + `react-recommended` rules
- Prettier configured for consistent formatting (arrow parens, semi-colons, tabs/spaces)
- Component naming: `src/components/ComponentName.jsx` (PascalCase)
- File structure: co-locate components with their tests (`ComponentName.jsx` + `ComponentName.test.jsx`)

### Principle II: Test Coverage
- All React components MUST have unit tests via Jest + React Testing Library
- All API endpoints MUST have integration tests
- Minimum branch coverage: 80% (validated by CI)
- Tests run on every commit; CI blocks merge if coverage drops

### Principle IV: Performance
- API response time target: <100ms (p95) from Azure Functions
- Frontend rendering: React components render in <50ms (p95)
- Polling interval: 5 seconds (balances latency vs server load)
- Bundle size optimization: Tree-shake TailwindCSS, code-split components

### Principle V: Simplicity
- Rationale for Azure serverless: Enables cross-device sync (FR-007) at minimal operational cost
- Polling model chosen over WebSocket: Simpler infrastructure, no persistent connections needed
- React over vanilla JS: Component reusability and ecosystem maturity justify complexity trade-off

## Project Structure

### Documentation (this feature)

```text
specs/001-availability-calendar/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── localStorage-schema.md
└── spec.md
```

### Source Code (project layout)

```text
public/
├── index.html
├── src/
│   ├── App.jsx          # React app root
│   ├── components/      # React components
│   ├── api/             # API client helpers
│   ├── index.css        # TailwindCSS imports
│   └── main.jsx         # Vite entry point
├── vite.config.js
└── tailwind.config.js

api/
├── __init__.py
├── function_app.py      # Azure Functions app definition
├── routes/
│   ├── __init__.py
│   ├── availability.py  # GET/POST/DELETE availability endpoints
│   └── users.py         # GET/POST user list endpoints
└── models/
    ├── __init__.py
    ├── availability.py  # Data models
    └── table_storage.py # Azure Table Storage client
```

**Architecture Decision**: Separate frontend (React SPA) from serverless backend (Python Functions). Static Web Apps handles frontend delivery and auth; Functions handle state mutations and cross-device sync.

## Complexity Tracking

**Cost Analysis**:
- Azure Static Web Apps (Free Tier): $0
- Azure Functions (Consumption): ~$0.20/million requests (first 1M free per month)
- Azure Table Storage: ~$0.016 per GB stored, ~$1/million transactions
- **Estimated monthly cost for small groups**: <$5 (well below free tier thresholds)

**Deployment Strategy**:
1. Frontend builds with Vite, deploys to Static Web Apps GitHub Actions
2. Backend functions zip and deploy to Function App resource
3. Static Web Apps routes `/api/*` to backend Function App

No constitution gate violations identified.

## Deployment & Azure Integration

### Static Web Apps Configuration
- Frontend app served from `public/build/` after Vite build
- API routes proxy to Azure Functions via `staticwebapp.config.json`
- GitHub Actions workflow handles build and deploy

### Azure Functions Setup
- Python 3.11 runtime, Consumption Tier
- Function triggers: HTTP (REST API endpoints)
- Environment variables: `AzureWebJobsStorage` (connection string for Table Storage)

### Data Persistence
- Azure Table Storage stores availability state
- Partition key: `calendar-month` (e.g., `2026-06`)
- Row key: `user_id-date` (e.g., `alice-2026-06-14`)
- Attributes: `name`, `color`, `date`, `timestamp`

### Local Development
- Frontend: `npm run dev` (Vite dev server on port 5173)
- Backend: `func start` (Azure Functions Core Tools on port 7071)
- Local storage emulator or mock Table Storage client for offline dev

## Quality Gates Before Implementation

1. **Code Style**: ESLint + Prettier configured and passing on all source files
2. **Test Setup**: Jest + React Testing Library configured; sample test demonstrates pattern
3. **Architecture Validation**: API contract review (contracts/api-endpoints.md)
4. **Constitution Review**: All principles documented and acknowledged in PR

**Next Steps**: Begin Phase 1 implementation (frontend scaffold) and Phase 2 implementation (backend scaffold) in parallel.

