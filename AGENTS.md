# Agent instructions (repo-wide)

## Language policy
- **Chat (assistant responses to the user): always in Russian.**
- **Repository artifacts (documentation, markdown files, comments, commit messages, UI copy stubs): always in English.**

If a user message is in Russian, still keep repository documentation in English and only communicate in Russian in the chat.

## System of record (read first)
- Product requirements: `prd.md`
- Epic backlog + build order: `epics/00-index.md`
- Bootstrap execution sources (Week 1 slice): `epics/EPIC-02-bootstrap.md`, `epics/EPIC-03-domain-persistence.md`, `epics/EPIC-04-map-ui.md`, `epics/EPIC-05-creation-flows.md`
- Plan template: `PLANS/plan.md`
- Implementation readiness checklist: `epics/IMPLEMENTATION-READINESS.md`
- Repo map: `docs/index.md`

## Fast commands (agent harness)
- Smoke: `make smoke`
- Preflight: `make preflight`
- Strict smoke: `make smoke STRICT=1`
- Harness info (optional): `make doctor`

## Non-negotiable invariants
- Wire existing tooling first; do not migrate the stack just to satisfy the harness.
- Keep default verification offline and deterministic unless the repo documents an opt-in integration path.
- Never commit secrets or generated credentials.

## Repo map (planned after EPIC-02 bootstrap)
- Entrypoints: `src/app/main.tsx`, `src/app/App.tsx`
- Core domain logic (pure rules): `src/game/rules/**`
- Boundaries / DTOs / config: `src/entities/**`, `src/storage/**`, `src/map/**`
- Adapters (I/O): `src/storage/**`

## How to finish a task
- Make the change.
- Run `make smoke`.
- (If relevant) run `make agent-smoke`.
- Run `make preflight`.
- Summarize what changed and the commands you ran.
