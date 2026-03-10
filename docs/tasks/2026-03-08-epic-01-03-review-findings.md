# EPIC-01..03 review findings and fix list

Date: 2026-03-08
Scope reviewed:
- `EPIC-01` foundation contracts
- `EPIC-02` bootstrap
- `EPIC-03` domain + persistence

Outcome:
- The repo is not ready to claim "done through EPIC-03".
- `EPIC-04` should not start as the next clean phase until the blocking items below are fixed.

## Priority order

1. Restore green verification (`make smoke`, `make preflight`)
2. Fix broken EPIC-03 persistence boot flow
3. Fix import/migration order so old snapshots can be imported
4. Complete missing EPIC-03 deliverables
5. Reconcile docs with actual implementation state

## Blocking findings

### 1. Lint is failing in storage error handling

Severity: High

Problem:
- `make smoke` and `make preflight` currently fail on ESLint.
- The rule complains that thrown errors drop the original cause.

Where to fix:
- `src/storage/storage.ts`

Relevant lines:
- `src/storage/storage.ts:48`
- `src/storage/storage.ts:73`
- `src/storage/storage.ts:103`
- `src/storage/storage.ts:115`
- `src/storage/storage.ts:145`
- `src/storage/storage.ts:175`

What is wrong:
- The code does `throw new Error("...")` inside `catch` blocks without preserving `error` as `cause`.

Expected fix:
- Preserve the original error when rethrowing.
- Keep the current user-facing message, but attach `cause`.

Suggested approach:
- Replace patterns like `throw new Error("Failed to initialize storage")`
- With `throw new Error("Failed to initialize storage", { cause: error })`
- Apply the same fix consistently to all rethrows in this file.

Done when:
- `npm run lint` passes.
- `make smoke` no longer fails on this file.

### 2. Typecheck is failing in migrations

Severity: High

Problem:
- `npm run typecheck` fails.

Where to fix:
- `src/storage/migrations.ts:81`

What is wrong:
- `new Error(..., { cause })` is used in a way that does not match the current TypeScript/lib configuration.

Expected fix:
- Make the error handling compile with the current TS setup.

Suggested approach:
- Either adjust the TS/lib target so `ErrorOptions` is supported cleanly, or rewrite the error wrapping in a way that passes typecheck.
- Keep the original migration error available for debugging.

Done when:
- `npm run typecheck` passes.
- `make preflight` reaches the next stage.

### 3. Storage initialization is defined but never executed on app startup

Severity: High

Problem:
- The storage layer has initialization code, but the app does not call it before rendering.

Where to fix:
- `src/storage/storage.ts`
- `src/app/main.tsx`

Relevant lines:
- `src/storage/storage.ts:40`
- `src/app/main.tsx:1`

What is wrong:
- `initStorage()` exists, but `main.tsx` renders `App` immediately.
- This means bootstrap-time storage setup is not guaranteed.

Expected fix:
- Run storage initialization before or during app bootstrap.
- Decide on a simple failure path for MVP: render fallback UI, log hard failure, or block render until init completes.

Suggested approach:
- Add a bootstrap function in `main.tsx`.
- Await `initStorage()` before calling `ReactDOM.createRoot(...).render(...)`.
- Keep the startup path simple and deterministic.

Done when:
- App startup explicitly initializes storage.
- Initial render path is deterministic and reviewable.

### 4. Migrations are not run on normal app startup

Severity: High

Problem:
- `EPIC-03` requires schema migration on startup.
- Current code only uses `migrate()` during import flow.

Where to fix:
- `src/storage/migrations.ts`
- `src/storage/storage.ts`
- `src/app/main.tsx`

Relevant lines:
- `src/storage/migrations.ts:58`
- `src/storage/import-export.ts:108`
- `src/app/main.tsx:1`

What is wrong:
- Existing local state in IndexedDB is not upgraded during normal app boot.
- A user with older persisted data would never be migrated unless they manually export/import.

Expected fix:
- Add a startup migration path.

Suggested approach:
- On app boot:
  - load current app state;
  - compare `schemaVersion` with `CURRENT_SCHEMA_VERSION`;
  - run `migrate()` when needed;
  - persist the migrated result back to storage.
- Keep this logic in storage/bootstrap code, not in route pages.

Done when:
- Existing persisted state is upgraded automatically on startup.
- Startup migration behavior is testable.

### 5. Import validates against current schema before migration

Severity: High

Problem:
- Old exports cannot be reliably imported.

Where to fix:
- `src/storage/import-export.ts`

Relevant lines:
- `src/storage/import-export.ts:67`
- `src/storage/import-export.ts:75`
- `src/storage/import-export.ts:108`

What is wrong:
- The code does:
  1. basic validation,
  2. current `AppStateSchema` validation,
  3. only then `migrate(parsedState)`.
- This defeats the purpose of migrations for older schema versions.

Expected fix:
- Parse and validate enough structure to detect version and required top-level shape.
- Run migration first.
- Validate the migrated result against the current schema after migration.

Suggested approach:
- Split validation into two phases:
  - pre-migration validation: minimal structure and version checks;
  - post-migration validation: strict `AppStateSchema.safeParse(...)`.

Done when:
- Older schema snapshots can be migrated and imported.
- Current-version snapshots still validate strictly.

### 6. Export blob helper is broken

Severity: Medium

Problem:
- The export helper returns an empty file payload.

Where to fix:
- `src/storage/import-export.ts:29`

What is wrong:
- `exportAppStateAsBlob()` returns `new Blob([], ...)`, so the caller would get an empty JSON file.

Expected fix:
- Build the blob from the actual exported state JSON.

Suggested approach:
- Reuse `exportAppState()` or share a helper that serializes the current state once.
- Ensure the blob contains the same JSON as the text export path.

Done when:
- Exported file content matches `exportAppState()`.

### 7. Settings page does not expose import/export UI required by EPIC-03

Severity: Medium

Problem:
- `EPIC-03` explicitly requires a minimal Settings entry for import/export.
- Settings is still a placeholder page.

Where to fix:
- `src/pages/SettingsPage.tsx`
- likely plus wiring to `src/storage/import-export.ts`

Relevant lines:
- `src/pages/SettingsPage.tsx:1`
- `epics/EPIC-03-domain-persistence.md:80`

What is wrong:
- The page says import/export will be added later, but this is part of the current epic deliverable.

Expected fix:
- Add the minimum viable UI:
  - export button
  - import file input or paste area
  - success/error message rendering

Suggested approach:
- Keep the UI intentionally simple.
- Do not build a design system around this yet.
- Wire directly to the existing import/export functions first.

Done when:
- A user can export current state and import a valid JSON snapshot from Settings.

### 8. EPIC-03 repositories are incomplete

Severity: Medium

Problem:
- Only three repositories exist.
- `EPIC-03` deliverables cover more entities than `Campaign`, `Region`, and `Province`.

Where to fix:
- `src/storage/repositories.ts`
- potentially split into multiple files if that improves clarity

Relevant lines:
- `src/storage/repositories.ts:63`
- `src/storage/repositories.ts:189`
- `src/storage/repositories.ts:320`
- `epics/EPIC-03-domain-persistence.md:23`

What is wrong:
- Missing CRUD surfaces for entities such as:
  - `Season`
  - `PlayerProfile`
  - `DailyMove`
  - `SiegeEvent`
  - `IfThenPlan`
  - and extended entities already present in `src/entities/types.ts`

Expected fix:
- Implement the missing repositories or clearly reduce the deliverable scope in docs.

Suggested approach:
- Prefer consistent repository APIs:
  - `getById`
  - `list`
  - `create`
  - `update`
  - `delete`
- Add relationship/query helpers only where needed by current epics.

Done when:
- Repo coverage matches the entities claimed in `EPIC-03`, or the docs are explicitly narrowed.

### 9. No persistence integration tests for CRUD, migrations, and roundtrip import/export

Severity: Medium

Problem:
- The repo has only app-shell tests right now.
- `EPIC-03` requires persistence tests.

Where to fix:
- add tests under `src/storage/**` or `tests/**`

Relevant lines:
- `src/app/App.test.tsx:1`
- `tests/smoke.spec.ts:1`
- `epics/EPIC-03-domain-persistence.md:91`

What is wrong:
- There are no tests covering:
  - repository CRUD
  - relationship consistency
  - migration behavior
  - export/import roundtrip

Expected fix:
- Add focused tests around persistence behavior before building more features on top.

Suggested test list:
- create campaign -> create region -> create province -> relationship arrays stay consistent
- deleting campaign removes nested regions/provinces
- import old snapshot -> migrate -> validate -> save
- export -> import roundtrip preserves state

Done when:
- Persistence test suite exists and runs in CI/local verification.

### 10. Tutorial seed and persistence helpers are not wired into the app

Severity: Medium

Problem:
- Several useful persistence helpers exist but are not used by the UI.

Where to fix:
- `src/storage/tutorial-seed.ts`
- `src/app/main.tsx`
- route/page components that should consume loaded data

Relevant lines:
- `src/storage/tutorial-seed.ts:233`
- `src/storage/storage.ts:40`

What is wrong:
- `loadTutorialIfFirstRun()` exists, but nothing calls it.
- The repository currently exposes domain/persistence code that the visible UI does not use.

Expected fix:
- Decide whether tutorial seeding is part of the current slice.
- If yes, wire it during app bootstrap.
- If not, remove or document it as planned-only.

Done when:
- The tutorial path is either active and tested, or clearly marked as future work.

## EPIC-02 gaps still open

### 11. UI primitives layer from EPIC-02 is not present

Severity: Medium

Problem:
- `EPIC-02` says the bootstrap should include a minimal primitives layer under `src/shared/ui/` or equivalent.
- The directory exists conceptually, but there are no files in `src/shared/`.

Where to fix:
- `src/shared/`
- `src/app/App.tsx`
- any first consumer page

Relevant lines:
- `epics/EPIC-02-bootstrap.md:98`
- `src/app/App.tsx:1`

What is wrong:
- The current shell is plain CSS and page stubs only.
- There is no reusable foundation for Button/Input/Dialog/Drawer/Tabs/Badge.

Expected fix:
- Either implement the promised minimal primitives layer, or explicitly de-scope it in the epic docs.

Done when:
- Shared UI primitives exist and are used by at least one screen, or the docs are corrected.

### 12. E2E smoke does not cover the map-oriented stub path described in EPIC-02

Severity: Low

Problem:
- Current Playwright tests only cover Home, Campaigns, and Settings stubs.
- `EPIC-02` deliverable mentions a map-oriented smoke path.

Where to fix:
- `tests/smoke.spec.ts`
- route structure in `src/app/App.tsx`

Relevant lines:
- `tests/smoke.spec.ts:1`
- `epics/EPIC-02-bootstrap.md:77`

Expected fix:
- Once map or region stub routes exist, update E2E smoke to cover one of them.

Done when:
- E2E smoke exercises at least one route closer to the real MVP navigation model.

## Documentation alignment tasks

### 13. Keep implementation status notes aligned with code changes

Severity: Medium

Problem:
- The docs currently state that only bootstrap + part of `EPIC-03` are implemented.
- That statement is accurate now, but it must be updated only after the code truly reaches the claimed state.

Where to fix:
- `docs/index.md`
- `docs/architecture.md`
- `epics/00-index.md`

Relevant lines:
- `docs/index.md:5`
- `docs/architecture.md:15`
- `epics/00-index.md:27`

Expected fix:
- Do not update these status notes optimistically.
- Update them only after:
  - verification is green,
  - startup migration is wired,
  - import/export UI exists,
  - missing EPIC-03 deliverables are either implemented or de-scoped explicitly.

## Required verification after fixes

Run all of these before claiming the slice complete:

```sh
make smoke
make preflight
npm run e2e
```

Recommended targeted checks while fixing persistence:

```sh
npm run lint
npm run typecheck
npm run test -- --run
```

## Recommended junior execution order

1. Fix lint failures in `src/storage/storage.ts`
2. Fix typecheck failure in `src/storage/migrations.ts`
3. Wire startup init + startup migration in `src/app/main.tsx` and storage/bootstrap code
4. Fix import flow ordering in `src/storage/import-export.ts`
5. Fix empty export blob helper
6. Add minimal Settings import/export UI
7. Add missing persistence tests
8. Implement missing repositories or narrow EPIC-03 scope in docs
9. Re-run verification and update status docs only after green checks

## Review evidence

Commands used during review:

```sh
make smoke
make preflight
npm run -s typecheck
npm run -s test -- --run
rg --files
```
