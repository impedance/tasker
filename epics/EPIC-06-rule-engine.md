# EPIC-06 — Rule engine: fog, progress, state transitions

**ID:** `EPIC-06`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD/RFC reference:** `prd.md` (Game rules) / `rfc.md` (states/mechanics)

## 1) Objective (Outcome)
Create a single rule engine entry point for all province state transitions, and compute fog/progress by rules rather than UI mutations.

## 3) Scope
**In scope:**
- domain actions + pure transition functions;
- fog rule (required clarity fields);
- stage-based progress (`progressStage`);
- minimal runtime validation.

**Out of scope:**
- siege tactics implementation details (EPIC-07) beyond action plumbing.

## 4) Deliverables
- `game/rules/applyAction(...)` (or equivalent) returning new state + side effects.
- `Action` types and payload validation.
- Unit tests for transitions.

## 6) Work breakdown

### T1. Define domain action set
**Steps:**
1) Define action types: clarify, decompose, start_move, log_move, apply_tactic, complete, retreat, reschedule.
2) Define payload schema for each.
**Acceptance criteria:**
- Actions cover all transitions from EPIC-01.
**DoD:**
- Actions are defined and exported.
**Estimate:** `M`

### T2. Implement fog rule
**Steps:**
1) `isFog(province)` based on required fields.
2) `clarify` action updates fields and removes fog.
**Acceptance criteria:**
- Fog is removed only when required fields are present.
**DoD:**
- Unit tests exist.
**Estimate:** `M`

### T3. Implement applyAction and transition enforcement
**Steps:**
1) `applyAction(state, action)` returns new province + side effects or error.
2) Ensure UI does not set `state` directly.
**Acceptance criteria:**
- Invalid transitions return explicit errors.
**DoD:**
- Covered by tests.
**Estimate:** `XL`

### T4. Stage-based progress (`progressStage`)
**Steps:**
1) Define criteria for each stage (scouted/decomposed/started/sustained/captured).
2) Update progress via actions only.
**Acceptance criteria:**
- Progress increases only when rules allow it.
**DoD:**
- Tests cover stage changes.
**Estimate:** `L`

### T5. Minimal runtime validation
**Steps:**
1) Validate ranges (effort/clarity), required IDs, and required fields for actions.
2) Provide user-friendly errors for UI.
**Acceptance criteria:**
- Invalid data cannot be persisted.
**DoD:**
- Validators exist and are used by repositories/actions.
**Estimate:** `M`
