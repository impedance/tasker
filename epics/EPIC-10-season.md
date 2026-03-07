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
- season summary page (aggregates);
- short integration review after season end;
- archetype balance stats in the summary (P1 if available).
- chronicle highlights derived from meaningful actions (P1 / optional).

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
2) Show P1 stats if available: archetype balance, hero moments, share cards generated.
3) Optional: “Start new season” CTA.
**Acceptance criteria:**
- Numbers match stored data.
**DoD:**
- Summary screen is implemented.
**Estimate:** `M`

### T5. Integration review flow
**Steps:**
1) Add a 3-screen debrief: worked well / obstacles / carry forward or drop.
2) Pre-fill review suggestions from season data where possible.
3) Allow immediate next-season start after the review.
**Acceptance criteria:**
- Review can be completed in about 1–2 minutes.
- User can skip deep writing but still finish the ritual cleanly.
**DoD:**
- Review data is persisted and available for the next season.
**Estimate:** `L`

### T6. Chronicle highlights (P1 / optional)
**Goal:** strengthen “world state” attachment by showing a short, skimmable timeline derived from meaningful actions (no new mechanics).

**Steps:**
1) Define a minimal “chronicle entry” model derived from existing events (EPIC-01 Appendix B).
2) Add a “Highlights” section to season summary (or a link to a full chronicle page if implemented in EPIC-14).
3) Ensure entries never include raw free-text in public-safe contexts (EPIC-01 Appendix A).

**Acceptance criteria:**
- Highlights are fully offline and computed from local data.
- Entries only appear after meaningful actions (never from app open).

**Estimate:** `M`
