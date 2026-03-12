# FEAT-01 T2 - Onboarding to first meaningful action

Goal: make first-run flow deterministic from onboarding through one real action and back into the Capital loop.

Read first:
- `PLANS/FEAT-01-production-readiness-hardening.md`
- `src/app/OnboardingDialog.tsx`
- `src/storage/tutorial-seed.ts`
- `src/pages/province/ClarifyProvincePage.tsx`
- `src/pages/province/ProvinceDetailsPage.tsx`
- `src/pages/chronicle/ChroniclePage.tsx`
- `src/pages/capital/CapitalPage.tsx`
- `docs/E2E-CHECKLIST.md`

Likely code areas:
- Tutorial seeding and first-run flags
- Navigation after tutorial actions
- CTA wiring from tutorial into province action screens and back to Capital
- Playwright first-run scenario

Implementation notes:
- The target path is: onboarding -> tutorial seed -> fog clear -> first meaningful action -> Chronicle or feedback confirmation -> Capital.
- Avoid hidden route knowledge or DevTools steps.
- Prefer fixing missing navigation/state transitions over adding extra copy.

Steps:
1. Walk the clean-profile flow and record where it stalls or becomes ambiguous.
2. Fix missing CTA targets, stale redirects, or dead-end screens.
3. Add one deterministic end-to-end scenario covering the full path.
4. Reduce manual checklist steps that currently require route guessing.

Acceptance criteria:
- A clean-profile user can reach one meaningful action without manual storage edits.
- The path back to Capital is obvious after the first action.
- The flow is stable enough to automate.

Self-check before review:
- Tested from clean storage only.
- The tutorial path does not depend on old seeded data being present.
- Chronicle/feedback screens do not strand the user away from the hub.

Verification:
- `make smoke`
- `make preflight`
- `npm run e2e -- --grep "first_run|tutorial|onboarding"`
- Manual: run the first-run path in a fresh browser profile

PR must mention:
- Which dead ends were removed
- Which route or CTA now closes the loop back to Capital
