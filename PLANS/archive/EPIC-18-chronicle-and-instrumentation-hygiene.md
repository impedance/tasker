# Chronicle generation + instrumentation hygiene (P0/P1)

> Archived on 2026-03-11. Superseded by `PLANS/EPIC-16-17-18-hardening-and-alignment.md`.

**ID:** `EPIC-18`  
**Priority:** `P0`  
**Status:** `ready`  
**Owner:** `BE (with FE support)`  
**PRD/RFC reference:** `prd.md (Chronicle, instrumentation goals), epics/IMPLEMENTATION-READINESS.md (Sections 6,8), docs/E2E-CHECKLIST.md`

## 1) Objective (Outcome)
Meaningful actions automatically produce human-readable Chronicle entries and a usable local event stream that persists across reloads and is not accidentally wiped by app-state export/import/reset flows.

## 2) Context
- Chronicle UI exists but is not fed by gameplay actions, so “world memory” is missing.
- Event schema/logger exist but tracking is sparse and storage hygiene can wipe events unintentionally.
- Pilot readiness checklist requires stable instrumentation export and Chronicle updates.

## 3) Scope
**In scope:**
- Fix storage hygiene so `clearAll()` only clears `tasker:` keys (not the entire store).
- Add Chronicle entry creation for the core meaningful actions:
  - `province_clarified`, `province_started`, `province_move_logged`, `siege_resolved`, `province_captured` (or MVP subset).
- Add basic event tracking for the same actions using `event-logger.track()`.
- Add tests verifying:
  - Chronicle entries are created on actions.
  - Event log persists across reloads (already partially covered; extend if needed).

**Out of scope (explicit non-goals):**
- Full analytics dashboards and metric aggregation.
- Rich Chronicle templating/copy polish (just minimal readable entries).
- PII-safe sharing/export artifacts (EPIC-14/P1).

## 4) Deliverables
- Updated `src/storage/storage.ts` `clearAll()` behavior.
- Updated `src/shared/services/domainService.ts` (or a new domain “post-action” service) that:
  - writes Chronicle entries via `chronicleEntryRepository`
  - tracks events via `track()`
- Tests under `tests/integration/` for Chronicle + events.
- Updated `docs/E2E-CHECKLIST.md` scenario 3/6 to reflect what is automated.

## 5) Dependencies
- Technical: `domainService.persistResult`, repositories for Chronicle/events, `applyAction` meaningful action detection.
- Product/design: minimal Chronicle copy for each action type.
- Data/tools: none.

## 6) Work breakdown (junior-friendly tasks)

### T1. Fix `clearAll()` to not wipe unrelated keys
**Description:** Make `clearAll()` match its comment: clear only `tasker:` keys.  
**Steps:**
1) Replace `db.clear()` with iteration over keys and delete only keys starting with `tasker:`.
2) Ensure schema-version key is handled correctly (kept or reset intentionally).
**Acceptance criteria:**
- Export/import/reset of app state does not delete event keys that are not prefixed with `tasker:`.
**DoD (done when):**
- Tests pass; quick manual check exporting state doesn’t clear events.
- `make preflight` passes.
**Estimate:** `S=1–2h`  
**Risks/notes:** Be careful with performance; key iteration should be linear but small.

### T2. Add Chronicle entry creation for core actions
**Description:** When a meaningful action is persisted, write a Chronicle entry.  
**Steps:**
1) Decide where to centralize: `domainService.persistResult` is the MVP chokepoint.
2) For each supported action, create `ChronicleEntry` with:
   - `entryType`, `title`, optional `body`, `createdAt`
3) Persist via `chronicleEntryRepository.create(...)`.
**Acceptance criteria:**
- After Clarify/Start/Complete, Chronicle page shows new entries after reload.
**DoD (done when):**
- Manual check: perform action → open `/chronicle` → entry exists.
- `make preflight` passes.
**Estimate:** `M=0.5d`  
**Risks/notes:** Keep entries idempotent per action execution (avoid duplicates on retries).

### T3. Track events for the same actions
**Description:** Emit local events for key actions for pilot analysis.  
**Steps:**
1) Call `track({ name: ..., payload: ... })` after persistence.
2) Use event names from `src/shared/events/schema.ts`.
**Acceptance criteria:**
- `/dev/events` shows events after performing actions.
- JSON/CSV exports include these events.
**DoD (done when):**
- Manual check: actions → `/dev/events` shows latest items.
- `make preflight` passes.
**Estimate:** `S=1–2h`  
**Risks/notes:** Keep payload minimal; avoid raw user text in payload unless explicitly allowed.

### T4. Add integration tests for Chronicle + events
**Description:** Protect the new behavior with deterministic tests.  
**Steps:**
1) Create a province, apply an action, persist.
2) Assert `chronicleEntryRepository.list()` contains an entry of expected type.
3) Assert `getEventsByName(...)` returns at least 1 event.
**Acceptance criteria:**
- Tests pass and are stable.
**DoD (done when):**
- `make preflight` passes.
**Estimate:** `M=0.5d`  
**Risks/notes:** Clean up storage between tests to avoid cross-test contamination.

## 7) Testing and QA
- Unit: optional helper tests for Chronicle formatting.
- Integration: new tests for Chronicle + events.
- E2E: update manual checklist (chronicle entries should appear without manual seeding).
- Manual checklist: `docs/E2E-CHECKLIST.md` scenario 3 and 6.

## 8) Metrics / Events (if applicable)
- Events added/ensured:
  - `province_clarified`
  - `province_started`
  - `province_move_logged`
  - `siege_resolved`
  - `province_captured`
- Minimal metric example: “meaningful days” = count of distinct dates with ≥1 meaningful action event.

## 9) Risks and mitigations
- Risk: over-logging sensitive content. Mitigation: keep payload to ids/types/durations only.
- Risk: duplicate Chronicle entries on retries. Mitigation: include a deterministic “action id” if needed (later).

## 10) Open questions
- Should events be prefixed with `tasker:` as well, or stay separate? (Depends on desired reset semantics.)
- Do we want Chronicle entries per action, or per “session milestone” only?
