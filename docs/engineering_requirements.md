# Engineering Requirements (MVP)

Purpose: turn the PRD + EPIC specs into implementation contracts that keep development fast, safe, and low-friction.

System of record:
- Product + stack overview: `prd.md` (see “Technical architecture (MVP)”)
- Mechanics and contracts: `epics/EPIC-01-foundation.md`
- Week 1 executable plan: `PLANS/EPIC-02-05-junior-tickets.md`

## 1) Non-negotiables (MUST)

### 1.1. Architecture boundaries
- **Rules are pure:** all domain rules and state transitions live in `src/game/rules/**` as pure functions (no storage, no UI, no timers, no network).
- **UI stays dumb:** UI components must not encode rule logic; they call typed use-cases/services and render state.
- **Storage is an adapter:** persistence lives in `src/storage/**` behind a small typed interface; no IndexedDB/localForage calls from UI or rules.
- **Map is layered:** SVG template is view-only; map metadata and adjacency graph are typed data independent from SVG.

### 1.2. Offline-first and data safety
- The app must be usable offline after initial load (no backend assumptions).
- Persistence uses IndexedDB (via localForage) and is resilient to refresh/tab restart.
- Import/export is supported for the full state; exported JSON includes a schema version and supports migrations.

### 1.3. Determinism and “time boundary”
- Any “current time” usage must be routed through a single boundary (injectable clock) so rules are deterministic and testable.
- Any non-determinism (random names, etc.) must be isolated behind a boundary and be seedable in tests.

## 2) Defaults (SHOULD)

### 2.1. Tech stack (recommended defaults)
Use the PRD MVP stack unless a concrete blocker is found:
- Vite + React + TypeScript
- Zustand for state management
- localForage for IndexedDB
- shadcn/ui + Radix (UI primitives)
- Vitest + React Testing Library; Playwright for E2E

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

## 5) “Don’t do this” (anti-patterns)
- UI components directly mutate persisted storage or call localForage.
- Rules read from global state, `Date.now()`, or random generators without boundaries.
- SVG template becomes the source of truth for adjacency/graph logic.
- Multi-day mega-PRs: break work into junior-sized tickets with verifiable outputs.

