# Tasker — Project Context Guide

## Project Overview

**Tasker** is a browser-based single-player strategy game for personal project execution. It transforms real-world tasks and projects into a game world where:
- **Campaigns** = projects
- **Regions** = phases or large workstreams
- **Provinces** = individual tasks/subtasks
- **Capital** = home hub showing campaign state
- **Fog of War** = task ambiguity
- **Siege** = procrastination/stalling mechanics

The MVP is a **backend-free offline SPA** that uses local storage (IndexedDB) for persistence, with JSON import/export for data portability.

### Core Technologies
- **Frontend:** React 19 + TypeScript + Vite
- **State Management:** Zustand
- **UI Components:** Radix Primitives, shadcn/ui patterns, Lucide icons
- **Styling:** Tailwind CSS
- **Persistence:** localForage (IndexedDB wrapper)
- **Routing:** React Router DOM
- **Maps:** SVG-based interactive campaign/region maps with `react-zoom-pan-pinch`
- **Validation:** Zod schemas
- **Testing:** Vitest (unit/integration), Playwright (E2E), React Testing Library

### Architecture Highlights
- **Domain logic** lives in `src/game/rules/**` as pure functions
- **Entities & schemas** in `src/entities/**` with Zod validation
- **Storage layer** in `src/storage/**` (repositories, migrations, import/export)
- **Map system** in `src/map/**` (SVG templates, map metadata, adjacency graphs)
- **Shared utilities** in `src/shared/**` (UI primitives, formatters, helpers)
- **Route pages** in `src/pages/**` (composition layer)

## Building and Running

### Prerequisites
- Node.js (v18+)
- npm

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript compile + Vite build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint static checks |
| `npm run typecheck` | TypeScript type checking (app + node configs) |
| `npm test` | Vitest unit/integration tests (watch mode) |
| `npm run test:run` | Vitest tests (single run) |
| `npm run e2e` | Playwright E2E tests |

### Makefile Targets (Agent Harness)

| Command | Description |
|---------|-------------|
| `make smoke` | Fast verification: structural + lint + test |
| `make preflight` | Full verification: smoke + typecheck (+ e2e if `E2E=1`) |
| `make smoke STRICT=1` | Strict mode: fail on warnings |
| `make agent-smoke` | Smoke + optional black-box checks |
| `make doctor` | Harness wiring status check |
| `make blackbox` | Structural black-box checks for refactors |

### Environment Variables for Make
- `STRICT=1` — fail on harness warnings
- `QUIET=1` — reduce output to one-line summaries
- `E2E=1` — include E2E in preflight
- `FAIL_FAST=1` — stop tests on first failure
- `ARTIFACTS_DIR` — output directory for test artifacts (default: `artifacts/`)

## Development Conventions

### Language Policy
- **Chat responses:** Russian
- **Repository artifacts (docs, comments, commit messages, UI copy):** English

### Code Style
- **TypeScript:** Strict mode enabled (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`)
- **Module system:** ESNext with `bundler` module resolution
- **Path aliases:** `@/*` maps to `src/*`
- **JSX:** `react-jsx` (React 17+ transform)

### Architecture Principles
1. **Domain rules are pure functions** — no storage dependencies in `src/game/rules/**`
2. **Storage is isolated** — repositories and migrations live in `src/storage/**`
3. **Map layering contract** — SVG template (view) separated from map metadata and adjacency graph (data)
4. **Time boundary** — use injectable clock for determinism (EPIC-01 contracts)
5. **No business logic in route components** — orchestrate through feature/use-case layer

### Testing Practices
- **Unit tests:** Co-located with source files (`*.test.ts`)
- **Integration tests:** `tests/integration/`
- **E2E tests:** `tests/*.spec.ts` (Playwright)
- **Test globals:** Vitest globals enabled (`describe`, `it`, `expect` without imports)

### Git & CI
- CI workflow: `.github/workflows/agent-harness.yml`
- Smoke tests run on pushes/PRs
- Artifacts stored in `artifacts/` (gitignored)

## Key Documentation

| File | Purpose |
|------|---------|
| `prd.md` | Product requirements (system of record) |
| `epics/00-index.md` | Epic backlog + MVP build order |
| `epics/IMPLEMENTATION-READINESS.md` | Implementation checklist |
| `docs/index.md` | Repository navigation map |
| `docs/architecture.md` | Module boundaries and data flow |
| `docs/testing.md` | Testing guide and commands |
| `AGENTS.md` | Agent interaction guidelines |

## Module Responsibilities

| Directory | Responsibility |
|-----------|----------------|
| `src/app/` | App shell, providers, routing, bootstrapping |
| `src/pages/` | Route-level screens (composition only) |
| `src/features/` | Use-case oriented UI + orchestration |
| `src/entities/` | Core types and Zod schemas (no storage) |
| `src/game/` | Mechanics, rules, transitions (pure functions) |
| `src/map/` | SVG view components, map metadata, adjacency data |
| `src/storage/` | IndexedDB adapter, repositories, migrations, import/export |
| `src/shared/` | Shared UI primitives, utilities, formatters |

## Current Implementation Status (March 2026)

| Epic | Status | Notes |
|------|--------|-------|
| EPIC-01 Foundation | ✅ Done | Contracts, state machine, meaningful action |
| EPIC-02 Bootstrap | ✅ Done | Vite/React/TS app, routing, tests, CI |
| EPIC-03 Domain + Persistence | ✅ Done | Entities, repos, migrations, import/export |
| EPIC-04 Map UI | 🟡 Partial | Campaign/region maps, SVG binding, pan/zoom |
| EPIC-05 Creation Flows | 🟡 Partial | CRUD flows, onboarding, tutorial seed |
| EPIC-06 Rule Engine | 🟡 Partial | Transitions, validation, roles, pressure |
| EPIC-07 Siege + Tactics | 🟡 Partial | Detection, 5 tactics, UI |
| EPIC-08 Daily Loop | 🟡 Partial | Check-in, Daily Orders, War Council |
| EPIC-10 Season | 🟡 Partial | Season rules, summary, debrief |
| EPIC-11 Feedback | 🟡 Partial | Hero moments, streaks, guardrails |
| EPIC-12 Instrumentation | 🟡 Partial | Event logger, export, viewer |
| EPIC-15 World Shell | 🟡 Partial | Capital, Chronicle, theming |

**P1 (Post-MVP):** EPIC-09 (Adaptation), EPIC-14 (Share cards)

## How to Finish a Task

1. Make the change following architecture principles
2. Run `make smoke` for fast feedback
3. Run `make agent-smoke` if relevant (black-box checks)
4. Run `make preflight` for full verification
5. Summarize changes and commands run

## Notes
- **No README.md exists** — this QWEN.md and `docs/index.md` serve as primary navigation
- **Backend-free MVP** — "backend" refers to in-browser domain logic, not a server
- **Offline-first** — app must work without network after initial load
- **No secrets** — never commit secrets or generated credentials
