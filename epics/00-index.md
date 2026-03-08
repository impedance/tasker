# Epic index (Tasker MVP)

Template: `PLANS/plan.md`.
Executable junior ticket plan (EPIC-02..05): `PLANS/EPIC-02-05-junior-tickets.md`.
Shared contracts: `epics/EPIC-01-foundation.md` (Appendix A/B).
Workstream split (Frontend vs Domain/Backend): `epics/WORKSTREAMS.md`.
Product spec (system of record): `prd.md`.
Implementation readiness checklist: `epics/IMPLEMENTATION-READINESS.md`.

## Suggested MVP build order (critical path)
1) `EPIC-01` — lock contracts (state machine, meaningful action, time boundary, event list).
2) `EPIC-02` — bootstrap app skeleton + tests/CI.
3) `EPIC-03` — domain + persistence + import/export (unblocks everything).
4) `EPIC-04` + `EPIC-05` — map surfaces + creation flows (first usable slice).
5) `EPIC-06` + `EPIC-07` — rule engine + siege/tactics (core mechanics).
6) `EPIC-11` + `EPIC-15` — feedback + capital/chronicle shell (game-first feel).
7) `EPIC-08` + `EPIC-10` — daily loop + season/debrief (rhythm).
8) `EPIC-13` — QA hardening + pilot kit.

## MVP cutline reminder
- `EPIC-09` adaptation is P1.
- `EPIC-12` local instrumentation is P1 (recommended for a measured pilot, but not required for the first MVP cut).
- `EPIC-14` share cards/export artifacts is P1.

- `epics/EPIC-01-foundation.md` — product foundation (terms/rules/flows)
- `epics/EPIC-02-bootstrap.md` — tech setup + project skeleton
- `epics/EPIC-03-domain-persistence.md` — domain models + local persistence + import/export
- `epics/EPIC-04-map-ui.md` — SVG maps + navigation
- `epics/EPIC-05-creation-flows.md` — create campaigns/regions/provinces
- `epics/EPIC-06-rule-engine.md` — rule engine: states/fog/progress/transitions
- `epics/EPIC-07-siege-tactics.md` — siege + 5 tactics
- `epics/EPIC-08-daily-loop.md` — daily move + war council
- `epics/EPIC-09-adaptation.md` — rule-based adaptation
- `epics/EPIC-10-season.md` — season (21 days) + summary
- `epics/EPIC-11-scoring-feedback.md` — scoring/streaks/anti-abuse/feedback
- `epics/EPIC-12-instrumentation.md` — events/logs + analytics export
- `epics/EPIC-13-qa-release.md` — tests/QA/release artifacts
- `epics/EPIC-14-engagement-sharing.md` — safe sharing, map cards, and engagement surfaces
- `epics/EPIC-15-world-shell.md` — capital, chronicle, theme shell (MVP game-first surfaces)
