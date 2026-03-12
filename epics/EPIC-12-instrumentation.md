# EPIC-12 — Analytics and instrumentation (local)

**ID:** `EPIC-12`  
**Priority:** `P1`  
**Status:** `partial`  
**Owner:** `<TBD>`  
**PRD reference:** `prd.md` (Metrics)

## 1) Objective (Outcome)
Collect anonymous local events to evaluate MVP hypotheses without a backend: meaningful days, siege/tactic effectiveness, and basic retention proxies.

Notes:
- The event schema contract lives in `epics/EPIC-01-foundation.md` (Appendix B).
- Implementation (logger/export/viewer) is optional for the first MVP cut and can ship as v0.2 if time is constrained.

## 3) Scope
**In scope:**
- event schema (from EPIC-01);
- local append-only event log;
- export events (JSON/CSV);
- optional debug viewer;
- guardrail events for unhealthy engagement patterns.

## 6) Work breakdown

### T1. Finalize event schema v1
**Steps:**
1) Take the event list from EPIC-01.
2) Define payload types and required fields in `epics/EPIC-01-foundation.md` (Appendix B).
**Acceptance criteria:**
- Enough to compute MVP metrics in PRD.
**DoD:**
- EPIC-01 Appendix B is complete and consistent with EPIC-01 definitions.
**Estimate:** `M`

**Event additions to include:**
- `checkin_started`
- `checkin_completed`
- `daily_move_viewed`
- `daily_move_selected`
- `capital_viewed`
- `chronicle_viewed`
- `hero_moment_triggered`
- `share_card_generated`
- `share_card_exported`
- `season_debrief_started`
- `season_debrief_completed`
- `archetype_selected`
- `session_long_no_progress`
- `reward_seen_no_meaningful_action`

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
