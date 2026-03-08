# Documentation Hub

Use this file as the repo map for agents. Keep it short and specific.

## Start Here
- Testing rules: `docs/testing.md`
- Harness plan (discovery): `docs/harness_plan.md`

## Fast Commands
- `make smoke` — fastest verification loop
- `make agent-smoke` — smoke + optional black-box checks (if wired)
- `make preflight` — broader verification loop

## Code Map
- **Entrypoints:** `<paths>`
- **Core domain logic:** `<paths>`
- **Boundaries / DTOs / config:** `<paths>`
- **Adapters (I/O):** `<paths>`

## Typing Surfaces
- Config boundary: `<path>` — `<type/interface>`
- Service boundary: `<path>` — `<type/interface>`
- External I/O boundary: `<path>` — `<type/interface>`

## Test Map
- **Smoke path:** `<command or paths>` — run via `make smoke`
- **Black-box path (optional):** `<command or paths>` — run via `make agent-smoke`
- **Full path:** `<command or paths>` — run via `make preflight`
- **Integration path (opt-in):** `<command or paths>`
