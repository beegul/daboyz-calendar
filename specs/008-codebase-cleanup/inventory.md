# Inventory: Codebase Cleanup Candidates

## Summary

- Total candidates: 31
- Keep: 9
- Remove: 20
- Defer: 2

## Artifact Candidates

| ID | Path | Type | Classification | Stale by Usage | Workflow References | Notes |
|---|---|---|---|---|---|---|
| A-001 | COMPLETION_REPORT.md | document | remove | true | none | Historical completion snapshot, superseded by specs and changelog.
| A-002 | DEPLOYMENT_COMPLETE.md | document | remove | true | none | One-time status output, no active workflow dependency.
| A-003 | DEPLOYMENT_STATUS.md | document | remove | true | none | One-time status output, no active workflow dependency.
| A-004 | DEPLOYMENT_STATUS_007.md | document | remove | true | none | One-time status output, no active workflow dependency.
| A-005 | FINAL_COMPLETION_STATUS.md | document | remove | true | none | One-time status output, no active workflow dependency.
| A-006 | IMPLEMENTATION_NOTES.md | document | remove | true | none | Historical implementation notes, superseded by spec artifacts.
| A-007 | IMPLEMENTATION_NOTES_PHASE3.md | document | remove | true | none | Historical implementation notes, superseded by spec artifacts.
| A-008 | IMPLEMENTATION_SUMMARY.md | document | remove | true | none | Redundant summary, superseded by specs/changelog.
| A-009 | PHASE_1_DEPLOYMENT_SUMMARY.md | document | remove | true | none | One-time deployment summary, stale.
| A-010 | RAPID_IMPLEMENTATION_T023-T039.md | document | remove | true | none | Historical execution log, stale.
| A-011 | SESSION_WORK_SUMMARY.md | document | remove | true | none | Historical session artifact, stale.
| A-012 | TASK_STATUS.md | document | remove | true | none | Redundant status file, superseded by specs tasks.
| A-013 | COMPREHENSIVE_IMPLEMENTATION_GUIDE.md | document | remove | true | none | Feature 006 implementation scratchpad, superseded by completed source and spec artifacts.
| A-014 | DESIGN_SYSTEM_CONFIG.md | document | remove | true | none | Standalone design-token notes duplicated by committed code configuration.
| A-015 | LOCAL_TESTING_GUIDE.md | document | remove | true | none | Outdated local testing walkthrough with stale runtime/tooling details.
| A-016 | PERSONAS_FEATURE.md | document | remove | true | none | Historical feature explainer superseded by specs and current source.
| A-017 | README_START_HERE.md | document | remove | true | none | Stale feature 006 completion index with obsolete status and deleted file references.
| A-018 | SOURCE_CODE_REFERENCE.md | document | remove | true | none | Historical component index superseded by current source tree and specs.
| A-019 | lint-output.txt | document | remove | true | none | Transient lint artifact not required for active workflows.
| A-020 | README.md | document | keep | false | required-doc | Primary contributor entrypoint.
| A-021 | CHANGELOG.md | document | keep | false | required-doc | Release history and governance trace.
| A-022 | docs/ | directory | keep | false | required-doc | Active deployment and architecture docs.
| A-023 | specs/ | directory | keep | false | required-doc | Governance and planning source of truth.
| A-024 | .github/copilot-instructions.md | document | keep | false | required-doc | Agent context configuration.
| A-025 | .specify/memory/constitution.md | document | keep | false | required-doc | Constitutional governance.
| A-026 | azure.yaml | document | keep | false | deploy | Active Azure deployment manifest.

## Code Candidates

| ID | Path/Symbol | Type | Classification | Stale by Usage | Workflow References | Notes |
|---|---|---|---|---|---|---|
| C-001 | public/src/__tests__/AnimationIntegration.test.js | code-path | defer | unknown | test | Contains lint warnings but may be useful for animation regressions.
| C-002 | public/src/hooks/__tests__/useGestureSwipe.test.js | code-path | defer | unknown | test | Contains lint warnings; requires deeper behavior review before removal.
| C-003 | public/src/hooks/__tests__/useOptimisticUpdate.test.js | code-path | keep | false | test | Valid regression lane for optimistic behavior.
| C-004 | public/src/hooks/useHydration.js console noise | code-path | keep | false | runtime | Keep for now; addressed by future lint tightening, not deletion.
| C-005 | public/src/hooks/useDeletePersona.js console usage | code-path | keep | false | runtime | Keep for behavior and diagnostics consistency.

## Validation Notes

- Stale classification is usage-based.
- Files marked remove have no active build/test/deploy/required-doc references after reconciling legacy onboarding links.
- Deferred code candidates include explicit owner/target in deferred-items.md.
