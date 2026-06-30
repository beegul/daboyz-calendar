# Tasks: Codebase Cleanup and Hygiene

**Input**: Design documents from `/specs/008-codebase-cleanup/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/

**Tests**: Include risk-based validation tasks per spec (build + lint always; targeted high-signal regressions when behavior-affecting files are touched).

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: User story label for story phases only (`[US1]`, `[US2]`, `[US3]`)

## Phase 1: Setup (Project Hygiene Scaffolding)

**Purpose**: Create the cleanup working artifacts and baseline records used by all stories.

- [X] T001 Create cleanup candidate inventory scaffold in `specs/008-codebase-cleanup/inventory.md`
- [X] T002 Create cleanup decision log in `specs/008-codebase-cleanup/cleanup-decisions.md`
- [X] T003 [P] Create deferred items tracker in `specs/008-codebase-cleanup/deferred-items.md`
- [X] T004 [P] Create validation evidence log in `specs/008-codebase-cleanup/validation-evidence.md`

---

## Phase 2: Foundational (Blocking Cleanup Policy and Gate Rules)

**Purpose**: Establish non-negotiable keep/remove/defer policy and validation model before any removals.

**⚠️ CRITICAL**: No user story cleanup execution should begin until this phase is complete.

- [X] T005 Define operationally-lean keep/remove/defer policy in `specs/008-codebase-cleanup/cleanup-policy.md`
- [X] T006 [P] Document active workflow references (build/test/deploy/required-doc) in `specs/008-codebase-cleanup/workflow-reference-map.md`
- [X] T007 [P] Document usage-based stale-classification criteria in `specs/008-codebase-cleanup/stale-classification.md`
- [X] T008 [P] Define risk-based validation matrix in `specs/008-codebase-cleanup/validation-matrix.md`, including explicit required test lanes by touched area (artifact-only vs behavior-affecting frontend/backend) with exact command examples
- [X] T009 Prepare final cleanup completion report template in `specs/008-codebase-cleanup/cleanup-report.md`

**Checkpoint**: Policy, stale criteria, and validation gates are defined and can be applied consistently.

---

## Phase 3: User Story 1 - Remove Non-Essential Artifacts (Priority: P1) 🎯 MVP

**Goal**: Remove non-essential generated/temp/stale file artifacts while preserving workflow-critical assets.

**Independent Test**: Audit and classify repository artifacts, execute approved removals, and confirm no unresolved high-priority junk-file findings remain.

### Implementation for User Story 1

- [X] T010 [US1] Inventory top-level and feature artifact candidates in `specs/008-codebase-cleanup/inventory.md`
- [X] T011 [P] [US1] Classify artifact candidates as keep/remove/defer with rationale in `specs/008-codebase-cleanup/cleanup-decisions.md`
- [X] T012 [US1] Generate concrete artifact removal manifest (exact repo-relative paths) in `specs/008-codebase-cleanup/artifact-removal-batch.md`
- [X] T013 [US1] Execute artifact removals strictly from `specs/008-codebase-cleanup/artifact-removal-batch.md`
- [X] T014 [US1] Record artifact removal evidence and remaining status in `specs/008-codebase-cleanup/cleanup-report.md`
- [X] T015 [US1] Record any controlled artifact deferrals (owner/reason/milestone) in `specs/008-codebase-cleanup/deferred-items.md`

**Checkpoint**: Non-essential artifact cleanup is complete and auditable.

---

## Phase 4: User Story 2 - Remove Redundant or Dead Code (Priority: P1)

**Goal**: Remove unused/duplicated/obsolete code paths while preserving existing behavior.

**Independent Test**: Identify code cleanup candidates, apply removals in small slices, and pass required risk-based validation.

### Implementation for User Story 2

- [X] T016 [US2] Inventory dead/duplicate code candidates across `public/src/` and `api/` in `specs/008-codebase-cleanup/inventory.md`
- [X] T017 [P] [US2] Classify code candidates and rationale in `specs/008-codebase-cleanup/cleanup-decisions.md`
- [X] T018 [US2] Generate frontend code removal manifest (exact paths/symbol targets) in `specs/008-codebase-cleanup/frontend-code-removal-batch.md`
- [X] T019 [US2] Generate backend code removal manifest (exact paths/symbol targets) in `specs/008-codebase-cleanup/backend-code-removal-batch.md`
- [X] T020 [US2] Update stale or redundant test code impacted by removals in `public/src/__tests__/`
- [X] T021 [US2] Execute frontend code removals strictly from `specs/008-codebase-cleanup/frontend-code-removal-batch.md`
- [X] T022 [US2] Execute backend code removals strictly from `specs/008-codebase-cleanup/backend-code-removal-batch.md`
- [X] T023 [US2] Run required risk-based validation per `specs/008-codebase-cleanup/validation-matrix.md` and record outcomes in `specs/008-codebase-cleanup/validation-evidence.md`
- [X] T024 [US2] Record controlled code deferrals (owner/reason/milestone) in `specs/008-codebase-cleanup/deferred-items.md`

**Checkpoint**: Redundant/dead code cleanup is complete with behavior-preserving evidence.

---

## Phase 5: User Story 3 - Establish Ongoing Hygiene Guardrails (Priority: P2)

**Goal**: Prevent junk-file/junk-code reaccumulation through explicit rules and contributor guidance.

**Independent Test**: A contributor can apply hygiene rules and determine what should not be committed without extra clarification.

### Implementation for User Story 3

- [X] T025 [US3] Define repository hygiene rules in `docs/repo-hygiene.md`
- [X] T026 [P] [US3] Update contributor guidance with hygiene workflow in `README.md`
- [X] T027 [P] [US3] Align ignore-file rules with cleanup policy in `.gitignore`
- [X] T028 [P] [US3] Align formatter ignore rules with cleanup policy in `.prettierignore`
- [X] T029 [P] [US3] Align lint ignore rules with cleanup policy in `.eslintignore`
- [X] T030 [US3] Add cleanup review checklist for contributors in `.github/pull_request_template.md`
- [X] T031 [US3] Add guardrail verification steps in `specs/008-codebase-cleanup/quickstart.md`

**Checkpoint**: Ongoing hygiene guardrails are documented and enforceable in normal contribution flow.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize records, run final validation, and produce completion summary.

- [X] T032 [P] Reconcile keep/remove/defer totals and unresolved items in `specs/008-codebase-cleanup/inventory.md`
- [X] T033 [P] Finalize deferred-item visibility section in `specs/008-codebase-cleanup/cleanup-report.md`
- [X] T034 Execute contributor dry-run review simulation and record proof for SC-006 in `specs/008-codebase-cleanup/validation-evidence.md`
- [X] T035 Run final required quality gates per `specs/008-codebase-cleanup/validation-matrix.md` and append command evidence in `specs/008-codebase-cleanup/validation-evidence.md`
- [X] T036 Publish final cleanup completion summary in `specs/008-codebase-cleanup/cleanup-report.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks story execution
- **Phase 3 (US1)**: Depends on Phase 2; can start first as MVP
- **Phase 4 (US2)**: Depends on Phase 2; should follow/overlap US1 after policy is stable
- **Phase 5 (US3)**: Depends on Phase 2; best finalized after major removals from US1/US2
- **Phase 6 (Polish)**: Depends on completion of selected story phases

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational; first delivery slice
- **US2 (P1)**: Independent after Foundational; may consume US1 classification outputs
- **US3 (P2)**: Independent after Foundational; benefits from finalized cleanup decisions

### Within-Story Ordering

- Inventory before classification
- Classification before removal
- Removal before final validation evidence
- Deferrals documented before story completion

### Parallel Opportunities

- `T003` and `T004` parallel with each other
- `T006`, `T007`, `T008` parallel after `T005`
- `T011` parallel with preparation of `T015`
- `T018` and `T019` parallel manifest generation for code removals
- `T017` parallel with planning of `T022`
- `T026` through `T029` parallel once guardrail rules are drafted
- `T032` and `T033` parallel in final phase

---

## Parallel Example: User Story 1

```bash
# Run classification and deferral preparation in parallel:
Task: "Classify artifact candidates in specs/008-codebase-cleanup/cleanup-decisions.md"
Task: "Prepare controlled artifact deferrals in specs/008-codebase-cleanup/deferred-items.md"
```

## Parallel Example: User Story 3

```bash
# Run guardrail alignment updates in parallel:
Task: "Update README.md with hygiene workflow"
Task: "Update .gitignore/.prettierignore/.eslintignore with cleanup policy"
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate artifact cleanup outcomes and report

### Incremental Delivery

1. Foundation + US1 (artifact cleanup)
2. US2 (dead/redundant code cleanup)
3. US3 (guardrails)
4. Final polish and completion report

### Team Strategy

1. Developer A: artifact inventory/classification/removal (US1)
2. Developer B: code cleanup slices + validation (US2)
3. Developer C: guardrails and contributor docs (US3)
4. Joint finalization: completion report and deferred item review

---

## Notes

- Tasks follow strict checklist format with IDs and file paths.
- Story tasks include mandatory `[US#]` labels.
- Cleanup execution must remain within operationally-lean scope defined in spec and plan.
- Controlled deferrals are mandatory where unresolved items remain.
