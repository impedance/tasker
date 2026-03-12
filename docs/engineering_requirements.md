# Engineering Requirements (MVP)

Purpose: turn the PRD + EPIC specs into implementation contracts that keep development fast, safe, and low-friction.

System of record:
- Product + stack overview: `prd.md` (see “Technical architecture (MVP)”)
- Mechanics and contracts: `epics/EPIC-01-foundation.md`
- Bootstrap execution sources: `epics/00-index.md`, `epics/EPIC-02-bootstrap.md`, `epics/EPIC-03-domain-persistence.md`, `epics/EPIC-04-map-ui.md`, `epics/EPIC-05-creation-flows.md`

## 1) Non-negotiables (MUST)

### 1.1. Architecture boundaries
- **Rules are pure:** all domain rules and state transitions live in `src/game/rules/**` as pure functions (no storage, no UI, no timers, no network).
- **UI stays dumb:** UI components must not encode rule logic; they call typed use-cases/services and render state.
- **Storage is an adapter:** persistence lives in `src/storage/**` behind a small typed interface; no IndexedDB/localForage calls from UI or rules.
- **Map is layered:** SVG template is view-only; map metadata and adjacency graph are typed data independent from SVG.

Current-repo interpretation:
- These are target architecture constraints, not a claim that every screen already follows them perfectly.
- The repo now includes `src/game/**`, `src/map/**`, and `src/shared/**`; `src/features/**` is still the main missing orchestration layer.
- Active cleanup work should reduce direct page-level orchestration drift rather than re-litigating the module map.

### 1.2. Offline-first and data safety
- The app must be usable offline after initial load (no backend assumptions).
- Persistence uses IndexedDB (via localForage) and is resilient to refresh/tab restart.
- Import/export is supported for the full state; exported JSON includes a schema version and supports migrations.

### 1.3. Determinism and “time boundary”
- Any “current time” usage must be routed through a single boundary (injectable clock) so rules are deterministic and testable.
- Any non-determinism (random names, etc.) must be isolated behind a boundary and be seedable in tests.

Current-repo note:
- This remains a target-state rule.
- Repositories and several services still use direct `new Date()` calls, so new mechanics work should reduce that drift instead of expanding it.

## 2) Defaults (SHOULD)

### 2.1. Tech stack (recommended defaults)
Use the PRD MVP stack unless a concrete blocker is found:
- Vite + React + TypeScript
- React Router for routing
- localForage for IndexedDB
- zod for runtime validation at import/export and storage boundaries
- Zustand for client state orchestration once rule-driven flows need it
- UI primitives: lightweight local wrappers in `src/shared/ui/**` (Radix-based where helpful)
- Vitest + React Testing Library; Playwright for E2E

Implemented today (present in `package.json` and/or in active use):
- Vite + React + TypeScript
- React Router
- localForage
- zod
- Zustand (available; adopt when rule-driven orchestration needs it)
- Radix primitives (used by shared UI wrappers)
- react-zoom-pan-pinch (used for map pan/zoom)
- Lucide (icons)
- Vitest + React Testing Library
- Playwright

### 2.2. Type safety
- TypeScript should run in strict mode.
- Public boundaries must be typed: rules inputs/outputs, storage adapter, import/export schema, map metadata.
- Prefer `unknown` + runtime validation at boundaries (import/export) to avoid “trusting JSON”.

### 2.3. Testing strategy (fast-first)
- Unit test pure rules heavily; keep them free of React/DOM.
- Have at least one “smoke UI” test that renders the app and checks route shell.
- Add a minimal Playwright E2E smoke (home → campaigns → settings) early to catch bundling/routing regressions.

## 3) Definition of Done (DoD) for tickets
Every ticket (1–4h target) must include:
- Acceptance criteria (observable behavior)
- How to verify (commands + manual steps if needed)
- Tests updated/added (at least for rules; UI as appropriate)
- No rule logic in UI; no persistence in rules

## 4) Repo workflow and quality gates

### 4.1. Harness commands
- `make smoke` must stay fast and be the default local loop.
- `make preflight` is the “before PR” loop.

### 4.2. Minimum scripts (when the app exists)
Wire these in `package.json` (names are stable to match the harness):
- `lint`
- `typecheck`
- `test`
- `e2e` (recommended)

Current status:
- All four scripts exist and are wired.

## 5) Documentation hygiene
- `prd.md` remains the product source of truth unless explicitly replaced.
- Active implementation work should point to one current execution plan; completed plans belong in `PLANS/archive/`.
- When code and docs disagree, either fix the code or update the docs in the same task. Do not leave known drift undocumented.
- Keep one manual user-path checklist and one mechanics regression checklist; do not duplicate the same QA steps across multiple docs.
- Epic files remain the backlog/spec layer; the current implementation snapshot lives in `epics/00-index.md`.

## 6) “Don’t do this” (anti-patterns)
- UI components directly mutate persisted storage or call localForage.
- Rules read from global state, `Date.now()`, or random generators without boundaries.
- SVG template becomes the source of truth for adjacency/graph logic.
- Multi-day mega-PRs: break work into junior-sized tickets with verifiable outputs.
