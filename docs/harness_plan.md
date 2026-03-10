# Harness Plan

- Harness version: 0.6
- Detected stacks: Node

## Current tooling
- Lint: `npm run lint` via `eslint.config.mjs`
- Typecheck: `npm run typecheck` via `tsconfig.json` + `tsconfig.node.json`
- Tests: `npm test` (Vitest) and `npm run e2e` (Playwright)
- CI: `.github/workflows/agent-harness.yml`, `.github/workflows/ci.yml`

## Open placeholders
- Code map paths: resolved in `docs/index.md`
- Typing surfaces: resolved in `docs/index.md`
- Test map wiring: `make smoke` runs structural + `npm run lint` + `npm test`; `make preflight` adds `npm run typecheck` (and can include `make e2e` via `E2E=1`)
