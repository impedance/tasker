# Handoff: Slice EPICs into junior tickets (Tasker)

## Context
The user asked to "slice" the existing EPIC docs into junior-friendly tasks and confirm where tasks should live and which docs to touch.

Repo: `/home/spec/work/tasker`.

Important repo rule: chat responses in Russian, repo docs/artifacts in English (see `AGENTS.md`).

## What’s already done (docs hardening)
Key mechanics and implementation contracts were tightened to reduce ambiguity and junior guesswork:

- Map art direction locked to a Hearts-of-Iron-like political/front map (readability-first) + Shogunate theming via iconography/copy.
  - `prd.md:172`
  - `epics/EPIC-04-map-ui.md:15`

- Map style contract (CSS tokens, state→class mapping, suggested palette/patterns):
  - `epics/EPIC-04-map-ui.md:27`

- Asset plan for MVP (SVG templates, slots, patterns, stamps, mon icons, folder conventions, acceptance criteria):
  - `epics/ASSET-PLAN.md:1` (currently untracked in git status)

- Mechanics contracts improved:
  - `updatedAt` vs `lastMeaningfulActionAt` semantics (siege uses last meaningful action)
  - Added `province_supplied` and `province_move_logged` so real progress counts even when stage doesn’t change.
  - Added Appendix I: “Real step” contract + soft prepare-loop anti-exploit.
  - `epics/EPIC-01-foundation.md:389` (C)
  - `epics/EPIC-01-foundation.md:452` (D)
  - `epics/EPIC-01-foundation.md:590` (I)

- QA mechanics checklist created:
  - `epics/QA-MECHANICS-CHECKLIST.md:1` (currently untracked)

- Implementation readiness checklist exists and is referenced from epic index:
  - `epics/IMPLEMENTATION-READINESS.md:12`
  - `epics/00-index.md:6`

### Current working tree changes
`git status --porcelain` shows modified:
- `prd.md`
- `epics/EPIC-01-foundation.md`
- `epics/EPIC-04-map-ui.md`
- `epics/EPIC-05-creation-flows.md` (already patched earlier in session)
- `epics/EPIC-06-rule-engine.md` (action set updated earlier)
- `epics/EPIC-07-siege-tactics.md` (timestamp semantics)
- `epics/EPIC-08-daily-loop.md`
- `epics/EPIC-11-scoring-feedback.md`
- `epics/EPIC-13-qa-release.md`
- `epics/EPIC-15-world-shell.md`
- `epics/00-index.md`

And untracked:
- `epics/ASSET-PLAN.md`
- `epics/QA-MECHANICS-CHECKLIST.md`

(Do NOT forget to keep these new files in the final patch.)

## What remains (user request)
### Goal
Create “junior tickets” (1–4h each) derived from EPIC-02/03/04/05 first, and explain where they should live.

### Where tasks should live
Use the repo’s existing plan template `PLANS/plan.md`.
Create one executable plan per EPIC in `PLANS/` (recommended filenames):
- `PLANS/EPIC-02-bootstrap.md`
- `PLANS/EPIC-03-domain-persistence.md`
- `PLANS/EPIC-04-map-ui.md`
- `PLANS/EPIC-05-creation-flows.md`

Each plan should:
- reference the original epic (`epics/EPIC-XX-...md`) and PRD sections;
- split work into junior-sized tasks (1–4h) with explicit acceptance criteria and “how to verify”;
- include a minimal dependency order inside the plan.

Optionally, add a short link from `epics/00-index.md` to these executable plans once created.

### Which docs to touch vs not touch
Touch:
- `PLANS/*` (new plan files)
- optionally `epics/00-index.md` to link plans

Avoid touching (unless a real inconsistency is found while slicing):
- `prd.md`
- `epics/EPIC-01-...` contracts
- other EPIC specs

## Suggested slicing (outline)
### EPIC-02 (Bootstrap) — example junior ticket split
Split into tasks like:
- Init Vite React TS app + scripts
- Add router + stub pages
- Add Vitest+RTL + 1 smoke test
- Add Playwright + 1 e2e smoke
- Add CI workflow

### EPIC-03 (Domain & persistence)
Split by deliverable layers:
- Define TS types for each entity (Campaign/Region/Province/Season/…)
- Add runtime validation strategy (pick one)
- Storage adapter wrapper (localForage init + namespaces)
- Repositories per entity (Campaign repo, Region repo, Province repo, …)
- Relationship consistency helpers
- Import/export schema
- Migration pipeline + 1 example migration
- Integration tests per layer

### EPIC-04 (Map UI)
Split into:
- Add SVG assets skeleton + slot IDs
- Implement CSS tokens file + mapping classes
- Render region map + bind slots
- Province drawer skeleton
- Hotspot overlay
- Unplaced provinces list panel

### EPIC-05 (Creation flows)
Split into:
- Campaign create form
- Region create form
- Province create + auto slot assignment
- Bulk add
- Tutorial seed data scaffolding

## Verification guidance
Plans should reference:
- Readiness checklist: `epics/IMPLEMENTATION-READINESS.md`
- Mechanics QA checklist: `epics/QA-MECHANICS-CHECKLIST.md`

## Notes/risks
- Repo currently contains only docs; running tests is not applicable yet.
- Keep MVP scope tight: do not introduce new systems beyond docs.
