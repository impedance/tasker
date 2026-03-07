# EPIC-07 — Siege system and anti-procrastination tactics

**ID:** `EPIC-07`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD/RFC reference:** `prd.md` (Siege + tactics) / `rfc.md` (mechanics)

## 1) Objective (Outcome)
Implement “siege” as a gentle mode for stalled tasks: auto-trigger, tactic selection UI, tactic effects, and logging.

## 3) Scope
**In scope:**
- siege rule (N=3 days without meaningful update, per `epics/EPIC-01-foundation.md` Appendix C `updatedAt` contract);
- `SiegeEvent` entity;
- siege screen;
- 5 tactics with explicit effects;
- rule-based exit from siege.

## 6) Work breakdown

### T1. Siege detection + SiegeEvent creation
**Steps:**
1) Implement a detector at app startup and/or province open to check `updatedAt`.
2) If no movement for N days → set `siege` and create a SiegeEvent.
**Acceptance criteria:**
- Siege triggers predictably by the rule.
**DoD:**
- Unit tests cover the N=3 logic.
**Estimate:** `L`

### T2. Siege screen (UI)
**Steps:**
1) Show minimal reason/context.
2) Show 5 tactics with short descriptions.
3) Selecting a tactic applies it and updates the province.
**Acceptance criteria:**
- User can resolve siege.
**DoD:**
- Screen is wired in navigation.
**Estimate:** `M`

### T3. Implement 5 tactics as domain actions
**Steps:**
1) Scout: drive clarification of outcome/first step/entry time.
2) Supply: store “resources” (links/context) and update `updatedAt`.
3) Engineer: split into 3–5 sub-provinces (MVP: create new provinces and link them).
4) Raid: create a 5-minute DailyMove and update progress.
5) Retreat: set `retreated` or reschedule.
**Acceptance criteria:**
- Each tactic has a verifiable data effect.
**DoD:**
- All tactics work end-to-end.
**Estimate:** `XL`

### T4. Log tactic effectiveness
**Steps:**
1) Track `tactic_applied`.
2) Track subsequent progress and correlate minimally (provinceId + timestamps).
**Acceptance criteria:**
- Exported events can be used to compute “what works”.
**DoD:**
- Events exist (see EPIC-12).
**Estimate:** `M`
