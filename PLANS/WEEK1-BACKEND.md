# Week 1 — Domain/Backend track (single handoff doc)

Owner: `<assign>`  
Track: `BE`  
Source of truth: `PLANS/EPIC-02-05-junior-tickets.md` (use the same ticket IDs)  

## How to use this doc (required)

- Treat this file as your task tracker.
- For every checkbox you complete:
  - change `[ ]` → `[x]`
  - add a PR link or commit hash in parentheses
  - if something is blocked, write `BLOCKED:` with a 1-line reason under the item.
- Prefer small PRs (1–4h tasks). Avoid mega PRs.

## What you should read (only when needed)

- Contracts/terms (must): `epics/EPIC-01-foundation.md`
- Domain + persistence: `epics/EPIC-03-domain-persistence.md`
- Full Week 1 plan (ticket details): `PLANS/EPIC-02-05-junior-tickets.md`

## 1) BE scope (what BE owns)

Primary:
- Entity schemas + runtime validation strategy.
- Storage adapter (IndexedDB/localForage), key conventions, schemaVersion.
- Repositories (CRUD + listBy* queries), relationship consistency rules.
- Import/export pipeline + migrations runner.
- Pure helpers FE relies on (e.g., slot assignment helper).

Non-goals (do not own):
- React screens/forms, routing, map UI rendering.
- Styling/theming/copy.

## 2) Integration contracts (what BE must provide to FE)

Deliver stable APIs early, even if implementation is minimal.

BE outputs FE should be able to depend on:
- Stable TS types for `Campaign/Region/Province` (and any shared DTOs).
- Repos with deterministic behavior (especially around IDs and mapSlot assignment).
- Import/export JSON shape that includes `schemaVersion`.
- Clear, user-friendly domain errors for invalid import payloads.

## 3) Week 1 checklist (execute in order)

- [ ] `03-T1` Pick runtime validation strategy + wire into import (`BE`) (PR/commit: )
- [ ] `03-T2` Define P0 entity types (Campaign/Region/Province) (`BE`) (PR/commit: )
- [ ] `03-T3` Storage adapter + key namespaces (`BE`) (PR/commit: )
- [ ] `03-T4` Campaign repository CRUD (`BE`) (PR/commit: )
- [ ] `03-T5` Region repository CRUD + listByCampaignId (`BE`) (PR/commit: )
- [ ] `03-T6` Province repository CRUD + listByRegionId + mapSlot helper (`BE`) (PR/commit: )
- [ ] `03-T7` SchemaVersion + migrations runner (`BE`) (PR/commit: )
- [ ] `03-T8` Import/export pipeline (`BE`) (PR/commit: )

## 4) BE behavioral contracts (to avoid FE pain)

- ID strategy: pick one and stick to it (`crypto.randomUUID()` recommended if available).
- Timestamps: define and enforce semantics from EPIC-01; do not let UI set state directly.
- Province slot assignment:
  - expose a pure helper to compute “first free slot”
  - repo create should preserve a provided `mapSlotId` and never silently reassign on update
- Deletion behavior: define cascade/block rules for Campaign→Region→Province and document them.

## 5) BE Definition of Done (Week 1)

- CRUD works for Campaign/Region/Province and survives refresh.
- listByCampaignId/listByRegionId behave correctly.
- `schemaVersion` exists and migrations run on startup without data loss.
- Export JSON + Import JSON roundtrip restores identical state.
- Invalid imports fail with a human-readable error message (not a stack trace).
