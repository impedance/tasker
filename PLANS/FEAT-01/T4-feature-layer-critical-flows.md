# FEAT-01 T4 - Feature layer for critical flows

Goal: move critical route orchestration out of pages and into `src/features/**` without rewriting the whole app.

Blocked by:
- `T5` clock boundary should land first for time-sensitive flows.

Read first:
- `PLANS/FEAT-01-production-readiness-hardening.md`
- `docs/architecture.md`
- `epics/IMPLEMENTATION-READINESS.md`
- `src/pages/daily-orders/DailyOrdersPage.tsx`
- `src/pages/province/ProvinceDetailsPage.tsx`
- `src/pages/siege/SiegePage.tsx`
- `src/pages/capital/CapitalPage.tsx`
- `src/shared/services/domainService.ts`
- `src/shared/hooks/useApplyAction.ts`

Likely code areas:
- New `src/features/**` modules and hooks
- Route pages that currently import repositories/services directly
- Integration tests around use-case orchestration

Implementation notes:
- Migrate only hot paths: Daily Orders, province actions, siege resolution, capital loading.
- Keep rules pure and storage behind adapters.
- Display-only pages stay as-is unless the page is already in the selected path.

Suggested split for juniors:
- T4a: feature slice for capital loading
- T4b: feature slice for province actions
- T4c: feature slice for siege resolution
- T4d: feature slice for Daily Orders

Steps:
1. Identify page-local orchestration that should become a use-case or feature hook.
2. Add the smallest feature module needed for one flow.
3. Migrate one page at a time and keep behavior unchanged.
4. Add integration tests for the feature entry points.

Acceptance criteria:
- Selected critical pages no longer coordinate repositories and navigation ad hoc.
- New orchestration logic is typed and testable outside the page component.
- The migration is incremental and behavior-preserving.

Self-check before review:
- Page components got smaller and mostly render state + callbacks.
- The new feature module has a clear input/output contract.
- No unrelated architectural cleanup was mixed into the PR.

Verification:
- `make smoke`
- `make preflight`
- Targeted tests for each migrated feature module

PR must mention:
- Which route flow moved into `src/features/**`
- Which page imports were removed as a result
