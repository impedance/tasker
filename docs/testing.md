# Testing Guide

## Goals
- Keep default checks fast enough for agent iteration.
- Prefer offline-by-default verification; gate real external calls behind an explicit opt-in (e.g. `INTEGRATION=1`).

## Default commands
- `make smoke` — fastest verification loop
- `make agent-smoke` — optional black-box checks (if wired)
- `make preflight` — broader verification loop

## Notes
- Optional flags:
  - `QUIET=1` — reduce successful tool output to one-line summaries (full output on failure).
  - `FAIL_FAST=1` — (Python/pytest) stop after the first failure (`--maxfail=1`).
- Put CI/debug output in `artifacts/`.
- If host-mode is supported, document it here.
