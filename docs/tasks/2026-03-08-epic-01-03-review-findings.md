# EPIC-01..03 review findings and fix list

Date: 2026-03-08
Scope reviewed:
- `EPIC-01` foundation contracts
- `EPIC-02` bootstrap
- `EPIC-03` domain + persistence

Outcome:
- As of 2026-03-10, most of the original blocking EPIC-02/03 findings have been addressed.
- The repo is in a much better state than on 2026-03-08, but there are still a few follow-up items before claiming a fully clean `EPIC-03` closeout.
- Remaining work is now concentrated in repository coverage consistency, explicit migration test coverage, and keeping status docs narrowly aligned with proven verification.

## Current status summary (2026-03-10)

Resolved:
- 1. Lint is failing in storage error handling
- 2. Typecheck is failing in migrations
- 3. Storage initialization is defined but never executed on app startup
- 4. Migrations are not run on normal app startup
- 5. Import validates against current schema before migration
- 6. Export blob helper is broken
- 7. Settings page does not expose import/export UI required by EPIC-03
- 10. Tutorial seed and persistence helpers are not wired into the app
- 11. UI primitives layer from EPIC-02 is not present
- 12. E2E smoke does not cover the map-oriented stub path described in EPIC-02

Partially resolved / still requires follow-up:
- 8. EPIC-03 repositories are incomplete
- 9. No persistence integration tests for CRUD, migrations, and roundtrip import/export
- 13. Keep implementation status notes aligned with code changes

## Priority order

1. Restore green verification (`make smoke`, `make preflight`)
2. Fix broken EPIC-03 persistence boot flow
3. Fix import/migration order so old snapshots can be imported
4. Complete missing EPIC-03 deliverables
5. Reconcile docs with actual implementation state

## Blocking findings

### 1. Lint is failing in storage error handling

Severity: High
Status (2026-03-10): Resolved

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
Status (2026-03-10): Resolved

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
Status (2026-03-10): Resolved

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
Status (2026-03-10): Resolved

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
Status (2026-03-10): Resolved

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
Status (2026-03-10): Resolved

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
Status (2026-03-10): Resolved

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
Status (2026-03-10): Partially resolved

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

Follow-up note (2026-03-10):
- Repository coverage is materially better than on 2026-03-08 and now includes several additional entities beyond `Campaign` / `Region` / `Province`.
- However, the repository layer is still not fully consistent with the strongest reading of the EPIC-03 contract:
  - not every claimed entity has the same complete CRUD surface;
  - some supporting entities still rely on narrower APIs than `getById/list/create/update/delete`.
- Architect review should verify one of two outcomes:
  - finish repository coverage to a consistent EPIC-03-wide API, or
  - explicitly narrow the documented EPIC-03 deliverable scope.

### 9. No persistence integration tests for CRUD, migrations, and roundtrip import/export

Severity: Medium
Status (2026-03-10): Partially resolved

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

Follow-up note (2026-03-10):
- Persistence tests now exist for repository CRUD/relationships and export/import roundtrip.
- The remaining gap is explicit migration-path coverage:
  - old snapshot -> migrate -> validate -> save.
- Do not claim the persistence test matrix complete until that migration scenario is exercised directly.

### 10. Tutorial seed and persistence helpers are not wired into the app

Severity: Medium
Status (2026-03-10): Resolved

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
Status (2026-03-10): Resolved

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
Status (2026-03-10): Resolved

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

Follow-up note (2026-03-10):
- The current smoke suite includes the `/map` route.
- Local architectural review should still distinguish:
  - route coverage is present;
  - fully verified local Playwright execution may still depend on host environment constraints.

## Documentation alignment tasks

### 13. Keep implementation status notes aligned with code changes

Severity: Medium
Status (2026-03-10): Partially resolved

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

Follow-up note (2026-03-10):
- Status docs have already been updated to reflect the fixed bootstrap/persistence path.
- Remaining caution:
  - avoid overstating `EPIC-03 complete and verified` until repository coverage and migration-test coverage are fully closed or explicitly de-scoped.

## Required verification for final EPIC-03 closeout

Run all of these before claiming the slice complete:

```sh
make smoke
make preflight
npm run e2e
```

Recommended targeted checks while closing the remaining persistence gaps:

```sh
npm run lint
npm run typecheck
npm run test -- --run
```

## Recommended remaining execution order (2026-03-10)

1. Add an explicit migration-path persistence test (`old snapshot -> migrate -> validate -> save`)
2. Normalize remaining repository coverage, or narrow the documented EPIC-03 repository contract
3. Re-run verification
4. Keep status docs conservative until the two items above are closed

## Junior completion guide (detailed)

Use this section as the execution guide for the remaining work. The goal is not to redesign the persistence layer. The goal is to finish the remaining EPIC-03 cleanup with small, reviewable changes and clear verification after each step.

### Task A. Add explicit migration-path test coverage

Why this still matters:
- The code now runs migrations on startup and during import.
- The current tests cover CRUD/relationships and import/export roundtrip.
- What is still missing is a direct proof that an older snapshot can be accepted, migrated, validated, and saved.

Files to inspect first:
- `src/storage/persistence.test.ts`
- `src/storage/import-export.ts`
- `src/storage/migrations.ts`
- `src/entities/schemas.ts`

What to implement:
1. Add a new test case in `src/storage/persistence.test.ts`.
2. Build a minimal old-style snapshot object in the test.
3. The snapshot should represent an older schema version:
   - set `schemaVersion` to `0` or another older version supported by the migration path;
   - keep only the minimum top-level fields required by `validateAppState(...)`.
4. Pass that snapshot through the same public path the app uses for import:
   - preferred path: serialize to JSON and call `importAppState(json)`;
   - avoid testing private internals only.
5. Assert all of these:
   - import succeeds;
   - the saved state uses `CURRENT_SCHEMA_VERSION`;
   - the migrated data can be loaded back from storage;
   - one or two representative fields survive the migration.

Implementation constraints:
- Keep the test narrow and deterministic.
- Do not invent a complicated fake legacy schema if the current migration is only `0 -> 1`.
- The point is to prove the contract, not to simulate years of schema history.

Suggested test shape:
- Arrange:
  - create a minimal JSON snapshot with old `schemaVersion`;
  - include one campaign, one region, one province, and one `playerProfile`.
- Act:
  - call `importAppState(...)`.
- Assert:
  - `success === true`
  - loaded state exists
  - `schemaVersion === CURRENT_SCHEMA_VERSION`
  - entity titles/IDs remain intact

Done when:
- A dedicated migration-path test exists.
- The test fails if migration/import ordering breaks in the future.

How to verify:
- `npm run test -- --run`
- `make preflight`

### Task B. Normalize remaining repository coverage

Why this still matters:
- Repository coverage is much better now than during the original review.
- But the API surface is still uneven.
- Architect review will likely challenge any EPIC-03 “complete” claim if some entities have full CRUD while others only have partial helpers.

Files to inspect first:
- `src/storage/repositories.ts`
- `epics/EPIC-03-domain-persistence.md`
- `src/entities/types.ts`

Goal:
- Decide which entities are truly inside the implemented EPIC-03 slice.
- Then make the code and docs match exactly.

There are two valid ways to finish this:

Option 1. Finish repository coverage in code.
- For each entity claimed by EPIC-03, provide a consistent repository API as appropriate.
- Preferred baseline shape:
  - `getById`
  - `list`
  - `create`
  - `update`
  - `delete`

Option 2. Narrow the EPIC-03 claim in docs.
- If some entities are intentionally scaffold-only for later epics, document that clearly.
- Do not leave the current state ambiguous.

Recommended approach:
- Prefer the smallest change set.
- If an entity is already persisted and expected to be usable now, finish its repository.
- If an entity exists only because future epics need the type, narrow the doc claim instead of adding speculative CRUD.

Practical checklist:
1. Make a table for the entities currently claimed in EPIC-03:
   - `Campaign`
   - `Region`
   - `Province`
   - `Season`
   - `PlayerProfile`
   - `DailyMove`
   - `SiegeEvent`
   - `IfThenPlan`
   - extended entities already explicitly claimed
2. For each entity, mark:
   - has type/schema
   - has repository
   - has full CRUD
   - is actually used by current app slice
3. For any row that is incomplete, choose one action:
   - complete the repository API;
   - or reduce the doc claim.
4. Keep the final state consistent:
   - no doc should promise broad CRUD if the code intentionally provides only partial write helpers.

What not to do:
- Do not add large speculative abstractions.
- Do not split files or refactor architecture unless it is necessary to finish the contract.
- Do not silently leave “partial CRUD but docs say full CRUD”.

Done when:
- Code and `EPIC-03` docs say the same thing.
- A reviewer can check one entity at a time and see no ambiguity.

How to verify:
- `npm run typecheck`
- `npm run test -- --run`
- manual repository audit against `epics/EPIC-03-domain-persistence.md`

### Task C. Keep the status docs narrowly truthful

Why this still matters:
- Status notes are now much closer to reality.
- The remaining risk is over-claiming “EPIC-03 complete and verified” before the last two gaps are fully closed.

Files to inspect:
- `docs/index.md`
- `docs/architecture.md`
- `epics/00-index.md`
- this file: `docs/tasks/2026-03-08-epic-01-03-review-findings.md`

What to do:
1. After Task A and Task B are complete, re-read the status notes.
2. Check each claim against actual evidence:
   - green verification;
   - explicit migration-path test;
   - repository scope aligned with docs.
3. If any claim is broader than the evidence, weaken the wording.

Examples:
- Good: `EPIC-03 persistence bootstrap is complete and verified.`
- Good: `EPIC-03 repository coverage is complete for the currently implemented slice.`
- Risky unless proven: `EPIC-03 is fully complete and verified.`

Done when:
- Status notes do not require the reviewer to guess what “complete” means.
- The wording matches the exact implementation scope.

How to verify:
- Read the docs after edits and ask:
  - would a new engineer expect functionality that does not actually exist?
  - does “verified” map to a real command or test?

## Suggested junior workflow

Work in this order:
1. Read the current code paths:
   - `src/storage/migrations.ts`
   - `src/storage/import-export.ts`
   - `src/storage/persistence.test.ts`
   - `src/storage/repositories.ts`
2. Complete Task A first.
3. Run:
   - `npm run test -- --run`
   - `make preflight`
4. Complete Task B.
5. Run:
   - `npm run typecheck`
   - `npm run test -- --run`
   - `make preflight`
6. Complete Task C last.

## What to include in the final handoff / PR summary

The PR or handoff note should explicitly answer:
1. Was the migration path tested through the public import flow?
2. Which EPIC-03 entities now have full repository coverage?
3. If any entities were intentionally left partial, where was the scope narrowed in docs?
4. Which verification commands were run, and were they green?

## Review evidence

Commands used during review:

```sh
make smoke
make preflight
npm run -s typecheck
npm run -s test -- --run
rg --files
```
