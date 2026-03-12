# Refactor Plan — Dev Velocity + Tech Debt Reduction (MVP)

**ID:** `REFAC-01`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `Architecture / Tech Lead`  
**PRD/RFC reference:** `docs/engineering_requirements.md` (boundaries), `docs/architecture.md` (target layout)

## 1) Objective (Outcome)
Make feature work faster and safer by tightening domain/UI/storage boundaries, removing duplicated rule logic, and reducing type holes (`any` / casts) that currently allow invalid payloads to reach rules. After this refactor, a junior can add/modify a domain action, side effect, or tactic with: (1) a single canonical implementation, (2) compiler guidance across UI + persistence, and (3) predictable time semantics via an explicit clock boundary.

## 2) Context
- The repo already defines intended boundaries (rules are pure, storage is an adapter, UI is dumb), but some flows currently bypass them in practice.
- There is active type erosion (`any`, `as any`) at key seams (UI → actions, action side effects → persistence, chronicle types).
- `apply_tactic` logic exists in more than one place (`apply-action.ts` and `tactics.ts`), increasing divergence risk.
- Time is read ad-hoc (`new Date()`) across rules/services/UI, making deterministic behavior and tests harder as mechanics expand.
- The current implementation snapshot and remaining drift are tracked in `epics/00-index.md` and `epics/IMPLEMENTATION-READINESS.md`.

## 3) Scope
**In scope:**
- Canonicalize tactic application path and side effects.
- Remove/contain `any` and `as any` on domain boundaries.
- Introduce a `Clock` boundary and route time-dependent services through it.
- Add a thin `src/features/**` orchestration layer so route pages stop importing repositories directly.
- Decompose `src/storage/repositories.ts` into per-entity modules without changing behavior.

**Out of scope (explicit non-goals):**
- Product behavior changes (except to fix demonstrably invalid payload/contract mismatches).
- Storage format migration beyond mechanical refactors (schema version stays the same).
- New mechanics, new UI screens, or backend work.

## 4) Deliverables
- A single canonical tactic application implementation used by the app entry point.
- A typed `DomainAction` dispatch path from UI to rules to persistence (no `any` required).
- `Clock` boundary and removal of `new Date()` from rule/service codepaths where determinism matters.
- A first `src/features/**` vertical slice (Province actions) used by at least one route page.
- `src/storage/repositories/**` split into modules + updated imports; public API preserved.
- Tests updated/added where necessary; `make smoke` and `make preflight` stay green.

## 5) Dependencies
- Technical: TypeScript strict mode already enabled; Vitest exists; path alias `@/*` exists.
- Product/design: none.
- Data/tools: none (offline deterministic verification).

## 6) Work breakdown (junior-friendly tasks)

Notes:
- Each ticket should be a small PR.
- Avoid “drive-by” formatting; keep diffs minimal and behavior-preserving.
- Always run `make smoke` before requesting review; run `make preflight` for any cross-cutting change.

### T1. Audit + lock contracts for tactics payload (fix invalid UI payload shape)
**Description:** Ensure UI builds a payload that matches the domain `ApplyTacticPayloadSchema` and that invalid payload shapes cannot compile.  
**Files likely touched:** `src/pages/siege/SiegePage.tsx`, `src/game/rules/actions.ts` (types only if needed), `src/game/integration/*` (if tests added).  
**Steps:**
1) Replace `tacticData: any` with a typed state that matches the discriminated union used by `ApplyTacticPayloadSchema`.
2) Fix `engineer` tactic UI to produce `subProvinceIds` (or adjust tactic contract if product intends a different shape).
3) Add a small integration test that dispatches `apply_tactic` with each tactic payload shape used by UI.
**Acceptance criteria:**
- `SiegePage` builds `apply_tactic` payload without `any`.
- `engineer` payload matches domain schema (no `subSteps` mismatch).
- Tests cover the payload shapes used by UI.
**DoD (done when):**
- `make smoke` passes.
- New test(s) fail if payload shape drifts.
**Estimate:** `M=0.5d`  
**Risks/notes:** This may reveal further UI/data assumptions; keep the fix minimal and aligned with `ApplyTacticPayloadSchema`.

### T2. Make `SideEffect.create_daily_move.moveType` strongly typed end-to-end
**Description:** Remove `moveType as any` casts by making `SideEffect` carry a `MoveType` rather than `string`.  
**Files likely touched:** `src/game/rules/actions.ts`, `src/game/rules/apply-action.ts`, `src/shared/services/domainService.ts`, `src/entities/types.ts` (import type only), tests.  
**Steps:**
1) Change `SideEffect` union so `create_daily_move.moveType` is `MoveType`.
2) Update `applyAction` to emit typed move types.
3) Update `domainService.persistResult` to persist `DailyMove.moveType` without casting.
4) Fix any test fallout with minimal changes.
**Acceptance criteria:**
- No `as any` for move types in `domainService`.
- Compiler prevents invalid move types in side effects.
**DoD (done when):**
- `make preflight` passes.
**Estimate:** `S=1–2h`  
**Risks/notes:** Keep side effect payload as small as possible; do not introduce new persistence behavior.

### T3. Canonicalize tactic application: single source of truth
**Description:** Ensure the app uses one canonical tactic implementation (no divergence between `apply-action.ts` and `tactics.ts`).  
**Files likely touched:** `src/game/rules/apply-action.ts`, `src/game/rules/tactics.ts`, `src/game/rules/tactics.test.ts`, `src/shared/services/domainService.ts` (only if side-effects change).  
**Steps:**
1) Choose canonical direction:
   - Preferred: `applyAction` delegates to `applyTactic` for `apply_tactic` actions.
2) Create an adapter layer to translate `TacticResult.sideEffects` to the main `SideEffect` union (or update to a shared side-effect type).
3) Update tests to assert one path; remove redundant coverage only after equivalent coverage exists.
**Acceptance criteria:**
- App codepath for `apply_tactic` is implemented in exactly one place.
- Tests cover tactic behavior through the canonical entry point (`applyAction`).
**DoD (done when):**
- `rg "apply_tactic" src/game/rules` shows one implementation of actual mutations (helper functions ok).
- `make preflight` passes.
**Estimate:** `L=1d`  
**Risks/notes:** Do not change behavior; focus on removing duplication. Keep the side-effect contract explicit.

### T4. Align Chronicle entry types with actual writes (remove `as any` in chronicle writes)
**Description:** Stop writing chronicle entries with types outside `ChronicleEntryType`.  
**Files likely touched:** `src/entities/types.ts`, `src/entities/schemas.ts`, `src/shared/services/domainService.ts`, tests (if any depend on types).  
**Steps:**
1) Decide canonical chronicle taxonomy:
   - Option A (preferred): extend `ChronicleEntryType` to include the additional domain events already being written (e.g. province started/move logged/captured).
   - Option B: map those events onto existing chronicle types and adjust titles.
2) Update Zod schema to match.
3) Remove `as any` casts and make compiler enforce validity.
**Acceptance criteria:**
- No `as any` on chronicle entry type in `domainService`.
- Import/export validation still passes (Zod schema updated).
**DoD (done when):**
- `make preflight` passes.
**Estimate:** `S=1–2h`  
**Risks/notes:** This affects import/export schema validation; keep changes consistent across `types.ts` and `schemas.ts`.

### T5. Introduce `Clock` boundary and route time through it (determinism)
**Description:** Centralize “current time” access and pass `now` into time-sensitive rules/services.  
**Files likely touched:** `src/shared/services/*` (new clock), `src/game/services/*.ts`, `src/shared/hooks/useApplyAction.ts`, `src/app/App.tsx`.  
**Steps:**
1) Add `src/shared/services/clock.ts` with `Clock` interface and `systemClock`.
2) Update services (`season-service`, `siege-service`) to accept a `Clock` (or `now` parameter) and remove internal `new Date()` where possible.
3) Update `useApplyAction` to use clock for guardrails context.
4) Update `App` boot logic to use the clock boundary (not `new Date()` directly).
**Acceptance criteria:**
- Time-sensitive services can be tested deterministically by passing a fake clock.
- Rule codepaths do not call `new Date()` except via default parameters that are explicitly overridable.
**DoD (done when):**
- Existing tests still pass; add at least one unit test for a service using a fake clock.
**Estimate:** `L=1d`  
**Risks/notes:** Avoid over-engineering. Goal is a thin boundary, not a full DI framework.

### T6. Add first `src/features/**` vertical slice: Province actions (stop pages importing repositories)
**Description:** Create a small feature module that orchestrates: loading province, applying an action, persisting, and reloading.  
**Files likely touched:** `src/features/province/*` (new), `src/pages/province/ProvinceDetailsPage.tsx`, `src/pages/siege/SiegePage.tsx` (optional follow-up).  
**Steps:**
1) Create `src/features/province/useProvince.ts` (load + refresh) and `src/features/province/useProvinceActions.ts` (execute action).
2) Migrate `ProvinceDetailsPage` to the feature hooks; remove direct `provinceRepository` import from the page.
3) Keep UI behavior identical.
**Acceptance criteria:**
- `ProvinceDetailsPage` no longer imports repositories directly.
- One canonical execution path is used (feature → `useApplyAction`).
**DoD (done when):**
- `make smoke` passes.
**Estimate:** `M=0.5d`  
**Risks/notes:** Keep the slice narrow (Province only) to prove the pattern.

### T7. Decompose `src/storage/repositories.ts` into per-entity modules (behavior-preserving)
**Description:** Reduce merge conflicts and improve navigability by splitting the monolith repositories file.  
**Files likely touched:** `src/storage/repositories.ts` (removed/converted), `src/storage/repositories/*` (new), import sites in `src/**`.  
**Steps:**
1) Create `src/storage/repositories/` folder and move each repository into its own file.
2) Add a barrel export `src/storage/repositories/index.ts` to preserve existing imports (`from '../storage/repositories'`).
3) Keep function names and return types unchanged.
4) Update imports across the app to point at the barrel if needed.
**Acceptance criteria:**
- Public API surface remains the same for callers.
- No behavior changes (CRUD semantics identical).
**DoD (done when):**
- `make preflight` passes.
**Estimate:** `XL=2d` (can be split further)  
**Risks/notes:** Split into sub-tickets per repository type to keep PRs small (see decomposition below).

#### Decomposition for T7 (junior tickets)
**T7a:** Extract `campaignRepository` (S)  
**T7b:** Extract `regionRepository` (S)  
**T7c:** Extract `provinceRepository` (M)  
**T7d:** Extract `dailyMoveRepository` + `playerCheckInRepository` (S)  
**T7e:** Extract `seasonRepository` + `seasonReviewRepository` (S)  
**T7f:** Extract `siegeEventRepository` + `chronicleEntryRepository` + `heroMomentRepository` (M)  
**T7g:** Extract remaining repositories (`shareCard`, `capitalState`, `archetypeStats`, `playerProfile`) (M)  

Each sub-ticket must:
- Add/adjust barrel exports.
- Update imports in one small batch.
- Run `make smoke`.

### T8. Tighten linting boundaries (optional, after refactor)
**Description:** Turn `@typescript-eslint/no-explicit-any` into `error` for domain + features only, keeping UI permissive initially if needed.  
**Files likely touched:** `eslint.config.mjs`, targeted code files to fix.  
**Steps:**
1) Add ESLint overrides: `src/game/**`, `src/features/**`, `src/storage/**` → `no-explicit-any: error`.
2) Fix remaining `any` in those directories (replace with `unknown` + validation or specific types).
**Acceptance criteria:**
- Domain + storage do not compile/lint with `any`.
**DoD (done when):**
- `npm run lint` is clean (no `any`) in restricted directories.
**Estimate:** `XL=2d`  
**Risks/notes:** Do this only after contract fixes (T1–T6), otherwise it blocks work.

## 7) Testing and QA
- Unit: keep heavy coverage on `src/game/rules/**`; add minimal tests for new adapters.
- Integration: add one test that executes UI-shaped tactic payloads via `applyAction`.
- Manual checklist:
  - Create a province, trigger siege, resolve using each tactic.
  - Verify a DailyMove is created for `start_move`, `log_move`, and `raid`.
  - Verify chronicle entries appear and import/export still works.
- Commands:
  - `make smoke`
  - `make preflight`

## 8) Metrics / Events (if applicable)
- No new metrics required for this refactor.
- Ensure existing `track(...)` calls remain valid; do not change event names in this plan.

## 9) Risks and mitigations
- **Risk:** Contract changes break import/export validation.  
  **Mitigation:** Always update both `src/entities/types.ts` and `src/entities/schemas.ts` together; run persistence roundtrip tests.
- **Risk:** Large repo refactor causes painful merge conflicts.  
  **Mitigation:** Keep PRs small; split T7 into sub-tickets; land barrel exports early.
- **Risk:** Time boundary changes alter behavior subtly.  
  **Mitigation:** Pass `now` explicitly in tests; add at least one deterministic service test with a fixed clock.

## 10) Open questions
- Should Chronicle taxonomy include province-level events (started/move logged/captured) explicitly, or should chronicle remain higher-level?
- For `engineer` tactic: do we want “sub steps text” authored in UI to create sub-provinces automatically (needs a clear contract for sub-province creation)?
