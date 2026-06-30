# Cleanup Decisions Log

## Decision Rules

- Keep if referenced by active build/test/deploy/required-doc workflows.
- Remove if unreferenced by active workflows and without active ownership rationale.
- Defer only with owner, reason, and target milestone/date.

## Decisions

### Remove

- COMPLETION_REPORT.md
- COMPREHENSIVE_IMPLEMENTATION_GUIDE.md
- DESIGN_SYSTEM_CONFIG.md
- DEPLOYMENT_COMPLETE.md
- DEPLOYMENT_STATUS.md
- DEPLOYMENT_STATUS_007.md
- FINAL_COMPLETION_STATUS.md
- IMPLEMENTATION_NOTES.md
- IMPLEMENTATION_NOTES_PHASE3.md
- IMPLEMENTATION_SUMMARY.md
- lint-output.txt
- LOCAL_TESTING_GUIDE.md
- PHASE_1_DEPLOYMENT_SUMMARY.md
- PERSONAS_FEATURE.md
- RAPID_IMPLEMENTATION_T023-T039.md
- README_START_HERE.md
- SESSION_WORK_SUMMARY.md
- SOURCE_CODE_REFERENCE.md
- TASK_STATUS.md

### Keep

- README.md
- CHANGELOG.md
- docs/
- specs/
- .specify/memory/constitution.md
- .github/copilot-instructions.md
- azure.yaml

### Defer

- public/src/__tests__/AnimationIntegration.test.js
- public/src/hooks/__tests__/useGestureSwipe.test.js

Deferred metadata is tracked in deferred-items.md.
