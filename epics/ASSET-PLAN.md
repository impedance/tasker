# Asset plan (MVP) — political/front map + Shogunate theming

Goal: define the minimum graphics + UI assets required to implement the MVP map-first experience, with a **Hearts-of-Iron-like political/front map** aesthetic and **Shogunate** theming via iconography/copy (not painterly terrain).

This is an implementation-facing plan. It prioritizes:
- fast iteration (SVG + CSS tokens);
- offline-friendly assets;
- clear licensing boundaries (prefer MIT/CC0; avoid game IP reuse).

Source of truth for map styling contract: `epics/EPIC-04-map-ui.md` (Section 2.1).

---

## 1) Deliverables (what must exist in the repo)

### 1.1. Map SVG templates (P0)
Create fixed templates as SVG assets:
- `assets/maps/campaign_v1.svg`
- `assets/maps/region_v1.svg`

**Region template requirements (`region_v1.svg`):**
- 12–16 province slots for MVP (recommended: 16).
- Each slot is a clickable shape with `data-slot-id="p01"... "p16"`.
- Optional: `data-label-anchor="p01"` placeholder nodes for text labels (or use separate label layers).
- Optional: a `data-capital-anchor` point for route drawing origin (if not derived from layout).

**Campaign template requirements (`campaign_v1.svg`):**
- 6–12 regions (recommended: 8).
- Each region area is a clickable shape with `data-region-slot-id="r01"...`.
- A single “capital” marker location per campaign can be a UI overlay (not baked into SVG), but a default anchor may be included.

**Overflow contract:**
- If a region has more provinces than the slot count, extra provinces have no `mapSlotId` and must appear in an “Unplaced provinces” list panel.

### 1.2. Map patterns (P0)
Implement 3 patterns as SVG `<pattern>` definitions or CSS mask equivalents:
- `fog` (soft hatch/noise)
- `fortified` (diagonal hatch)
- `siege` (outline ring + stamp marker; pattern optional if marker is strong)

Assets:
- `assets/maps/patterns.svg` (definitions) OR patterns defined inline in map components.

### 1.3. Map markers + stamps (P0)
Create a minimal set of flat stamp-like icons (SVG) used on the map:
- `siege` stamp
- `fortified` stamp
- `fog` stamp (optional; fog may be pattern-only)
- `hotspot` marker (optional; hotspots can be halo-only)
- `capital` marker

Assets:
- `assets/icons/stamps/*.svg`

Constraints:
- Must work at 16–24px and 32–48px sizes.
- Must remain legible on dark background (`--map-bg`).

### 1.4. Clan `mon` set (P0)
Provide a small “clan identity lite” set:
- 12–20 mon icons (SVG), consistent stroke/weight, single-color.

Assets:
- `assets/icons/mon/*.svg`

Licensing:
- Prefer original/commissioned simple geometric mon-like symbols OR CC0 sources.

### 1.5. UI icon set (P0)
Use an existing open-source icon set for general UI controls (settings, back, close, import/export, etc.).
- Recommendation: Tabler Icons (MIT) as the default UI baseline.

No need to duplicate the full set in repo; use dependency + only export selected icons if desired.

### 1.6. Typography (P0)
Use system fonts for MVP to avoid font licensing and loading complexity:
- UI: `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
- Accent (optional): one display font for headings (must be OFL/CC0/MIT if bundled).

### 1.7. Color palette + tokens (P0)
Implement map tokens from `epics/EPIC-04-map-ui.md` as CSS variables in:
- `src/shared/theme/map.css`

Also define general UI tokens (minimal DS):
- `src/shared/theme/tokens.css` (spacing, radius, typography scale, elevation, motion)

### 1.8. Screen mock skeletons (P0)
Not full-fidelity design; just layout wireframes (can be Figma or simple PNGs) for:
- Capital
- Region map + drawer open
- Siege screen
- Daily Orders

If stored in repo:
- `pics/ui/` as PNG exports

---

## 2) File/folder conventions (recommended)

Assets:
- `assets/maps/`
- `assets/maps/patterns.svg`
- `assets/icons/stamps/`
- `assets/icons/mon/`

Code:
- `src/shared/theme/map.css`
- `src/shared/theme/tokens.css`
- `src/shared/ui/` (Button, Card, Drawer, Tooltip, Badge, Modal, TextField)
- `src/features/map/` (SVG renderer, hit-testing, state classes)

---

## 3) Production approach (how to create assets fast)

### 3.1. SVG template creation
Options:
1) Figma → export SVG (recommended for speed).
2) Inkscape → export SVG.

Rules:
- Convert strokes to paths only if necessary; keep shapes editable.
- Ensure `viewBox` is set; avoid hardcoded width/height-only scaling.
- Avoid embedded raster images in MVP.

### 3.2. Mon + stamps creation
Options:
- Create in Figma as a component library (single-color vector).
- Export optimized SVGs (SVGO).

---

## 4) Acceptance criteria (asset-level)

Map templates:
- Clicking a province slot is reliable on mobile sizes (no tiny targets).
- All `data-slot-id` values are unique and match the `pNN` convention.

Patterns:
- In grayscale, `fog`, `siege`, and `fortified` are distinguishable via pattern/outline/marker.

Icons:
- Stamps remain readable at 16px on `--map-bg`.
- Mon icons remain recognizable at 24px.

---

## 5) Open questions (for the art pass)

1) Slot count for `region_v1`: 12, 16, or 20?
2) Do we want province labels on-map in MVP, or drawer-only?
3) Do we want roads/connection lines in MVP, or only adjacency logic?

