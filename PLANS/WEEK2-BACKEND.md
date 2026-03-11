# Week 2 — Backend/Domain Tasks (EPIC-06, 07, 08, 10, 11, 12)

**Priority:** `P0`  
**Status:** `ready`  
**Owner:** Backend/Domain Junior  
**PRD reference:** `prd.md` (Game rules, Siege, Daily loop, Season, Scoring, Instrumentation)

---

## Context

This plan contains **pure backend/domain tasks** for Week 2 MVP slice. These tasks implement:
- Rule engine (state transitions, fog, progress stages)
- Siege system (detection, tactics as domain actions)
- Daily Orders recommendation algorithm
- Season system (day computation, boundaries)
- Feedback/anti-abuse heuristics
- Event instrumentation (local logging)

**Dependencies:** EPIC-03 (domain models + persistence) must be complete before starting these tasks.

---

## EPIC-06 — Rule Engine (Core Domain Logic)

### 06-T1. Define domain action set
**Track:** `BE`  
**Estimate:** `M` (2-4h)

**Description:** Define all domain actions that can mutate province state.

**Steps:**
1. Define action types in `src/game/rules/actions.ts`:
   - `clarify` — fill outcome/firstStep/estimatedEntryMinutes
   - `supply` — add context links/notes, reduce friction
   - `decompose` — split into sub-provinces
   - `start_move` — record first real step
   - `log_move` — log progress action
   - `apply_tactic` — resolve siege with specific tactic
   - `complete` — mark province as captured
   - `retreat` — defer/remove province
   - `reschedule` — change due date
   - `edit_fields` — cosmetic/administrative updates (non-meaningful)
2. Define payload schema for each action using zod
3. Export action types from `src/game/rules/index.ts`

**Acceptance criteria:**
- Actions cover all transitions from EPIC-01
- Each action has a validated payload type

**DoD:**
- Actions are defined, exported, and used by applyAction

**How to verify:**
```bash
npm run build
# Check that actions are imported in applyAction tests
```

---

### 06-T2. Implement fog rule
**Track:** `BE`  
**Estimate:** `M` (2-4h)

**Description:** Implement fog detection based on required clarity fields.

**Steps:**
1. Create `src/game/rules/fog.ts`:
   ```typescript
   function isFog(province: Province): boolean {
     return !province.desiredOutcome || !province.firstStep || !province.estimatedEntryMinutes;
   }
   ```
2. Implement `clarify` action that updates fields and removes fog
3. Add unit tests in `src/game/rules/fog.test.ts`

**Acceptance criteria:**
- Fog is removed only when all 3 required fields are present
- Fog state is computed, not stored directly

**DoD:**
- Unit tests exist and pass

**How to verify:**
```bash
npm test -- fog.test.ts
```

---

### 06-T3. Implement applyAction and transition enforcement
**Track:** `BE`  
**Estimate:** `XL` (6-8h)

**Description:** Central rule engine function that applies actions and enforces valid state transitions.

**Steps:**
1. Create `src/game/rules/applyAction.ts`:
   ```typescript
   function applyAction(
     province: Province,
     action: Action
   ): { newProvince: Province; sideEffects: SideEffect[] } | Error
   ```
2. Implement transition table from EPIC-01:
   - fog → ready (clarify)
   - ready → in_progress (start_move)
   - ready → siege (no meaningful action for N days)
   - ready → fortified (high effort + no decomposition)
   - siege → ready (apply_tactic)
   - in_progress → captured (complete)
   - any → retreated (retreat)
3. Ensure invalid transitions return explicit errors
4. Add unit tests for all transitions

**Acceptance criteria:**
- UI cannot set `state` directly (only via actions)
- Invalid transitions return errors with messages

**DoD:**
- All transitions covered by tests

**How to verify:**
```bash
npm test -- applyAction.test.ts
# Run 10+ times to ensure no flakiness
```

---

### 06-T4. Stage-based progress (progressStage)
**Track:** `BE`  
**Estimate:** `L` (4-6h)

**Description:** Implement 5-stage progress system (scouted/prepared/entered/held/captured).

**Steps:**
1. Define criteria in `src/game/rules/progress.ts`:
   - `scouted` (15%): fog cleared
   - `prepared` (30%): supply or engineer applied
   - `entered` (55%): first real step recorded
   - `held` (80%): sustained progress (2+ moves)
   - `captured` (100%): completed
2. Update `applyAction` to modify `progressStage` based on actions
3. Add tests for stage changes

**Acceptance criteria:**
- Progress increases only when rules allow it
- Progress never decreases (except on retreat)

**DoD:**
- Tests cover all stage changes

**How to verify:**
```bash
npm test -- progress.test.ts
```

---

### 06-T5. Province roles (MVP)
**Track:** `BE`  
**Estimate:** `M` (2-4h)

**Description:** Define province roles and their rule-level implications.

**Steps:**
1. Define `ProvinceRole` enum in `src/entities/province.ts`:
   - `standard` (default)
   - `fortress` — prefer engineer/supply before assault
   - `watchtower` — prefer scout/fog clearing
   - `archive` — prefer supply/clarify
   - `depot` — prefer supply actions
2. Add role-based recommendation hooks in `src/game/rules/recommendations.ts`
3. Ensure roles never create new mechanics (only influence recommendations/copy)

**Acceptance criteria:**
- Roles are optional and safe to ignore without breaking flows

**DoD:**
- Roles defined and exported

**How to verify:**
```bash
npm run build
```

---

### 06-T6. Pressure signals (front pressure, hotspots)
**Track:** `BE`  
**Estimate:** `M` (2-4h)

**Description:** Compute pressure signals from province states/history.

**Steps:**
1. Create `src/game/rules/pressure.ts`:
   ```typescript
   function computeFrontPressureLevel(province: Province, history: History): number // 0..3
   function computeIsHotspot(province: Province): boolean
   ```
2. Define computation inputs:
   - siege status
   - fortified status
   - repeated retreats
   - long stalling (no meaningful action >5 days)
3. Ensure pressure is never punitive (no territory loss, no penalties)

**Acceptance criteria:**
- Pressure can be rendered as map highlights without additional UI forms

**DoD:**
- Functions exist and are tested

**How to verify:**
```bash
npm test -- pressure.test.ts
```

---

### 06-T7. Minimal runtime validation
**Track:** `BE`  
**Estimate:** `M` (2-4h)

**Description:** Validate ranges, required IDs, and required fields for actions.

**Steps:**
1. Add validators in `src/shared/validation.ts`:
   - `effortLevel`: 1..5
   - `clarityLevel`: 1..5
   - `estimatedEntryMinutes`: 5..180
   - required IDs for actions
2. Integrate validators into `applyAction`
3. Provide user-friendly errors for UI

**Acceptance criteria:**
- Invalid data cannot be persisted
- Errors are human-readable

**DoD:**
- Validators used by repositories/actions

**How to verify:**
```bash
npm test -- validation.test.ts
```

---

## EPIC-07 — Siege System

### 07-T1. Siege detection + SiegeEvent creation
**Track:** `BE`  
**Estimate:** `L` (4-6h)

**Description:** Implement siege auto-trigger after N=3 days without meaningful action.

**Steps:**
1. Create `src/game/rules/siege.ts`:
   ```typescript
   function checkSiege(province: Province): boolean {
     const lastAction = province.lastMeaningfulActionAt ?? province.createdAt;
     const daysSinceAction = daysBetween(lastAction, now());
     return daysSinceAction >= 3;
   }
   ```
2. Implement detector at app startup and on province open
3. Create `SiegeEvent` entity in `src/entities/siege.ts`
4. Add unit tests for N=3 logic

**Acceptance criteria:**
- Siege triggers predictably by the rule
- SiegeEvent is created with timestamp and reason

**DoD:**
- Unit tests cover the N=3 logic

**How to verify:**
```bash
npm test -- siege.test.ts
# Manually: set lastMeaningfulActionAt to 4 days ago, reload app
```

---

### 07-T3. Implement 5 tactics as domain actions
**Track:** `BE`  
**Estimate:** `XL` (6-8h)

**Description:** Implement each tactic as a domain action with explicit data effects.

**Steps:**
1. Create `src/game/rules/tactics.ts`:
   - **Scout:** drive clarification (set outcome/firstStep/entry time)
   - **Supply:** store context (`contextLinks[]`, `contextNotes`), update timestamps
   - **Engineer:** split into 3-5 sub-provinces (create new provinces, link to parent)
   - **Raid:** create a 5-minute DailyMove, update progressStage to `prepared`
   - **Retreat:** set state to `retreated` or reschedule
2. Each tactic must:
   - Accept payload
   - Return new province state
   - Log side effects (Chronicle entry, SiegeEvent resolution)
3. Add tests for each tactic

**Acceptance criteria:**
- Each tactic has a verifiable data effect
- Tactics resolve siege (set state to `ready`)

**DoD:**
- All 5 tactics work end-to-end

**How to verify:**
```bash
npm test -- tactics.test.ts
```

---

### 07-T4. Log tactic effectiveness
**Track:** `BE`  
**Estimate:** `M` (2-4h)

**Description:** Track tactic application and subsequent progress for later analysis.

**Steps:**
1. Add `tactic_applied` event to EPIC-12 event schema
2. Track:
   - `provinceId`
   - `tacticType`
   - `timestamp`
   - `siegeDuration_days`
3. Track subsequent progress:
   - province moved to `in_progress` within 24h
   - province completed within 7 days
4. Export correlation data via EPIC-12 export

**Acceptance criteria:**
- Exported events can be used to compute "what works"

**DoD:**
- Events exist and are exported

**How to verify:**
```bash
# Export events and check for tactic_applied entries
```

---

## EPIC-08 — Daily Orders & War Council

### 08-T0. Commander check-in logic
**Track:** `BE`  
**Estimate:** `M` (2-4h)

**Description:** Implement check-in state persistence and binding to recommendations.

**Steps:**
1. Define `PlayerCheckIn` entity in `src/entities/checkin.ts`:
   ```typescript
   {
     id: string;
     date: string;
     emotionType: 'anxiety' | 'boredom' | 'fatigue' | 'irritation' | 'fear' | 'ambiguity';
     availableMinutes: 5 | 15 | 25;
     energyLevel: 'low' | 'medium' | 'high';
     recommendedMoveIds: string[];
   }
   ```
2. Create repository: `src/storage/checkin-repo.ts`
3. Bind check-in to Daily Orders (EPIC-08 T1)

**Acceptance criteria:**
- Check-in persists across refresh
- Check-in can be completed in 3-5 seconds (UI metric)

**DoD:**
- Check-in works end-to-end with persistence

**How to verify:**
```bash
# Create check-in, refresh, verify it loads
```

---

### 08-T2. Recommendation algorithm v1 (3 moves)
**Track:** `BE`  
**Estimate:** `XL` (6-8h)

**Description:** Implement rule-based algorithm to pick 3 daily moves (light/medium/main).

**Steps:**
1. Create `src/game/rules/recommendations.ts`:
   ```typescript
   function getDailyOrders(
     provinces: Province[],
     checkIn: PlayerCheckIn,
     history: DailyMove[]
   ): DailyOrder[]
   ```
2. Implement candidate pool: fog/ready/sieged/in_progress provinces
3. Implement rules:
   - One light (~5 min): scout/supply
   - One medium (~15 min): engineer/raid
   - One main (25+ min): assault
4. Adjust by check-in:
   - low energy → bias toward scout/supply
   - 5 min available → only light moves
5. Tie-breakers:
   - recency (prefer untouched provinces)
   - dueDate (if any)
   - history (prefer provinces with past success)
6. Implement soft anti-exploit:
   - If province in "prepare loop" (supply/decompose >3 times without start), bias toward `raid` or `retreat`
7. Generate "why" explanation for each recommendation
8. Add unit tests for 5-7 scenarios

**Acceptance criteria:**
- Recommendations always resolve (no empty state)
- Recommendations explain influence of state/history

**DoD:**
- Unit tests cover scenarios

**How to verify:**
```bash
npm test -- recommendations.test.ts
```

---

### 08-T4. Daily Orders history logic
**Track:** `BE`  
**Estimate:** `M` (2-4h)

**Description:** Implement history retrieval for last N daily moves.

**Steps:**
1. Create `DailyMove` repository: `src/storage/daily-move-repo.ts`
2. Implement `listByDateRange(startDate, endDate)`
3. Implement `listLastN(n)` for "last N moves" view
4. Add optional filter by `moveType` or `result`

**Acceptance criteria:**
- History is sorted by date (newest first)
- History includes: date, provinceId, moveType, duration, result

**DoD:**
- History is accessible via repository

**How to verify:**
```bash
# Create 5 DailyMoves, verify listLastN(5) returns them
```

---

## EPIC-10 — Season System

### 10-T1. Implement season dayNumber and boundaries
**Track:** `BE`  
**Estimate:** `M` (2-4h)

**Description:** Compute season day number from startedAt using EPIC-01 time contract.

**Steps:**
1. Create `src/game/rules/season.ts`:
   ```typescript
   function getSeasonDayNumber(season: Season): number {
     const days = daysBetween(season.startedAt, now());
     return Math.min(days, 21);
   }
   ```
2. Use EPIC-01 time boundary contract (day starts at 04:00 local)
3. Display dayNumber in UI (wire to EPIC-15)

**Acceptance criteria:**
- Day number is stable across refreshes
- Day number resets at correct boundary

**DoD:**
- dayNumber is computed and displayed

**How to verify:**
```bash
# Manually: change system date, verify dayNumber updates
```

---

### 10-T2. Auto-start the next season
**Track:** `BE`  
**Estimate:** `L` (4-6h)

**Description:** Automatically create new Season on day 21 completion.

**Steps:**
1. Implement season completion check:
   ```typescript
   function checkSeasonEnd(season: Season): boolean {
     return getSeasonDayNumber(season) >= 21;
   }
   ```
2. On completion:
   - Create new Season with `startedAt = now()`
   - Update `PlayerProfile.currentSeasonId`
   - Migrate active provinces (in_progress → ready for new season)
3. Ensure no data loss during transition

**Acceptance criteria:**
- Season switch does not lose data
- New season is created automatically

**DoD:**
- Auto-start works

**How to verify:**
```bash
# Manually: set season.startedAt to 20 days ago, trigger end, verify new season created
```

---

### 10-T4. Season summary aggregates
**Track:** `BE`  
**Estimate:** `M` (2-4h)

**Description:** Compute season statistics for summary screen.

**Steps:**
1. Create `src/game/rules/season-stats.ts`:
   ```typescript
   function computeSeasonSummary(seasonId: string): SeasonSummary {
     return {
       clarified: count(provinces, p => p.state === 'ready'),
       siegesResolved: count(siegeEvents),
       completed: count(provinces, p => p.state === 'captured'),
       meaningfulDays: count(unique dates with meaningful actions),
       archetypeBalance: { foundation, drive, joy } // P1
     };
   }
   ```
2. Wire to Season summary UI (EPIC-15)

**Acceptance criteria:**
- Numbers match stored data

**DoD:**
- Summary computation exists

**How to verify:**
```bash
npm test -- season-stats.test.ts
```

---

### 10-T5. Season Debrief persistence
**Track:** `BE`  
**Estimate:** `L` (4-6h)

**Description:** Persist Season Debrief data (worked well / obstacles / carry forward / drop).

**Steps:**
1. Define `SeasonReview` entity in `src/entities/season-review.ts`:
   ```typescript
   {
     id: string;
     seasonId: string;
     workedWell: string[];
     mainObstacles: string[];
     carryForward: string[];
     dropList: string[];
   }
   ```
2. Create repository: `src/storage/season-review-repo.ts`
3. Pre-fill suggestions from season data (optional)

**Acceptance criteria:**
- Review can be completed in 1-2 minutes
- Review data persists and is available for next season

**DoD:**
- Review data is persisted

**How to verify:**
```bash
# Complete debrief, refresh, verify data loads
```

---

## EPIC-11 — Scoring & Anti-Abuse

### 11-T1. Specify feedback model v1
**Track:** `BE` (Shared with FE for copy)  
**Estimate:** `M` (2-4h)

**Description:** Define which actions trigger feedback and what is shown.

**Steps:**
1. Create `src/game/rules/feedback-model.ts`:
   - `clarify` → subtle feedback
   - `supply` / `decompose` → subtle feedback
   - `start_move` / `log_move` → strong feedback
   - `siege_resolve` / `complete` → milestone feedback
   - "meaningful day" marker → streak feedback
2. Define caps:
   - Max 1 strong hero moment per session
   - No feedback for passive browsing
3. Document feedback rules

**Acceptance criteria:**
- No feedback for passive actions
- Feedback is understandable without tutorial

**DoD:**
- Feedback spec is written

**How to verify:**
```bash
# Review spec document
```

---

### 11-T2. Implement feedback wiring (domain signals)
**Track:** `BE`  
**Estimate:** `L` (4-6h)

**Description:** Expose "meaningful action happened" signals from domain transitions.

**Steps:**
1. Add `FeedbackSignal` type in `src/game/rules/feedback.ts`:
   ```typescript
   type FeedbackSignal = {
     type: 'subtle' | 'strong' | 'milestone';
     message: string;
     trigger: string;
   };
   ```
2. Modify `applyAction` to return `FeedbackSignal[]` as side effects
3. Persist meaningful-day marker per day/season

**Acceptance criteria:**
- Feedback triggers only on meaningful actions
- Signals are consumed by UI

**DoD:**
- Feedback is visible in main flow

**How to verify:**
```bash
# Trigger actions, verify signals returned
```

---

### 11-T3. Meaningful-day streak logic
**Track:** `BE`  
**Estimate:** `M` (2-4h)

**Description:** Implement streak counter that breaks softly (no harsh punishment).

**Steps:**
1. Define which events mark a day as meaningful:
   - `province_started`
   - `province_move_logged`
   - `siege_resolved`
   - `province_captured`
2. Implement streak counter in `PlayerProfile`:
   ```typescript
   {
     currentStreak: number;
     longestStreak: number;
     lastMeaningfulDate: string | null;
   }
   ```
3. Implement soft break (no reset of territories, no shame copy)

**Acceptance criteria:**
- Streak does not punish missing days

**DoD:**
- Streak counter exists and is displayed

**How to verify:**
```bash
# Complete meaningful actions on consecutive days, verify streak increases
```

---

### 11-T4. Anti-abuse heuristics (soft warnings)
**Track:** `BE`  
**Estimate:** `L` (4-6h)

**Description:** Implement guardrails to prevent gaming the system.

**Steps:**
1. Create `src/game/rules/guardrails.ts`:
   - Prevent progress without clarity (fog check)
   - Detect over-planning: `decompositionCount > 3` without `start_move`
   - Detect too many micro-tasks: >10 provinces with `estimatedEntryMinutes < 5`
   - Detect long sessions without meaningful action: session >30 min, no meaningful actions
2. Return warnings (not errors) from `applyAction`
3. Implement EPIC-01 Appendix A guardrails:
   - No rewards without action
   - Prompt budget (max N prompts per session)

**Acceptance criteria:**
- Warnings do not block legitimate use
- Guardrails are testable

**DoD:**
- Warnings implemented

**How to verify:**
```bash
npm test -- guardrails.test.ts
```

---

### 11-T6. Hero moments trigger rules
**Track:** `BE`  
**Estimate:** `M` (2-4h)

**Description:** Define allowed triggers for hero moments (capped celebratory overlays).

**Steps:**
1. Create `src/game/rules/hero-moments.ts`:
   ```typescript
   function checkHeroMomentTrigger(
     province: Province,
     action: Action,
     session: Session
   ): HeroMoment | null
   ```
2. Define triggers:
   - siege resolved
   - first clarity unlock (fog → ready)
   - first start (ready → in_progress)
   - 3 meaningful days in a row
   - high-effort capture (effortLevel >= 4)
3. Add caps:
   - Max 1 strong hero moment per session
   - Accessibility setting to reduce/disable
4. Ensure no hero moment without meaningful action

**Acceptance criteria:**
- Hero moments never trigger without meaningful action
- Hero moments do not reward "prepare loops"

**DoD:**
- Trigger rules and tests in place

**How to verify:**
```bash
npm test -- hero-moments.test.ts
```

---

## EPIC-12 — Instrumentation (Local Events)

### 12-T1. Finalize event schema v1
**Track:** `BE`  
**Estimate:** `M` (2-4h)

**Description:** Define event schema from EPIC-01 Appendix B.

**Steps:**
1. Create `src/shared/events/schema.ts`:
   ```typescript
   type GameEvent =
     | { name: 'checkin_started'; payload: { date: string } }
     | { name: 'checkin_completed'; payload: { date: string; emotionType: string; availableMinutes: number } }
     | { name: 'daily_move_viewed'; payload: { date: string; interventionId: string } }
     | { name: 'daily_move_selected'; payload: { date: string; interventionId: string; provinceId: string; moveType: string } }
     | { name: 'province_started'; payload: { provinceId: string; timestamp: string } }
     | { name: 'province_move_logged'; payload: { provinceId: string; moveType: string; durationMinutes: number } }
     | { name: 'siege_resolved'; payload: { provinceId: string; tactic: string; siegeDurationDays: number } }
     | { name: 'hero_moment_triggered'; payload: { type: string; provinceId?: string } }
     | { name: 'capital_viewed'; payload: { date: string } }
     | { name: 'chronicle_viewed'; payload: { date: string } }
     | { name: 'season_debrief_completed'; payload: { seasonId: string } }
     | { name: 'session_long_no_progress'; payload: { sessionDurationMinutes: number } }
     // ... add all from EPIC-01 Appendix B
   ```
2. Update EPIC-01 Appendix B with final schema

**Acceptance criteria:**
- Schema covers all MVP metrics from PRD

**DoD:**
- EPIC-01 Appendix B is complete

**How to verify:**
```bash
# Review schema document
```

---

### 12-T2. Implement event logger
**Track:** `BE`  
**Estimate:** `L` (4-6h)

**Description:** Implement append-only event logger in IndexedDB.

**Steps:**
1. Create `src/storage/event-logger.ts`:
   ```typescript
   async function track(event: GameEvent): Promise<void>;
   async function getEvents(limit?: number): Promise<GameEvent[]>;
   async function exportEvents(): Promise<string>; // JSON
   ```
2. Store events in IndexedDB (separate store: `game_events`)
3. Add size limits: keep last 1000 events, rotate older
4. Ensure logging does not degrade performance

**Acceptance criteria:**
- Logging is non-blocking
- Events persist across refresh

**DoD:**
- Logger integrated into key domain actions

**How to verify:**
```bash
# Trigger 10 events, verify they appear in storage
```

---

### 12-T3. Implement event export
**Track:** `BE`  
**Estimate:** `M` (2-4h)

**Description:** Export events as JSON/CSV via Settings UI.

**Steps:**
1. Add `exportEventsJSON()` and `exportEventsCSV()` functions
2. Wire to Settings UI (EPIC-03 T8 extension)
3. Include schema version in export

**Acceptance criteria:**
- Export downloads and can be parsed

**DoD:**
- Export works reliably

**How to verify:**
```bash
# Export events, parse JSON/CSV, verify structure
```

---

### 12-T4. Debug viewer (dev-only)
**Track:** `BE`  
**Estimate:** `S` (1-2h)

**Description:** Show last 50 events for debugging (dev mode only).

**Steps:**
1. Create dev-only component: `src/shared/dev/event-viewer.tsx`
2. Show last 50 events with filter by eventName
3. Enable only via `VITE_DEV_MODE=true`

**Acceptance criteria:**
- Helps developers verify event streams
- Never visible in production

**DoD:**
- Enabled only in dev

**How to verify:**
```bash
VITE_DEV_MODE=true npm run dev
# Navigate to /dev/events
```

---

## Shared Tasks (BE + FE Sync Required)

### SYNC-T1. After BE lands minimal repos for Campaign/Region/Province
**Track:** `SHARED`

**Description:** FE replaces mocks with real repos.

**Steps:**
1. BE completes: 03-T4, 03-T5, 03-T6
2. FE updates creation forms to use real repos
3. Test end-to-end: create → persist → refresh → verify

**Acceptance criteria:**
- No mocks in creation flows

---

### SYNC-T2. After BE lands import/export + schemaVersion
**Track:** `SHARED`

**Description:** FE wires Settings UI to real import/export.

**Steps:**
1. BE completes: 03-T7, 03-T8
2. FE updates Settings page to use real import/export
3. Test roundtrip: export → clear storage → import → verify

**Acceptance criteria:**
- Roundtrip works reliably

---

## Dependencies Summary

| Task | Depends On |
|------|------------|
| 06-T3 (applyAction) | 06-T1 (actions), 06-T2 (fog) |
| 06-T4 (progress) | 06-T3 (applyAction) |
| 07-T1 (siege) | 06-T3 (applyAction) |
| 07-T3 (tactics) | 07-T1 (siege), 06-T3 (applyAction) |
| 08-T2 (recommendations) | 08-T0 (check-in), 06-T5 (roles) |
| 10-T2 (auto-start season) | 10-T1 (dayNumber) |
| 11-T2 (feedback wiring) | 11-T1 (feedback model), 06-T3 (applyAction) |
| 11-T4 (guardrails) | 11-T1 (feedback model) |
| 12-T2 (event logger) | 12-T1 (schema) |

---

## Recommended Order

1. **Week 2A (Days 1-3):** 06-T1, 06-T2, 06-T3, 06-T4, 06-T7
2. **Week 2B (Days 4-6):** 07-T1, 07-T3, 06-T5, 06-T6
3. **Week 2C (Days 7-9):** 08-T0, 08-T2, 08-T4, 10-T1
4. **Week 2D (Days 10-12):** 10-T2, 10-T4, 10-T5, 11-T1, 11-T2
5. **Week 2E (Days 13-15):** 11-T3, 11-T4, 11-T6, 12-T1, 12-T2, 12-T3

---

## Definition of Done (All Tasks)

- [ ] All unit tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Code follows project conventions (eslint)
- [ ] Tasks are documented in code comments where non-obvious
