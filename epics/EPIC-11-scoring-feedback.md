# EPIC-11 — Scoring, streaks, feedback, and anti-abuse

**ID:** `EPIC-11`  
**Priority:** `P0`  
**Status:** `partial`  
**Owner:** `<TBD>`  
**PRD reference:** `prd.md` (Scoring + anti-abuse)

## 1) Objective (Outcome)
Deliver MVP game feedback without toxicity: progress-first feedback for meaningful actions, Hero Moments Lite (capped), and basic anti-abuse heuristics.

## 3) Scope
**In scope:**
- progress-first feedback (province progressStage + minimal “meaningful action” feedback);
- a lightweight “meaningful day” indicator (no harsh punishment);
- meaningful-day streak;
- soft anti-abuse warnings;
- baseline feedback copy;
- hero moments tied to meaningful actions;
- explicit no-guilt / no-empty-reward guardrails.

**Out of scope (for the first MVP cut):**
- a tuned points economy that requires balancing (can be added later as v0.2+).

## 6) Work breakdown

### T1. Specify feedback model v1 (progress-first)
**Steps:**
1) Define which domain actions trigger feedback (clarify, prepare, start, progress move logged, siege resolved, complete, recover/retreat).
2) Define what is shown:
   - subtle feedback for `prepare` actions (`province_supplied` / `province_decomposed`);
   - stronger feedback for `start` and `progress` (`province_started` / `province_move_logged`);
   - milestone feedback for `siege_resolve`, `complete`, and “meaningful day” marker.
3) Define caps so celebration never becomes pressure (see EPIC-01 Appendix A prompt budget).
**Acceptance criteria:**
- No feedback is shown for passive browsing or app opens without meaningful action.
- Feedback is understandable without a points legend/tutorial.
**DoD:**
- Feedback spec is written and ready to implement.
**Estimate:** `M`

### T2. Implement feedback wiring (UI + domain signals)
**Steps:**
1) Expose “meaningful action happened” and progressStage change signals from domain transitions.
2) Wire the UI to show minimal feedback after meaningful actions.
3) Persist the meaningful-day marker per day/season.
**Acceptance criteria:**
- Feedback triggers only on meaningful actions.
**DoD:**
- Feedback is visible in the main flow (province actions, siege tactic resolution, daily move).
**Estimate:** `L`

### T3. Meaningful-day streak (optional)
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

### T6. Hero moments (MVP Lite)
**Steps:**
1) Define allowed triggers: siege resolved, first clarity unlock, first start, 3 meaningful days, high-effort capture.
2) Add caps so only one strong hero moment appears per session.
3) Add an accessibility setting to reduce/disable celebratory intensity.
**Acceptance criteria:**
- Hero moments never trigger without meaningful action.
- Hero moments must not reward “prepare loops” (see EPIC-01 Appendix A9).
- Hero moments amplify progress without adding pressure.
**DoD:**
- Trigger rules, UI contract, and tests/spec are in place.
**Estimate:** `M`
