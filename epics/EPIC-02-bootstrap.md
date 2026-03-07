# EPIC-02 — Tech setup and project bootstrap

**ID:** `EPIC-02`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD reference:** `prd.md` (Architecture, weekly plan)

## 1) Objective (Outcome)
Ship a working SPA skeleton (React+TS+Vite) with tests and basic automation so juniors can implement features without infrastructure blockers.

## 3) Scope
**In scope:**
- project initialization and folder layout;
- minimal routing and layout;
- unit test runner + smoke tests;
- Playwright E2E smoke;
- minimal CI workflow.

**Out of scope:**
- domain rules implementation (EPIC-03/06);
- full design system.

## 4) Deliverables
- Working dev/build/preview scripts.
- Basic navigation between 2–3 stub screens.
- Vitest + RTL configured with at least 1–2 smoke tests.
- Playwright E2E smoke scenario.
- CI runs checks.

## 6) Work breakdown

### T1. Initialize Vite + React + TypeScript
**Steps:**
1) Create Vite React TS app.
2) Add `npm` scripts: dev/build/test/e2e/lint/format (if used).
3) Verify the app renders.
**Acceptance criteria:**
- `npm run dev` starts and renders a page.
**DoD:**
- Repo contains a working app with `package.json`.
**Estimate:** `L`

### T2. Create `src/` skeleton per PRD
**Steps:**
1) Create folders: `app/pages/entities/features/game/storage/shared`.
2) Add `App` and 2–3 page stubs.
3) Optional: configure import aliases.
**Acceptance criteria:**
- Clean imports; no circular dependencies.
**DoD:**
- Folder structure matches PRD intent.
**Estimate:** `M`

### T3. Add basic routing and layout
**Steps:**
1) Add React Router.
2) Implement minimal layout (header/nav).
3) Wire routes for 3–5 pages (capital / campaign map / region map / province drawer / chronicle) as stubs.
**Acceptance criteria:**
- Direct URL navigation to each page works.
**DoD:**
- Routing is stable.
**Estimate:** `M`

### T4. Configure Vitest + React Testing Library
**Steps:**
1) Add Vitest + RTL.
2) Add one App render smoke test.
**Acceptance criteria:**
- `npm test` is green.
**DoD:**
- Unit tests run locally and in CI.
**Estimate:** `M`

### T5. Configure Playwright + E2E smoke
**Steps:**
1) Add Playwright.
2) Add a smoke test: open home → navigate to a map page.
3) Configure CI execution (headless).
**Acceptance criteria:**
- E2E passes reliably (3 consecutive runs).
**DoD:**
- E2E smoke exists and runs in CI.
**Estimate:** `L`

### T6. Add minimal CI workflow
**Steps:**
1) CI: install → unit → build → (optional) e2e.
2) Add cache for dependencies.
**Acceptance criteria:**
- PR checks run successfully.
**DoD:**
- CI is present and green on main.
**Estimate:** `M`
