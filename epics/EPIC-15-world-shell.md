# EPIC-15 — World shell: Capital, Chronicle, and theme (Game-first MVP)

**ID:** `EPIC-15`  
**Priority:** `P0`  
**Status:** `partial`  
**Owner:** `<TBD>`  
**PRD reference:** `prd.md` (Capital/Chronicle/Hero moments, theme, IA)

## 1) Objective (Outcome)
Make the MVP feel like a strategy game on first contact: a capital as home, a human-readable chronicle as memory, and a consistent Shogunate/Warring Provinces fantasy layer — without adding a heavy meta-game or economy.

## 2) Scope
**In scope:**
- Shogunate/Warring Provinces theme shell (copy + minimal theming primitives).
- Capital Lite screen (daily entry hub).
- Chronicle Lite screen + entry generation pipeline.
- Seasonal fantasy naming (auto-generated + editable).
- Clan identity Lite (banner mark/style + name; no economy/diplomacy).

**Out of scope:**
- complex lore systems, codex, collectibles;
- deep personalization beyond banner/naming;
- share cards/export (EPIC-14).

## 3) Deliverables
- `CapitalPage` (default entry after onboarding).
- `ChroniclePage` (timeline of chronicle entries).
- Chronicle entry generation rules (when entries are created; caps).
- Minimal theming contract: bannerStyle + factionName + seasonFantasyName.
- Accessibility: reduced motion safe defaults for hero moments and transitions.

## 4) Dependencies
- EPIC-03 for persistence (`ChronicleEntry`, `CapitalState`, campaign fields).
- EPIC-04 for map navigation targets (Capital → Campaign/Region map).
- EPIC-11 for hero moment caps and reduced-motion setting contract.
- EPIC-10 for season boundaries and Season Debrief integration.

## 5) Work breakdown

### T1. Lock theme and naming rules (MVP)
**Steps:**
1) Confirm: MVP theme is stylized Shogunate/Warring Provinces (not historical reconstruction).
2) Define naming patterns for campaigns and seasons (auto-generate + editable).
3) Define “fantasy vs plain-language copy layering” examples for each surface (Capital, maps, Province Drawer, Siege).
**Acceptance criteria:**
- Naming and copy rules do not obscure real-world meaning on action surfaces.
**DoD:**
- A short, testable copy contract exists in this epic.
**Estimate:** `S`

### T2. Capital Lite (Home) screen
**Goal:** default entry that shows the front situation and leads into a meaningful move fast.

**Minimum contents:**
- campaign name + season fantasy name;
- clan banner mark/style;
- front summary: counts of fog/siege/fortified + 1–3 hotspots;
- CTA: “Make a move” (Daily Orders);
- CTA: “Open Chronicle”;
- CTA: “Open Map”.

**Steps:**
1) Create `CapitalPage` skeleton and routing (post-onboarding default).
2) Compute and render front summary from local state.
3) Implement the 3 CTAs and verify they connect to real actions (no extra forms).
**Acceptance criteria:**
- Capital adds near-zero friction: from open → meaningful action in <= 2 clicks.
- Capital never grants progress by itself (EPIC-01 Appendix A).
**DoD:**
- Capital is usable as the main entry surface.
**Estimate:** `M`

### T3. Chronicle Lite (human-readable memory)
**Goal:** a campaign memory layer, not an analytics log.

**Steps:**
1) Define `ChronicleEntry.entryType` set (MVP): fog_cleared, province_started, siege_resolved, province_fortified, region_captured, meaningful_streak_3, season_end, return_after_break.
2) Define entry generation rules and caps:
   - create entries only after meaningful actions;
   - max 1 “high” importance entry per session;
   - entries are short human-readable lines (“chronicle lines”).
   - avoid spam: do not write a Chronicle entry for every `prepare` action (supply/decompose) unless it crosses a milestone (e.g., first time a province becomes `prepared` or first supply on that province).
3) Implement `ChroniclePage`: reverse chronological, filter by importance (optional).
4) Add entry points from Capital and Season Debrief.
**Acceptance criteria:**
- Chronicle is readable in < 30 seconds and increases “world attachment”.
- No chronicle prompts appear before action; it is discoverable but not spammy.
**DoD:**
- Chronicle exists as a first-class screen with real entries.
**Estimate:** `L`

### T4. Capital visual progression (Lite, non-economic)
**Goal:** reflect milestones without adding building/economy.

**Steps:**
1) Define `CapitalState.visualTier` thresholds (e.g., region captured, 3 meaningful days, season completion).
2) Tie tier changes to meaningful actions/season events (not to time-in-app).
3) Render small visual changes (decor unlock list; minimal assets).
**Acceptance criteria:**
- Visual progression is purely reflective and never becomes grind or required input.
**DoD:**
- At least 2–3 tiers are visible and testable.
**Estimate:** `M`

## 6) Risks and mitigations
- Risk: becomes “task manager in costume” → Capital + Chronicle must be P0 and connected to Daily Orders.
- Risk: Chronicle becomes an event dump → human-readable copy, strict caps, importance levels.
- Risk: theme obscures clarity fields → enforce copy layering: action surfaces remain plain-language for outcome/first step/entry time.
