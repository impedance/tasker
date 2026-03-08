# EPIC-06 — Rule engine: fog, progress, state transitions

**ID:** `EPIC-06`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD reference:** `prd.md` (Game rules)

## 1) Objective (Outcome)
Create a single rule engine entry point for all province state transitions, and compute fog/progress by rules rather than UI mutations.

## 3) Scope
**In scope:**
- domain actions + pure transition functions;
- fog rule (required clarity fields);
- stage-based progress (`progressStage`);
- province roles (lightweight flags) and their rule-level implications (recommended moves/copy hooks);
- pressure signals (front pressure level, hotspot tagging) computed from states/history;
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
1) Define action types:
   - meaningful: clarify, supply, decompose, start_move, log_move, apply_tactic, complete, retreat, reschedule
   - non-meaningful: edit_fields (cosmetic/administrative updates)
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
3) Apply derived state rules where applicable (e.g., `fortified` trigger from EPIC-01 transition table).
**Acceptance criteria:**
- Invalid transitions return explicit errors.
**DoD:**
- Covered by tests.
**Estimate:** `XL`

### T4. Stage-based progress (`progressStage`)
**Steps:**
1) Define criteria for each stage (scouted/prepared/entered/held/captured).
2) Update progress via actions only.
**Acceptance criteria:**
- Progress increases only when rules allow it.
**DoD:**
- Tests cover stage changes.
**Estimate:** `L`

### T5. Province roles (MVP)
**Steps:**
1) Define `provinceRole` enum and defaults (`standard`).
2) Define lightweight rule hooks:
   - fortress → prefer engineer/supply before assault,
   - watchtower → prefer scout/fog clearing,
   - depot/archive → prefer supply/clarify actions.
3) Ensure roles never create new mechanics; they only influence recommendations/copy/icons.
**Acceptance criteria:**
- Roles are optional and safe to ignore without breaking flows.
**Estimate:** `M`

### T6. Pressure signals (front pressure, hotspots)
**Steps:**
1) Define `frontPressureLevel` computation inputs (siege/fortified/repeated retreat/long stalling).
2) Update `isHotspot` and `frontPressureLevel` as derived fields (or persisted if needed for performance).
3) Ensure pressure is never punitive: no territory loss; no penalties for missed days.
**Acceptance criteria:**
- Pressure can be rendered as map highlights without additional UI forms.
**Estimate:** `M`

### T7. Minimal runtime validation
**Steps:**
1) Validate ranges (effort/clarity), required IDs, and required fields for actions.
2) Provide user-friendly errors for UI.
**Acceptance criteria:**
- Invalid data cannot be persisted.
**DoD:**
- Validators exist and are used by repositories/actions.
**Estimate:** `M`
