# FEAT-01 T10 - Deterministic test helpers

Goal: provide reusable setup helpers for storage, time, and bootstrap state so tests stop depending on manual mutation rituals.

Read first:
- `PLANS/FEAT-01-production-readiness-hardening.md`
- `tests/setup.ts`
- `src/storage/tutorial-seed.ts`
- `src/storage/storage.ts`
- `src/storage/import-export.ts`
- `src/game/services/season-service.ts`
- `src/game/services/siege-service.ts`

Likely code areas:
- Shared test utilities for Vitest and Playwright
- Seed/reset helpers for tutorial state and app storage
- Time-freezing helpers based on the new clock boundary or equivalent test seam

Implementation notes:
- This task is foundational for T9.
- Prefer one explicit helper per common setup need:
  - clear local state
  - seed tutorial state
  - seed dated province/season state
  - freeze or override current time

Steps:
1. Inventory repeated test setup code and DevTools-only instructions.
2. Extract shared helpers with clear names and input contracts.
3. Reuse the helpers in at least one Vitest path and one Playwright path.
4. Remove duplicated ad hoc setup from the tests you touched.

Acceptance criteria:
- New tests can start from explicit fixtures instead of manual storage edits.
- Time and storage setup are readable and reusable.
- Failures are easier to diagnose because setup is named and centralized.

Self-check before review:
- Helpers do not leak production-only assumptions into tests.
- Playwright and Vitest use the same mental model for setup.
- The touched tests became shorter, not more magical.

Verification:
- `make smoke`
- `make preflight`
- Targeted test runs that exercise the new helpers

PR must mention:
- Which duplicated setup was removed
- Which later FEAT-01 tasks should reuse the new helpers
