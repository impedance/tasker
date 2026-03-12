# EPIC-16/17/18 hardening + alignment follow-ups (P0/P1)

> Archived on 2026-03-12 after the active documentation set was aligned with the current repo state.

**ID:** `PLAN-16-17-18-HARDENING`  
**Priority:** `P0`  
**Status:** `completed`  
**Owner:** `FE+BE`  
**Last Reviewed:** `2026-03-12`  
**References:** `prd.md`, `epics/EPIC-01-foundation.md`, `epics/EPIC-15-world-shell.md`, `PLANS/archive/EPIC-16-province-action-surfaces.md`, `PLANS/archive/EPIC-17-map-placement-and-overflow.md`, `PLANS/archive/EPIC-18-chronicle-and-instrumentation-hygiene.md`

## 1) Objective
Remove high-risk drift between product contracts, domain rules, and shipped UI. The outcome of this plan is:
- import/export stays resilient even with legacy Chronicle data;
- map slot assignment is safe at the domain boundary, not just in UI;
- Province Details stops offering invalid actions;
- manual QA docs and Settings copy match real app behavior;
- Chronicle compatibility is fixed without silently redefining Chronicle as an event log.

## 2) Why this plan exists
The codebase already ships EPIC-16/17/18 slices, but several follow-ups are still required:
- `domainService` writes Chronicle entry types that are outside the current `ChronicleEntryType` schema;
- strict import validation can fail on those entries;
- slot assignment still bypasses the domain action path and allows collision risk if UI state is stale;
- `AssignSlotDialog` mutates state during render;
- Province Details button enable/disable logic drifts from the transition table;
- `docs/E2E-CHECKLIST.md` and Settings reset copy no longer describe the actual UI/semantics.

This is a hardening plan, not a feature expansion plan.

## 3) Product decisions locked for this plan
- `prd.md` remains the product source of truth.
- Chronicle is a human-readable memory layer, not a full analytics/event stream.
- Events may remain more granular than Chronicle.
- Reset semantics must be explicit:
  - either `Reset Application Data` preserves events,
  - or the UI must expose a separate `Clear Events` action.

## 4) Scope
**In scope:**
- Chronicle compatibility fix and import anti-brick behavior.
- Slot-assignment hardening through the domain action path.
- React render-phase fix in the assign dialog.
- Province Details action gating aligned with domain transitions.
- Documentation/copy alignment for create/clarify/overflow/reset flows.

**Out of scope:**
- Re-architecting storage or changing persistence technology.
- Chronicle copy polish beyond minimal readable titles.
- Drag-and-drop map placement.
- New analytics, dashboards, or online features.

## 5) Deliverables
- No code path writes a Chronicle entry type that import/export cannot validate.
- Import normalizes unknown legacy Chronicle entry types instead of failing hard.
- Map assignment uses `edit_fields` through the standard action path and blocks collisions.
- `AssignSlotDialog` no longer updates state during render.
- Province Details uses transition helpers as the source of truth for button availability.
- `docs/E2E-CHECKLIST.md`, `docs/index.md`, and Settings copy are aligned with the shipped behavior.

## 6) Execution order

### Track A. Data safety first
Do these first because they protect existing user data and exported snapshots.

### T1. Add Chronicle compatibility layer
**Goal:** stop writing invalid Chronicle entry types and make the choice explicit.  
**Implementation rule:**
- Do not blindly treat every event name as a Chronicle taxonomy entry.
- Choose one of two implementation paths and document it in the PR:
  - **Path A (preferred):** keep Chronicle narrative and map `start/log/complete` onto approved Chronicle types/titles.
  - **Path B (allowed as a short-term compatibility fix):** extend `ChronicleEntryType` and `ChronicleEntryTypeSchema` with the currently-written values, but explicitly note that this is a compatibility compromise and not the final Chronicle taxonomy.
**Steps:**
1) Remove `as any` Chronicle writes from `src/shared/services/domainService.ts`.
2) Update `src/entities/types.ts` and `src/entities/schemas.ts` consistently.
3) Update tests so they assert the chosen canonical taxonomy instead of asserting implementation drift.
**Acceptance criteria:**
- `domainService` compiles without `as any` for Chronicle entry types.
- Chronicle write path and schema agree.

### T2. Make import/export anti-brick for legacy Chronicle snapshots
**Goal:** importing historical snapshots must not fail only because of unknown Chronicle `entryType`.  
**Steps:**
1) Add import-time normalization in `parseImportData(...)` before strict Zod validation.
2) Normalize unknown `chronicleEntries[].entryType` to a safe fallback.
3) Preserve forensic value in `title` or `body` instead of silently dropping entries.
4) Add tests for:
   - unknown `entryType` import succeeds;
   - normalized entries survive roundtrip export/import.
**Acceptance criteria:**
- strict import no longer bricks on legacy Chronicle entry type drift.

### Track B. Domain boundary hardening
Do these second because they reduce invalid state transitions and stale-UI issues.

### T3. Route slot assignment through domain action and block collisions
**Goal:** slot assignment must be handled like any other domain mutation.  
**Steps:**
1) Change map assignment flow to use `useApplyAction()` with `edit_fields`.
2) Add a guardrail/blocker for `payload.mapSlotId` collisions within the same region.
3) Surface the error in map UI with readable user feedback.
4) Add a test that proves a stale UI cannot double-assign the same slot.
**Acceptance criteria:**
- slot collisions are blocked at the domain boundary;
- successful assignment persists after reload.

### T4. Fix render-phase state updates in `AssignSlotDialog`
**Goal:** remove the React anti-pattern without changing UX.  
**Steps:**
1) Move slot synchronization into `useEffect`.
2) Keep current user selection unless it becomes invalid.
3) Add either a focused test or a documented manual verification note.
**Acceptance criteria:**
- no render-phase `setState`;
- dialog stays stable when `freeSlots` changes.

### T5. Align Province Details action gating with transition rules
**Goal:** the UI must not offer invalid transitions.  
**Steps:**
1) Introduce a helper based on `isTransitionAllowed(...)`.
2) Use that helper for button disabled states.
3) Keep runtime error handling as a fallback, not the primary guard.
4) Add a test for key states (`fog`, `ready`, `in_progress`, `captured`) and representative actions.
**Acceptance criteria:**
- `start_move` is not shown as available from invalid states;
- other actions follow the same domain truth.

### Track C. Documentation and copy alignment
Do these last so the docs reflect the final implementation.

### T6. Update docs and copy to match shipped behavior
**Goal:** remove misleading instructions from developer/user-facing docs.  
**Steps:**
1) Update `docs/E2E-CHECKLIST.md`:
   - creation via Add dialog;
   - clarify fields use entry minutes, not `Entry type`;
   - overflow scenario with unplaced provinces and manual assignment;
   - reset/events verification step.
2) Update `src/pages/SettingsPage.tsx` copy:
   - match actual reset semantics;
   - add `Clear Events` only if product intent is truly delete-all.
3) Update `docs/index.md` if active/archived plan links changed.
**Acceptance criteria:**
- no active doc tells the developer or tester to use a removed flow;
- reset wording is truthful.

## 7) Suggested ticket split
- `T1-T2` can be one BE ticket if kept small.
- `T3-T4` can be one FE/Shared ticket.
- `T5` is a FE ticket with domain-helper reuse.
- `T6` is a docs/copy ticket after code lands.

## 8) Verification
- `make smoke`
- `make preflight`
- Manual checks:
  1) create 17 provinces in one region and verify overflow handling;
  2) assign an unplaced province to a free slot and verify persistence after reload;
  3) try to double-assign the same slot and verify it is blocked;
  4) perform meaningful actions, open `/chronicle`, export/import app state, verify no import error;
  5) verify Settings reset behavior matches the UI text.

## 9) Risks
- If T1 chooses compatibility-only schema expansion, Chronicle may continue drifting toward an event log.
- If T6 lands before code changes, docs will still lie.
- If slot collision checks stay UI-only, stale state will keep producing invalid assignments.

## 10) Open questions
- Should `Reset Application Data` preserve events or should delete-all become a two-step action?
- Should `province_move_logged` remain an event only, or also live in Chronicle long-term?
- Should successful slot assignment emit an event, or stay purely administrative?
