# Validation Matrix

## Scope Types

### Artifact-Only Changes

Definition:
- Changes limited to documentation, manifests, inventory logs, and non-runtime artifact removals.

Required gates:
- `npm run build`
- `npm run lint`

Targeted high-signal regression lanes:
- Not required.

### Behavior-Affecting Frontend Changes

Definition:
- Changes touching `public/src/` runtime behavior paths.

Required gates:
- `npm run build`
- `npm run lint`

Required targeted lanes (example baseline):
- `npm test -- --runInBand public/src/hooks/__tests__/useAvailability.test.js`
- `npm test -- --runInBand public/src/__tests__/integration/availability-marking.integration.test.js`

### Behavior-Affecting Backend Changes

Definition:
- Changes touching API runtime behavior in `api/`.

Required gates:
- `npm run build`
- `npm run lint`

Required targeted lanes:
- If frontend contract behavior is impacted, run:
  - `npm test -- --runInBand public/src/__tests__/integration/personas.integration.test.js`
- Add route-specific verification commands as applicable.

## Recording Rule

- Every batch must record scope type and executed gates in `validation-evidence.md`.
