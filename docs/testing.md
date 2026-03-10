# Testing Guide

## Goals
- Keep default checks fast enough for agent iteration.
- Prefer offline-by-default verification; gate real external calls behind an explicit opt-in (e.g. `INTEGRATION=1`).
- Keep mechanics tests in pure domain code; keep UI tests minimal and stable.

## Default commands
- `make smoke` — fastest verification loop
- `make agent-smoke` — optional black-box checks (if wired)
- `make preflight` — broader verification loop
- `make e2e` — Playwright E2E (host-capable environments only)

## Planned (MVP stack)
- Unit/integration: Vitest + React Testing Library (`npm test`)
- E2E: Playwright (`npm run e2e`)
- Static analysis: ESLint (`npm run lint`)
- Type checks: TypeScript (`npm run typecheck`)

## Notes
- Optional flags:
  - `QUIET=1` — reduce successful tool output to one-line summaries (full output on failure).
  - `FAIL_FAST=1` — (Python/pytest) stop after the first failure (`--maxfail=1`).
  - `E2E=1` — include `make e2e` in `make preflight` (Playwright required).
- Put CI/debug output in `artifacts/`.
- In restricted sandboxes, Playwright may fail before tests start because Vite cannot bind a local port (`listen EPERM`). In host-capable environments and CI, `npm run e2e` should work as-is.
