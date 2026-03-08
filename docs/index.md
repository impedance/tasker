# Documentation Hub (system-of-record map)

Keep this file short. Prefer links over duplication.

Status note (2026-03-08):
- `prd.md` and `epics/**` define the target MVP architecture.
- The current repository implements only the bootstrap slice plus part of EPIC-03 (`src/app`, `src/pages`, `src/entities`, `src/storage`).
- Treat paths under `src/features`, `src/game`, `src/map`, and `src/shared` as planned boundaries until they land in code.

## Start Here
- Product spec (system of record): `prd.md`
- Epic backlog + build order: `epics/00-index.md`
- Executable junior tickets (Week 1): `PLANS/EPIC-02-05-junior-tickets.md`
- Engineering requirements (how we build): `docs/engineering_requirements.md`
- Architecture blueprint (module boundaries): `docs/architecture.md`
- Testing rules: `docs/testing.md`
- Harness plan (discovery): `docs/harness_plan.md`

## Fast Commands
- `make smoke` — fastest verification loop
- `make preflight` — broader verification loop
- `make doctor` — harness wiring status
- `npm run lint` — ESLint 80/20 static checks for TS/TSX
- `npm run typecheck` — TypeScript checks for app + config files

## Code Map (current vs target)
- Current:
  - Entrypoints: `src/app/main.tsx`, `src/app/App.tsx`
  - Route pages: `src/pages/**`
  - Domain entities + validation: `src/entities/**`
  - Storage + migrations + import/export: `src/storage/**`
- Target MVP boundaries:
  - Core domain rules: `src/game/rules/**`
  - Features / use-case orchestration: `src/features/**`
  - Map layer (SVG + metadata + graph): `src/map/**`
  - Shared UI/theme/utilities: `src/shared/**`

## Typing Surfaces
- Current:
  - Persistence boundary: `src/storage/**` — storage adapter interfaces + migration contracts
  - Import/export boundary: `src/storage/import-export.ts` — exported JSON schema types + versioning
  - Entity boundary: `src/entities/**` — domain types + runtime validation
- Planned:
  - Rules boundary: `src/game/rules/**` — pure functions over typed inputs/outputs
  - Map boundary: `src/map/**` — typed map meta + adjacency graph; SVG stays a view concern

## Test Map (planned)
- Smoke path: `npm test` (Vitest) via `make smoke`
- Full path: `npm run lint`, `npm run typecheck`, `npm test` via `make preflight`
- E2E path: `npm run e2e` (Playwright) — wired in CI, optional locally when host-mode is available
