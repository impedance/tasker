# EPIC-08 — Daily move and war council loops

**ID:** `EPIC-08`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD/RFC reference:** `prd.md` (Daily move, War council) / `rfc.md` (loops)

## 1) Objective (Outcome)
Add daily ritual loops: start-of-day “Daily move” (3 suggestions) and end-of-day “War council” (if-then plans).

## 3) Scope
**In scope:**
- Commander check-in before daily move;
- Daily move screen;
- algorithm to pick 3 recommendations v1 (rule-based, baseline/non-personalized);
- War council screen;
- If-then plan CRUD;
- Daily move history (minimum: last N).

## 6) Work breakdown

### T0. Commander check-in
**Steps:**
1) Add a 3-field ritual: emotion, available time, energy.
2) Persist the check-in and bind it to the presented recommendations.
3) Show a short “why these 3 moves” explanation.
**Acceptance criteria:**
- Check-in can be completed in 3–5 seconds.
- Daily recommendations react to the selected state.
**DoD:**
- Check-in works end-to-end with persistence.
- Events match EPIC-01 Appendix B (`checkin_started`, `checkin_completed`).
**Estimate:** `M`

### T1. Daily move screen
**Steps:**
1) UI: 3 cards (raid/supply/scout/assault/retreat) with durations.
2) “Do it” creates a DailyMove and applies the corresponding domain action.
**Acceptance criteria:**
- User can perform at least one meaningful action from this screen.
**DoD:**
- Screen works end-to-end.
- Events match EPIC-01 Appendix B (`daily_move_viewed`, `daily_move_selected`) including `interventionId`.
**Estimate:** `L`

### T2. Recommendation algorithm v1 (3 moves)
**Steps:**
1) Candidate pool: ready/sieged/in_progress provinces.
2) Rules: one light (5m), one medium (15m), one main (25m+), adjusted by current check-in.
3) Tie-breakers: recency, dueDate (if any), history.
**Acceptance criteria:**
- Recommendations always resolve (no empty state without explanation).
- Recommendations can explain the influence of current state/history.
**DoD:**
- Unit tests cover 5–7 scenarios.
**Estimate:** `XL`

### T3. War council screen + IfThenPlan CRUD
**Steps:**
1) UI: select province → fill trigger/action.
2) Enforce 1–3 plans per day (MVP).
3) Show active plans.
**Acceptance criteria:**
- Plans persist and are visible the next day.
**DoD:**
- CRUD works.
**Estimate:** `L`

### T4. Daily move history (minimum)
**Steps:**
1) List last N moves (date, province, type, duration).
2) Optional: filter by date.
**Acceptance criteria:**
- User can see what they did yesterday.
**DoD:**
- History is accessible.
**Estimate:** `M`
