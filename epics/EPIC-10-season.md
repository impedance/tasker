# EPIC-10 — Season system (21-day cycle)

**ID:** `EPIC-10`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD/RFC reference:** `prd.md` (Season) / `rfc.md` (21-day cycle)

## 1) Objective (Outcome)
Introduce a 21-day season: show season day number, weekly focus hints, season summary, and auto-start a new season after completion.

## 3) Scope
**In scope:**
- Season entity + dayNumber;
- auto-start next season;
- UI display for current day number;
- season summary page (aggregates).

## 6) Work breakdown

### T1. Implement season dayNumber and boundaries
**Steps:**
1) Use EPIC-01 time contract.
2) Compute dayNumber from startedAt and the day boundary.
**Acceptance criteria:**
- Day number is stable across refreshes.
**DoD:**
- dayNumber is computed and displayed.
**Estimate:** `M`

### T2. Auto-start the next season
**Steps:**
1) On day 21 completion (or endsAt), create a new Season.
2) Update currentSeasonId.
**Acceptance criteria:**
- Season switch does not lose data.
**DoD:**
- New season is created automatically.
**Estimate:** `L`

### T3. Weekly focus hints (copy-only)
**Steps:**
1) Week 1/2/3: show a short hint on daily move/home.
2) No complex mechanics; copy only.
**Acceptance criteria:**
- User can see the weekly focus.
**DoD:**
- Weekly hints are present.
**Estimate:** `S`

### T4. Season summary screen
**Steps:**
1) Show: clarified, sieges resolved, completed, meaningful days.
2) Optional: “Start new season” CTA.
**Acceptance criteria:**
- Numbers match stored data.
**DoD:**
- Summary screen is implemented.
**Estimate:** `M`

