# Week 1 — Frontend track (single handoff doc)

Owner: `<assign>`  
Track: `FE`  
Source of truth: `PLANS/EPIC-02-05-junior-tickets.md` (use the same ticket IDs)  

## How to use this doc (required)

- Treat this file as your task tracker.
- For every checkbox you complete:
  - change `[ ]` → `[x]`
  - add a PR link or commit hash in parentheses
  - if something is blocked, write `BLOCKED:` with a 1-line reason under the item.
- Prefer small PRs (1–4h tasks). Avoid mega PRs.

## What you should read (only when needed)

- Contracts/terms (only if you touch actions/time): `epics/EPIC-01-foundation.md`
- Bootstrap: `epics/EPIC-02-bootstrap.md`
- Map UI contract: `epics/EPIC-04-map-ui.md`
- Creation flows: `epics/EPIC-05-creation-flows.md`
- Full Week 1 plan (ticket details): `PLANS/EPIC-02-05-junior-tickets.md`

## 1) FE scope (what FE owns)

Primary:
- Routing, layout, pages/screens, map rendering (SVG DOM-first), Drawer UI.
- Forms for create flows + quick-add UI.
- Theming tokens/CSS for map state classes.

Non-goals (do not invent/own):
- Storage schema, repository behavior, import/export JSON shape, schemaVersion/migrations.
- Domain rules/validation rules (beyond basic UI validation).

## 2) Integration contracts (FE expectations from BE) — do not invent

FE should build UI as early as possible, but must wire to BE APIs as soon as they exist.

Minimum BE deliverables that unblock FE (in this order):
1) Entity types: `Campaign/Region/Province` with `region.mapTemplateId` and `province.mapSlotId?`.
2) Repositories: Campaign/Region/Province CRUD + listBy*.
3) Helper for slot assignment (pure): “first free slot” for a region template.
4) Import/export APIs (Settings uses them verbatim).

## 3) Week 1 checklist (execute in order)

### Phase A — App skeleton (EPIC-02)

- [ ] `02-T1` Initialize Vite + React + TS (`FE`) (PR/commit: )
- [ ] `02-T2` Routing + 3 stub pages (`FE`) (PR/commit: )
- [ ] `02-T3` `src/` module skeleton (`FE`) (PR/commit: )

Shared but FE-friendly (ok to take if you want to reduce coordination):
- [ ] `02-T4` Unit smoke test (`SHARED`) (PR/commit: )
- [ ] `02-T5` Playwright E2E smoke (`SHARED`) (PR/commit: )
- [ ] `02-T6` Minimal CI workflow (`SHARED`) (PR/commit: )

### Phase B — Map surface (EPIC-04)

- [ ] `04-T1` Add SVG templates + slot ID convention (`FE`) (PR/commit: )
- [ ] `04-T2` Map CSS tokens + province class mapping (`FE`) (PR/commit: )
- [ ] `04-T5` Province Drawer skeleton (map click → drawer) (`FE`) (PR/commit: )
- [ ] `04-T4` Unplaced provinces list panel (`FE`) (PR/commit: )
- [ ] `04-T3` Bind provinces to SVG slots (`FE`) (PR/commit: )  
  - BLOCKED: waiting for BE repos/types? (write here if blocked)
- [ ] `04-T6` Hover/selected + reduced motion (`FE`) (PR/commit: )

### Phase C — Creation flows (EPIC-05)

- [ ] `05-T1` Campaign create flow (minimal form) (`FE`) (PR/commit: )
- [ ] `05-T2` Region create flow (`FE`) (PR/commit: )
- [ ] `05-T3` Province create flow (auto mapSlot + fog/ready) (`FE`) (PR/commit: )
- [ ] `05-T4` Quick-add multiple provinces (`FE`) (PR/commit: )

Shared / coordination-heavy:
- [ ] `05-T5` First-run tutorial seed (versioned) (`SHARED`) (PR/commit: )  
  - Recommended split: FE ships onboarding UI + “remove tutorial” control; BE ships seed + loader.

## 4) Merge / conflict avoidance (recommended)

To reduce PR conflicts with BE:
- FE should avoid editing `src/entities/**` and `src/storage/**` except for imports/types usage.
- FE can temporarily use mock data, but must delete it once repos exist.
- Keep map binding logic in FE, but keep “what a slot list is” and slot assignment helper in BE.

## 5) FE Definition of Done (Week 1)

- A user can create campaign/region/province via UI.
- Region SVG renders and clicking a placed province opens the Drawer.
- Unplaced provinces list exists and opens the same Drawer.
- Refresh persists state (wired to BE persistence).
- Settings shows Import/Export UI (wired to BE import/export).
