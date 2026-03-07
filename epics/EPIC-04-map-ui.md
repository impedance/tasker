# EPIC-04 — Map UI and navigation (SVG)

**ID:** `EPIC-04`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD reference:** `prd.md` (UX: maps)

## 1) Objective (Outcome)
Make maps the primary UX: clickable SVG territories, visible province states, adjacency-driven affordances, and clear navigation to province actions.

Notes:
- Keep the map DOM/SVG-first for MVP (events + CSS styling + tooltips). Avoid Canvas/Phaser complexity unless proven necessary.

## 3) Scope
**In scope:**
- 1 campaign map SVG template + 1 region map SVG template (fixed assets).
- binding SVG areas to entities (regions/provinces) with stable data attributes.
- state-based styling + hover/selected.
- front pressure highlights (soft, non-punitive).
- command route drawing (Capital → target province) as visual feedback.
- responsive scaling.

**Out of scope:**
- procedural map generation;
- complex animations (P1).

## 4) Deliverables
- `CampaignMapPage` and `RegionMapPage`.
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
2) Select campaign → navigate to region map (primary play surface).
**Acceptance criteria:**
- Navigation is clear and stable.
**DoD:**
- User can enter a campaign.
**Estimate:** `M`

### T3. Implement region map page with province binding
**Steps:**
1) Render SVG.
2) Apply CSS classes per province state.
3) Click area → open Province Drawer (action panel).
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

### T6. Front pressure highlights (MVP)
**Goal:** make strategic hotspots legible on the map without punishment.

**Steps:**
1) Define a minimal `frontPressureLevel` → visual mapping (e.g., 0..3).
2) Render a soft halo/glow around hotspot provinces (siege/fortified/repeated retreat).
3) Ensure this does not imply territory loss or punitive mechanics.
**Acceptance criteria:**
- Hotspots are visible without reading lists.
- Pressure is purely informational/ambient (see PRD Pressure Layer).
**Estimate:** `M`

### T7. Command route drawing (MVP)
**Goal:** visual feedback that “orders originate from the capital”.

**Steps:**
1) On selecting a province action, draw a short route from Capital to province (SVG path overlay).
2) Keep it as feedback only (no logistics simulation).
**Acceptance criteria:**
- Route appears only when it helps decision/action, not as constant clutter.
**Estimate:** `M`

### T8. Province Drawer (action panel) (MVP)
**Goal:** keep the primary interaction lightweight: an action drawer over the map, not a heavy form screen.

**Minimum contents (contract):**
- fantasy layer: province status, role icon, recommended move, front pressure hint;
- plain-language layer: desiredOutcome, firstStep, estimatedEntryMinutes, effort, friction;
- CTA to start an action (scout/supply/assault/raid/retreat) with immediate map feedback.

**Acceptance criteria:**
- From map click → real action in <= 2 clicks.
- Drawer enforces “max 3–5 required fields” for clarify flows.

**Estimate:** `L`

### T9. Strategic nodes (MVP Lite)
**Goal:** add map affordances that strengthen strategy readability without new mechanics.

**Minimum set:**
- Capital marker (home/seat).
- Chronicle node (entry point icon; optional if Chronicle is only in nav).
- Watchtower / Supply Depot markers (can be implemented as province roles + icons).

**Acceptance criteria:**
- Nodes are purely navigational/visual; they do not grant rewards or progress.

**Estimate:** `S`
