# FEAT-01 T12 - Offline and release packaging review

Goal: make offline and packaging behavior explicit, then fix only the low-risk gaps worth closing before pilot.

Read first:
- `PLANS/FEAT-01-production-readiness-hardening.md`
- `prd.md` sections touching offline expectations
- `docs/index.md`
- build config files and current build output

Likely code areas:
- Build configuration if a low-risk fix is chosen
- Docs for known limitations and release notes

Implementation notes:
- Start with truth-finding, not implementation.
- If the app is not honestly "offline after initial load", document the exact limitation.
- Only take low-risk packaging fixes inside FEAT-01.

Steps:
1. Run a production build and note warnings or chunking issues.
2. Verify current offline behavior after initial load.
3. Decide which issues are:
  - ship blockers
  - documented limitations
  - low-risk fixes worth doing now
4. Implement only low-risk fixes and document the rest.

Acceptance criteria:
- Offline/release behavior is understood and written down.
- Build warnings are either reduced or intentionally accepted.
- Pilot handoff contains no hidden non-functional surprises.

Self-check before review:
- The PR distinguishes between "documented limitation" and "fixed behavior".
- No half-finished PWA infrastructure was added just to claim coverage.
- Build output was actually reviewed, not assumed.

Verification:
- `make smoke`
- `make preflight`
- `npm run build`
- Manual: verify offline behavior after initial load and record the result

PR must mention:
- Whether offline after initial load is truly supported
- Which warnings or packaging issues remain intentionally accepted
