# Implementation alignment checklist (Tasker MVP)

Goal: keep the active docs aligned with the current repo state and make the remaining drift explicit.

This file is no longer a pre-implementation gate for a greenfield MVP. The repo already contains substantial implementation across maps, rules, persistence, Daily Orders, season flows, feedback, and local instrumentation.

System of record:
- Product spec: `prd.md`
- Epic backlog + current status snapshot: `epics/00-index.md`
- Core contracts: `epics/EPIC-01-foundation.md`
- Manual QA: `docs/E2E-CHECKLIST.md`
- Mechanics QA: `epics/QA-MECHANICS-CHECKLIST.md`

---

## 0) Current stage
The project is in an alignment/hardening stage, not a bootstrap stage.

Implemented in the repo today:
- app shell, routing, onboarding, and tutorial seed;
- campaign/region/province creation and map flows;
- domain rules, siege, recommendations, season logic, and guardrails;
- local persistence, migrations, import/export;
- Capital, Chronicle, feedback overlays, hero moments, and event export/viewer;
- broad unit/integration coverage and active smoke/preflight commands.

The highest-value remaining work is:
- reducing page-level orchestration drift via `src/features/**`;
- tightening type boundaries (`any` / casts);
- centralizing time access behind a clock boundary;
- aligning a few UI/doc semantics with shipped behavior.

---

## 1) Remaining alignment gaps
- [ ] Introduce a first-class `src/features/**` orchestration layer for route-level flows that still talk to repositories/services directly.
- [ ] Centralize time access behind a clock boundary for time-sensitive services and new mechanics.
- [ ] Remove remaining `any` / unsafe casts on domain boundaries (`siege`, `daily orders`, `domainService`, storage helpers, tests where practical).
- [ ] Align Chronicle taxonomy and event-to-chronicle mapping so narrative entries are explicit and import/export-safe.
- [ ] Align Settings copy with actual reset behavior, or extend reset to clear events if that becomes the product decision.
- [ ] Keep map slot assignment and province action gating enforced at the domain boundary, not only through page logic.

Current repo snapshot (`2026-03-12`):
- `src/game/**`, `src/map/**`, `src/storage/**`, and `src/shared/**` are already in active use.
- `src/features/**` is the primary architectural gap.
- `make smoke` and `make preflight` pass in the current repo state.

---

## 2) Contracts that must stay stable
- [ ] Province state machine remains defined by `epics/EPIC-01-foundation.md` and implemented through the rule engine, not page-local mutations.
- [ ] Meaningful-action semantics remain explicit:
  - `updatedAt` changes on any persisted mutation;
  - `lastMeaningfulActionAt` changes only on meaningful actions.
- [ ] Siege detection uses `lastMeaningfulActionAt` with `createdAt` fallback and respects the `04:00` local boundary.
- [ ] Copy layering remains stable: fantasy-first on map/home surfaces, plain language on action surfaces.
- [ ] Map runtime remains DOM/SVG-first; graph/meta data should not be derived from SVG geometry at runtime.

---

## 3) UX constraints that still matter
- [ ] The app stays map-first; no task-list-first fallback becomes the primary loop.
- [ ] Create/clarify flows stay within the `3-5` meaningful field budget.
- [ ] Passive browsing/opening must not produce progress, hero moments, or Chronicle spam.
- [ ] Pressure/hotspots remain informational and non-punitive.
- [ ] Capital remains a hub and never grants passive progress by itself.

---

## 4) Verification anchors
Use these as the active Definition-of-Done anchors for future mechanic and refactor work:

1. Onboarding: tutorial/demo path is optional, fast, and leads to first meaningful action quickly.
2. Create: campaign/region/province can be created and appears on-map or in the unplaced list.
3. Fog: a fog province can be clarified and becomes `ready`; timestamps follow the contract.
4. Siege: a province enters siege after `N=3` meaningful-action-free days and can be resolved through a tactic.
5. Daily Orders: produces at least one meaningful action without extra workflow friction.
6. Capital: acts as a hub and never grants passive progress.
7. Chronicle: only meaningful actions create readable entries.
8. Season: day number is stable with the `04:00` boundary; transition and summary/debrief work.
9. Persistence: refresh-safe; import/export roundtrip is stable.

Verification surfaces:
- Manual user-path checks: `docs/E2E-CHECKLIST.md`
- Mechanics/contract regression: `epics/QA-MECHANICS-CHECKLIST.md`
- Fast repo checks: `make smoke`, `make preflight`
