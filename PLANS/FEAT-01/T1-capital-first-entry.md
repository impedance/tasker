# FEAT-01 T1 - Capital-first entry

Goal: make `/` open into the real Capital-first home loop instead of a bootstrap placeholder.

Read first:
- `PLANS/FEAT-01-production-readiness-hardening.md`
- `prd.md` sections 1.0, 4.1, 5.2
- `src/app/App.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/capital/CapitalPage.tsx`
- `src/app/OnboardingDialog.tsx`
- `tests/smoke.spec.ts`

Likely code areas:
- Routing in `src/app/App.tsx`
- Entry surface components in `src/pages/HomePage.tsx` and `src/pages/capital/CapitalPage.tsx`
- Onboarding behavior in `src/app/OnboardingDialog.tsx`
- App-level smoke/E2E tests

Implementation notes:
- Choose one canonical home contract:
  - preferred option A: `/` redirects to `/capital`
  - option B: `HomePage` becomes a thin Capital wrapper
- Do not keep two competing "home" concepts.
- Remove obsolete bootstrap wording from the first screen.

Steps:
1. Inspect current `/` behavior and document what still looks like bootstrap copy.
2. Implement the canonical home contract.
3. Verify onboarding still appears on a clean profile and does not duplicate the entry surface.
4. Update black-box coverage for `/`.
5. Update any manual checklist entries that still mention the old home.

Acceptance criteria:
- Opening `/` lands on the intended hub experience.
- First-run users see onboarding and can continue into the real game loop.
- No stale bootstrap wording remains on the default entry path.

Self-check before review:
- A clean browser profile opens the app and the first meaningful screen is Capital-centric.
- Returning users do not see a broken redirect loop or duplicate wrappers.
- Sidebar/navigation still marks the expected home destination.

Verification:
- `make smoke`
- `make preflight`
- Manual: open `/`, dismiss onboarding, confirm the app lands in the same home surface every time

PR must mention:
- Which home contract was chosen and why
- Which test was added/updated to lock the new behavior
