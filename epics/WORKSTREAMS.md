# Workstreams (Frontend vs Domain/Backend)

Tasker MVP is a **backend-free** offline SPA. In this repo, “backend” means **in-browser domain logic**: entities, persistence, rules, recommendations, and derived signals (not a server).

## Definitions

- **Frontend (FE):** React UI, routing/navigation, screens, SVG map rendering + interactions, theming tokens, copy wiring, accessibility affordances.
- **Domain/Backend (BE):** entity schemas + runtime validation, repositories + IndexedDB/localForage storage, import/export + migrations, rule engine transitions, recommendation algorithms, derived signals (pressure/hotspots), event logging.
- **Shared:** contracts, cross-cutting wiring, tests (unit/integration/E2E), CI, QA checklists.

## Ownership by folder (guideline, not a hard rule)

- **FE owns (primary):** `src/app/**`, `src/pages/**`, `src/shared/ui/**`, `src/shared/theme/**`, `pics/**` (or any UI asset folder), SVG rendering components.
- **BE owns (primary):** `src/entities/**`, `src/storage/**`, `src/game/rules/**`, recommendation logic under `src/game/**`, seed/templates data under `src/**` (wherever it lives).

Rule of thumb: FE can call BE code, but FE should not mutate domain state directly; it should invoke BE “commands” (applyAction / create* / import/export).

## Epic ownership (who leads what)

Legend: **Primary** = the “lead” junior; **Secondary** = support/PR review.

| Epic | Primary | Secondary | Notes / Integration checkpoints |
|---|---|---|---|
| `EPIC-01` Foundation/contracts | Shared | Shared | Must be locked first: actions, time boundary, state machine, event list. |
| `EPIC-02` Bootstrap | FE | Shared | App skeleton, routing, test harness, CI. Provide stable module layout early. |
| `EPIC-03` Domain + persistence | BE | Shared | Repos + import/export + migrations unblock all UI work. |
| `EPIC-04` Map UI (SVG) | FE | BE | Needs `Province.state`, `province.mapSlotId`, derived `frontPressureLevel`. |
| `EPIC-05` Creation flows | FE | BE | BE provides create/update commands; FE owns UX + forms + onboarding screens. |
| `EPIC-06` Rule engine | BE | FE | FE consumes transition errors + derived state to keep UI simple. |
| `EPIC-07` Siege + tactics | BE | FE | BE implements tactics; FE builds siege/tactic UI and feedback hooks. |
| `EPIC-08` Daily loop | BE | FE | BE owns recommendation algo; FE owns Daily Orders + War Council UI. |
| `EPIC-09` Adaptation (P1) | BE | FE | Mostly domain + recommendation layer; FE adds explanation surfaces. |
| `EPIC-10` Season | BE | FE | BE computes boundaries/aggregates; FE implements summary/debrief screens. |
| `EPIC-11` Feedback + anti-abuse | Shared | Shared | BE defines triggers/guards; FE implements feedback UI + settings. |
| `EPIC-12` Instrumentation (P1) | BE | FE | BE implements logger/export; FE adds Settings/export UI and optional viewer. |
| `EPIC-13` QA + release | Shared | Shared | Test ownership follows code ownership; release docs shared. |
| `EPIC-14` Sharing (P1) | FE | BE | FE builds card rendering/export; BE defines safe redaction rules + persistence. |
| `EPIC-15` World shell | FE | BE | FE builds Capital/Chronicle UI; BE owns chronicle entry generation rules/caps. |

## Two-junior staffing plan (recommended)

### Phase 0 — Lock contracts (shared, short)
**Goal:** prevent FE/BE divergence.

- Freeze the “public” interfaces (even if implementation is stubbed):
  - entity types (Campaign/Region/Province + key fields),
  - repository interfaces (CRUD + listBy*),
  - command/transition API (`applyAction(state, action)` or equivalent),
  - import/export API,
  - error model (user-facing domain errors).

### Phase 1 — Week 1 usable slice (parallel)

**BE junior (lead):**
- `EPIC-03`: types + validation + repositories + schemaVersion + migrations + import/export.

**FE junior (lead):**
- `EPIC-02`: app skeleton + routing + test harness.
- `EPIC-04`: SVG map rendering + slot binding + Province Drawer skeleton + unplaced list.
- `EPIC-05`: creation flows UI (forms + quick-add + onboarding choice screens).

**Sync checkpoints (non-negotiable):**
1) After BE lands minimal repos for Campaign/Region/Province, FE replaces mocks with real repos.
2) After BE lands import/export + schemaVersion, FE wires Settings UI to it (no custom JSON shape).

### Phase 2 — Core mechanics (still split)

**BE lead:** `EPIC-06` + `EPIC-07` + recommendation logic for `EPIC-08`.  
**FE lead:** siege screens, tactics selection UI, daily ritual screens, map feedback wiring.

### Phase 3 — “Game feel” surfaces

**FE lead:** `EPIC-15` Capital/Chronicle IA + copy layering; map polish.  
**BE lead:** chronicle entry generation caps, meaningful-day logic, derived signals.

## Practical ticketing rule (so handoffs are obvious)

When creating tasks (or splitting existing ones), tag them explicitly:
- `[FE]` UI-only changes
- `[BE]` domain/persistence/rules-only changes
- `[SHARED]` tests/CI/contracts/cross-cutting wiring

And add one “integration” sentence:
“FE is blocked until BE provides `<function/type>`” or “BE needs FE screen `<route>` to wire events”.

