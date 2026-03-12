# Documentation Hub (system-of-record map)

Keep this file short. Prefer links over duplication.

## Start Here
- Product spec (system of record): `prd.md`
- Epic backlog + build order: `epics/00-index.md`
- Current implementation alignment checklist: `epics/IMPLEMENTATION-READINESS.md`
- Bootstrap execution source: `epics/00-index.md` + `epics/EPIC-02-bootstrap.md` ... `epics/EPIC-05-creation-flows.md`
- Engineering requirements (how we build): `docs/engineering_requirements.md`
- Architecture blueprint (module boundaries): `docs/architecture.md`
- Testing rules: `docs/testing.md`
- Manual QA checklist: `docs/E2E-CHECKLIST.md`
- Mechanics QA checklist: `epics/QA-MECHANICS-CHECKLIST.md`

## Fast Commands
- `make smoke` — fastest verification loop
- `make preflight` — broader verification loop
- `make doctor` — harness wiring status
- `npm run lint` — ESLint 80/20 static checks for TS/TSX
- `npm run typecheck` — TypeScript checks for app + config files
- `npm test` — unit/integration tests (Vitest)
- `npm run e2e` — Playwright E2E (requires `npx playwright install`)

## Code Map
- Entrypoints: `src/app/main.tsx`, `src/app/App.tsx`
- Route pages: `src/pages/**`
- Map UI: `src/pages/MapPage.tsx`, `src/map/**`, `public/assets/maps/**`
- Domain entities + validation: `src/entities/**`
- Storage + migrations + import/export: `src/storage/**`
- Shared UI/theme/utilities: `src/shared/**`
- Rules/services: `src/game/**`
- Planned vertical feature layer: `src/features/**`

## Typing Surfaces
- Entity types: `src/entities/types.ts`
- Repository API surface: `src/storage/repositories.ts`
- Storage adapter: `src/storage/storage.ts`
- Migrations: `src/storage/migrations.ts`
- Import/export schema + versioning: `src/storage/import-export.ts`

## Test Map
- Smoke: `make smoke` (structural + `npm run lint` + `npm test`)
- Preflight: `make preflight` (smoke + `npm run typecheck`)
- E2E: `make e2e` / `npm run e2e` (optional; requires `npx playwright install`). Include in `make preflight` via `E2E=1`.

## Archive
- Historical plans that are no longer execution sources live in `PLANS/archive/`.
- Completed execution plans should be archived once their outcomes are reflected in the active docs.
- `PLANS/archive/EPIC-16-17-18-hardening-and-alignment.md` is historical context for the March 2026 hardening pass.
