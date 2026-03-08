# Implementation readiness checklist (Tasker MVP)

Goal: make implementation startable without guessing by locking contracts, decisions, and verification steps.

This checklist is intentionally biased toward **P0 MVP** (offline, no backend). It links to the system-of-record docs:
- Product spec: `prd.md`
- Contract/spec hardening: `epics/EPIC-01-foundation.md`
- Execution backlog: `epics/00-index.md`

---

## 0) Definition of “ready to implement”
The MVP is “ready to implement” when:
- critical rules are unambiguous and testable (state machine, timestamps, meaningful action);
- UI-to-domain action mapping is explicit (no “assault means ???” debates);
- map binding rules are explicit (how provinces attach to fixed SVG slots + overflow behavior);
- time boundaries are locked (day boundary, season day number);
- there is a minimal verification checklist for the 5–8 core scenarios.

If any item below is missing, implementation will drift across EPICs and create rework.

---

## 1) Contracts to lock (must be P0)
- [ ] Province state machine + transition table is final: `epics/EPIC-01-foundation.md` (Appendix D).
- [ ] Meaningful action contract is final (what counts / what never counts): `epics/EPIC-01-foundation.md` (Appendix C).
- [ ] Timestamp contract is final:
  - `updatedAt` changes on any persisted mutation;
  - `lastMeaningfulActionAt` changes only on meaningful actions: `epics/EPIC-01-foundation.md` (Appendix C).
- [ ] Siege detection contract uses `lastMeaningfulActionAt` (fallback `createdAt`) and eligible states: `epics/EPIC-01-foundation.md` (Appendix C) + `epics/EPIC-07-siege-tactics.md`.
- [ ] Day boundary/time contract is final (04:00 local time): `epics/EPIC-01-foundation.md` (Appendix E).
- [ ] Progress stage contract is final (exact stage update rules): `epics/EPIC-01-foundation.md` (Appendix G).
- [ ] Copy layering contract is final (fantasy-first on map/home, plain-language on action surfaces): `epics/EPIC-01-foundation.md` (Appendix F).
- [ ] Frontend “primitives layer” decision is locked (shadcn/ui + Radix; temporary system icons via Lucide) to avoid UI drift across EPICs: `prd.md` (Technical architecture).
- [ ] Map interaction runtime decision is locked (DOM/SVG-first + pan/zoom wrapper for MVP) and is kept decoupled from domain logic: `epics/EPIC-04-map-ui.md`.

---

## 2) UX constraints (non-negotiable for MVP)
- [ ] “Map-first” constraint is enforced (no task-list-first UI): `prd.md` (UX principles) + `epics/EPIC-04-map-ui.md`.
- [ ] Field budget is enforced:
  - create/clarify requires max 3–5 fields;
  - map click → real action in ≤2 clicks: `prd.md` (UX requirements) + `epics/EPIC-04-map-ui.md` (T8) + `epics/EPIC-05-creation-flows.md` (T5).
- [ ] No toxic reward loops (no passive rewards, no streak shame): `epics/EPIC-01-foundation.md` (Appendix A).
- [ ] Map art direction is locked: political/front map readability-first; theme via iconography/copy: `epics/EPIC-04-map-ui.md`.
- [ ] Motion policy is locked: only state-change/hero-moment transitions; reduced-motion safe defaults; no ambient loops that delay entry into action: `prd.md` (Technical architecture) + `epics/EPIC-15-world-shell.md`.

---

## 3) Map binding contract (avoid rework)
MVP assumption: maps are fixed SVG templates (no procedural generation).

- [ ] `Region.mapTemplateId` is defined (default `region_v1`): `prd.md` (entities).
- [ ] `Province.mapSlotId` is defined as a stable slot key within the region template:
  - SVG uses `data-slot-id="p01" ...`;
  - province stores `mapSlotId="p01" ...`: `epics/EPIC-04-map-ui.md`.
- [ ] Overflow behavior is explicit:
  - if no free slot exists, `mapSlotId` can be empty;
  - “unplaced” provinces remain fully playable via a list panel and can be reassigned later: `epics/EPIC-04-map-ui.md` + `epics/EPIC-05-creation-flows.md`.

---

## 4) Action taxonomy (UI → domain)
- [ ] UI move labels map 1:1 to domain actions/events:
  - `scout` → `clarify` (fog → ready) → `province_clarified`
  - `supply` → `supply` (context fields) → `tactic_applied` (if in siege) or `province_supplied` (if out of siege)
  - `engineer` → `decompose` → `province_decomposed`
  - `raid` → `start_move` with a time cap → `province_started`
  - `assault` → `start_move` or `log_move` (real step) → `province_started`/`province_move_logged`
  - `retreat` → `retreat/reschedule` → `province_retreated`

If a mapping is not implemented in MVP, the UI move must not exist.

Source of truth: `epics/EPIC-01-foundation.md` (Appendix H) + `epics/EPIC-06-rule-engine.md`.

---

## 5) MVP cutlines (what can slip without breaking the pilot)
- P0 must ship: EPIC-02/03/04/05/06/07/11/15 + minimal EPIC-08/10 loop + EPIC-13 checklist.
- P1 can slip: EPIC-09 adaptation, EPIC-12 instrumentation, EPIC-14 sharing/export.
Reference: `epics/00-index.md`.

---

## 6) Verification checklist (minimum)
Use these as “Definition of Done” anchors across EPICs:

1) **Onboarding**: tutorial campaign optional, first meaningful action ≤60s: `epics/EPIC-05-creation-flows.md` (T0).
2) **Create**: campaign/region/province created, assigned to map slot or “unplaced”, visible and openable: `epics/EPIC-03-domain-persistence.md` + `epics/EPIC-04-map-ui.md`.
3) **Fog**: fog province can be clarified and becomes ready; timestamps updated per contract: `epics/EPIC-06-rule-engine.md`.
4) **Siege**: province enters siege after N=3 meaningful-action-free days; resolves via a tactic with verifiable data changes: `epics/EPIC-07-siege-tactics.md`.
5) **Daily Orders**: produces at least 1 meaningful action without extra forms; “why” is explainable: `epics/EPIC-08-daily-loop.md`.
6) **Capital**: home shows front summary + links into action; does not reward passive viewing: `epics/EPIC-15-world-shell.md`.
7) **Chronicle**: entries appear only after meaningful actions and are human-readable: `epics/EPIC-15-world-shell.md`.
8) **Season**: day number stable with 04:00 boundary; summary/debrief works: `epics/EPIC-10-season.md`.
9) **Persistence**: refresh safe; import/export roundtrip stable: `epics/EPIC-03-domain-persistence.md`.
