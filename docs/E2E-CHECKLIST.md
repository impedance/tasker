# Manual E2E Test Checklist

**Version:** 1.0  
**Last Updated:** 2026-03-11  
**Purpose:** Manual testing of key user flows for Week 2 Integration

---

## Prerequisites

- [ ] Application running (`npm run dev`)
- [ ] Browser DevTools open (Console + Application/Storage tabs)
- [ ] No existing data (or use `Settings > Reset Application Data`)

---

## Scenario 1: Create and Clarify Province

**Goal:** Verify province creation and clarification flow

1. Navigate to `/map`
2. Click on empty map slot to create new province
3. Verify province created in `fog` state
4. Open province drawer (click on province)
5. Click **"Scout"** button
6. **Expected:** Navigate to clarify form `/province/:id/clarify`
7. Fill in form:
   - Outcome: "Completed"
   - First step: "Write documentation"
   - Entry type: "Solo"
8. Submit form
9. **Expected:** Province state changes to `ready`
10. **Expected:** Progress stage is `scouted`
11. **Expected:** Feedback overlay appears

**Pass Criteria:**
- [ ] Province transitions fog → ready
- [ ] Clarify form works
- [ ] Feedback shown

---

## Scenario 2: Trigger and Resolve Siege

**Goal:** Verify siege auto-trigger and resolution

1. Navigate to `/map`
2. Open DevTools Application tab → IndexedDB → tasker-store
3. Find a province and note its `id`
4. Modify province:
   - Set `state` to `"ready"`
   - Set `lastMeaningfulActionAt` to 4 days ago (ISO string)
5. Reload application
6. **Expected:** Console shows `[App] Created X siege event(s)`
7. Navigate to `/map`
8. Open province drawer for modified province
9. **Expected:** Siege warning banner visible
10. **Expected:** "Break Siege" button visible
11. Click **"Break Siege"**
12. **Expected:** Navigate to siege page `/province/:id/siege`
13. Select **"Scout"** tactic
14. Fill clarify form
15. Submit
16. **Expected:** Province state changes to `ready`
17. **Expected:** Siege event resolved (check IndexedDB)

**Pass Criteria:**
- [ ] Siege auto-triggers on app load
- [ ] Siege UI visible in drawer
- [ ] Siege resolution works
- [ ] Province returns to ready state

---

## Scenario 3: Complete Province (Hero Moment)

**Goal:** Verify province completion and hero moment trigger

1. Navigate to `/map`
2. Create/clarify a province to `ready` state
3. Click **"Start"** action (or use Daily Orders)
4. **Expected:** Province state changes to `in_progress`
5. Click **"Log Progress"** action
6. **Expected:** Province remains `in_progress`
7. Click **"Complete"** action
8. **Expected:** Province state changes to `captured`
9. **Expected:** Hero moment overlay appears (confetti/celebration)
10. **Expected:** Chronicle entry created
11. Navigate to `/chronicle`
12. **Expected:** New entry visible

**Pass Criteria:**
- [ ] Province completes successfully
- [ ] Hero moment triggers
- [ ] Chronicle entry created
- [ ] Hero moment cooldown works (complete another immediately - should not show again)

---

## Scenario 4: Daily Orders Flow

**Goal:** Verify check-in and daily orders

1. Clear all check-ins (DevTools → IndexedDB → delete `tasker:checkIn:*` keys)
2. Navigate to `/daily-orders`
3. **Expected:** Commander Check-in modal appears
4. Complete check-in:
   - Emotion: "Anxious"
   - Energy: "Medium"
   - Time: "15 min"
5. Click **"Receive Daily Orders"**
6. **Expected:** Check-in modal closes
7. **Expected:** Daily orders page loads with recommendations
8. **Expected:** 3 orders visible (light/medium/main)
9. Click **"Do it"** on one order
10. **Expected:** Action applied to province
11. **Expected:** Feedback shown
12. **Expected:** Orders refresh

**Test Skip Option:**
1. Clear check-ins again
2. Navigate to `/daily-orders`
3. Click **"Skip and go to orders"**
4. **Expected:** Orders load with default recommendations

**Pass Criteria:**
- [ ] Check-in modal shows when no check-in
- [ ] Check-in persists
- [ ] Orders use check-in data
- [ ] Skip option works

---

## Scenario 5: Season Transition

**Goal:** Verify season auto-start on day 21

1. Navigate to `/season`
2. Note current season ID (from URL or page)
3. Open DevTools → IndexedDB → tasker-store
4. Find season record
5. Modify `startedAt` to 21 days ago (ISO string)
6. Reload application
7. **Expected:** Console shows `[App] Started new season: Season X`
8. Navigate to `/season`
9. **Expected:** New season created (different ID)
10. **Expected:** Day number reset to 1
11. **Expected:** Season phase is "early"
12. Check provinces (DevTools → IndexedDB)
13. **Expected:** All `in_progress` provinces changed to `ready`

**Pass Criteria:**
- [ ] New season auto-created
- [ ] Player profile updated with new season ID
- [ ] Active provinces migrated to ready
- [ ] No data loss

---

## Scenario 6: Event Export

**Goal:** Verify event persistence and export

1. Perform several actions:
   - Create province
   - Clarify province
   - Start move
   - Complete province
2. Navigate to `/dev/events`
3. **Expected:** Events visible in viewer
4. Navigate to `/settings`
5. Click **"Export Events (JSON)"**
6. **Expected:** JSON file downloads
7. Open JSON file
8. **Expected:** Schema version present
9. **Expected:** Events array contains recent actions
10. Click **"Export Events (CSV)"**
11. **Expected:** CSV file downloads
12. Open CSV in spreadsheet app
13. **Expected:** Data parseable

**Pass Criteria:**
- [ ] Events persist across page reload
- [ ] JSON export works
- [ ] CSV export works
- [ ] Files are valid

---

## Scenario 7: ProvinceDrawer Actions

**Goal:** Verify drawer buttons wire to applyAction

1. Navigate to `/map`
2. Open province drawer for `fog` province
3. Click **"Scout"**
4. **Expected:** Navigate to clarify form
5. Open province drawer for `ready` province
6. Click **"Scout"**
7. **Expected:** Scout move logged (15 min)
8. **Expected:** Feedback shown
9. Click **"Details"**
10. **Expected:** Navigate to province details page

**Pass Criteria:**
- [ ] Scout button works for fog provinces
- [ ] Scout button logs move for ready provinces
- [ ] Details button navigates

---

## Summary

**Total Scenarios:** 7  
**Date Tested:** ___________  
**Tester:** ___________  

| Scenario | Pass | Fail | Notes |
|----------|------|------|-------|
| 1. Create & Clarify | ☐ | ☐ | |
| 2. Siege Trigger & Resolve | ☐ | ☐ | |
| 3. Complete Province | ☐ | ☐ | |
| 4. Daily Orders | ☐ | ☐ | |
| 5. Season Transition | ☐ | ☐ | |
| 6. Event Export | ☐ | ☐ | |
| 7. ProvinceDrawer Actions | ☐ | ☐ | |

**Issues Found:**
- [ ] None
- [ ] (List below)

---

## Troubleshooting

### Siege not triggering
- Check `lastMeaningfulActionAt` is > 3 days ago
- Check province state is `ready`, `in_progress`, or `fortified`
- Check console for errors

### Hero moment not showing
- Check if hero moment shown in last hour (sessionStorage)
- Clear `lastHeroMoment` from sessionStorage to test again

### Events not persisting
- Check IndexedDB in DevTools
- Verify `game_event:*` keys exist

### Season not transitioning
- Check `startedAt` is exactly 21 days ago
- Check console for season creation message
