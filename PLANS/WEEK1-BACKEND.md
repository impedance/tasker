# Week 1 — Domain/Backend handoff (tracker)

Owner: `<assign>`  
Track: `BE`  
Source of truth for ticket text: `PLANS/EPIC-02-05-junior-tickets.md`  

## How to use this tracker (required)
- For every checkbox you complete: change `[ ]` → `[x]`.
- Add a PR link or commit hash in parentheses.
- If blocked, add `BLOCKED:` with a 1-line reason under the item.
- Keep PRs small (target 1–4 hours).

## References (read when needed)
- Contracts/time/actions/events: `epics/EPIC-01-foundation.md`
- Domain + persistence: `epics/EPIC-03-domain-persistence.md`
- Architecture boundaries: `docs/architecture.md`, `docs/engineering_requirements.md`

## Week 1 checklist (execute in order)

### EPIC-03 (Domain + persistence)
- [x] `03-T1` Pick runtime validation strategy + wire into import (PR/commit: implemented)
- [x] `03-T2` Define P0 entity types (Campaign/Region/Province) (PR/commit: implemented)
- [x] `03-T3` Storage adapter (localForage) + key namespaces (PR/commit: implemented)
- [x] `03-T4` Repository: Campaign (CRUD) (PR/commit: implemented)
- [x] `03-T5` Repository: Region (CRUD + list by campaign) (PR/commit: implemented)
- [x] `03-T6` Repository: Province (CRUD + list by region + mapSlot helper) (PR/commit: implemented)
- [x] `03-T7` Schema version + migration pipeline (minimal) (PR/commit: implemented)
- [x] `03-T8` JSON export/import (Settings) (PR/commit: implemented)

Shared (coordination-heavy):
- [x] `05-T5` First-run tutorial seed (BE: seed data + deterministic loader + removal/reset mechanics) (PR/commit: implemented)  
  - BLOCKED:

