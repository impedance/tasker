# FEAT-01 T6 - Tighten critical type boundaries

Goal: remove unsafe `any` and weak casts from production-critical action paths.

Read first:
- `PLANS/FEAT-01-production-readiness-hardening.md`
- `src/game/rules/actions.ts`
- `src/game/rules/apply-action.ts`
- `src/game/rules/tactics.ts`
- `src/shared/services/domainService.ts`
- `src/storage/repositories.ts`
- `src/entities/types.ts`
- `src/entities/schemas.ts`

Likely code areas:
- Daily Orders payload mapping
- Siege/tactic payloads
- Chronicle writes in `domainService`
- Storage helpers that accept loosely-typed data

Implementation notes:
- Prefer domain types or `unknown` plus validation.
- Limit work to critical paths. Do not churn non-critical tests just to chase zero `any` everywhere.
- If some `any` remains, document why it is safe to defer.

Suggested split for juniors:
- T6a: Daily Orders payload typing
- T6b: Siege/tactic payload typing
- T6c: Chronicle/domainService casts
- T6d: storage helper payload typing

Steps:
1. Audit critical `any` and `as any` sites.
2. Replace the highest-risk ones with concrete types or validation.
3. Add focused tests for payload mapping and persistence side effects.
4. Leave explicit comments only where a safe deferral is necessary.

Acceptance criteria:
- Critical flows no longer depend on `any`.
- Type contracts match actual domain rules and storage expectations.
- New tests fail if payload mapping drifts.

Self-check before review:
- The compiler now guides the changed path end-to-end.
- No user behavior changed as a side effect of the typing cleanup.
- Remaining casts are deliberate and explained.

Verification:
- `make smoke`
- `make preflight`
- `npm run lint`
- Targeted tests for the typed flow you changed

PR must mention:
- Which unsafe boundary was removed
- Which `any` sites are still deferred after this PR
