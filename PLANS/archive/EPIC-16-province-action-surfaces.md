# Province action surfaces: Clarify + Province Details (P0)

> Archived on 2026-03-11. Superseded by `PLANS/EPIC-16-17-18-hardening-and-alignment.md`.

**ID:** `EPIC-16`  
**Priority:** `P0`  
**Status:** `ready`  
**Owner:** `FE (with BE support)`  
**PRD/RFC reference:** `prd.md (MVP screens + fog/siege flows), epics/IMPLEMENTATION-READINESS.md (Sections 4,6,8), docs/E2E-CHECKLIST.md`

## 1) Objective (Outcome)
Users can reliably turn a newly created `fog` province into `ready` via a dedicated Clarify screen, and can open a Province Details screen to execute the core actions (start/log/supply/complete/retreat/reschedule/edit fields). All UI actions map 1:1 to domain actions, and no UI surface links to missing routes.

## 2) Context
- Current UI links to `/province/:id/clarify` and `/province/:id`, but these routes/screens do not exist yet, blocking the P0 “Fog → Clarify → Ready” loop.
- Daily Orders and Siege surfaces have action mapping gaps that cause incorrect navigation and/or invalid payloads.
- The readiness checklist requires that the “5–8 core scenarios” are executable end-to-end without guessing.

## 3) Scope
**In scope:**
- Add routes: `/province/:provinceId/clarify`, `/province/:provinceId` (details).
- Implement Clarify form (required fields + validation + submit → `clarify` domain action).
- Implement Province Details screen with core action buttons mapping to `applyAction` via `useApplyAction`.
- Fix Daily Orders “scout” behavior to use Clarify when province is `fog`.
- Update manual E2E checklist to match the implemented UX (labels + flows).

**Out of scope (explicit non-goals):**
- Advanced province editing (adjacency graph editor, map slot reassignment UI).
- Full UX polish, animations, and copy pass (only minimal P0 copy correctness).
- Rule changes in the domain layer (assume EPIC-01/06 contracts stand).

## 4) Deliverables
- New screens:
  - `src/pages/province/ClarifyProvincePage.tsx`
  - `src/pages/province/ProvinceDetailsPage.tsx`
- Route wiring in `src/app/App.tsx`.
- Updated action mapping in `src/pages/daily-orders/DailyOrdersPage.tsx`.
- Tests:
  - At least 1 integration test that creates a `fog` province, runs Clarify via `useApplyAction`/`applyAction`, and asserts state + timestamps changes.
- Updated `docs/E2E-CHECKLIST.md` scenarios 1/2/4/7 for accurate steps.

## 5) Dependencies
- Technical: `useApplyAction`, `applyAction` action schemas, `provinceRepository`, `domainService.persistResult`.
- Product/design: minimal field set for Clarify (Outcome, First step, Entry minutes) and labels.
- Data/tools: tutorial seed should still work; no backend.

## 6) Work breakdown (junior-friendly tasks)

### T1. Add missing province routes
**Description:** Wire new routes in the app router.  
**Steps:**
1) Add `Route` entries for `/province/:provinceId/clarify` and `/province/:provinceId`.
2) Create placeholder components that render headings and the `provinceId` param.
**Acceptance criteria:**
- Navigating to both routes renders without a blank page / runtime errors.
**DoD (done when):**
- `make preflight` passes.
**Estimate:** `S=1–2h`  
**Risks/notes:** Ensure the routes do not conflict with `/province/:provinceId/siege`.

### T2. Implement ClarifyProvincePage (form → domain action)
**Description:** Build the Clarify form for `fog` provinces and apply the `clarify` action.  
**Steps:**
1) Load province by `provinceId` and show “not found” state.
2) Render fields: `desiredOutcome`, `firstStep`, `estimatedEntryMinutes` (required).
3) On submit, call `execute(province, { type: 'clarify', payload: ... })`.
4) On success, navigate back to map (or to province details) and close the drawer if needed.
**Acceptance criteria:**
- Submitting valid fields transitions province `fog → ready`.
- `updatedAt` and `lastMeaningfulActionAt` update to “now”.
**DoD (done when):**
- Manual check: create province in `fog`, clarify it, see state change.
- `make preflight` passes.
**Estimate:** `M=0.5d`  
**Risks/notes:** Handle “province not in fog” gracefully (show message + link to details).

### T3. Implement ProvinceDetailsPage (core actions)
**Description:** Add a screen that exposes core province actions with correct action mapping.  
**Steps:**
1) Load province by id, render key fields and current state/progress.
2) Add buttons for:
   - Start (→ `start_move`)
   - Log progress (→ `log_move`)
   - Supply (→ `supply`)
   - Complete (→ `complete`)
   - Retreat/Reschedule (→ `retreat`/`reschedule`)
   - Edit fields (→ `edit_fields`) (minimal subset)
3) Use minimal payload defaults (duration minutes) but keep required fields explicit.
**Acceptance criteria:**
- Actions apply without validation errors for allowed states.
- Illegal actions show a readable error (not a silent failure).
**DoD (done when):**
- Manual check: apply at least 3 different actions and see persisted results after refresh.
- `make preflight` passes.
**Estimate:** `L=1d`  
**Risks/notes:** Keep action availability state-based (disable buttons if transition not allowed).

### T4. Fix ProvinceDrawer “Details” and “Scout” flows
**Description:** Ensure drawer buttons never navigate to missing screens and match P0 loop.  
**Steps:**
1) “Scout” for `fog` → Clarify page.
2) “Details” → ProvinceDetailsPage.
3) For `ready/in_progress`, decide: “Scout” logs a move OR becomes “Log progress” (align with readiness doc).
**Acceptance criteria:**
- Drawer CTA clicks never lead to 404/unrouted pages.
**DoD (done when):**
- Manual check from map drawer for `fog` and `ready`.
- `make preflight` passes.
**Estimate:** `S=1–2h`  
**Risks/notes:** Keep labels consistent with `docs/E2E-CHECKLIST.md`.

### T5. Fix Daily Orders “scout” mapping
**Description:** Daily Orders must not send `scout` to siege; it should route to Clarify for fog provinces.  
**Steps:**
1) Fetch province state when executing an order.
2) If `moveType === 'scout'` and province is `fog`, navigate to Clarify.
3) Otherwise map to a meaningful action (likely `log_move` with `moveType: 'scout'`) or hide “scout” order when not applicable.
**Acceptance criteria:**
- Clicking “Do it” on a scout recommendation never navigates to Siege by default.
**DoD (done when):**
- Manual check: generate a scout order, execute it, observe correct navigation/action.
- `make preflight` passes.
**Estimate:** `S=1–2h`  
**Risks/notes:** Align with EPIC-01 mapping rules; avoid UI move types that are not implemented.

### T6. Add an integration test for fog → clarify
**Description:** Add a deterministic test proving the fog loop updates state + timestamps.  
**Steps:**
1) Create a province in `fog` with minimal required fields.
2) Execute `clarify` action and persist via `domainService`.
3) Reload from repository and assert: `state === 'ready'`, `lastMeaningfulActionAt` set.
**Acceptance criteria:**
- Test passes in CI and locally; no flakiness.
**DoD (done when):**
- `make preflight` passes.
**Estimate:** `S=1–2h`  
**Risks/notes:** Use fixed `Date` inputs where possible.

## 7) Testing and QA
- Unit: extend tests only if needed for mapping helpers.
- Integration: 1–2 tests for clarify + persistence.
- E2E: `make e2e` smoke remains green.
- Manual checklist: update `docs/E2E-CHECKLIST.md` scenarios 1/7.

## 8) Metrics / Events (if applicable)
- Optional in this epic. If events are already wired, emit `province_clarified` on Clarify completion.

## 9) Risks and mitigations
- Risk: action payload validation failures. Mitigation: keep payload defaults minimal and add UI constraints.
- Risk: UX drift from readiness docs. Mitigation: update `docs/E2E-CHECKLIST.md` as part of the epic.

## 10) Open questions
- For `ready` provinces, should “Scout” be a `log_move` or should the button label change to “Log progress”?
- Where should Clarify redirect after submit: back to map, or to province details?
