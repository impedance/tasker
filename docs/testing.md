# Testing Guide

## Default commands
- `make smoke` — fastest verification loop
- `make agent-smoke` — optional black-box checks (if wired)
- `make preflight` — broader verification loop
- `make blackbox` — structural black-box checks for refactors (offline; may be stricter than smoke)
- `make e2e` — Playwright E2E (host-capable environments only)

## Notes
- Optional flags:
  - `QUIET=1` — reduce successful tool output to one-line summaries (full output on failure)
  - `STRICT=1` — fail on harness warnings and missing optional wiring
  - `E2E=1` — include `make e2e` in `make preflight` (Playwright required)
- `make blackbox` supports phases via env var:
  - `PHASE=1 make blackbox` — early Pareto gates (high-risk seams only)
  - `PHASE=2 make blackbox` — includes Phase 1 + feature-layer migration gates
  - `PHASE=3 make blackbox` — end-state gates (strictest; default)
- Artifacts go to `artifacts/`.
- E2E prerequisites: `npx playwright install` (browser binaries).
- In restricted sandboxes, Playwright may fail before tests start if Vite cannot bind a local port (`listen EPERM`). In host-capable environments and CI, `npm run e2e` should work as-is.
