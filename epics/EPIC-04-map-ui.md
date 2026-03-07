# EPIC-04 — Map UI and navigation (SVG)

**ID:** `EPIC-04`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD/RFC reference:** `prd.md` (UX: maps) / `rfc.md` (epic 4)

## 1) Objective (Outcome)
Make maps the primary UX: clickable SVG territories, visible province states, and clear navigation to province details.

Notes:
- Keep the map DOM/SVG-first for MVP (events + CSS styling + tooltips). Avoid Canvas/Phaser complexity unless proven necessary.

## 3) Scope
**In scope:**
- 1 campaign map SVG template + 1 project map SVG template (fixed assets).
- binding SVG areas to entities (regions/provinces).
- state-based styling + hover/selected.
- responsive scaling.

**Out of scope:**
- procedural map generation;
- complex animations (P1).

## 4) Deliverables
- `CampaignMapPage` and `ProjectMapPage`.
- SVG assets + a stable ID/data-attribute convention.
- Styling for each province state.

## 6) Work breakdown

### T1. Add SVG templates
**Steps:**
1) Add 2 SVG assets (campaign map + project map).
2) Define a convention: `data-province-id`, `data-region-id`.
**Acceptance criteria:**
- SVGs render and click handling works.
**DoD:**
- Assets are present and documented.
**Estimate:** `M`

### T2. Implement campaign map page
**Steps:**
1) Render campaigns as territories/cards (MVP can be a hybrid list + SVG).
2) Select campaign → navigate to project map.
**Acceptance criteria:**
- Navigation is clear and stable.
**DoD:**
- User can enter a campaign.
**Estimate:** `M`

### T3. Implement project map page with province binding
**Steps:**
1) Render SVG.
2) Apply CSS classes per province state.
3) Click area → open province page.
**Acceptance criteria:**
- States are visually distinct.
**DoD:**
- Map is clickable and useful.
**Estimate:** `L`

### T4. Hover/selected + minimal transitions
**Steps:**
1) Add hover/selected styles.
2) Add soft transitions for fill/stroke changes.
**Acceptance criteria:**
- Feels responsive, no jank.
**DoD:**
- Interactions are implemented.
**Estimate:** `S`

### T5. Responsive scaling
**Steps:**
1) Scale SVG to fit container.
2) Verify on desktop and mobile sizes.
**Acceptance criteria:**
- Click targets remain accurate.
**DoD:**
- Map works on mobile (baseline).
**Estimate:** `M`

### T6. Campaign hub panel (“Capital”) (P1 / optional)
**Goal:** add a lightweight “home/hub” UI surface that increases world attachment without introducing new mechanics.

**Notes:**
- This is a UI metaphor only. It must not grant progress or rewards by itself.
- It should not add required input or a “dashboard to maintain”.

**Suggested contents (minimal):**
- season day number + meaningful days (read-only);
- a single “next suggested move” CTA (links to Daily move);
- quick links to season summary / export (if available).

**Dependencies:**
- EPIC-10 (season dayNumber / summary), EPIC-08 (Daily move).

**Acceptance criteria:**
- The panel does not add friction to the core map interactions.
- No rewards/prompts are shown without a meaningful action (EPIC-01 Appendix A).

**Estimate:** `S`
