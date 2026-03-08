# Tasker — Project Context for AI Assistants

## Project Overview

**Tasker** is a browser-based single-player strategy game for personal project execution. Real tasks become "provinces" on a strategic map, and procrastination becomes game situations (fog of war, sieges) solved through short rituals and tactics. The MVP is a **backend-free, offline-first SPA** using local storage (IndexedDB).

### Core Concept
- **Campaigns** = Projects with fantasy naming (seasons, clans, banners)
- **Regions** = Phases/large tasks within campaigns
- **Provinces** = Individual tasks/subtasks with state machine logic
- **Fog of War** = Unclear tasks (missing outcome/first step/entry time)
- **Siege** = Stalled tasks (no meaningful action for 3 days) with 5 resolution tactics
- **21-day Seasons** = Structured progress cycles with debrief rituals

### Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript + Vite |
| State | Zustand |
| Storage | localForage (IndexedDB) |
| Routing | React Router v7 |
| UI | shadcn/ui + Radix Primitives |
| Testing | Vitest (unit) + Playwright (E2E) |
| Validation | Zod |
| Icons | Lucide |

## Repository Structure

```
src/
├── app/              # App shell, routing, main entry point
├── entities/         # Domain types and schemas (types.ts)
├── features/         # Use-case oriented feature modules
├── game/             # Core game logic
│   └── rules/        # Pure functions for state transitions
├── map/              # SVG map rendering + metadata + graph
├── pages/            # Route components (Home, Campaigns, Settings)
├── shared/           # Shared utilities and UI primitives
│   └── theme/        # Theming tokens
└── storage/          # IndexedDB adapter + migrations + import/export
```

### Key Documentation
| File | Purpose |
|------|---------|
| `prd.md` | Product requirements (system of record) |
| `epics/00-index.md` | Epic backlog + build order |
| `epics/EPIC-01-foundation.md` | Shared contracts (state machine, meaningful action, events) |
| `docs/index.md` | Documentation hub |
| `PLANS/EPIC-02-05-junior-tickets.md` | Executable junior ticket plan |

## Building and Running

### Development
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production (tsc + vite build)
npm run preview      # Preview production build
```

### Verification
```bash
make smoke           # Fast verification: structural + lint + test
make preflight       # Full verification: structural + lint + typecheck + test
make doctor          # Check harness wiring status

# Direct commands
npm run lint         # ESLint checks
npm run typecheck    # TypeScript checks (app + node configs)
npm run test         # Vitest (unit tests)
npm run test:run     # Vitest run mode
npm run e2e          # Playwright E2E tests
```

### Strict Mode
```bash
make smoke STRICT=1    # Fail on warnings
make preflight STRICT=1
```

## Development Conventions

### Language Policy
- **Chat responses**: Russian (for user communication)
- **Repository artifacts**: English (documentation, comments, commit messages, UI copy)

### Code Style
- **Strict TypeScript**: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- **ESLint**: Configured in `eslint.config.mjs` with `@eslint/js` and `typescript-eslint`
- **Module resolution**: `bundler` mode with `@/*` path alias to `src/*`
- **Import organization**: Prefer explicit imports; avoid circular dependencies

### Architecture Principles
1. **Domain rules in `game/rules/`**: Pure functions over typed inputs/outputs
2. **UI contains no rule logic**: Components consume rules, don't implement them
3. **Storage adapter isolated**: `storage/` handles IndexedDB + migrations
4. **Map layers separated**: Visual SVG template vs. map metadata vs. adjacency graph
5. **No backend**: All logic runs client-side; offline-first by design

### Testing Practices
- **Unit tests**: Vitest + React Testing Library, colocated with source (`*.test.tsx`)
- **E2E tests**: Playwright in `tests/` directory
- **Test isolation**: Unit tests exclude `tests/**` (E2E directory)
- **Smoke tests**: Verify app renders and basic navigation works

### Git Workflow
- Feature branches off `main`
- Run `make smoke` before committing
- Commits should be atomic and focused

## Domain Model (MVP)

### Province State Machine
```
fog → ready        (clarify: outcome + first step + entry time)
ready → in_progress (first real step recorded)
ready → siege      (no meaningful action for 3 days)
siege → ready      (tactic applied)
ready → fortified  (high effort + no decomposition)
in_progress → captured (completed)
any → retreated    (consciously deferred)
```

### Progress Stages (non-binary)
`scouted (15%)` → `prepared (30%)` → `entered (55%)` → `held (80%)` → `captured (100%)`

### Siege Tactics
1. **Scout** — Clarify what to do
2. **Supply** — Prepare environment/context
3. **Siege Engineer** — Split into 3-5 micro-steps
4. **5-minute Raid** — Smallest entry step
5. **Retreat** — Reschedule or remove

## Current Implementation Status

### Completed
- ✅ Project bootstrap (EPIC-02): Vite + React + TypeScript
- ✅ Basic routing: Home, Campaigns, Settings pages
- ✅ Domain types: Full entity schema in `src/entities/types.ts`
- ✅ Test infrastructure: Vitest + Playwright configured
- ✅ Agent harness: Makefile with smoke/preflight targets
- ✅ CI workflow: GitHub Actions configured

### In Progress / TODO
- ⏳ Domain persistence (EPIC-03): IndexedDB repos + migrations + import/export
- ⏳ Map UI (EPIC-04): SVG campaign/region maps
- ⏳ Creation flows (EPIC-05): CRUD for campaigns/regions/provinces
- ⏳ Rule engine (EPIC-06): State transitions + fog/siege logic
- ⏳ Daily loop (EPIC-08): Daily Orders + War Council
- ⏳ Season system (EPIC-10): 21-day seasons + debrief

## Working with This Codebase

### Adding a New Feature
1. Check `epics/00-index.md` for epic mapping
2. Read relevant foundation contracts in `epics/EPIC-01-foundation.md`
3. Implement domain types in `src/entities/types.ts`
4. Add pure rule logic in `src/game/rules/`
5. Build UI components in `src/pages/` or `src/features/`
6. Add tests (unit + E2E if user-facing)
7. Run `make smoke` before committing

### Adding a New Entity
1. Define TypeScript interface in `src/entities/types.ts`
2. Add to `AppState` interface for persistence
3. Create repository in `src/storage/` (when EPIC-03 is implemented)
4. Add Zod schema for validation (when EPIC-03 is implemented)

### Map Implementation Notes
- SVG stays as a **view concern** (DOM-native hover/click)
- Map metadata (anchors, labels, badges) separate from SVG template
- Adjacency graph data independent from visual rendering
- Use `react-zoom-pan-pinch` for pan/zoom (MVP)

## Common Pitfalls

1. **Dashboard drift**: Enforce map-first surfaces; use shadcn/Radix as interaction mechanics, not layout templates
2. **Gaming the system**: Rewards only for meaningful actions (see EPIC-01 Appendix A guardrails)
3. **Too much manual input**: Strict limit on required fields (3-5 max for creation)
4. **Rule logic in UI**: Keep domain rules in `game/rules/` as pure functions
5. **Timestamp handling**: Use local timezone; `updatedAt` on any mutation, `lastMeaningfulActionAt` only on meaningful actions

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `make smoke` | Fast verification loop |
| `make preflight` | Full verification before commit |
| `npm run typecheck` | TypeScript validation |
| `npm run e2e` | Playwright E2E tests |

| Surface | File |
|---------|------|
| App entry | `src/app/main.tsx` |
| Router | `src/app/App.tsx` |
| Domain types | `src/entities/types.ts` |
| Product spec | `prd.md` |
| Epic index | `epics/00-index.md` |
