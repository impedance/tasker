# Implementation readiness checklist (Tasker MVP)

Goal: keep the MVP implementable without guessing by locking contracts, cutlines, and minimum verification.

This checklist is intentionally biased toward the offline/browser-only MVP.

System of record:
- Product spec: `prd.md`
- Core contracts: `epics/EPIC-01-foundation.md`
- Build order: `epics/00-index.md`
- Manual QA: `docs/E2E-CHECKLIST.md`
- Mechanics QA: `epics/QA-MECHANICS-CHECKLIST.md`

---

## 0) Definition of “ready to implement”
The MVP is ready when:
- critical rules are explicit and testable;
- UI labels map to concrete domain actions;
- map binding rules are fixed;
- time boundaries are fixed;
- minimum verification exists for the core gameplay loop.

If any item below is unclear, implementation will drift across EPICs and create rework.

---

## 1) Contracts to lock (must be P0)
- [ ] Province state machine + transition table are final: `epics/EPIC-01-foundation.md` (Appendix D).
- [ ] Meaningful-action contract is final: what counts, what never counts, and what updates `lastMeaningfulActionAt`: `epics/EPIC-01-foundation.md` (Appendix C).
- [ ] Timestamp contract is final:
  - `updatedAt` changes on any persisted mutation;
  - `lastMeaningfulActionAt` changes only on meaningful actions.
- [ ] Siege detection contract is final:
  - uses `lastMeaningfulActionAt` with `createdAt` fallback;
  - applies only to eligible states;
  - respects the 04:00 local boundary.
- [ ] Day-boundary contract is final: `04:00` local time.
- [ ] Progress-stage contract is final: exact rules for stage movement.
- [ ] Copy-layering contract is final: fantasy-first on map/home, plain-language on action surfaces.
- [ ] Map runtime decision is final: DOM/SVG-first with pan/zoom wrapper isolated from domain logic.

Current repo snapshot (`2026-03-12`):
- `src/game/**`, `src/map/**`, `src/storage/**`, and `src/shared/**` exist.
- The main target-state gap remains `src/features/**`.
- Repositories and several services still call `new Date()` directly, so the clock boundary is not fully centralized yet.

---

## 2) UX constraints (non-negotiable for MVP)
- [ ] The app stays map-first. No task-list-first fallback UI becomes the primary loop.
- [ ] Field budget stays tight:
  - create/clarify flows require at most `3-5` meaningful fields;
  - map click to real action stays within `<= 2` clicks.
- [ ] No passive rewards:
  - no progress for browsing/opening;
  - no streak shame;
  - no celebratory loops for passive use.
- [ ] Map art direction stays readability-first:
  - political/front-map look;
  - theme expressed via copy, icons, and simple overlays.
- [ ] Motion stays functional:
  - only state-change/feedback transitions;
  - reduced-motion safe;
  - no ambient loops that delay action.

---

## 3) Map binding contract (avoid rework)
MVP assumption: maps are fixed SVG templates, not procedural maps.

- [ ] `Region.mapTemplateId` is part of the persisted model.
- [ ] `Province.mapSlotId` is a stable slot key inside the selected SVG template.
- [ ] SVG slot convention is stable:
  - province slots use `data-slot-id="pNN"`;
  - campaign/region binding uses stable IDs, not geometry inference.
- [ ] Overflow behavior is explicit:
  - if no free slot exists, `mapSlotId` may be empty;
  - unplaced provinces remain visible, playable, and assignable later.
- [ ] Slot collisions are blocked at the domain boundary, not only in UI.

---

## 4) Action taxonomy (UI -> domain)
- [ ] UI move labels map 1:1 to domain actions/events:
  - `scout` -> `clarify` -> `province_clarified`
  - `supply` -> `supply` -> `province_supplied` or siege tactic result
  - `engineer` -> `decompose` -> `province_decomposed`
  - `raid` -> `start_move` -> `province_started`
  - `assault` -> `start_move` or `log_move` -> `province_started` / `province_move_logged`
  - `retreat` -> `retreat` or `reschedule` -> `province_retreated`
- [ ] If a mapping is not implemented, the corresponding UI move must not exist.
- [ ] Province Details and Province Drawer availability must follow transition helpers, not local ad hoc logic.

Source of truth:
- `epics/EPIC-01-foundation.md` (Appendix H)
- `epics/EPIC-06-rule-engine.md`

---

## 5) MVP cutlines
- P0 must ship: `EPIC-02/03/04/05/06/07/11/15` plus minimal `EPIC-08/10` loop and `EPIC-13` verification.
- P1 may slip without breaking the pilot: `EPIC-09`, `EPIC-12`, `EPIC-14`.

Reference: `epics/00-index.md`.

---

## 6) Minimum verification
Use these as Definition-of-Done anchors across EPICs:

1. Onboarding: tutorial/demo path is optional, fast, and leads to first meaningful action quickly.
2. Create: campaign/region/province can be created and appears either on-map or in the unplaced list.
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
