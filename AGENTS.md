# AGENTS.md

## 1) What this repo is
One short paragraph describing the product, runtime shape, and key constraints.

System-of-record map: `docs/index.md`.

## 2) Fast commands (run these first)
- Smoke: `make smoke`
- Agent smoke (optional): `make agent-smoke`
- Preflight: `make preflight`
- Strict smoke: `make smoke STRICT=1`
- Harness info (optional): `make doctor`

## 3) Non-negotiable invariants
- Wire existing tooling first; do not migrate the stack just to satisfy the harness.
- Keep default verification offline and deterministic unless the repo documents an opt-in integration path.
- Never commit secrets or generated credentials.

## 4) Repo map
- Entrypoints: `<paths>`
- Core domain logic: `<paths>`
- Boundaries / DTOs / config: `<paths>`
- Adapters (I/O): `<paths>`

## 5) How to finish a task
- Make the change.
- Run `make smoke`.
- (If relevant) run `make agent-smoke`.
- Run `make preflight`.
- Summarize what changed and the commands you ran.
