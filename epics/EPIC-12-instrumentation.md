# EPIC-12 — Analytics and instrumentation (local)

**ID:** `EPIC-12`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD/RFC reference:** `prd.md` (Metrics) / `rfc.md` (instrumentation epic)

## 1) Objective (Outcome)
Collect anonymous local events to evaluate MVP hypotheses without a backend: meaningful days, siege/tactic effectiveness, and basic retention proxies.

## 3) Scope
**In scope:**
- event schema (from EPIC-01);
- local append-only event log;
- export events (JSON/CSV);
- optional debug viewer.

## 6) Work breakdown

### T1. Finalize event schema v1
**Steps:**
1) Take the event list from EPIC-01.
2) Define payload types and required fields.
**Acceptance criteria:**
- Enough to compute MVP metrics in PRD.
**DoD:**
- Schema is documented in this file or a linked md.
**Estimate:** `M`

### T2. Implement event logger
**Steps:**
1) API: `track(event)`.
2) Storage: append-only in IndexedDB (or a dedicated storage key).
3) Add size limits / rotation (keep last N).
**Acceptance criteria:**
- Logging does not degrade performance.
**DoD:**
- Logger is integrated into key domain actions.
**Estimate:** `L`

### T3. Implement event export
**Steps:**
1) Settings entry: “Export events”.
2) JSON export and optional CSV export.
**Acceptance criteria:**
- Export downloads and can be parsed.
**DoD:**
- Export works reliably.
**Estimate:** `M`

### T4. Optional debug viewer
**Steps:**
1) Show last 50 events.
2) Filter by eventName.
**Acceptance criteria:**
- Helps developers verify event streams.
**DoD:**
- Enabled only in dev via a flag.
**Estimate:** `S`

