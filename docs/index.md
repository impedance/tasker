# Documentation Hub (system-of-record map)

Keep this file short. Prefer links over duplication.

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

## Code Map (planned after EPIC-02 bootstrap)
- **Entrypoints (web app):** `src/app/main.tsx`, `src/app/App.tsx`
- **Pages / routes:** `src/pages/**`
- **Core domain logic (pure rules):** `src/game/rules/**`
- **Domain entities + types:** `src/entities/**`
- **Features (use-case oriented):** `src/features/**`
- **Map layer (SVG + metadata + graph):** `src/map/**`
- **Storage + migrations + import/export:** `src/storage/**`
- **Shared utilities + UI primitives:** `src/shared/**`

## Typing Surfaces (planned)
- Rules boundary: `src/game/rules/**` — pure functions over typed inputs/outputs
- Persistence boundary: `src/storage/**` — storage adapter interfaces + migration contracts
- Import/export boundary: `src/storage/import_export/**` — exported JSON schema types + versioning
- Map boundary: `src/map/**` — typed map meta + adjacency graph; SVG stays a view concern

## Test Map (planned)
- Smoke path: `npm test` (Vitest) via `make smoke`
- Full path: `npm run lint`, `npm run typecheck`, `npm test` via `make preflight`
- E2E path: `npm run e2e` (Playwright) — wired in CI, optional locally when host-mode is available
