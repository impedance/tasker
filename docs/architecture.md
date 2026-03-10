# Architecture Blueprint (MVP)

This document defines the intended module boundaries and data flow to keep implementation simple and testable.

System of record:
- Stack + principles: `prd.md` → “Technical architecture (MVP)”
- Contracts: `epics/EPIC-01-foundation.md` (meaningful action, time boundary, events)

## 1) System context
- Single-user browser SPA (no backend in MVP).
- Offline-first after initial load.
- Local persistence (IndexedDB via localForage).
- Import/export JSON for full state portability.

## 1.1) Current implementation status
Implemented in the repo now:
- App shell and routing in `src/app/**`
- Route pages in `src/pages/**`
- Domain entities and zod validation in `src/entities/**`
- Storage, repositories, migrations, import/export in `src/storage/**`
- Shared UI primitives + theme tokens in `src/shared/**`
- Map UI surfaces in `src/pages/MapPage.tsx` and `src/map/**`

Planned but not yet implemented as first-class modules:
- `src/features/**`
- `src/game/**`

Note:
- `src/map/**` exists and is used for the EPIC-04 slice, but the full “map layering contract” (meta + graph as typed data) is still planned work.

## 2) Target module layout
Suggested target layout (from PRD):
`src/app`, `src/pages`, `src/entities`, `src/features`, `src/game`, `src/map`, `src/storage`, `src/shared`.

### Responsibilities
- `src/app/**`: app shell, providers, routing, bootstrapping.
- `src/pages/**`: route-level screens (composition only).
- `src/features/**`: use-case oriented UI + orchestration (calls domain rules + storage via boundaries).
- `src/entities/**`: core types and lightweight entity helpers (no storage).
- `src/game/**`: mechanics; rules and transitions are pure functions in `src/game/rules/**`.
- `src/map/**`: SVG view components + typed map meta (anchors/labels) + adjacency graph data.
- `src/storage/**`: persistence adapter, repositories, migrations, import/export.
- `src/shared/**`: shared UI primitives, utilities, formatting, small helpers.

## 3) Data flow

Current bootstrap flow:
1) Route/page code calls repository helpers in `src/storage/**`.
2) Storage loads and persists `AppState`.
3) UI renders directly from repository results.

Target MVP flow after EPIC-04..08:

### “User action → world change”
1) UI triggers a feature use-case (e.g., “log meaningful move”, “clarify fog”, “resolve siege”).
2) Feature code calls pure domain rules (`src/game/rules/**`) with typed inputs + current state.
3) Rules return a new state (or patch/events) deterministically.
4) Storage adapter persists updated state and appends any event log as needed.
5) UI renders the new state (map coloring, overlays, chronicle entries).

### “Persistence boundaries”
- Rules must not depend on storage format.
- Storage owns migrations and import/export compatibility.
- Import must validate unknown JSON and migrate to the latest schema version.

Interim rule until `src/features/**` and `src/game/**` exist:
- Keep business logic out of route components as much as possible.
- New mechanics should not be added straight into pages; they should land in dedicated modules even if those modules are still under `src/storage/**` or `src/entities/**` temporarily.

## 4) Map layering contract
- **SVG template (view):** contains paths/slots/labels with stable IDs.
- **Map meta (data):** anchors, label positions, badge slots, etc (typed).
- **Adjacency graph (data):** province neighbors for mechanics; never derived from SVG at runtime in MVP.

## 5) Time boundary and determinism
- Centralize time access behind an injectable clock.
- Keep “meaningful action time” semantics consistent with EPIC-01 contracts.

Implementation note:
- Current repositories still use `new Date()` directly. That is acceptable for the bootstrap slice, but any EPIC-06+ mechanics work should introduce a clock boundary before rule logic expands.
