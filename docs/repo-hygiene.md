# Repository Hygiene Guide

## Goal

Keep the repository operationally lean: only retain files and code needed for build, test, deploy, governance, and active feature documentation.

## Classification Rules

- Keep: actively required by workflows or governance.
- Remove: unreferenced and without ownership rationale.
- Defer: unresolved but bounded with owner/reason/milestone.

## Do Not Commit

- One-off status outputs and temporary generated reports.
- Local cache/output files already covered by ignore rules.
- Ad hoc work-summary files not tied to active workflows.

## Required Evidence for Cleanup PRs

- Candidate classification summary
- Removal/defer rationale
- Build + lint results
- Targeted regressions when behavior is touched
- Deferred items section with owner/reason/date
