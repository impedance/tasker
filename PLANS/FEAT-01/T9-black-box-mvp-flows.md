# FEAT-01 T9 - Black-box MVP flows

Goal: expand Playwright from route smoke into real MVP user-path coverage.

Blocked by:
- `T10` deterministic test helpers should land first.

Read first:
- `PLANS/FEAT-01-production-readiness-hardening.md`
- `tests/smoke.spec.ts`
- `docs/E2E-CHECKLIST.md`
- `epics/QA-MECHANICS-CHECKLIST.md`

Likely code areas:
- `tests/**/*.spec.ts`
- Shared Playwright helpers/fixtures
- Minimal app hooks only if required to support deterministic setup

Implementation notes:
- Keep route smoke as the fast layer.
- New E2E tests must assert visible outcomes, not internal storage key shapes.
- Prefer several short deterministic specs over one giant brittle journey.

Suggested split for juniors:
- T9a: first-run tutorial to first action
- T9b: create -> clarify -> ready
- T9c: siege trigger and resolution
- T9d: Daily Orders flow
- T9e: hero moment and Chronicle
- T9f: season rollover
- T9g: reset + import/export sanity

Steps:
1. Reuse `T10` fixtures instead of ad hoc IndexedDB edits.
2. Add one spec per P0 path.
3. Keep helpers small and scenario-specific.
4. Remove repeated manual-only steps from the checklist when automation replaces them.

Acceptance criteria:
- E2E coverage now reflects shipped gameplay loops, not only headings and routes.
- Failures point to a broken user journey quickly.
- Specs are CI-friendly and deterministic.

Self-check before review:
- Assertions only cover externally visible behavior.
- The spec does not depend on manual DevTools mutation.
- Long scenarios were split before they became flaky.

Verification:
- `make smoke`
- `make preflight`
- `npm run e2e`

PR must mention:
- Which user path the spec locks
- Which manual checklist steps can now be shortened or removed
