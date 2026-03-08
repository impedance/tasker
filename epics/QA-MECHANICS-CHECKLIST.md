# QA checklist — core mechanics (MVP)

Goal: verify the MVP mechanics match the contracts and cannot be exploited by passive use or “prepare-only” loops.

Sources of truth:
- PRD: `prd.md`
- Contracts: `epics/EPIC-01-foundation.md` (Appendices A–I)
- Readiness: `epics/IMPLEMENTATION-READINESS.md`

---

## 1) Passive use must not reward
- [ ] Open app, browse maps, open/close drawers → no meaningful actions recorded, no hero moments, no chronicle entries.
- [ ] Complete a check-in but do not act → no progress, no hero moments.
- [ ] Generate/export share artifacts (if P1) → no progress and no “meaningful day” credit.

## 2) Fog contract
- [ ] Create a province with missing clarity fields → it is `fog`.
- [ ] Clarify by filling Outcome + First step + Entry time → transitions to `ready`.
- [ ] `lastMeaningfulActionAt` updates only on meaningful actions (clarify counts, cosmetic edits do not).

## 3) Start vs progress logging
- [ ] `start_move` from `ready` transitions to `in_progress`.
- [ ] `log_move` in `in_progress` creates `province_move_logged` and updates `lastMeaningfulActionAt`.
- [ ] `log_move` is impossible (or no-op) for `fog` provinces.

## 4) Prepare actions (supply/decompose)
- [ ] `supply` adds context fields (`contextLinks/contextNotes`) and is meaningful (`province_supplied`).
- [ ] `decompose` creates 3–5 sub-provinces and increments `decompositionCount` (and is meaningful).
- [ ] Prepare actions do not unlock strong hero moments by themselves (per caps and anti-exploit rules).

## 5) Siege detection (N=3)
- [ ] Siege uses `lastMeaningfulActionAt` (fallback `createdAt`), not `updatedAt`.
- [ ] Province in eligible states (`ready/in_progress/fortified`) enters `siege` after 3 meaningful-action-free days (04:00 boundary).
- [ ] Province in ineligible states (`fog/siege/captured/retreated`) never auto-enters siege.

## 6) Siege resolution
- [ ] Selecting a tactic applies verifiable data changes (clarity/context/decomposition/start/retreat).
- [ ] Siege resolution logs `tactic_applied` and updates `lastMeaningfulActionAt`.

## 7) Prepare-loop anti-exploit (soft)
- [ ] After 3+ prepare actions without start/progress/complete/retreat in 7 days:
  - Daily Orders biases toward `raid` or `retreat`.
  - Celebratory intensity is reduced for further prepare actions until a real step happens.

## 8) Time boundaries
- [ ] “Meaningful day” uses the 04:00 local boundary.
- [ ] Late-night actions (before/after 04:00) bucket correctly and remain stable across refreshes.

## 9) Capital/Chronicle constraints
- [ ] Capital is a hub: leads to actions fast; never grants progress itself.
- [ ] Chronicle entries are created only after meaningful actions and are capped (no spam for prepare-only actions).

