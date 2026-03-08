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

## 2) Module layout (planned)
Suggested module layout (from PRD):
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

## 3) Data flow (recommended)

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

## 4) Map layering contract
- **SVG template (view):** contains paths/slots/labels with stable IDs.
- **Map meta (data):** anchors, label positions, badge slots, etc (typed).
- **Adjacency graph (data):** province neighbors for mechanics; never derived from SVG at runtime in MVP.

## 5) Time boundary and determinism
- Centralize time access behind an injectable clock.
- Keep “meaningful action time” semantics consistent with EPIC-01 contracts.

