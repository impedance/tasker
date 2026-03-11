# Week 2 — Frontend Tasks (EPIC-06, 07, 08, 10, 11, 12, 15)

**Priority:** `P0`  
**Status:** `ready`  
**Owner:** Frontend Junior  
**PRD reference:** `prd.md` (UI screens, Map interactions, World shell)

---

## Context

This plan contains **pure frontend tasks** for Week 2 MVP slice. These tasks implement:
- UI screens (Siege, Daily Orders, War Council, Capital, Chronicle, Season)
- Map interactions and state styling
- Feedback UI (hero moments, progress indicators)
- Theme and copy layering

**Dependencies:** EPIC-03 (domain models + persistence) and EPIC-04 (map UI) must be complete before starting these tasks.

---

## EPIC-06 — Rule Engine (UI Wiring Only)

### 06-T8. Wire province state classes to SVG map
**Track:** `FE`  
**Estimate:** `M` (2-4h)

**Description:** Apply province state classes to SVG map elements based on domain state.

**Steps:**
1. In `src/map/region-map.tsx`, add state class mapping:
   ```typescript
   const stateClass = {
     fog: 'province--fog',
     ready: 'province--ready',
     siege: 'province--siege',
     in_progress: 'province--in-progress',
     fortified: 'province--fortified',
     captured: 'province--captured',
     retreated: 'province--retreated',
   }[province.state];
   ```
2. Apply class to SVG element via `className`
3. Ensure state updates on province change (reactive)

**Acceptance criteria:**
- Creating/updating provinces updates map UI after reload
- State classes match EPIC-04 contract

**DoD:**
- Province-to-slot binding works and is stable

**How to verify:**
```bash
npm run dev
# Create provinces with different states, verify map updates
```

---

### 06-T9. Pressure level visual styling
**Track:** `FE`  
**Estimate:** `S` (1-2h)

**Description:** Render front pressure as map highlights (not terrain).

**Steps:**
1. Add CSS for pressure levels in `src/shared/theme/map.css`:
   ```css
   .province--pressure-1 { stroke: #fbbf24; stroke-width: 2px; }
   .province--pressure-2 { stroke: #f59e0b; stroke-width: 3px; }
   .province--pressure-3 { stroke: #ef4444; stroke-width: 4px; animation: pulse 2s infinite; }
   ```
2. Apply pressure class based on `province.frontPressureLevel`
3. Ensure pressure is readable in grayscale (not just color)

**Acceptance criteria:**
- Pressure can be rendered as map highlights without additional UI forms
- Pressure is distinguishable in grayscale

**DoD:**
- Pressure styling exists and is applied

**How to verify:**
```bash
# Set frontPressureLevel on provinces, verify visual difference
# Desaturate browser to check grayscale readability
```

---

## EPIC-07 — Siege System (UI)

### 07-T2. Siege screen (UI)
**Track:** `FE`  
**Estimate:** `M` (2-4h)

**Description:** Implement siege resolution screen with 5 tactics.

**Steps:**
1. Create `src/pages/siege/SiegePage.tsx`:
   ```typescript
   // Show:
   // - Province title
   // - Reason (days without action)
   // - 5 tactic cards with descriptions
   ```
2. Add tactic cards:
   - **Scout:** "Clarify what to do" — rewrite outcome/next step
   - **Supply:** "Prepare environment" — add links/files/context
   - **Engineer:** "Split into parts" — 3-5 micro-steps
   - **5-minute raid:** "Smallest entry step" — strict time cap
   - **Retreat:** "Change expectations" — reschedule or remove
3. On tactic select:
   - Call domain action (EPIC-07 T3)
   - Close siege screen
   - Show feedback (EPIC-11)
4. Add navigation: `/province/:id/siege`

**Acceptance criteria:**
- User can resolve siege from this screen
- Screen is wired in navigation

**DoD:**
- Siege screen works end-to-end

**How to verify:**
```bash
npm run dev
# Trigger siege (set lastMeaningfulActionAt to 4 days ago)
# Open province, verify siege screen appears
# Select tactic, verify siege resolves
```

---

## EPIC-08 — Daily Orders & War Council (UI)

### 08-T0. Commander check-in UI
**Track:** `FE`  
**Estimate:** `M` (2-4h)

**Description:** Implement 3-field check-in ritual (3-5 seconds).

**Steps:**
1. Create `src/pages/daily-orders/CommanderCheckIn.tsx`:
   ```typescript
   // Fields:
   // - Emotion: anxiety | boredom | fatigue | irritation | fear | ambiguity
   // - Available time: 5 | 15 | 25+ minutes
   // - Energy: low | medium | high
   ```
2. Use radio buttons or segmented controls for fast selection
3. On submit:
   - Persist check-in (EPIC-08 T0 BE)
   - Navigate to Daily Orders screen
   - Show "why these 3 moves" explanation
4. Make skippable (default values if skipped)

**Acceptance criteria:**
- Check-in can be completed in 3-5 seconds
- Check-in binds to recommendations

**DoD:**
- Check-in works end-to-end with persistence

**How to verify:**
```bash
npm run dev
# Complete check-in, verify it persists after refresh
```

---

### 08-T1. Daily Orders screen
**Track:** `FE`  
**Estimate:** `L` (4-6h)

**Description:** Implement Daily Orders screen with 3 move cards.

**Steps:**
1. Create `src/pages/daily-orders/DailyOrdersPage.tsx`:
   ```typescript
   // Show 3 cards:
   // - Light move (~5 min): scout/supply
   // - Medium move (~15 min): engineer/raid
   // - Main move (25+ min): assault
   ```
2. Each card shows:
   - Province title
   - Move type icon
   - Duration
   - "Why recommended" explanation (from BE)
   - "Do it" button
3. On "Do it":
   - Create DailyMove (EPIC-08 T1 BE)
   - Apply domain action
   - Show feedback (EPIC-11)
   - Update map/chronicle
4. Add "Skip" option for each card

**Acceptance criteria:**
- User can perform at least one meaningful action from this screen
- Recommendations load after check-in

**DoD:**
- Screen works end-to-end

**How to verify:**
```bash
npm run dev
# Complete check-in, verify 3 orders appear
# Click "Do it", verify action applies
```

---

### 08-T3. War council screen (UI)
**Track:** `FE`  
**Estimate:** `L` (4-6h)

**Description:** Implement if-then planning screen (evening ritual).

**Steps:**
1. Create `src/pages/war-council/WarCouncilPage.tsx`:
   ```typescript
   // Form:
   // - Select province (dropdown)
   // - Trigger: "If (situation/time)..."
   // - Action: "Then I will (action)..."
   ```
2. Enforce 1-3 plans per day (MVP)
3. Show active plans list:
   - Province
   - Trigger
   - Action
   - Status (pending/completed)
4. Persist plans (EPIC-08 T3 BE)
5. Add navigation: `/war-council`

**Acceptance criteria:**
- Plans persist and are visible the next day
- User can create 1-3 plans in under 2 minutes

**DoD:**
- CRUD works

**How to verify:**
```bash
npm run dev
# Create 2 plans, refresh, verify they load
```

---

### 08-T5. Daily Orders history UI
**Track:** `FE`  
**Estimate:** `S` (1-2h)

**Description:** Show last N daily moves in a list view.

**Steps:**
1. Create `src/pages/daily-orders/DailyOrdersHistory.tsx`:
   ```typescript
   // List items:
   // - Date
   // - Province title
   // - Move type icon
   // - Duration
   // - Result (started/progressed/completed/etc.)
   ```
2. Add optional filter by date range
3. Add optional filter by move type
4. Wire to BE repository (EPIC-08 T4)

**Acceptance criteria:**
- User can see what they did yesterday
- History is sorted (newest first)

**DoD:**
- History is accessible

**How to verify:**
```bash
npm run dev
# Create 5 DailyMoves, verify they appear in history
```

---

## EPIC-10 — Season System (UI)

### 10-T3. Weekly focus hints (copy-only)
**Track:** `FE`  
**Estimate:** `S` (1-2h)

**Description:** Show week-specific hints on Daily Orders / Capital screens.

**Steps:**
1. Add copy in `src/shared/copy/season-hints.ts`:
   ```typescript
   const hints = {
     week1: "Week 1: Establish your foothold. Clear fog, start small.",
     week2: "Week 2: Build momentum. Resolve sieges, maintain rhythm.",
     week3: "Week 3: Close strong. Capture high-effort provinces.",
   };
   ```
2. Display hint on:
   - Daily Orders screen (top banner)
   - Capital screen (sidebar)
3. Compute week from `season.dayNumber` (EPIC-10 T1)

**Acceptance criteria:**
- User can see the weekly focus
- Copy changes by week

**DoD:**
- Weekly hints are present

**How to verify:**
```bash
npm run dev
# Change season dayNumber, verify hint updates
```

---

### 10-T6. Season summary screen
**Track:** `FE`  
**Estimate:** `M` (2-4h)

**Description:** Show season statistics and aggregates.

**Steps:**
1. Create `src/pages/season/SeasonSummaryPage.tsx`:
   ```typescript
   // Show:
   // - Season name + dates
   // - Clarified: X provinces
   // - Sieges resolved: X
   // - Completed: X provinces
   // - Meaningful days: X / 21
   // - Archetype balance (P1)
   ```
2. Add "Start new season" CTA
3. Add link to Season Debrief
4. Wire to BE aggregates (EPIC-10 T4)

**Acceptance criteria:**
- Numbers match stored data
- Screen is accessible from Capital

**DoD:**
- Summary screen is implemented

**How to verify:**
```bash
npm run dev
# Complete season actions, verify summary shows correct numbers
```

---

### 10-T7. Season Debrief UI (3-screen flow)
**Track:** `FE`  
**Estimate:** `L` (4-6h)

**Description:** Implement short debrief ritual (worked well / obstacles / carry forward).

**Steps:**
1. Create `src/pages/season/SeasonDebriefPage.tsx`:
   - Screen 1: "What worked well?" — text areas (2-3 items)
   - Screen 2: "What obstacles appeared?" — text areas (2-3 items)
   - Screen 3: "Carry forward / Drop" — two lists
2. Pre-fill suggestions from season data (optional, EPIC-10 T5)
3. Allow skip (minimal completion ok)
4. On complete:
   - Persist review (EPIC-10 T5 BE)
   - Auto-start new season
   - Navigate to Capital

**Acceptance criteria:**
- Review can be completed in 1-2 minutes
- User can skip deep writing but finish ritual

**DoD:**
- Review data is persisted

**How to verify:**
```bash
npm run dev
# Complete debrief, verify new season starts
```

---

## EPIC-11 — Scoring & Feedback (UI)

### 11-T5. Feedback copy (minimum viable)
**Track:** `FE` (Shared with BE for triggers)  
**Estimate:** `S` (1-2h)

**Description:** Draft copy for feedback messages.

**Steps:**
1. Create `src/shared/copy/feedback.ts`:
   ```typescript
   const feedbackCopy = {
     clarify: "Fog cleared. The path is visible.",
     start: "First step taken. The campaign advances.",
     progress: "Ground gained. Hold the line.",
     capture: "Province secured. Your realm grows.",
     siege_resolve: "Siege broken. Resistance fades.",
     retreat: "Strategic withdrawal. Fight another day.",
   };
   ```
2. Draft non-shaming siege copy:
   ```typescript
   const siegeCopy = {
     title: "The province is under siege",
     reason: "No meaningful action for {days} days",
     encouragement: "Choose a tactic. Break the siege.",
   };
   ```
3. Ensure tone is neutral-positive, not childish

**Acceptance criteria:**
- Copy is wired into UI components
- Tone is consistent

**DoD:**
- Copy is complete

**How to verify:**
```bash
npm run dev
# Trigger feedback, verify copy appears
```

---

### 11-T7. Hero moments UI (MVP Lite)
**Track:** `FE`  
**Estimate:** `M` (2-4h)

**Description:** Implement capped celebratory overlays for meaningful milestones.

**Steps:**
1. Create `src/shared/ui/HeroMomentOverlay.tsx`:
   ```typescript
   // Show overlay when:
   // - siege resolved
   // - first clarity unlock
   // - first start
   // - 3 meaningful days
   // - high-effort capture
   ```
2. Add animation (respect reduced-motion preference):
   ```css
   @keyframes hero-fade {
     0% { opacity: 0; transform: scale(0.9); }
     50% { opacity: 1; transform: scale(1); }
     100% { opacity: 0; transform: scale(1.1); }
   }
   ```
3. Implement caps:
   - Max 1 strong hero moment per session
   - Accessibility setting to reduce/disable
4. Wire to BE triggers (EPIC-11 T6)

**Acceptance criteria:**
- Hero moments never trigger without meaningful action
- Hero moments do not reward "prepare loops"

**DoD:**
- Trigger rules and UI contract in place

**How to verify:**
```bash
npm run dev
# Trigger hero moment actions, verify overlay appears
# Trigger twice in one session, verify only one appears
```

---

### 11-T8. Meaningful-day streak UI
**Track:** `FE`  
**Estimate:** `S` (1-2h)

**Description:** Display streak counter minimally (no harsh punishment).

**Steps:**
1. Add streak display to Capital screen:
   ```typescript
   // Show: "🔥 {streak} day streak"
   // Or: "Last meaningful: {days} days ago"
   ```
2. Use subtle visual (icon + number)
3. No shame copy for broken streaks

**Acceptance criteria:**
- Streak is visible on Capital
- Streak does not punish missing days

**DoD:**
- Streak counter is displayed

**How to verify:**
```bash
npm run dev
# Complete meaningful actions on consecutive days, verify streak updates
```

---

### 11-T9. Anti-abuse warning UI
**Track:** `FE`  
**Estimate:** `S` (1-2h)

**Description:** Show soft warnings (not errors) for guardrail violations.

**Steps:**
1. Create `src/shared/ui/WarningToast.tsx`:
   ```typescript
   // Show warnings:
   // - "This province is still unclear. Add outcome/first step?"
   // - "You've split this 3 times. Ready to start?"
   // - "Many micro-tasks detected. Consider merging?"
   ```
2. Show as toast notification (non-blocking)
3. Auto-dismiss after 5 seconds
4. Wire to BE guardrails (EPIC-11 T4)

**Acceptance criteria:**
- Warnings do not block legitimate use
- Warnings are dismissible

**DoD:**
- Warnings are implemented

**How to verify:**
```bash
npm run dev
# Trigger guardrail conditions, verify warnings appear
```

---

## EPIC-12 — Instrumentation (UI Wiring)

### 12-T5. Settings: Export events UI
**Track:** `FE`  
**Estimate:** `S` (1-2h)

**Description:** Add "Export events" button to Settings page.

**Steps:**
1. Extend `src/pages/settings/SettingsPage.tsx`:
   ```typescript
   // Add section:
   // "Export Events"
   // - Button: "Export as JSON"
   // - Button: "Export as CSV"
   ```
2. On click:
   - Call `exportEventsJSON()` or `exportEventsCSV()` (EPIC-12 T3)
   - Download file
3. Include schema version in export

**Acceptance criteria:**
- Export downloads file
- File can be parsed

**DoD:**
- Export works reliably

**How to verify:**
```bash
npm run dev
# Click export, verify file downloads
# Parse file, verify structure
```

---

### 12-T6. Dev-only event viewer
**Track:** `FE`  
**Estimate:** `S` (1-2h)

**Description:** Debug viewer for last 50 events (dev mode only).

**Steps:**
1. Create `src/pages/dev/EventViewerPage.tsx`:
   ```typescript
   // Show:
   // - List of last 50 events
   // - Filter by eventName (dropdown)
   // - Timestamp, payload preview
   ```
2. Enable only via `VITE_DEV_MODE=true`
3. Add route: `/dev/events` (dev-only)

**Acceptance criteria:**
- Helps developers verify event streams
- Never visible in production

**DoD:**
- Enabled only in dev

**How to verify:**
```bash
VITE_DEV_MODE=true npm run dev
# Navigate to /dev/events, verify events appear
npm run dev  # without VITE_DEV_MODE
# Verify /dev/events returns 404
```

---

## EPIC-15 — World Shell (Capital, Chronicle, Theme)

### 15-T1. Theme & naming rules (copy contract)
**Track:** `FE` (Shared with BE for copy)  
**Estimate:** `S` (1-2h)

**Description:** Define copy layering contract (fantasy vs plain language).

**Steps:**
1. Create `src/shared/copy/layering.md`:
   ```markdown
   ## Copy Layering Rules

   ### Fantasy-first surfaces (map, Capital, Chronicle):
   - "Province" not "task"
   - "Campaign" not "project"
   - "Siege" not "stalled"
   - "Fog" not "unclear"

   ### Plain-language surfaces (action screens, forms):
   - "Outcome" (desired result)
   - "First step" (next action)
   - "Entry time" (minutes to start)
   - Never hide real-world meaning

   ### Naming patterns:
   - Campaigns: "{FantasyName} Campaign" (e.g., "Iron Valley Campaign")
   - Seasons: "Season {number}: {FantasySubtitle}" (e.g., "Season 1: The Breaking")
   ```
2. Document examples for each surface

**Acceptance criteria:**
- Naming and copy rules do not obscure real-world meaning on action surfaces

**DoD:**
- Copy contract exists

**How to verify:**
```bash
# Review document
```

---

### 15-T2. Capital Lite (Home) screen
**Track:** `FE`  
**Estimate:** `M` (2-4h)

**Description:** Implement default entry hub (front situation + fast CTAs).

**Steps:**
1. Create `src/pages/capital/CapitalPage.tsx`:
   ```typescript
   // Show:
   // - Campaign name + season fantasy name
   // - Clan banner mark/style
   // - Front summary: fog/siege/fortified counts
   // - 1-3 hotspots (provinces with high pressure)
   // - CTA: "Make a move" → Daily Orders
   // - CTA: "Open Chronicle"
   // - CTA: "Open Map"
   ```
2. Compute front summary from local state
3. Add navigation: `/capital` (post-onboarding default)
4. Ensure 2 clicks max to meaningful action

**Acceptance criteria:**
- Capital adds near-zero friction
- Capital never grants progress by itself

**DoD:**
- Capital is usable as main entry surface

**How to verify:**
```bash
npm run dev
# Open Capital, verify front summary appears
# Click CTAs, verify navigation works
```

---

### 15-T3. Chronicle Lite screen
**Track:** `FE`  
**Estimate:** `L` (4-6h)

**Description:** Implement human-readable campaign memory (timeline of chronicle lines).

**Steps:**
1. Create `src/pages/chronicle/ChroniclePage.tsx`:
   ```typescript
   // Show reverse chronological timeline:
   // - Entry type icon
   // - Title (short chronicle line)
   // - Body (optional, 1-2 sentences)
   // - Timestamp
   // - Importance badge (low/medium/high)
   ```
2. Define entry types (EPIC-15 T3 BE):
   - `fog_cleared`
   - `province_started`
   - `siege_resolved`
   - `province_fortified`
   - `region_captured`
   - `meaningful_streak_3`
   - `season_end`
   - `return_after_break`
3. Add filter by importance (optional)
4. Add entry points from Capital and Season Debrief
5. Wire to BE entry generation (EPIC-15 T3 BE)

**Acceptance criteria:**
- Chronicle is readable in < 30 seconds
- No chronicle prompts before action
- Entries are short human-readable lines

**DoD:**
- Chronicle exists as first-class screen

**How to verify:**
```bash
npm run dev
# Trigger meaningful actions, verify chronicle entries appear
# Open Chronicle, verify entries are readable
```

---

### 15-T4. Capital visual progression (Lite)
**Track:** `FE`  
**Estimate:** `M` (2-4h)

**Description:** Reflect milestones via visual tiers (non-economic).

**Steps:**
1. Define `CapitalState.visualTier` thresholds:
   ```typescript
   const tiers = {
     1: { name: 'Outpost', requirement: 'start' },
     2: { name: 'Garrison', requirement: 'region_captured' },
     3: { name: 'Stronghold', requirement: '3_meaningful_days' },
     4: { name: 'Capital', requirement: 'season_completion' },
   };
   ```
2. Render small visual changes:
   - Tier badge/icon
   - Unlock list (decor)
3. Tie tier changes to meaningful actions (not time-in-app)
4. Wire to BE thresholds (EPIC-15 T4 BE)

**Acceptance criteria:**
- Visual progression is purely reflective
- Never becomes grind or required input

**DoD:**
- At least 2-3 tiers are visible

**How to verify:**
```bash
npm run dev
# Trigger tier milestones, verify visual changes
```

---

### 15-T5. Clan identity Lite (banner + name)
**Track:** `FE`  
**Estimate:** `M` (2-4h)

**Description:** Implement minimal clan identity (banner mark/style + name).

**Steps:**
1. Create `src/entities/campaign.ts` extension:
   ```typescript
   {
     factionId?: string;
     factionName?: string;
     bannerStyle?: 'solid' | 'striped' | 'chevron' | 'quartered';
     bannerColor?: string;
   }
   ```
2. Add banner selection UI during campaign creation:
   - 4 banner styles
   - 6-8 colors
   - Optional faction name
3. Display banner on:
   - Capital screen
   - Campaign map
   - Chronicle entries

**Acceptance criteria:**
- Clan identity is optional
- Banner is visible on Capital/Chronicle

**DoD:**
- Clan identity works

**How to verify:**
```bash
npm run dev
# Create campaign with banner, verify it appears on Capital
```

---

### 15-T6. Seasonal fantasy naming (auto-generated + editable)
**Track:** `FE`  
**Estimate:** `S` (1-2h)

**Description:** Implement auto-generated season/campaign names (editable).

**Steps:**
1. Create `src/shared/copy/fantasy-names.ts`:
   ```typescript
   const campaignPrefixes = ['Iron', 'Shadow', 'Crystal', 'Storm', 'Ember'];
   const campaignSuffixes = ['Vale', 'Hold', 'Reach', 'Pass', 'Crossing'];
   const seasonSubtitles = ['The Breaking', 'The Rising', 'The Reckoning', 'The Return'];

   function generateCampaignName(): string {
     return `${random(prefixes)} ${random(suffixes)} Campaign`;
   }

   function generateSeasonName(seasonNumber: number): string {
     return `Season ${seasonNumber}: ${random(subtitles)}`;
   }
   ```
2. Auto-fill on campaign/season creation
3. Make editable (user can change)

**Acceptance criteria:**
- Names are auto-generated
- User can edit names

**DoD:**
- Naming works

**How to verify:**
```bash
npm run dev
# Create campaign, verify auto-generated name
# Edit name, verify it saves
```

---

## EPIC-14 — Safe Sharing (UI, P1)

### 14-T2. Local card generation UI
**Track:** `FE`  
**Estimate:** `L` (4-6h)

**Description:** Implement share card render pipeline (image-ready).

**Steps:**
1. Create `src/pages/share/ShareCard.tsx`:
   ```typescript
   // Render card types:
   // - Weekly map card
   // - Before/after season card
   // - Siege recovery card
   // - Campaign style card
   ```
2. Use HTML5 Canvas or SVG-to-image for export
3. Support PNG download
4. Save card metadata (EPIC-03)

**Acceptance criteria:**
- Card generation works fully offline
- At least one card type can be generated

**DoD:**
- One card type works end-to-end

**How to verify:**
```bash
npm run dev
# Generate card, verify PNG downloads
```

---

### 14-T3. Privacy modes UI
**Track:** `FE`  
**Estimate:** `M` (2-4h)

**Description:** Implement public-safe vs private export modes.

**Steps:**
1. Add privacy mode selector to share card UI:
   ```typescript
   // Options:
   // - "Public-safe" (default): strip task titles, deadlines, sensitive text
   // - "Private": full details (local export only)
   ```
2. Implement redaction rules:
   - Remove `province.title` in public-safe
   - Remove `province.description` in public-safe
   - Remove `dueDate` in public-safe
   - Keep: stats, counts, progress
3. Show preview before export

**Acceptance criteria:**
- Public-safe export never leaks raw task text by default

**DoD:**
- Privacy mode is visible and testable

**How to verify:**
```bash
npm run dev
# Generate public-safe card, verify no task titles
# Generate private card, verify full details
```

---

### 14-T4. Connect export entry points
**Track:** `FE`  
**Estimate:** `S` (1-2h)

**Description:** Add export CTAs to season summary and hero moments.

**Steps:**
1. Add "Export" button to SeasonSummaryPage
2. Add "Share" button to HeroMomentOverlay (optional)
3. Ensure export prompts are contextual (not spammy)
4. Respect prompt budget (EPIC-01 Appendix A)

**Acceptance criteria:**
- Users can reach export from at least two contexts
- Export prompts respect prompt budget

**DoD:**
- Entry points connected

**How to verify:**
```bash
npm run dev
# Complete season, verify export CTA appears
# Trigger hero moment, verify share option
```

---

## Shared Tasks (BE + FE Sync Required)

### SYNC-T3. After BE lands rule engine (applyAction)
**Track:** `SHARED`

**Description:** FE wires province actions to real rule engine.

**Steps:**
1. BE completes: 06-T3 (applyAction)
2. FE updates Province Drawer to use `applyAction` instead of direct state mutation
3. Test: clarify fog, resolve siege, start province

**Acceptance criteria:**
- No direct state mutation in UI

---

### SYNC-T4. After BE lands feedback signals
**Track:** `SHARED`

**Description:** FE wires feedback UI to domain signals.

**Steps:**
1. BE completes: 11-T2 (feedback wiring)
2. FE shows feedback after meaningful actions
3. Test: trigger hero moment, verify overlay appears

**Acceptance criteria:**
- Feedback triggers only on meaningful actions

---

## Dependencies Summary

| Task | Depends On |
|------|------------|
| 06-T8 (state classes) | EPIC-04 (map binding) |
| 07-T2 (siege screen) | 07-T1 (siege detection BE) |
| 08-T0 (check-in) | None |
| 08-T1 (Daily Orders) | 08-T0 (check-in), 08-T2 (recommendations BE) |
| 08-T3 (War council) | 08-T3 BE (IfThenPlan CRUD) |
| 10-T3 (weekly hints) | 10-T1 (dayNumber BE) |
| 10-T6 (season summary) | 10-T4 (stats BE) |
| 10-T7 (debrief) | 10-T5 (review persistence BE) |
| 11-T7 (hero moments) | 11-T6 (triggers BE) |
| 11-T8 (streak UI) | 11-T3 (streak logic BE) |
| 15-T2 (Capital) | EPIC-03 (persistence) |
| 15-T3 (Chronicle) | 15-T3 BE (entry generation) |
| 15-T4 (visual tiers) | 15-T4 BE (thresholds) |

---

## Recommended Order

1. **Week 2A (Days 1-3):** 15-T1, 15-T2, 15-T5, 15-T6, 06-T8, 06-T9
2. **Week 2B (Days 4-6):** 07-T2, 11-T5, 11-T7, 11-T8, 11-T9
3. **Week 2C (Days 7-9):** 08-T0, 08-T1, 08-T3, 08-T5
4. **Week 2D (Days 10-12):** 10-T3, 10-T6, 10-T7, 15-T3, 15-T4
5. **Week 2E (Days 13-15):** 12-T5, 12-T6, 14-T2, 14-T3, 14-T4

---

## Definition of Done (All Tasks)

- [ ] All components render without errors: `npm run dev`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Code follows project conventions (eslint)
- [ ] UI is responsive (desktop-first, mobile-friendly)
- [ ] Reduced-motion preference respected
- [ ] Accessibility basics (keyboard navigation, ARIA labels)
