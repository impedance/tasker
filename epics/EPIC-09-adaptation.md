# EPIC-09 — Rule-based adaptation engine

**ID:** `EPIC-09`  
**Priority:** `P1`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD/RFC reference:** `prd.md` (Adaptation) / `rfc.md` (rule examples)

## 1) Objective (Outcome)
Personalize hints and daily/tactic prioritization using rule-based adaptation grounded in the user’s friction history.

Notes:
- Baseline (non-personalized) recommendations are part of `epics/EPIC-08-daily-loop.md` (Recommendation algorithm v1).
- This epic is the “personalization layer” and is optional for the first MVP cut.

## 3) Scope
**In scope:**
- signal collection into `PlayerProfile.frictionStats`;
- check-in state as a recommendation signal;
- 5–8 recommendation rules;
- a short “why this is recommended” explanation;
- a lightweight tactics codex / personal strategy layer.

**Out of scope:**
- ML, complex segmentation.

## 6) Work breakdown

### T1. Define frictionStats and signals
**Steps:**
1) Define fields: stall ratios by friction type, tactic success rate, active time windows, check-in patterns.
2) Decide which actions/events update each signal.
**Acceptance criteria:**
- Enough data to power 5–8 rules.
**DoD:**
- Profile schema is defined and documented.
**Estimate:** `M`

### T2. Implement profile updates from actions/events
**Steps:**
1) Update aggregates on clarify/start/complete/siege/tactic/check-in actions.
2) Add tests for predictable updates.
**Acceptance criteria:**
- Profile changes as expected given a sequence of actions.
**DoD:**
- Update logic is implemented and tested.
**Estimate:** `L`

### T3. Implement recommendation rules v1
**Steps:**
1) Implement RFC-inspired rules: ambiguity → scout; heavy tasks stall → engineer; raid success → boost raids; morning success → schedule main move; no deadlines → suggest soft deadline; low energy + low time → recovery/light move.
2) Implement rule priority/scoring.
3) Generate short “why” strings.
**Acceptance criteria:**
- Recommendations change after history accumulates.
**DoD:**
- Tests cover “before/after history” for 3–4 cases.
**Estimate:** `XL`

### T4. Tactics codex (P1)
**Steps:**
1) Summarize successful tactics, repeated siege patterns, and productive time windows.
2) Expose the codex as a read-only personal strategy view.
3) Allow daily move explanations to reference codex insights.
**Acceptance criteria:**
- Codex is generated only from real events.
- It helps interpretation without becoming required for the main flow.
**DoD:**
- A minimum codex view/spec is documented and backed by data.
**Estimate:** `L`
