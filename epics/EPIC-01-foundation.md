# EPIC-01 — Product foundation (PRD → backlog contract)

**ID:** `EPIC-01`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD/RFC reference:** `prd.md` / `rfc.md`

## 1) Objective (Outcome)
Make the product rules and definitions unambiguous so the team can implement the MVP without guessing, and QA can accept work against testable criteria.

## 2) Context
- `rfc.md` contains many rules and terms, but some need to be turned into an explicit contract (what counts as movement, day boundaries, what is “meaningful”).
- Without this, implementation will diverge (rule engine, siege, scoring, metrics).

## 3) Scope
**In scope:**
- glossary of entities/terms;
- province state machine (transition table + actions/events);
- definitions: meaningful move, `updatedAt`, “movement”, “decomposition”, “first step”;
- minimal metrics/events contract (what we log).

**Out of scope:**
- high-fidelity UI design (separate workstream);
- final copywriting (drafts are OK).

## 4) Deliverables
- Province state machine: states, transitions, conditions, side effects.
- Glossary of entities and minimum required fields.
- Time contract: timezone, day boundary, season day number rules.
- Minimal event schema (feeds EPIC-12).

## 5) Dependencies
- Product decisions on PRD open questions (dark mode, demo project, template decomposition, etc.).
- Technical decision: date/time handling (local user time).

## 6) Work breakdown (junior-friendly tasks)

### T1. Glossary of terms and entities
**Description:** extract terms and write strict definitions (Campaign/Region/Province, fog/siege, daily move, war council, progressStage).  
**Steps:**
1) Extract terms from `prd.md`/`rfc.md`.
2) For each term: 1–2 sentence definition + examples (1 valid, 1 not-valid).
3) Define minimum required fields per entity (what is needed for MVP).
**Acceptance criteria:**
- Definitions do not contradict each other.
- Each definition is verifiable in the product.
**DoD (done when):**
- Glossary is added as an appendix in this file or a separate md linked from here.
**Estimate:** `M`

### T2. Province state machine (transition table)
**Description:** produce a table “from → action/event → to” + conditions + side effects (fields, points, events).  
**Steps:**
1) Start from PRD states: fog/ready/siege/in_progress/fortified/captured/retreated.
2) Define domain actions: clarify, start_move, log_move, apply_tactic, complete, retreat, split, reschedule.
3) For each action: what fields change and which event is logged.
**Acceptance criteria:**
- Each transition has a condition and an explicit effect.
- No “magic” transitions without an action/event.
**DoD:**
- Transition table is written and reviewed.
**Estimate:** `L`

### T3. Define “meaningful move” and “task update”
**Description:** formalize what increases progress/points and what updates `updatedAt`.  
**Steps:**
1) List actions that are meaningful.
2) List actions that must NOT be meaningful (e.g., “just opened a screen”).
3) Define `updatedAt` update rules (e.g., only on domain actions that change state/progress/clarity).
**Acceptance criteria:**
- Unit tests can be written from this definition.
**DoD:**
- Definition is written with 3–5 example cases.
**Estimate:** `S`

### T4. Time contract: day boundary and season
**Description:** define how “day” and season day number are computed.  
**Steps:**
1) Decide timezone (user local timezone).
2) Decide day boundary (e.g., 00:00 or 04:00 local time) and document it.
3) Define behavior for DST/timezone changes (MVP minimum: how we interpret them).
**Acceptance criteria:**
- Daily move screen is stable across refreshes.
**DoD:**
- Time rules are documented with 2–3 edge cases.
**Estimate:** `M`

### T5. Minimal event schema contract (feeds EPIC-12)
**Description:** lock the event list and required fields to avoid debates during implementation.  
**Steps:**
1) P0 events: create/clarify/start/move/siege/tactic/complete/day_open/season_end/import/export.
2) For each: required fields (entityId, timestamp, payload).
3) Define `eventVersion`.
**Acceptance criteria:**
- Sufficient to compute PRD MVP metrics.
**DoD:**
- Event schema is documented and referenced from `epics/EPIC-12-instrumentation.md`.
**Estimate:** `M`

## 7) Testing and QA
- Manual checklist: run the 5 key PRD scenarios and validate against the definitions above.

## 9) Risks and mitigations
- Day boundary/timezone debate can block daily loop → decide early.
- “Meaningful” can become fuzzy → enforce via testable rules.

## 10) Open questions
- Day boundary: 00:00 vs 04:00 local time?
- Do we keep separate actions for “split” vs “decompose”, or treat them as one?

