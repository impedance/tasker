# EPIC-13 — Testing, QA, and release prep

**ID:** `EPIC-13`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD reference:** `prd.md` (Testing/Release)

## 1) Objective (Outcome)
Stabilize the MVP for a 21-day pilot: tests for critical rules and flows, a regression checklist, deploy setup, and pilot documentation.

## 3) Scope
**In scope:**
- unit tests for rule engine/feedback;
- integration tests for storage/import/export/migrations;
- end-to-end E2E smoke scenario;
- README + user guide + known limitations + feedback form template;
- release checklist.
- Minimal verification checklist for core MVP scenarios (see `epics/IMPLEMENTATION-READINESS.md`).

## 6) Work breakdown

### T1. Unit tests for rule engine and feedback
**Steps:**
1) Cover fog/ready/in_progress/captured/retreated transitions.
2) Cover siege enter/exit (minimum).
3) Cover feedback/meaningful-day trigger rules (no passive rewards).
**Acceptance criteria:**
- Critical cases from EPIC-01 are covered.
**DoD:**
- Unit suite is green in CI.
**Estimate:** `XL`

### T2. Integration tests for persistence
**Steps:**
1) CRUD + relationships.
2) Import/export roundtrip.
3) Migrations.
**Acceptance criteria:**
- Data is never lost across refresh/import.
**DoD:**
- Integration suite is green in CI.
**Estimate:** `L`

### T3. E2E “user path” scenario
**Steps:**
1) Onboarding → start tutorial campaign (or create campaign) → clarify fog → resolve siege via a tactic → Daily Orders → Chronicle → Capital → season summary/debrief (minimum).
2) Run in CI (headless).
**Acceptance criteria:**
- Stable test (no flakiness).
**DoD:**
- E2E is green in CI.
**Estimate:** `XL`

### T4. Regression checklist
**Steps:**
1) Write 15–25 items (refresh, import/export, siege timer, day boundary).
2) Include “no data loss” checks.
**Acceptance criteria:**
- Checklist can be run in ≤20 minutes.
**DoD:**
- Checklist is stored in the repo.
**Estimate:** `M`

### T5. Release docs and pilot kit
**Steps:**
1) README: how to run dev/build/test.
2) User guide: 5 core scenarios and how to use the app.
3) Known limitations.
4) Feedback form template (questions).
**Acceptance criteria:**
- Pilot users can start without developer support.
**DoD:**
- Docs are complete and readable.
**Estimate:** `L`
