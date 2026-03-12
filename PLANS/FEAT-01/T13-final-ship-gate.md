# FEAT-01 T13 - Final ship gate

Goal: create an explicit release decision checkpoint so the team stops mixing blockers with nice-to-have cleanup.

Blocked by:
- All intended FEAT-01 ship-blocker tasks.

Read first:
- `PLANS/FEAT-01-production-readiness-hardening.md`
- `PLANS/FEAT-01/00-index.md`
- `docs/index.md`
- `docs/E2E-CHECKLIST.md`
- `epics/QA-MECHANICS-CHECKLIST.md`

Likely code areas:
- Release checklist docs
- A short recorded ship-gate note in the repo

Implementation notes:
- This is a release decision artifact, not another refactor bucket.
- The output must separate:
  - P0 blockers that stop pilot handoff
  - post-release backlog items

Steps:
1. Define the final P0 blocker list from the current FEAT-01 status.
2. Run the ship commands and record the outcome.
3. Do one dry-run pilot handoff using only repo docs.
4. Move remaining non-blockers out of the ship path.

Acceptance criteria:
- The team can answer "pilot-ready or not" using explicit criteria.
- Remaining issues are triaged into blocker vs follow-up.
- Code, docs, and QA entry points do not contradict each other.

Self-check before review:
- This task did not reopen already-closed scope.
- The dry-run handoff used repo docs only.
- Follow-up items are clearly outside the pilot cutline.

Verification:
- `make smoke`
- `make preflight`
- `npm run build`
- `npm run e2e`

PR must mention:
- Final blocker status
- Which items were intentionally deferred after the pilot cutline
