# Week 2 Integration Plan — P0/P1 Completion

> Archived on 2026-03-12. Completed on 2026-03-11 and retained for historical context only.

**ID:** `WEEK2-INTEGRATION`
**Priority:** `P0`
**Status:** `ready`
**Owner:** `Backend/Frontend Junior`
**PRD reference:** `prd.md` (Game rules, Siege, Daily loop, Season, Scoring, Instrumentation)

---

## 1) Objective (Outcome)

Complete all P0 and P1 tasks from Week 2 plans (BACKEND/FRONTEND) to achieve a **fully integrated, pilot-ready MVP**. After this plan:
- Siege system auto-triggers and resolves end-to-end
- Event instrumentation persists and exports reliably
- All UI screens wire to domain rule engine (no direct state mutation)
- Feedback signals trigger hero moments and chronicle entries
- Season system auto-completes and starts new season on day 21

**Success metric:** Run `make preflight` + manual E2E test of 5 key scenarios (create province, clarify fog, trigger siege, resolve siege, complete province) without errors.

---

## 2) Context

**Current state (from architectural audit):**
- Rule engine: 90% complete (excellent test coverage, pure functions)
- Siege system: 75% complete (domain logic done, auto-trigger missing)
- Daily Orders: 60% complete (UI exists, check-in integration missing)
- Season system: 70% complete (dayNumber works, auto-start missing)
- Feedback: 65% complete (signals returned, not consumed by UI)
- Instrumentation: 50% complete (schema exists, IndexedDB persistence missing)

**Why it matters:**
- Without auto-trigger, siege is invisible to users (core anti-procrastination mechanic broken)
- Without event persistence, pilot analytics are impossible
- Without UI wiring to applyAction, architecture contract is violated
- Without feedback consumption, hero moments never appear

---

## 3) Scope

**In scope:**
- All P0 tasks from architectural audit (5 critical gaps)
- All P1 tasks from architectural audit (10 pilot-readiness tasks)
- Integration tests for key flows
- Manual E2E checklist

**Out of scope (explicit non-goals):**
- P2 features (multiplayer, cloud sync, AI decomposition)
- Visual polish beyond functional requirements
- Performance optimization (code splitting can wait until post-pilot)
- Mobile-responsive refinements

---

## 4) Deliverables

1. **Code changes:**
   - `src/app/App.tsx` — siege auto-trigger on load
   - `src/shared/events/event-logger.ts` — IndexedDB persistence
   - `src/shared/events/event-logger.ts` — export JSON/CSV functions
   - `src/map/ProvinceDrawer.tsx` — applyAction wiring
   - `src/shared/hooks/useFeedbackConsumer.ts` — new hook for feedback consumption
   - `src/game/rules/season-service.ts` — new service for auto-start season
   - `src/pages/daily-orders/DailyOrdersPage.tsx` — check-in integration

2. **Tests:**
   - Integration tests for siege auto-trigger
   - Integration tests for event persistence
   - E2E smoke test for key flows

3. **Documentation:**
   - Updated `epics/IMPLEMENTATION-READINESS.md` with completion checklist
   - Manual E2E test script in `docs/E2E-CHECKLIST.md`

---

## 5) Dependencies

**Technical:**
- EPIC-03 (domain models + persistence) — ✅ complete
- EPIC-06 (rule engine) — ✅ complete
- EPIC-07 (siege tactics) — ✅ domain logic complete

**Product/design:**
- Copy for feedback messages — ✅ complete (`src/shared/copy/feedback.ts`)
- Season hints — ✅ complete (`src/shared/copy/season-hints.ts`)

**Data/tools:**
- IndexedDB via localForage — ✅ available in `src/storage/storage.ts`

---

## 6) Work breakdown (junior-friendly tasks)

### P0 — CRITICAL (Complete before pilot)

---

### T0.1. Implement siege auto-trigger on app load
**Track:** `BE`
**Estimate:** `M` (2-4h)

**Description:** Call `checkSiegeTrigger` for all provinces at app startup and persist siege events.

**Steps:**
1. Create `src/game/services/siege-service.ts`:
   ```typescript
   export async function checkAndCreateSieges(now: Date = new Date()): Promise<number> {
       const provinces = await provinceRepository.list();
       let siegeCount = 0;
       
       for (const province of provinces) {
           const result = checkSiegeTrigger(province, now);
           if (result.triggered && result.province && result.sideEffect) {
               // Update province state
               await provinceRepository.update(province.id, result.province);
               
               // Create siege event
               if (result.sideEffect.type === 'create_siege_event') {
                   await siegeEventRepository.create({
                       provinceId: result.sideEffect.provinceId,
                       reasonType: result.sideEffect.reasonType
                   });
                   siegeCount++;
               }
           }
       }
       
       return siegeCount;
   }
   ```
2. Call in `src/app/App.tsx` inside `useEffect` on mount (after onboarding check)
3. Add error handling (log errors, don't block app load)
4. Add unit test in `src/game/services/siege-service.test.ts`

**Acceptance criteria:**
- Provinces with `lastMeaningfulActionAt` > 3 days ago enter siege state on app load
- SiegeEvent is created and persisted
- Province drawer shows "Break Siege" button

**DoD:**
- Service exists and is called on app load
- Unit test covers N=3 logic end-to-end
- Manual test: set `lastMeaningfulActionAt` to 4 days ago, reload app, verify siege appears

**How to verify:**
```bash
npm test -- siege-service.test.ts
# Manual: modify province in dev tools, reload, check siege appears
```

**Risks/notes:**
- Ensure idempotency (don't create duplicate siege events)
- Check `province.state !== 'siege'` before triggering

---

### T0.2. Implement event logger with IndexedDB persistence
**Track:** `BE`
**Estimate:** `M` (2-4h)

**Description:** Replace in-memory event array with IndexedDB storage.

**Steps:**
1. Update `src/shared/events/event-logger.ts`:
   ```typescript
   import { localForage } from '../../storage/storage';
   
   const EVENT_STORE_KEY = 'game_events';
   const MAX_EVENTS = 1000;
   
   export async function track(event: GameEvent): Promise<void> {
       const events = await getEvents();
       const envelope: EventEnvelope = {
           eventName: event.name,
           eventVersion: 1,
           occurredAt: new Date().toISOString(),
           timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
           sessionId: getSessionId(),
           payload: event.payload
       };
       
       events.push(envelope);
       
       // Rotate old events
       if (events.length > MAX_EVENTS) {
           events.splice(0, events.length - MAX_EVENTS);
       }
       
       await localForage.setItem(EVENT_STORE_KEY, events);
   }
   
   export async function getEvents(limit?: number): Promise<EventEnvelope[]> {
       const events = await localForage.getItem<EventEnvelope[]>(EVENT_STORE_KEY) || [];
       if (limit) {
           return events.slice(-limit);
       }
       return events;
   }
   ```
2. Add `getSessionId()` utility (generate once per session, store in localStorage)
3. Update all `track()` calls to await (or use void for fire-and-forget)
4. Add unit tests in `src/shared/events/event-logger.test.ts`

**Acceptance criteria:**
- Events persist across page refresh
- Events are limited to last 1000 (older rotated out)
- Logging is non-blocking (no UI freeze)

**DoD:**
- IndexedDB storage works
- Events survive refresh
- Unit tests exist

**How to verify:**
```bash
npm test -- event-logger.test.ts
# Manual: trigger 5 events, reload, verify they appear in dev viewer
```

**Risks/notes:**
- Use `void track(...)` for fire-and-forget to avoid blocking UI
- Handle IndexedDB errors gracefully (log to console, don't crash)

---

### T0.3. Implement event export (JSON/CSV)
**Track:** `BE`
**Estimate:** `S` (1-2h)

**Description:** Add export functions for events.

**Steps:**
1. Add to `src/shared/events/event-logger.ts`:
   ```typescript
   export async function exportEventsJSON(): Promise<string> {
       const events = await getEvents();
       return JSON.stringify({
           schemaVersion: 1,
           exportedAt: new Date().toISOString(),
           events
       }, null, 2);
   }
   
   export async function exportEventsCSV(): Promise<string> {
       const events = await getEvents();
       const headers = ['eventName', 'occurredAt', 'timezone', 'sessionId', 'payload'];
       const rows = events.map(e => [
           e.eventName,
           e.occurredAt,
           e.timezone,
           e.sessionId,
           JSON.stringify(e.payload).replace(/"/g, '""')
       ]);
       
       return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
   }
   
   export function downloadFile(content: string, filename: string, mimeType: string): void {
       const blob = new Blob([content], { type: mimeType });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = filename;
       a.click();
       URL.revokeObjectURL(url);
   }
   ```
2. Add unit tests

**Acceptance criteria:**
- JSON export includes schema version and timestamp
- CSV export is parseable
- Download triggers browser download dialog

**DoD:**
- Functions exist and are tested
- Manual export works

**How to verify:**
```bash
npm test -- event-logger.test.ts
# Manual: call exportEventsJSON(), verify file downloads
```

**Risks/notes:**
- CSV payload field needs proper escaping (quotes, commas)

---

### T0.4. Wire ProvinceDrawer to applyAction
**Track:** `FE`
**Estimate:** `M` (2-4h)

**Description:** Replace mock buttons with real domain actions.

**Steps:**
1. Update `src/map/ProvinceDrawer.tsx`:
   ```typescript
   import { useApplyAction } from '../../shared/hooks/useApplyAction';
   import { useNavigate } from 'react-router-dom';
   
   export function ProvinceDrawer({ province, onClose }: ProvinceDrawerProps) {
       const navigate = useNavigate();
       const { execute } = useApplyAction();
       
       const handleScout = async () => {
           if (!province) return;
           
           if (province.state === 'fog') {
               // Navigate to clarify form
               navigate(`/province/${province.id}/clarify`);
           } else {
               // For non-fog, show progress logging
               await execute(province, {
                   type: 'log_move',
                   payload: {
                       durationMinutes: 15,
                       moveType: 'scout'
                   }
               });
           }
       };
       
       // ... rest of component
   }
   ```
2. Add "Clarify" action button for fog provinces
3. Add "Log Progress" button for in_progress provinces
4. Add error handling (show toast on failure)
5. Add feedback consumption (show hero moment if triggered)

**Acceptance criteria:**
- Clicking "Scout" on fog province navigates to clarify form
- Clicking "Scout" on ready province logs a move
- Province state updates after action
- Feedback signals are consumed

**DoD:**
- Buttons call applyAction
- State updates persist
- Manual test: clarify fog province from drawer

**How to verify:**
```bash
npm run dev
# Open province drawer, click Scout, verify action applies
```

**Risks/notes:**
- Need clarify form page (create if missing)
- Ensure loading state during async action

---

### T0.5. Implement feedback consumer hook
**Track:** `FE`
**Estimate:** `M` (2-4h)

**Description:** Create hook that consumes feedback signals and triggers UI effects.

**Steps:**
1. Create `src/shared/hooks/useFeedbackConsumer.ts`:
   ```typescript
   import { useState, useCallback } from 'react';
   import { FeedbackSignal } from '../game/rules/feedback';
   import { track } from '../events/event-logger';
   
   export function useFeedbackConsumer() {
       const [pendingSignals, setPendingSignals] = useState<FeedbackSignal[]>([]);
       
       const consumeSignals = useCallback((signals: FeedbackSignal[]) => {
           setPendingSignals(signals);
           
           // Auto-dismiss after 5 seconds
           setTimeout(() => {
               setPendingSignals([]);
           }, 5000);
           
           // Log feedback seen event
           signals.forEach(signal => {
               void track({
                   name: 'feedback_seen',
                   payload: {
                       type: signal.type,
                       trigger: signal.trigger
                   }
               });
           });
       }, []);
       
       const clearSignals = useCallback(() => {
           setPendingSignals([]);
       }, []);
       
       return { pendingSignals, consumeSignals, clearSignals };
   }
   ```
2. Integrate with `useApplyAction` hook to consume returned signals
3. Wire to `HeroMomentOverlay` component
4. Add unit tests

**Acceptance criteria:**
- Feedback signals from applyAction are captured
- Hero moment overlay shows for milestone signals
- Signals auto-dismiss after 5 seconds
- Events are logged

**DoD:**
- Hook exists and is integrated
- Hero moments trigger correctly
- Manual test: complete province, verify hero moment appears

**How to verify:**
```bash
npm run dev
# Complete a province, verify hero moment overlay appears
```

**Risks/notes:**
- Respect `prefers-reduced-motion` for animations
- Cap hero moments (max 1 per session)

---

### P1 — IMPORTANT (Complete for pilot readiness)

---

### T1.1. Implement auto-start season on day 21
**Track:** `BE`
**Estimate:** `L` (4-6h)

**Description:** Automatically create new season when current season reaches day 21.

**Steps:**
1. Create `src/game/services/season-service.ts`:
   ```typescript
   export async function checkAndStartNewSeason(): Promise<Season | null> {
       const seasons = await seasonRepository.list();
       const currentSeason = seasons[seasons.length - 1];
       
       if (!currentSeason) return null;
       
       const dayNumber = getSeasonDayNumber(currentSeason);
       
       if (dayNumber >= 21) {
           // Create new season
           const newSeason: Omit<Season, 'id' | 'createdAt' | 'updatedAt'> = {
               title: `Season ${seasons.length + 1}`,
               startedAt: new Date().toISOString(),
               endsAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
               dayNumber: 1,
               timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
           };
           
           const created = await seasonRepository.create(newSeason);
           
           // Update player profile
           await playerProfileRepository.update({
               currentSeasonId: created.id
           });
           
           // Migrate active provinces (in_progress → ready)
           const provinces = await provinceRepository.list();
           for (const province of provinces) {
               if (province.state === 'in_progress') {
                   await provinceRepository.update(province.id, {
                       ...province,
                       state: 'ready',
                       updatedAt: new Date().toISOString()
                   });
               }
           }
           
           return created;
       }
       
       return null;
   }
   ```
2. Call in `src/app/App.tsx` on mount (after siege check)
3. Add unit tests in `src/game/services/season-service.test.ts`

**Acceptance criteria:**
- New season created when dayNumber >= 21
- PlayerProfile.currentSeasonId updated
- Active provinces transition to ready
- No data loss during transition

**DoD:**
- Service exists and is called on app load
- Unit tests cover season transition
- Manual test: set season.startedAt to 20 days ago, reload, verify new season created

**How to verify:**
```bash
npm test -- season-service.test.ts
# Manual: modify season date in dev tools, reload, check new season
```

**Risks/notes:**
- Ensure idempotency (check if already migrated)
- Preserve all historical data (don't delete old season)

---

### T1.2. Integrate CommanderCheckIn with DailyOrders
**Track:** `FE`
**Estimate:** `M` (2-4h)

**Description:** Require check-in before showing daily orders (or use defaults if skipped).

**Steps:**
1. Update `src/pages/daily-orders/DailyOrdersPage.tsx`:
   ```typescript
   const [checkIn, setCheckIn] = useState<PlayerCheckIn | null>(null);
   const [showCheckIn, setShowCheckIn] = useState(false);
   
   useEffect(() => {
       async function loadCheckIn() {
           const today = new Date().toISOString().split('T')[0];
           const checkIns = await playerCheckInRepository.listByDate(today);
           
           if (checkIns.length === 0) {
               setShowCheckIn(true);
           } else {
               setCheckIn(checkIns[checkIns.length - 1]);
           }
       }
       loadCheckIn();
   }, []);
   
   const handleCheckInComplete = async (checkInData: PlayerCheckIn) => {
       const created = await playerCheckInRepository.create(checkInData);
       setCheckIn(created);
       setShowCheckIn(false);
   };
   
   if (showCheckIn) {
       return <CommanderCheckIn onComplete={handleCheckInComplete} />;
   }
   ```
2. Pass checkIn to `getDailyOrders()` call
3. Add "Skip" option with default values

**Acceptance criteria:**
- Check-in modal shows if no check-in today
- Daily orders use check-in data for recommendations
- Skip option provides default recommendations

**DoD:**
- Check-in flow works end-to-end
- Manual test: complete check-in, verify orders update

**How to verify:**
```bash
npm run dev
# Navigate to /daily-orders without check-in, verify modal appears
```

**Risks/notes:**
- Don't block users who skip check-in
- Provide sensible defaults

---

### T1.3. Wire hero moments to feedback signals
**Track:** `FE`
**Estimate:** `S` (1-2h)

**Description:** Trigger HeroMomentOverlay when feedback signal type is 'milestone'.

**Steps:**
1. Update `useFeedbackConsumer` hook:
   ```typescript
   const consumeSignals = useCallback((signals: FeedbackSignal[]) => {
       const milestoneSignals = signals.filter(s => s.type === 'milestone');
       
       milestoneSignals.forEach(signal => {
           // Check if already shown hero moment this session
           const lastHeroMoment = sessionStorage.getItem('lastHeroMoment');
           const now = Date.now();
           
           if (!lastHeroMoment || (now - parseInt(lastHeroMoment)) > 60 * 60 * 1000) {
               setPendingSignals([...pendingSignals, signal]);
               sessionStorage.setItem('lastHeroMoment', now.toString());
               
               // Log hero moment event
               void track({
                   name: 'hero_moment_triggered',
                   payload: {
                       type: signal.trigger
                   }
               });
           }
       });
   }, [pendingSignals]);
   ```
2. Ensure `HeroMomentOverlay` component renders from `pendingSignals`
3. Add accessibility check (respect reduced motion)

**Acceptance criteria:**
- Hero moment shows for milestone feedback
- Max 1 hero moment per hour (session cap)
- Reduced motion preference respected

**DoD:**
- Hero moments trigger correctly
- Manual test: complete province, verify overlay appears once

**How to verify:**
```bash
npm run dev
# Complete province, verify hero moment appears
# Complete another immediately, verify it doesn't appear again
```

**Risks/notes:**
- Session cap prevents spam
- Respect accessibility settings

---

### T1.4. Add event export to Settings UI
**Track:** `FE`
**Estimate:** `S` (1-2h)

**Description:** Add buttons to Settings page for exporting events.

**Steps:**
1. Update `src/pages/SettingsPage.tsx`:
   ```typescript
   import { exportEventsJSON, exportEventsCSV, downloadFile } from '../events/event-logger';
   
   const handleExportJSON = async () => {
       const content = await exportEventsJSON();
       downloadFile(content, `tasker-events-${Date.now()}.json`, 'application/json');
   };
   
   const handleExportCSV = async () => {
       const content = await exportEventsCSV();
       downloadFile(content, `tasker-events-${Date.now()}.csv`, 'text/csv');
   };
   
   // In render:
   <Panel title="Event Export">
       <p className="text-sm text-muted-foreground mb-4">
           Export your activity data for analysis.
       </p>
       <div className="flex gap-3">
           <Button onClick={handleExportJSON} variant="outline">
               Export JSON
           </Button>
           <Button onClick={handleExportCSV} variant="outline">
               Export CSV
           </Button>
       </div>
   </Panel>
   ```
2. Add visual confirmation toast after export
3. Add error handling

**Acceptance criteria:**
- Buttons trigger file download
- Files are parseable
- User sees confirmation

**DoD:**
- Export works from Settings UI
- Manual test: export, verify file downloads and parses

**How to verify:**
```bash
npm run dev
# Navigate to /settings, click Export JSON, verify download
```

**Risks/notes:**
- Handle case when no events exist (show message)

---

### T1.5. Create integration tests for key flows
**Track:** `SHARED`
**Estimate:** `L` (4-6h)

**Description:** Add integration tests for siege, events, and feedback flows.

**Steps:**
1. Create `tests/integration/siege-integration.test.ts`:
   ```typescript
   describe('Siege Integration', () => {
       it('should auto-create siege event on app load for stalled provinces', async () => {
           // Setup: create province with lastMeaningfulActionAt 4 days ago
           // Action: call checkAndCreateSieges()
           // Assert: province state is 'siege', siege event exists
       });
   });
   ```
2. Create `tests/integration/event-logger-integration.test.ts`:
   ```typescript
   describe('Event Logger Integration', () => {
       it('should persist events across page reload', async () => {
           // Action: track event
           // Reload: simulate page reload
           // Assert: event still exists
       });
   });
   ```
3. Create `tests/integration/feedback-integration.test.ts`:
   ```typescript
   describe('Feedback Integration', () => {
       it('should trigger hero moment on province completion', async () => {
           // Setup: create province
           // Action: applyAction with 'complete'
           // Assert: feedback signal returned, hero moment triggered
       });
   });
   ```

**Acceptance criteria:**
- Tests cover P0 integration points
- Tests pass consistently (no flakiness)
- Tests run in < 30 seconds total

**DoD:**
- Integration tests exist and pass
- Tests run in CI

**How to verify:**
```bash
npm test -- tests/integration/
```

**Risks/notes:**
- Mock IndexedDB for tests (use localForage memory driver)
- Clean up test data after each test

---

### T1.6. Update IMPLEMENTATION-READINESS.md
**Track:** `SHARED`
**Estimate:** `S` (1-2h)

**Description:** Mark completed tasks and add pilot readiness checklist.

**Steps:**
1. Update `epics/IMPLEMENTATION-READINESS.md`:
   - Mark EPIC-06, EPIC-07, EPIC-08, EPIC-10, EPIC-11, EPIC-12 as complete/in-progress
   - Add Week 2 Integration completion status
2. Add pilot readiness checklist:
   ```markdown
   ## Pilot Readiness Checklist
   
   - [ ] Siege auto-trigger works
   - [ ] Events persist and export
   - [ ] ProvinceDrawer wired to applyAction
   - [ ] Hero moments trigger correctly
   - [ ] Season auto-starts on day 21
   - [ ] Check-in integrated with Daily Orders
   - [ ] All integration tests pass
   - [ ] Manual E2E checklist passes
   ```

**Acceptance criteria:**
- Document reflects current state
- Pilot checklist is actionable

**DoD:**
- Document updated
- Checklist reviewed

**How to verify:**
```bash
# Review document
```

**Risks/notes:**
- Keep checklist short and testable

---

### T1.7. Create manual E2E checklist
**Track:** `SHARED`
**Estimate:** `S` (1-2h)

**Description:** Document manual testing steps for key scenarios.

**Steps:**
1. Create `docs/E2E-CHECKLIST.md`:
   ```markdown
   # Manual E2E Test Checklist
   
   ## Scenario 1: Create and clarify province
   1. Navigate to /map
   2. Create new province in fog state
   3. Open province drawer
   4. Click "Scout" → navigate to clarify form
   5. Fill outcome/first step/entry time
   6. Submit → verify province state is 'ready'
   7. Verify progress stage is 'scouted'
   
   ## Scenario 2: Trigger and resolve siege
   1. Modify province.lastMeaningfulActionAt to 4 days ago (dev tools)
   2. Reload app
   3. Verify siege auto-triggered (province state = 'siege')
   4. Open province drawer → click "Break Siege"
   5. Select "Scout" tactic
   6. Fill clarify form
   7. Submit → verify siege resolved, province state = 'ready'
   8. Verify hero moment appeared (if eligible)
   
   ## Scenario 3: Complete province
   1. Start province (apply 'start_move' action)
   2. Log progress (apply 'log_move' action)
   3. Complete province (apply 'complete' action)
   4. Verify province state = 'captured'
   5. Verify progress stage = 'captured'
   6. Verify hero moment appeared
   7. Verify chronicle entry created
   
   ## Scenario 4: Daily Orders flow
   1. Navigate to /daily-orders
   2. Complete check-in (or skip)
   3. Verify 3 orders appear (light/medium/main)
   4. Click "Do it" on one order
   5. Verify action applied
   6. Verify feedback shown
   
   ## Scenario 5: Season transition
   1. Modify season.startedAt to 20 days ago (dev tools)
   2. Reload app
   3. Verify new season created
   4. Verify active provinces transitioned to 'ready'
   5. Verify player profile updated
   ```

**Acceptance criteria:**
- Checklist covers all P0 scenarios
- Steps are clear and testable
- Expected results documented

**DoD:**
- Document created
- Checklist tested by someone other than author

**How to verify:**
```bash
# Follow checklist manually
```

**Risks/notes:**
- Keep steps atomic and verifiable
- Include dev tools instructions where needed

---

## 7) Testing and QA

**Unit tests:**
- Siege service: `npm test -- siege-service.test.ts`
- Event logger: `npm test -- event-logger.test.ts`
- Season service: `npm test -- season-service.test.ts`
- Feedback consumer: `npm test -- useFeedbackConsumer.test.ts`

**Integration tests:**
- Siege integration: `npm test -- tests/integration/siege-integration.test.ts`
- Event logger integration: `npm test -- tests/integration/event-logger-integration.test.ts`
- Feedback integration: `npm test -- tests/integration/feedback-integration.test.ts`

**E2E tests (Playwright):**
- Full flow: `npm run e2e`

**Manual checklist:**
- Follow `docs/E2E-CHECKLIST.md`

**Definition of Done (all tasks):**
- [ ] Unit tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Integration tests pass
- [ ] Manual E2E checklist passes
- [ ] Code reviewed (if applicable)

---

## 8) Metrics / Events (if applicable)

**Events added:**
- `feedback_seen` — when feedback signals consumed
- `hero_moment_triggered` — when hero moment overlay shown
- `siege_auto_triggered` — when siege created on app load
- `season_auto_started` — when new season created on day 21

**Metrics to compute:**
- `siege_resolution_rate` — siege events resolved / total siege events
- `hero_moment_effectiveness` — provinces progressed within 24h of hero moment
- `check_in_completion_rate` — days with check-in / total active days
- `event_export_rate` — users who exported events / total users (post-pilot)

---

## 9) Risks and mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| IndexedDB errors in production | High | Graceful fallback to memory, log errors |
| Siege auto-trigger creates duplicates | Medium | Check existing siege state before creating |
| Hero moments spam users | Medium | Session cap (1 per hour) |
| Season transition loses data | High | Preserve all historical data, don't delete |
| Check-in blocks users | Medium | Allow skip with defaults |
| Event export performance | Low | Limit to last 1000 events |

---

## 10) Open questions

1. **Should siege auto-trigger run on every page load or once per session?**
   - Recommendation: Every load (idempotent, safe)

2. **Should event export include all events or filter by date range?**
   - Recommendation: All events (last 1000), date range filter is P2

3. **Should hero moment cap be per-session or per-hour?**
   - Recommendation: Per-hour (sessionStorage cleared on tab close)

4. **Should season transition prompt user or happen automatically?**
   - Recommendation: Automatic (user sees notification after)

---

## Appendix A — Task Priority Matrix

| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| T0.1 Siege auto-trigger | P0 | M | None |
| T0.2 Event logger persistence | P0 | M | None |
| T0.3 Event export | P0 | S | T0.2 |
| T0.4 ProvinceDrawer wiring | P0 | M | None |
| T0.5 Feedback consumer | P0 | M | None |
| T1.1 Auto-start season | P1 | L | None |
| T1.2 Check-in integration | P1 | M | None |
| T1.3 Hero moment wiring | P1 | S | T0.5 |
| T1.4 Settings export UI | P1 | S | T0.3 |
| T1.5 Integration tests | P1 | L | T0.1, T0.2, T0.5 |
| T1.6 IMPLEMENTATION-READINESS update | P1 | S | All |
| T1.7 E2E checklist | P1 | S | All |

**Total estimated effort:** ~30-40 hours (1 week for single developer)

**Recommended order:**
1. T0.1, T0.2, T0.3 (backend foundation)
2. T0.4, T0.5 (frontend integration)
3. T1.1, T1.2, T1.3 (pilot features)
4. T1.4, T1.5, T1.6, T1.7 (polish and tests)

---

## Appendix B — File Change Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/game/services/siege-service.ts` | New | Siege auto-trigger service |
| `src/game/services/season-service.ts` | New | Season auto-start service |
| `src/shared/events/event-logger.ts` | Modify | Add IndexedDB persistence + export |
| `src/shared/hooks/useFeedbackConsumer.ts` | New | Feedback consumption hook |
| `src/map/ProvinceDrawer.tsx` | Modify | Wire to applyAction |
| `src/pages/daily-orders/DailyOrdersPage.tsx` | Modify | Check-in integration |
| `src/pages/SettingsPage.tsx` | Modify | Add export buttons |
| `src/app/App.tsx` | Modify | Call siege/season services on mount |
| `epics/IMPLEMENTATION-READINESS.md` | Modify | Update completion status |
| `docs/E2E-CHECKLIST.md` | New | Manual testing checklist |

---

## Appendix C — Success Criteria

**Pilot-ready when:**
1. ✅ All P0 tasks complete and tested
2. ✅ All P1 tasks complete and tested
3. ✅ `make preflight` passes
4. ✅ Manual E2E checklist passes (5 scenarios)
5. ✅ No critical bugs in issue tracker
6. ✅ IMPLEMENTATION-READINESS.md shows all green

**Post-pilot (P2):**
- Code splitting for bundle size
- Mobile-responsive refinements
- Advanced analytics
- Share card generation
