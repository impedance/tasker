# Tasker — Project Context

## Project Overview

**Tasker** is a browser-based single-player strategy game for personal project execution. It transforms task management into a strategic campaign where:
- **Projects** become **campaigns** on a map
- **Tasks** become **provinces** to capture
- **Procrastination** becomes **fog of war** and **sieges**
- **Real progress** fuels game advancement

**MVP Goal:** Validate that a "progress map instead of task list" mechanic increases task initiation and reduces procrastination through game-like rituals.

### Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript + Vite |
| State | Zustand |
| Storage | localForage (IndexedDB) |
| Routing | React Router v7 |
| Validation | Zod |
| Testing | Vitest + React Testing Library, Playwright (E2E) |
| UI | shadcn/ui + Radix Primitives (planned) |

### Architecture
```
src/
├── app/          # App shell, providers, routing, bootstrap
├── entities/     # Core domain types (Campaign, Region, Province, etc.)
├── features/     # Use-case oriented UI + orchestration
├── game/         # Domain rules (pure functions in rules/)
├── map/          # SVG map components + metadata + adjacency graph
├── pages/        # Route-level screen composition
├── shared/       # Shared UI primitives, utilities, theme
└── storage/      # Persistence adapter, repositories, migrations
```

**Key Principles:**
- Domain rules in `src/game/rules/**` are pure functions (no storage/UI/timers)
- UI components contain no rule logic — they call typed use-cases
- Storage is isolated behind repository interfaces in `src/storage/**`
- Map SVG is view-only; adjacency/graph data is separate typed data

## Building and Running

### Prerequisites
- Node.js 18+
- npm

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run Vitest tests (watch mode) |
| `npm run test:run` | Run Vitest tests (single run) |
| `npm run e2e` | Run Playwright E2E tests |

### Make Targets (Agent Harness)

| Target | Description |
|--------|-------------|
| `make smoke` | Fastest verification: structural checks + lint + test |
| `make preflight` | Full verification: structural + lint + typecheck + test |
| `make smoke STRICT=1` | Strict smoke (fails on warnings) |
| `make doctor` | Show harness configuration status |
| `make agent-smoke` | Optional black-box checks (if configured) |

### Week 1 Exit Criteria (DoD)
- User can create Campaign → Region → Province
- Provinces appear on SVG region map (or "unplaced" list)
- Data persists across refresh
- JSON import/export works

## Development Conventions

### Language Policy
- **Chat responses:** Russian
- **Repository artifacts (docs, comments, commit messages, UI copy):** English

### Code Style
- TypeScript strict mode enabled
- Module resolution: `bundler`
- Path alias: `@/*` → `src/*`
- No unused locals/parameters
- No fallthrough in switch cases

### Testing Practices
- Unit test pure rules heavily (no React/DOM dependencies)
- At least one smoke UI test rendering the app shell
- Minimal Playwright E2E for routing/regression catches
- Keep default tests fast and offline

### Task Sizing
- Target: 1–4 hours per ticket
- Every task must have acceptance criteria + verification steps
- Avoid multi-day mega-PRs

### Key Documentation (System of Record)
| File | Purpose |
|------|---------|
| `prd.md` | Product requirements + spec |
| `epics/00-index.md` | Epic backlog + build order |
| `epics/EPIC-01-foundation.md` | Shared contracts (meaningful action, time boundary, events) |
| `PLANS/EPIC-02-05-junior-tickets.md` | Executable Week 1 ticket plan |
| `docs/index.md` | Documentation hub / code map |
| `docs/architecture.md` | Module boundaries + data flow |
| `docs/engineering_requirements.md` | Implementation contracts |
| `docs/testing.md` | Testing strategy |
| `AGENTS.md` | Agent instructions + fast commands |

### Province State Machine (Core Mechanic)
```
fog → ready       (clarity fields filled: outcome/firstStep/entryTime)
ready → in_progress (first real step recorded)
ready → siege     (no meaningful action for 3 days)
siege → ready     (tactic applied)
in_progress → captured (marked done)
any → retreated   (consciously deferred)
```

### Province Progress Stages
```
scouted (15%) → prepared (30%) → entered (55%) → held (80%) → captured (100%)
```

### Invariants
- Rewards only for **meaningful actions** (never for app opens or passive browsing)
- No punitive mechanics (no territory loss, no streak shame)
- Copy layering: fantasy-first on map/home, plain language on action screens
- Offline-first, backend-free, local storage with JSON import/export
