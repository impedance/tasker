# Week 1 — Frontend handoff (tracker)

Owner: `<assign>`  
Track: `FE`  
Source of truth for ticket text: `PLANS/EPIC-02-05-junior-tickets.md`  

## How to use this tracker (required)
- For every checkbox you complete: change `[ ]` → `[x]`.
- Add a PR link or commit hash in parentheses.
- If blocked, add `BLOCKED:` with a 1-line reason under the item.
- Keep PRs small (target 1–4 hours).

## References (read when needed)
- Contracts/time/actions/events: `epics/EPIC-01-foundation.md`
- Bootstrap: `epics/EPIC-02-bootstrap.md`
- Map UI contract: `epics/EPIC-04-map-ui.md`
- Creation flows: `epics/EPIC-05-creation-flows.md`
- Architecture boundaries: `docs/architecture.md`, `docs/engineering_requirements.md`

## Week 1 checklist (execute in order)

### EPIC-02 (Bootstrap)
- [x] `02-T1` Initialize Vite + React + TypeScript (PR/commit: initialized)
- [x] `02-T2` Add routing + 3 stub pages (PR/commit: aligned to `/`, `/campaigns`, `/settings`)
- [x] `02-T3` Create `src/` module skeleton (PRD-aligned) (PR/commit: implemented)

Shared (can be taken by FE if needed):
- [x] `02-T4` Configure Vitest + RTL (one smoke) (PR/commit: smoke asserts `Tasker MVP`)
- [x] `02-T5` Configure Playwright E2E (one smoke) (PR/commit: routes + direct URL smoke wired; CI-ready)
- [x] `02-T6` Add minimal CI workflow (PR/commit: lint + typecheck + unit + build + e2e)

### EPIC-04 (Map UI)
- [x] `04-T1` Add SVG templates + slot ID convention (PR/commit: implemented)
- [x] `04-T2` Map CSS tokens file + province class mapping (PR/commit: implemented)
- [x] `04-T5` Province Drawer skeleton (map click → drawer) (PR/commit: implemented)
- [x] `04-T4` Unplaced provinces list panel (PR/commit: implemented)
- [x] `04-T3` Region map page: bind provinces to SVG slots (PR/commit: implemented)  
- [x] `04-T6` Hover/selected styles + reduced motion (PR/commit: implemented)

### EPIC-05 (Creation flows)
- [ ] `05-T1` Campaign create flow (minimal form) (PR/commit: )
- [ ] `05-T2` Region create flow (scoped to campaign) (PR/commit: )
- [ ] `05-T3` Province create flow (auto mapSlot + fog/ready) (PR/commit: )
- [ ] `05-T4` Quick-add multiple provinces (bulk) (PR/commit: )

Shared (coordination-heavy):
- [ ] `05-T5` First-run tutorial seed (FE: onboarding UI + “remove tutorial”) (PR/commit: )  
  - BLOCKED:
