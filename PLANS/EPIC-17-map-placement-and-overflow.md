# Map placement and overflow contract (P0)

**ID:** `EPIC-17`  
**Priority:** `P0`  
**Status:** `ready`  
**Owner:** `FE (with BE support)`  
**PRD/RFC reference:** `epics/IMPLEMENTATION-READINESS.md (Section 3), epics/EPIC-04-map-ui.md, epics/EPIC-05-creation-flows.md`

## 1) Objective (Outcome)
When a region has no free SVG slots, newly created provinces become explicitly “unplaced” (no `mapSlotId`) and remain fully playable via a list panel. Users can later assign an unplaced province to a free slot without data loss.

## 2) Context
- Readiness contract: overflow provinces must not “disappear”; they should be playable and re-assignable later.
- Current slot allocation returns a fake slot id when full, which prevents the “unplaced” UX from working and breaks the contract.

## 3) Scope
**In scope:**
- Fix `findFirstFreeMapSlotId()` overflow behavior to return “no slot”.
- Ensure `UnplacedProvincesList` catches provinces with missing OR invalid slot ids.
- Add a minimal “Assign to slot” flow for unplaced provinces (no drag&drop required).
- Add a unit/integration test for slot allocation.

**Out of scope (explicit non-goals):**
- Dynamic slot discovery from SVG (hard-coded `p01..p16` is acceptable for MVP).
- Complex adjacency editing on the map.

## 4) Deliverables
- Updated `src/storage/repositories.ts` slot allocator logic.
- Updated `src/pages/MapPage.tsx` to treat unknown slots as unplaced.
- Minimal assign flow UI (dialog/select) on the map screen.
- Tests for allocator + “unplaced” behavior.

## 5) Dependencies
- Technical: `provinceRepository`, map SVG templates in `public/assets/maps/`.
- Product/design: confirm that “unplaced list” is acceptable MVP fallback.
- Data/tools: none.

## 6) Work breakdown (junior-friendly tasks)

### T1. Fix slot allocation overflow behavior
**Description:** Stop generating fake slot ids when full.  
**Steps:**
1) Change `findFirstFreeMapSlotId()` to return `null | undefined` when no slots exist.
2) Update call sites to store `mapSlotId` only when a real slot is available.
**Acceptance criteria:**
- When 16 slots are occupied, new provinces get `mapSlotId === undefined`.
**DoD (done when):**
- `make preflight` passes.
**Estimate:** `S=1–2h`  
**Risks/notes:** Ensure existing provinces with invalid `mapSlotId` are still visible somewhere.

### T2. Treat unknown slot ids as “unplaced”
**Description:** If `mapSlotId` doesn’t exist in the SVG template, treat it as unplaced.  
**Steps:**
1) Parse the loaded SVG and collect a set of available `data-slot-id` values.
2) Split provinces into:
   - placed: `mapSlotId` is in the set
   - unplaced: missing or not in the set
3) Render unplaced in `UnplacedProvincesList`.
**Acceptance criteria:**
- Provinces never “vanish” due to invalid slot ids.
**DoD (done when):**
- Manual check: create province past capacity and see it in “Unplaced Provinces”.
- `make preflight` passes.
**Estimate:** `M=0.5d`  
**Risks/notes:** Keep performance acceptable; recompute on SVG/province changes only.

### T3. Add minimal “Assign to slot” action
**Description:** Allow assigning an unplaced province to a free slot.  
**Steps:**
1) Compute free slot ids (available minus occupied).
2) Add a button “Assign” in the unplaced list item to open a dialog/select.
3) Persist via `edit_fields` action or direct repo update (prefer `edit_fields`).
**Acceptance criteria:**
- User can assign and the province becomes clickable on the map.
**DoD (done when):**
- Manual check: assign, refresh, province still placed.
- `make preflight` passes.
**Estimate:** `L=1d`  
**Risks/notes:** Ensure assignment is blocked if slot becomes occupied concurrently.

### T4. Add tests for slot allocator and overflow
**Description:** Make overflow behavior deterministic and covered.  
**Steps:**
1) Unit test `findFirstFreeMapSlotId()` for “full” case.
2) Optional: integration test that creating 17th province results in `mapSlotId` undefined.
**Acceptance criteria:**
- Tests pass reliably in `vitest run`.
**DoD (done when):**
- `make preflight` passes.
**Estimate:** `S=1–2h`  
**Risks/notes:** Avoid DOM/SVG tests if possible; prefer pure function tests.

## 7) Testing and QA
- Unit: allocator test(s).
- Integration: optional repository-level overflow test.
- E2E: manual map scenario in `docs/E2E-CHECKLIST.md` should be updated if needed.

## 8) Metrics / Events (if applicable)
- Optional: emit `province_map_slot_assigned` when a slot is set.

## 9) Risks and mitigations
- Risk: mismatch between hard-coded slot count and actual SVG. Mitigation: treat unknown slots as unplaced and keep slot list consistent with template.

## 10) Open questions
- Should assignment use domain action `edit_fields` (preferred) or direct repo update?

