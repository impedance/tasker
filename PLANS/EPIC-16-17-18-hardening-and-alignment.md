# EPIC-16/17/18 hardening + alignment follow-ups (P0/P1)

**ID:** `PLAN-16-17-18-HARDENING`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `FE+BE`  
**PRD/RFC reference:** `PLANS/archive/EPIC-16-province-action-surfaces.md, PLANS/archive/EPIC-17-map-placement-and-overflow.md, PLANS/archive/EPIC-18-chronicle-and-instrumentation-hygiene.md, docs/E2E-CHECKLIST.md`

## 1) Objective (Outcome)
Bring the shipped implementation in line with EPIC-16/17/18 contracts by removing schema inconsistencies, making map-slot assignment conflict-safe, and aligning user-facing docs/copy with real behavior. Ensure export/import does not brick due to Chronicle entry type drift, and overflow provinces remain playable and assignable without data loss.

## 2) Context
- EPIC-18 currently writes Chronicle entry types that are not part of the `ChronicleEntryType` union / Zod schema, which can break strict import validation.
- EPIC-17 "Assign to slot" currently bypasses domain actions and does not prevent slot collisions.
- EPIC-16 core flows work, but action availability/UX and docs drift can cause incorrect expectations and subtle invalid transitions.

## 3) Scope
**In scope:**
- Chronicle entry type alignment (types/schemas) + anti-bricking import normalization.
- Map-slot assignment: conflict checks + route through a domain action (`edit_fields`) so the UI→domain mapping is 1:1.
- Fix React anti-pattern in `AssignSlotDialog` (no state updates during render).
- Tighten action enable/disable logic on Province Details to match transition rules (prevent invalid actions).
- Update manual E2E checklist and Settings copy to match reset/export semantics.

**Out of scope (explicit non-goals):**
- Re-architecting storage layers or changing persistence technology.
- Drag-and-drop map placement.
- Full Chronicle templating/copy polish beyond minimal readable titles.
- Adding remote analytics, dashboards, or aggregation pipelines.

## 4) Deliverables
- Updated `ChronicleEntryType` union and `ChronicleEntryTypeSchema` to include the EPIC-18 “core meaningful action” entry types that are being written.
- Import-time normalizer to prevent hard failures when unknown Chronicle entry types are encountered.
- Map assignment flow implemented via `useApplyAction` / domain action and guarded against slot conflicts.
- Fixed `AssignSlotDialog` state synchronization (no render-phase state writes).
- Updated `docs/E2E-CHECKLIST.md` (scenarios touching create/clarify, overflow, chronicle, events).
- Tests (unit/integration) covering: chronicle types roundtrip, slot collision prevention, action availability logic.

## 5) Dependencies
- Technical: `src/shared/hooks/useApplyAction.ts`, `src/game/rules/transitions.ts`, `src/game/rules/guardrails.ts`, `src/storage/import-export.ts`.
- Product/design: confirm wording for “Reset Application Data” vs “Clear Events” semantics.
- Data/tools: none (offline deterministic only).

## 6) Work breakdown (junior-friendly tasks)

### T1. Align Chronicle entry types with what is written
**Description:** Add missing Chronicle entry types so `domainService` does not rely on `as any`, and strict AppState import/export remains valid.  
**Steps:**
1) Add new values to `ChronicleEntryType` and `ChronicleEntryTypeSchema`:
   - `province_started`, `province_move_logged`, `province_captured` (and any other types currently written).
2) Remove `as any` casts in `src/shared/services/domainService.ts` and use typed values.
3) Add/extend a test to export AppState and re-import it after generating a Chronicle entry for each supported type.
**Acceptance criteria:**
- No code path writes an invalid `ChronicleEntry.entryType` relative to the Zod schema.
- Exported state with new Chronicle entries imports successfully.
**DoD (done when):**
- `make smoke` and `make preflight` pass.
- Added tests fail before the change and pass after.
**Estimate:** `S=1–2h`  
**Risks/notes:** Ensure backward compatibility for existing stored entries (handled further in T2).

### T2. Make import/export anti-brick for unknown Chronicle entry types
**Description:** Prevent strict import from failing if a snapshot contains Chronicle entries with unknown `entryType` (e.g., produced by an older buggy build).  
**Steps:**
1) Implement an import-time normalizer in `parseImportData` (before Zod validation) that:
   - maps unknown `chronicleEntries[].entryType` to a safe fallback (e.g., `campaign_created`)
   - optionally prefixes `title` with `[legacy]` to preserve forensic value.
2) Add a unit test feeding `importAppState` a snapshot containing an unknown chronicle `entryType` and assert import succeeds and entry is normalized.
**Acceptance criteria:**
- Import never hard-fails due to unknown Chronicle entry types.
**DoD (done when):**
- Tests demonstrate the anti-brick behavior.
- `make preflight` passes.
**Estimate:** `S=1–2h`  
**Risks/notes:** Keep normalization minimal and deterministic; do not drop entries silently.

### T3. Route “Assign to slot” through domain action and prevent slot collisions
**Description:** Ensure map placement is an explicit domain action and block assigning an occupied slot (even if the UI list is stale).  
**Steps:**
1) Update MapPage assign handler to:
   - fetch the latest province
   - call `execute(province, { type: 'edit_fields', payload: { mapSlotId: slotId } })`
   - refresh view after success
2) Add a guardrail in `runGuardrails(...)` for `edit_fields` when `payload.mapSlotId` exists:
   - block if another province in the same region already has that slot
3) Update `UnplacedProvincesList` to surface errors (toast/banner) when assignment is blocked.
4) Add an integration/unit test:
   - create two provinces in same region
   - assign slot `p01` to province A
   - attempt to assign slot `p01` to province B via `useApplyAction` path
   - assert it throws a blocker warning and province B remains unassigned
**Acceptance criteria:**
- Slot collisions are prevented at the domain boundary, not only in UI.
- Assignment persists across reload and remains visible on the map.
**DoD (done when):**
- Automated test covers collision case.
- Manual verification: stale UI cannot override and double-assign.
- `make preflight` passes.
**Estimate:** `M=0.5d`  
**Risks/notes:** Guardrails must be deterministic and rely only on locally available data.

### T4. Fix `AssignSlotDialog` render-phase state updates
**Description:** Remove `setState` calls that occur during render; sync selected slot when `freeSlots` changes via `useEffect`.  
**Steps:**
1) Replace render-phase `if (!freeSlots.includes(slotId)) setSlotId(...)` with a `useEffect` triggered by `freeSlots`.
2) Add a small unit test (or a story/manual reproduction note) to confirm no React warnings and that slot selection updates when free slots change.
**Acceptance criteria:**
- No state updates during render.
- Slot selection stays valid when freeSlots list changes.
**DoD (done when):**
- `make preflight` passes.
**Estimate:** `S=1–2h`  
**Risks/notes:** Keep UX stable (don’t reset user selection unnecessarily).

### T5. Enforce action availability on Province Details using transition rules
**Description:** Disable actions strictly based on domain transitions (avoid “start_move while already in_progress”, etc.).  
**Steps:**
1) Use `isTransitionAllowed(currentState, actionType)` (or equivalent helper) to compute button disabled states.
2) Add a unit test for the UI mapping helper (or a lightweight integration test) ensuring disallowed actions are disabled for key states.
3) Ensure error messaging remains readable if an invalid action is attempted (fallback safety net).
**Acceptance criteria:**
- Province Details does not offer invalid transitions (or clearly blocks them).
**DoD (done when):**
- Tests cover at least fog/ready/in_progress/captured states for 2–3 actions.
- `make preflight` passes.
**Estimate:** `M=0.5d`  
**Risks/notes:** Use domain functions as the source of truth; avoid duplicating transition logic.

### T6. Align manual E2E checklist and Settings copy with real behavior
**Description:** Remove drift: reflect actual UI (Add dialog, Clarify fields) and clarify reset semantics with event persistence.  
**Steps:**
1) Update `docs/E2E-CHECKLIST.md`:
   - Scenario 1 creation step (Add dialog vs “click empty slot”)
   - Clarify fields (minutes instead of “Entry type”)
   - Add/adjust a scenario for overflow (17th province appears as unplaced; assign to slot)
2) Update Settings “Danger Zone” copy if reset does not clear events; optionally add a separate “Clear Events” action if product wants “delete all data” literally.
3) Add a black-box checklist item verifying:
   - Reset app state preserves events (if intended), or clears them (if “Clear Events” is added).
**Acceptance criteria:**
- Manual checklist matches the shipped UI and storage semantics.
**DoD (done when):**
- `make preflight` passes.
**Estimate:** `S=1–2h`  
**Risks/notes:** Copy must match product intent; confirm desired semantics before shipping UI text changes.

## 7) Testing and QA
- Unit:
  - Import-time Chronicle normalizer (unknown type → fallback).
  - Guardrail for `edit_fields.mapSlotId` collision prevention.
  - Action availability mapping helper (states → disabled buttons).
- Integration:
  - AppState export/import roundtrip after generating Chronicle entries of each supported type.
  - Map-slot collision attempt via `useApplyAction` path.
- E2E (black-box manual):
  1) Create 17 provinces in a region → the 17th shows under “Unplaced Provinces”.
  2) Assign an unplaced province to a free slot → appears on map; reload → still placed.
  3) Attempt to assign the same slot to another province → blocked with a readable error; no silent overwrite.
  4) Perform actions (clarify, start, log, complete, siege resolve) → `/chronicle` shows entries; export state → import state → no errors.
  5) Perform actions → `/dev/events` shows events; export events JSON/CSV works; reset behavior matches Settings copy.

## 8) Metrics / Events (if applicable)
- Optional: add `province_map_slot_assigned` event when `edit_fields.mapSlotId` changes from empty→set.
- Metric idea: “overflow pressure” = count of unplaced provinces per region over time (computed from AppState, not analytics).

## 9) Risks and mitigations
- Risk: existing users already have invalid Chronicle entry types in storage.
  - Mitigation: T2 import normalizer + T1 schema alignment.
- Risk: UI-only collision checks are bypassed by stale state.
  - Mitigation: T3 guardrail blocks at domain boundary.
- Risk: “Reset Application Data” copy conflicts with event persistence.
  - Mitigation: T6 copy alignment or add explicit “Clear Events”.

## 10) Open questions
- Should “Reset Application Data” clear events or preserve them? (EPIC-18 suggests preserve; Settings copy currently implies delete-all.)
- Do we want Chronicle entry deduplication/idempotency now (action retries), or accept duplicates for MVP?
- Should map-slot assignment be treated as meaningful (Chronicle/event) or administrative (no logging)?
