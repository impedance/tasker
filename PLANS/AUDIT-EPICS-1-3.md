# Detailed Audit Report: Epics 1, 2, and 3

This document provides a comprehensive and detailed analysis of the implementation status of Epics 1, 2, and 3 against the PRD, architecture constraints, and epic tickets.

## Epic 1: Product Foundation (Contracts & Definitions)
**Status:** ✅ Completed (Documentation Only)
Epic 1 (`EPIC-01-foundation.md`) consists entirely of defining the domain language, state machines, and metrics. It acts as a reference document for Epics 3, 6, and 12.
* **T1. Glossary:** Present in Appendix Z.
* **T2. Province state machine:** Present in Appendix D.
* **T3. Meaningful move:** Present in Appendix C.
* **T4. Time contract:** Present in Appendix E.
* **T5. Minimal event schema:** Present in Appendix B.
* **T6. Healthy-engagement guardrails:** Present in Appendix A.
* **Code Impact:** The definitions from Epic 1 heavily influence the Types and Schemas created in Epic 3 (`src/entities/schemas.ts`). These schemas correctly reflect the states (fog, ready, siege), move types, and entity structures defined here.

## Epic 2: Tech Setup and Project Bootstrap
**Status:** ⚠️ Partially Completed (Missing UI Primitives)
Epic 2 (`EPIC-02-bootstrap.md`) sets up the developer environment, CI, and minimal UI skeleton.
* **T1. Initialize Vite + React + TS:** ✅ Done (`package.json`, Vite config exist).
* **T2. Create `src/` skeleton:** ✅ Done. Folders match PRD (`app`, `pages`, `entities`, `features`, `game`, `map`, `storage`, `shared`).
* **T3. Basic routing and layout:** ✅ Done. `App.tsx` contains React Router with 3 stub pages.
* **T4. Vitest + RTL:** ✅ Done. `App.test.tsx` exists and runs.
* **T5. Playwright + E2E:** ✅ Done. Tests exist and are wired in CI.
* **T6. Minimal CI workflow:** ✅ Done. GitHub actions exist (`ci.yml`).
* **T7. Initialize UI primitives (shadcn/ui):** ❌ **MISSING**. 
  * Epic 2 explicitly states: *"Goal: prevent juniors from building ad-hoc UI primitives... Add shadcn/ui to the repo... Add 5–8 base components as 'thin foundation': Button, IconButton, Panel, Drawer/Sheet, Dialog, Tabs, Input, Badge."*
  * **Finding:** `src/shared/` is empty except for `theme/`. No shadcn/ui components exist. `package.json` lacks dependencies like `lucide-react`, `tailwind-merge`, `clsx`, or Radix UI primitives.

## Epic 3: Domain Model and Local Persistence
**Status:** ❌ Architecturally Flawed & Incomplete
Epic 3 (`EPIC-03-domain-persistence.md`) implements data structures and localForage storage. While the *code* exists, it violates the constraints and misses a critical helper.
* **T1. Runtime validation (zod):** ✅ Done. `src/entities/schemas.ts` defines full Zod validation.
* **T2. P0 entity types:** ✅ Done. `src/entities/types.ts` is populated.
* **T3. Storage adapter & key namespaces:** ❌ **FAILED**. 
  * The spec requires entity-level key namespaces (`campaign:<id>`, `region:<id>`).
  * The implementation uses a **monolithic blob** (`tasker:app-state`), reading and writing the entire database into memory for every single CRUD operation. This will cause severe performance degradation and data loss conditions in a concurrent environment.
* **T4 & T5. Campaign/Region Repositories:** ⚠️ Functionally present, but built on top of the flawed monolithic storage adapter.
* **T6. Province Repository:** ❌ **INCOMPLETE**. 
  * Basic CRUD exists, but the required helper `findFirstFreeMapSlotId(region)` was **omitted entirely**. This helper is a strict dependency for Epic 5 (Creation flows).
* **T7. Schema versioning + migrations:** ✅ Done (technically). `migrations.ts` handles versioning, though again, bound to the monolithic state.
* **T8. JSON export/import:** ✅ Done. Logic exists in `import-export.ts`.
* **Adjacency Validation:** ❌ **MISSING**. `EPIC-03` requires: *"Support adjacency lists on provinces (store + validate IDs)."* Repositories do not perform any adjacency validation.

---

## Conclusion & Action Plan for Remediation

Before proceeding to Epic 4 (Map UI) or Epic 5 (Creation Flows), the following technical debt **must** be resolved to prevent cascading architectural failures:

### 1. Re-architect Storage (Priority: Critical)
**Files to change:** `storage.ts`, `repositories.ts`, `migrations.ts`, `import-export.ts`, `tutorial-seed.ts`
* We must delete the monolithic `KEY_APP_STATE` logic.
* Implement itemized storage using `localForage`:
  * `campaign:<uuid>` -> `{...campaignData}`
  * `region:<uuid>` -> `{...regionData}`
  * `province:<uuid>` -> `{...provinceData}`
* Update all repository CRUD methods to read/write specific keys using `db.getItem()` and `db.setItem()`.
* Update `importAppState` and `exportAppState` to iterate over all DB keys instead of reading a single state object.

### 2. Add Missing Helpers (Priority: High)
**Files to change:** `repositories.ts`
* Implement `provinceRepository.findFirstFreeMapSlotId(regionId)`. This will require cross-referencing a region's configured `mapTemplateId` against assigned slots. (Note: Since templates aren't fully defined yet, this might need a stub template definition or a robust generic algorithm).
* Add adjacency list validation to `create` and `update` logic in `provinceRepository`.

### 3. Bootstrap UI Primitives (Priority: Medium)
**Files to change:** `package.json`, `tailwind.config.js` (needs creation), `src/shared/ui/*`
* Install Tailwind CSS and initialize it.
* Install `shadcn/ui` and configure it.
* Scaffold the base components required by Epic 2 (Button, Input, Drawer, Panel, etc.) so Epic 4 and 5 development isn't blocked.
