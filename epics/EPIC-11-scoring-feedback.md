# EPIC-11 — Scoring, streaks, feedback, and anti-abuse

**ID:** `EPIC-11`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD/RFC reference:** `prd.md` (Scoring + anti-abuse) / `rfc.md` (progression rules)

## 1) Objective (Outcome)
Deliver game feedback without toxicity: points for meaningful actions, soft streaks, and basic anti-abuse heuristics.

## 3) Scope
**In scope:**
- clarify/momentum/capture/recovery points;
- meaningful-day streak;
- soft anti-abuse warnings;
- baseline feedback copy;
- hero moments tied to meaningful actions;
- explicit no-guilt / no-empty-reward guardrails.

## 6) Work breakdown

### T1. Specify scoring model v1
**Steps:**
1) For each domain action: define points granted and type.
2) Add caps/limits to prevent farming (e.g., max N clarify points per day).
**Acceptance criteria:**
- No obvious “open app and farm points” exploits.
- No reward is granted for passive app opens or empty sessions.
**DoD:**
- Scoring spec is written and ready to implement.
**Estimate:** `M`

### T2. Implement points and store them in season/profile
**Steps:**
1) Transition engine returns point side effects.
2) Persist points into Season and/or PlayerProfile.
**Acceptance criteria:**
- Points match the spec under tests.
**DoD:**
- Points are granted and visible.
**Estimate:** `L`

### T3. Meaningful-day streak
**Steps:**
1) Define which events/actions mark a day as meaningful.
2) Implement a streak that breaks softly (no harsh punishment).
**Acceptance criteria:**
- Streak does not reset territories or punish missing days.
**DoD:**
- Streak counter exists and is displayed minimally.
**Estimate:** `M`

### T4. Anti-abuse heuristics (soft warnings)
**Steps:**
1) Prevent progress without clarity (fog).
2) Detect over-planning: frequent splitting without starting.
3) Detect too many micro-tasks and suggest merging.
4) Detect long sessions without meaningful action and reduce celebratory feedback.
**Acceptance criteria:**
- Warnings do not block legitimate use.
**DoD:**
- Warnings are implemented and testable.
- Guardrails from EPIC-01 Appendix A are enforced (no rewards without action, prompt budget).
**Estimate:** `L`

### T5. Feedback copy (minimum viable)
**Steps:**
1) Draft copy for clarify/start/capture/recover.
2) Draft non-shaming siege copy.
**Acceptance criteria:**
- Tone is neutral-positive, not childish.
**DoD:**
- Copy is wired into UI components.
**Estimate:** `S`

### T6. Hero moments (P1)
**Steps:**
1) Define allowed triggers: siege resolved, first clarity unlock, first start, 3 meaningful days, high-effort capture.
2) Add caps so only one strong hero moment appears per session.
3) Add an accessibility setting to reduce/disable celebratory intensity.
**Acceptance criteria:**
- Hero moments never trigger without meaningful action.
- Hero moments amplify progress without adding pressure.
**DoD:**
- Trigger rules, UI contract, and tests/spec are in place.
**Estimate:** `M`
