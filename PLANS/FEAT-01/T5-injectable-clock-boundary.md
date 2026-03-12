# FEAT-01 T5 - Injectable clock boundary

Goal: centralize time access so 04:00-boundary logic and daily bucketing become deterministic.

Read first:
- `PLANS/FEAT-01-production-readiness-hardening.md`
- `docs/architecture.md`
- `docs/engineering_requirements.md`
- `src/app/App.tsx`
- `src/game/services/season-service.ts`
- `src/game/services/siege-service.ts`
- `src/game/rules/season.ts`
- `src/game/rules/transitions.ts`
- `src/game/rules/pressure.ts`
- `src/game/rules/apply-action.ts`

Likely code areas:
- New shared clock module
- App boot code that currently calls time-sensitive services
- Rule/service code paths that still use `new Date()` directly
- Boundary tests around 04:00 and day rollover

Implementation notes:
- Keep the boundary thin. A simple `Clock` interface plus `systemClock` is enough.
- Prioritize services and flows touched by FEAT-01.
- New work in this plan must not add fresh direct `new Date()` reads in mechanic paths.

Suggested split for juniors:
- T5a: add shared clock module and wire app boot
- T5b: adopt clock in siege/season services
- T5c: adopt clock in daily bucketing and related helpers
- T5d: add boundary tests for before/after 04:00

Steps:
1. Add the clock interface and default implementation.
2. Replace direct time reads in season and siege services.
3. Adopt the clock in daily-order or persistence timestamps where FEAT-01 work touches them.
4. Add focused tests for before/after 04:00 and season rollover.

Acceptance criteria:
- Time-sensitive flows can be tested by injecting a fake clock.
- Critical FEAT-01 code paths no longer read current time directly.
- Behavior is unchanged except for improved determinism.

Self-check before review:
- `rg "new Date\\(" src/game src/shared src/app` shows fewer direct mechanic reads than before.
- Tests cover both sides of the 04:00 boundary.
- No DI framework or unnecessary abstraction was introduced.

Verification:
- `make smoke`
- `make preflight`
- Targeted tests for season and siege boundary behavior

PR must mention:
- Which `new Date()` call sites were removed
- Which remaining call sites are intentionally deferred
