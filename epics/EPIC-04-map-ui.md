# EPIC-04 — Map UI and navigation (SVG)

**ID:** `EPIC-04`  
**Priority:** `P0`  
**Status:** `partial`  
**Owner:** `<TBD>`  
**PRD reference:** `prd.md` (UX: maps)

## 1) Objective (Outcome)
Make maps the primary UX: clickable SVG territories, visible province states, adjacency-driven affordances, and clear navigation to province actions.

Notes:
- Keep the map DOM/SVG-first for MVP (events + CSS styling + tooltips). Avoid Canvas/Phaser complexity unless proven necessary.
- For MVP pan/zoom, prefer a lightweight wrapper (recommended: `react-zoom-pan-pinch`) and keep it isolated from domain logic.

## 1.1) Map layering contract (must stay split)
The map is not a single artifact. Keep these layers separate to avoid rework:
- **Visual layer:** fixed SVG templates (slots, paths, label layers).
- **Meta layer:** anchors/label positions/optional icon slots (JSON or TS config).
- **Graph layer:** adjacency / neighbors (JSON or TS), independent from the SVG.

Rationale: art iteration (SVG) must not break rules/adjacency, and rules iteration must not require editing SVG geometry.

## 2) Art direction (MVP)
Direction: **political/front map readability-first** (think classic grand strategy war maps), but with Shogunate theming expressed via **iconography and copy**, not painterly terrain.

Rules (MVP):
- Flat fills + bold borders; minimal/no terrain textures.
- Province status must read at a glance via color/outline/pattern.
- “Front pressure” and hotspots read as operational overlays (halo/outline), not as decorative effects.
- Theming elements are limited to:
  - clan `mon`-style icons/badges;
  - stamp-like markers for siege/fortified/fog (still flat and minimal);
  - typography and naming on non-action surfaces.

## 2.1) Map style contract (CSS tokens + state mapping)
Goal: make province states readable at a glance and implementation-consistent across the SVG, drawer, and any legends.

Implementation constraints (MVP):
- Prefer CSS variables and classes over inline SVG styling.
- Do not rely on color only: use pattern/outline differences for at least `fog`, `siege`, and `fortified`.
- Provide a reduced-motion mode for any map transitions (ties into EPIC-15 accessibility).

### CSS variable tokens (recommended)
Define tokens once (e.g., `src/shared/theme/map.css`) and consume them in map styles.

**Base:**
- `--map-bg`
- `--province-stroke`
- `--province-stroke-selected`
- `--province-stroke-hover`
- `--province-label`
- `--overlay-hotspot`

**State fills:**
- `--province-fill-fog`
- `--province-fill-ready`
- `--province-fill-in-progress`
- `--province-fill-siege`
- `--province-fill-fortified`
- `--province-fill-captured`
- `--province-fill-retreated`

**State patterns (SVG/CSS):**
- `--pattern-fog` (soft hatch or noise)
- `--pattern-fortified` (diagonal hatch)
- `--pattern-siege` (ring/outline + stamp marker; pattern optional if marker is strong)

### Default palette (suggested, adjustable)
These are safe starting values for MVP; exact colors can be tuned later, but token semantics must remain stable.

- Background: `--map-bg: #0f1420`
- Borders: `--province-stroke: rgba(255,255,255,0.18)`
- Labels: `--province-label: rgba(255,255,255,0.82)`

- `fog`: `--province-fill-fog: #1b2333` + `--pattern-fog`
- `ready`: `--province-fill-ready: #2b3a55`
- `in_progress`: `--province-fill-in-progress: #2f6aa3` (cool “active”)
- `siege`: `--province-fill-siege: #6b2b2b` (warm “blocked”) + siege stamp marker
- `fortified`: `--province-fill-fortified: #5a4a2f` + `--pattern-fortified`
- `captured`: `--province-fill-captured: #2f6b4f`
- `retreated`: `--province-fill-retreated: #2a2a2a` + low-contrast opacity

Hotspots/front pressure overlay (purely informational):
- `--overlay-hotspot: rgba(255, 180, 60, 0.28)` for a soft halo/glow.

### Province class mapping (contract)
Every province SVG shape must receive exactly one of these classes:
- `.province--fog`
- `.province--ready`
- `.province--in-progress`
- `.province--siege`
- `.province--fortified`
- `.province--captured`
- `.province--retreated`

Interaction classes:
- `.province--hover`
- `.province--selected`
- `.province--hotspot` (front pressure highlight)

### State readability acceptance criteria
- In a grayscale screenshot, `fog`, `siege`, and `fortified` are still distinguishable (pattern/outline/marker).
- The user can identify hotspots without opening lists (halo/outline works on mobile sizes).
- Selected province remains readable regardless of its state (selection stroke wins).

## 3) Scope
**In scope:**
- 1 campaign map SVG template + 1 region map SVG template (fixed assets).
- binding SVG areas to entities via stable **slot IDs** in the SVG (e.g., `data-slot-id="p01"`), mapped from `province.mapSlotId` within `region.mapTemplateId` (default `region_v1`).
- state-based styling + hover/selected.
- front pressure highlights (soft, non-punitive).
- command route drawing (Capital → target province) as visual feedback.
- responsive scaling.
- optional pan/zoom for the region map surface (desktop wheel + drag pan; touch pinch/zoom).

**Out of scope:**
- procedural map generation;
- complex animations (P1).

## 4) Deliverables
- `CampaignMapPage` and `RegionMapPage`.
- SVG assets + a stable ID/data-attribute convention.
- Styling for each province state.
- A minimal map style guide (colors/patterns) implemented in CSS tokens.
- A thin set of map primitives (component-level contract): ProvincePath, ProvinceLabel, ProvinceStateOverlay, ProvinceRoleBadge, SiegeRing, FogLayer, RouteLine, CapitalMarker.

### 4.1) Asset baseline (MVP)
Keep the asset contract small and implementation-facing. The MVP needs:
- fixed SVG templates for campaign/region maps;
- stable slot IDs on interactive shapes;
- CSS-token-based state styling in `src/shared/theme/map.css`;
- optional simple inline markers/patterns for `fog`, `siege`, and `fortified`.

Do not treat icons/stamps/mon libraries as a separate planning layer unless active implementation work starts on them.

## 6) Work breakdown

### T1. Add SVG templates
**Steps:**
1) Add 2 SVG assets (campaign map + project map).
2) Define a convention:
   - SVG shapes carry stable slot IDs: `data-slot-id="p01"`, `data-slot-id="p02"`, ...
   - persisted entities store slot IDs: `province.mapSlotId` (optional).
3) Define overflow behavior (MVP contract):
   - If a region has more provinces than available slots, extra provinces remain “unplaced” (`mapSlotId` missing).
   - Unplaced provinces are fully playable via a list panel (open drawer, run actions, appear in recommendations).
**Acceptance criteria:**
- SVGs render and click handling works.
 - Unplaced provinces remain accessible and actionable (no hidden tasks).
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
3) If pan/zoom is enabled, ensure default zoom reads well and never replaces base readability.
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
- CTA to start an action (scout/supply/engineer/raid/assault/retreat) with immediate map feedback.
  - `assault` = start/log a real step (`start_move` or `log_move` in domain terms).

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
