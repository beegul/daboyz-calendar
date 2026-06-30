# Daboyz Calendar

Shared availability calendar with React frontend and Azure Functions API.

## Repository Hygiene

- Follow `docs/repo-hygiene.md` for keep/remove/defer rules.
- Do not commit one-off status reports or temporary generated outputs.
- For cleanup changes, record rationale and validation evidence before merge.

## Supported Local Prerequisites

- Node.js 20 LTS (recommended for Azure Functions Core Tools compatibility)
- npm 10+
- Azure Functions Core Tools v4 (`func` command)
- Azure Static Web Apps CLI (`swa` command)
- Azure CLI (`az`) is optional for local development and required only for cloud deployment and some diagnostics

## Install

```bash
npm install
```

## Local Development Workflows

### Fast Frontend Loop (default)

```bash
npm run dev
```

Starts Vite only. Use this mode for UI and component work that does not require local API emulation.

### Full Local Stack (frontend + api + swa)

```bash
npm run dev:full
```

Runs:

- `npm run dev:web`
- `npm run dev:api`
- `npm run dev:swa`

Use this when validating sync and API-dependent flows.

### Individual Commands

```bash
npm run dev:web
npm run dev:api
npm run dev:swa
```

## Validation Commands

```bash
npm run lint
npm run test
npm run build
```

## Fallback Workflow (If Full Stack Is Blocked)

If your environment is missing `func` or `swa`, continue with the frontend loop and use targeted smoke checks that do not require local API runtime. Document any skipped API-local checks in your validation notes and run full-stack checks in CI or a configured machine.

## Troubleshooting

- `func: command not found`: install Azure Functions Core Tools v4 and restart the terminal.
- `swa: command not found`: install SWA CLI and restart the terminal.
- Node runtime mismatch with Functions tools: switch to Node.js 20 LTS.
- Local API unavailable: use `npm run dev` for frontend validation and record skipped API-local checks.

## Rollback Plan

If a deployment introduces regression:

1. Re-deploy the previous known-good artifact or previous successful commit on main.
2. Confirm recovery with the retained smoke checks:
	- Cross-device sync
	- Persona create/delete reconciliation
	- Mobile clarity (month, persona, tap target)
3. Freeze additional changes until root cause and a narrow regression test are added.

## Post-Deployment Monitoring

- Watch sync error rate and API failure logs during first hour after release.
- Spot-check offline queue replay behavior after reconnect.
- Confirm no mobile layout regressions at 375px viewport.
- Re-run `npm run build` and compare bundle gzip size against baseline budget (<120 kB).
