# Harness Plan

- Harness version: 0.6
- Detected stacks: <unknown>

## Current tooling
- Lint: `npm run lint` (planned; wire in EPIC-02)
- Typecheck: `npm run typecheck` (planned; wire in EPIC-02)
- Tests: `npm test` (planned; wire in EPIC-02)
- CI: `.github/workflows/agent-harness.yml`

## Open placeholders
- Code map paths: `src/app`, `src/pages`, `src/entities`, `src/features`, `src/game`, `src/map`, `src/storage`, `src/shared`
- Typing surfaces: `src/game/rules`, `src/storage`, `src/map`, `src/storage/import_export`
- Test map wiring: `make smoke` (structural + best-effort), `make preflight` (structural + best-effort + typecheck)
