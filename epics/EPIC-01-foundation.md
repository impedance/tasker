# EPIC-01 — Product foundation (PRD → backlog contract)

**ID:** `EPIC-01`  
**Priority:** `P0`  
**Status:** `done`  
**Owner:** `<TBD>`  
**PRD reference:** `prd.md`

## 1) Objective (Outcome)
Make the product rules and definitions unambiguous so the team can implement the MVP without guessing, and QA can accept work against testable criteria.

## 2) Context
- `prd.md` defines MVP rules and terms, but some need to be turned into an explicit contract (what counts as movement, day boundaries, what is “meaningful”).
- Without this, implementation will diverge (rule engine, siege, scoring, metrics).

## 3) Scope
**In scope:**
- glossary of entities/terms;
- province state machine (transition table + actions/events);
- definitions: meaningful move, `updatedAt`, “movement”, “decomposition”, “first step”;
- minimal metrics/events contract (what we log);
- healthy-engagement guardrails and privacy-safe sharing rules.

**Out of scope:**
- high-fidelity UI design (separate workstream);
- final copywriting (drafts are OK).

## 4) Deliverables
- Province state machine: states, transitions, conditions, side effects.
- Glossary of entities and minimum required fields.
- Time contract: timezone, day boundary, season day number rules.
- Minimal event schema (feeds EPIC-12) documented in Appendix B.
- Guardrail contract: what must never be rewarded or gamified, documented in Appendix A.

## 5) Dependencies
- Product decisions on PRD open questions (dark mode, demo project, template decomposition, etc.).
- Technical decision: date/time handling (local user time).

## 6) Work breakdown (junior-friendly tasks)

### T1. Glossary of terms and entities
**Description:** extract terms and write strict definitions (Campaign/Region/Province, fog/siege, commander check-in, daily move, war council, integration review, progressStage).  
**Steps:**
1) Extract terms from `prd.md`.
2) For each term: 1–2 sentence definition + examples (1 valid, 1 not-valid).
3) Define minimum required fields per entity (what is needed for MVP).
**Acceptance criteria:**
- Definitions do not contradict each other.
- Each definition is verifiable in the product.
**DoD (done when):**
- Glossary is added as an appendix in this file or a separate md linked from here.
**Estimate:** `M`

### T2. Province state machine (transition table)
**Description:** produce a table “from → action/event → to” + conditions + side effects (fields, points, events).  
**Steps:**
1) Start from PRD states: fog/ready/siege/in_progress/fortified/captured/retreated.
2) Define domain actions: clarify, decompose, start_move, log_move, apply_tactic, complete, retreat, reschedule.
3) For each action: what fields change and which event is logged.
**Acceptance criteria:**
- Each transition has a condition and an explicit effect.
- No “magic” transitions without an action/event.
**DoD:**
- Transition table is written and reviewed.
**Estimate:** `L`

### T3. Define “meaningful move” and “task update”
**Description:** formalize what increases progress/points, and how timestamps are updated (`updatedAt` vs `lastMeaningfulActionAt`).  
**Steps:**
1) List actions that are meaningful.
2) List actions that must NOT be meaningful (e.g., “just opened a screen”).
3) Define timestamp rules:
   - `updatedAt` updates on any persisted mutation;
   - `lastMeaningfulActionAt` updates only on meaningful actions.
**Acceptance criteria:**
- Unit tests can be written from this definition.
**DoD:**
- Definition is written with 3–5 example cases.
**Estimate:** `S`

### T4. Time contract: day boundary and season
**Description:** define how “day” and season day number are computed.  
**Steps:**
1) Decide timezone (user local timezone).
2) Decide day boundary (e.g., 00:00 or 04:00 local time) and document it.
3) Define behavior for DST/timezone changes (MVP minimum: how we interpret them).
**Acceptance criteria:**
- Daily Orders screen is stable across refreshes.
**DoD:**
- Time rules are documented with 2–3 edge cases.
**Estimate:** `M`

### T5. Minimal event schema contract (feeds EPIC-12)
**Description:** lock the event list and required fields to avoid debates during implementation.  
**Steps:**
1) P0 events: create/clarify/start/move/siege/tactic/complete/checkin/day_open/season_end/season_review/import/export.
2) For each: required fields (entityId, timestamp, payload).
3) Define `eventVersion`.
**Acceptance criteria:**
- Sufficient to compute PRD MVP metrics.
**DoD:**
- Event schema is documented in this file (Appendix B) and referenced from `epics/EPIC-12-instrumentation.md`.
**Estimate:** `M`

### T6. Healthy-engagement guardrails
**Description:** document the explicit product guardrails that prevent guilt loops, empty rewards, and unsafe sharing.  
**Steps:**
1) List prohibited reward patterns (app-open rewards, passive streak farming, random loot).
2) Define privacy defaults for exported/shareable artifacts.
3) Define warning metrics for long no-progress sessions and reward-without-action situations.
4) Lock ritual time budgets and a prompt budget (hero moments / share prompts).
5) Add the 10/90 heuristic as a non-toxic anti-overplanning rule.
**Acceptance criteria:**
- Guardrails can be used as acceptance criteria in EPIC-11 and EPIC-12.
**DoD:**
- Guardrails are documented in this file (Appendix A).
**Estimate:** `M`

## 8) Metrics / Events (contract)
- Event schema: this file (Appendix B).
- Engagement/recovery guardrails: this file (Appendix A).

## 7) Testing and QA
- Manual checklist: run the 5 key PRD scenarios and validate against the definitions above.

## 9) Risks and mitigations
- Day boundary/timezone debate can block daily loop → decide early.
- “Meaningful” can become fuzzy → enforce via testable rules.

## 10) Open questions
- Day boundary is fixed to 04:00 local time (see Appendix E).
- Use a single domain action name `decompose` (UI may call it "split"); avoid duplicating actions for the same intent.

---

# Appendix Z — Glossary of terms and entities (T1 deliverable)

## Z1) Core entities

### Campaign
**Definition:** A top-level project or initiative that the user wants to track. In the fantasy layer, a "campaign" is a shogunate/clan's overall war effort.
- **Required fields:** `id`, `title`, `createdAt`, `seasonId`, `status`
- **Optional fields:** `description`, `colorTheme`, `regionIds[]`, `archetype`, `factionId`, `factionName`, `bannerStyle`, `seasonFantasyName`, `chronicleEnabled`, `capitalProvinceId`
- **Example (valid):** `{ id: "camp-1", title: "Q1 Product Launch", seasonId: "season-1", status: "active" }`
- **Example (invalid):** `{ title: "My Project" }` — missing `id`, `seasonId`, `status`

### Region
**Definition:** A phase, milestone, or large component within a campaign. In the fantasy layer, a "region" is a territory on the campaign map.
- **Required fields:** `id`, `campaignId`, `title`, `order`, `provinceIds[]`, `progressPercent`, `status`
- **Optional fields:** `description`, `mapTemplateId`, `mapRole`, `pressureLevel`, `adjacentRegionIds[]`
- **Example (valid):** `{ id: "reg-1", campaignId: "camp-1", title: "Development Phase", order: 1, provinceIds: ["prov-1", "prov-2"], progressPercent: 45, status: "in_progress" }`
- **Example (invalid):** `{ id: "reg-1", title: "Phase 1" }` — missing `campaignId`, `provinceIds[]`, `progressPercent`, `status`

### Province
**Definition:** A single task or subtask within a region. In the fantasy layer, a "province" is a territory to be captured through real work.
- **Required fields:** `id`, `regionId`, `title`, `state`, `progressStage`, `updatedAt`, `createdAt`
- **Required to exit `fog` state:** `desiredOutcome`, `firstStep`, `estimatedEntryMinutes`
- **Optional fields:** `description`, `mapSlotId`, `dueDate`, `effortLevel`, `clarityLevel`, `emotionalFrictionType`, `provinceRole`, `decompositionCount`, `contextLinks[]`, `contextNotes`, `adjacentProvinceIds[]`, `frontPressureLevel`, `lastMeaningfulActionAt`, `heroMomentShownAt`, `isHotspot`
- **Example (valid, fog):** `{ id: "prov-1", regionId: "reg-1", title: "Write API docs", state: "fog", progressStage: "scouted" }`
- **Example (valid, ready):** `{ id: "prov-1", regionId: "reg-1", title: "Write API docs", desiredOutcome: "Published docs", firstStep: "Open docs folder", estimatedEntryMinutes: 10, state: "ready", progressStage: "scouted" }`
- **Example (invalid):** `{ id: "prov-1", title: "Docs" }` — missing `regionId`, `state`, `progressStage`

### DailyMove
**Definition:** A logged action representing a real step taken on a province during a specific day.
- **Required fields:** `id`, `date`, `provinceId`, `moveType`, `durationMinutes`, `result`
- **Example (valid):** `{ id: "move-1", date: "2026-03-08", provinceId: "prov-1", moveType: "raid", durationMinutes: 5, result: "started" }`

### PlayerCheckIn
**Definition:** A brief daily ritual capturing the user's emotional state and available time before receiving recommendations.
- **Required fields:** `id`, `date`, `energyLevel`, `availableMinutes`, `emotionType`
- **Optional fields:** `recommendedMoveIds[]`, `selectedMoveId`
- **Example (valid):** `{ id: "check-1", date: "2026-03-08", energyLevel: "medium", availableMinutes: 15, emotionType: "ambiguity" }`

### SiegeEvent
**Definition:** A record of when a province entered siege (stalled) and how it was resolved.
- **Required fields:** `id`, `provinceId`, `triggeredAt`, `reasonType`
- **Optional fields:** `selectedTactic`, `resolvedAt`
- **Example (valid):** `{ id: "siege-1", provinceId: "prov-1", triggeredAt: "2026-03-07T10:00:00", reasonType: "no_meaningful_action_3_days", selectedTactic: "scout", resolvedAt: "2026-03-08T09:00:00" }`

### Season
**Definition:** A 21-day cycle during which the user works on their campaigns. Seasons provide rhythm and reflection points.
- **Required fields:** `id`, `title`, `startedAt`, `endsAt`, `dayNumber`
- **Optional fields:** `goals`, `score`, `timezone`
- **Example (valid):** `{ id: "season-1", title: "Spring 2026", startedAt: "2026-03-01", endsAt: "2026-03-21", dayNumber: 8 }`

### SeasonReview
**Definition:** A structured reflection completed at the end of a season.
- **Required fields:** `id`, `seasonId`
- **Optional fields:** `workedWell[]`, `mainObstacles[]`, `carryForward[]`, `dropList[]`
- **Example (valid):** `{ id: "review-1", seasonId: "season-1", workedWell: ["Daily Orders"], mainObstacles: ["Unclear outcomes"], carryForward: ["5-minute raids"], dropList: ["Over-planning"] }`

### HeroMoment
**Definition:** A celebratory feedback event triggered after meaningful milestones.
- **Required fields:** `id`, `type`, `seasonId`, `triggeredAt`
- **Optional fields:** `provinceId`, `shownAt`, `shareCardId`
- **Example (valid):** `{ id: "hero-1", type: "first_fog_cleared", seasonId: "season-1", triggeredAt: "2026-03-08T10:00:00", provinceId: "prov-1" }`

### ChronicleEntry
**Definition:** A human-readable entry in the campaign's history, written after meaningful actions.
- **Required fields:** `id`, `campaignId`, `entryType`, `title`, `createdAt`
- **Optional fields:** `seasonId`, `regionId`, `provinceId`, `body`, `importance`
- **Example (valid):** `{ id: "chron-1", campaignId: "camp-1", entryType: "fog_cleared", title: "Fog Lifted from API Docs", createdAt: "2026-03-08T10:00:00" }`

### IfThenPlan
**Definition:** An implementation intention linking a trigger to an action, created during War Council.
- **Required fields:** `id`, `provinceId`, `triggerText`, `actionText`
- **Optional fields:** `scheduledFor`
- **Example (valid):** `{ id: "plan-1", provinceId: "prov-1", triggerText: "After morning coffee", actionText: "Write one paragraph of docs" }`

### ShareCard
**Definition:** A privacy-safe exportable artifact showing progress or achievements.
- **Required fields:** `id`, `type`, `generatedAt`, `privacyMode`, `payload`
- **Optional fields:** `seasonId`, `sourceSurface`
- **Example (valid):** `{ id: "card-1", type: "weekly_map", generatedAt: "2026-03-08T12:00:00", privacyMode: "public_safe", payload: { progressPercent: 45, capturedCount: 3 } }`

## Z2) Province states

| State | Definition | Entry condition | Exit condition |
|---|---|---|---|
| `fog` | Unclear task; missing clarity fields | Created without `desiredOutcome`/`firstStep`/`estimatedEntryMinutes` | User provides required clarity fields (`clarify` action) |
| `ready` | Clear and available for action | `clarify` action completed | User starts work, retreats, or siege triggers |
| `siege` | Stalled for N days (MVP: 3) without meaningful action | `system_siege_trigger` based on `lastMeaningfulActionAt` | User applies a tactic (`apply_tactic`) |
| `in_progress` | Work has started | `start_move` action (first real step) | User completes or retreats |
| `fortified` | Too large/heavy; high effort with no decomposition | `system_fortify_trigger`: `effortLevel >= 4` AND `decompositionCount == 0` | User decomposes or supplies |
| `captured` | Completed | `complete` action | None (terminal in MVP) |
| `retreated` | Consciously deferred or removed | `retreat` action | None (terminal in MVP) |

## Z3) Progress stages

| Stage | Definition | Percent (suggested) |
|---|---|---|
| `scouted` | Fog cleared; clarity achieved | 15% |
| `prepared` | Friction reduced; decomposition or supply applied | 30% |
| `entered` | First real step recorded | 55% |
| `held` | Sustained progress; multiple moves logged | 80% |
| `captured` | Completed | 100% |

## Z4) Key terms

### Meaningful Action
**Definition:** A user action that represents real progress, clarification, recovery, or action-prep that materially reduces friction. It can unlock feedback/hero moments and counts toward "meaningful days".
- **Examples (valid):** `clarify`, `start_move`, `log_move`, `complete`, `retreat`, `apply_tactic`, `decompose`, `supply`
- **Examples (invalid):** opening the app, browsing maps, renaming provinces, changing themes

### Movement
**Definition:** For MVP, synonymous with "meaningful action" — any action that updates `lastMeaningfulActionAt`.

### Fog of War
**Definition:** The state of a province that lacks required clarity fields. Visually represented as obscured/hidden on the map.

### Siege
**Definition:** A game situation triggered when a province has no meaningful action for N days (MVP: 3). Requires a tactic to resolve.

### Tactics
**Definition:** Five methods to resolve siege:
1. **Scout:** Clarify what to do (rewrite outcome/next step)
2. **Supply:** Prepare environment (links/files/context)
3. **Engineer:** Split into 3-5 parts/micro-steps
4. **5-minute Raid:** Smallest entry step with strict time cap
5. **Retreat:** Change expectations, reschedule, or remove

### Commander Check-in
**Definition:** A 3-5 second daily ritual capturing emotion, energy, and available time before receiving recommendations.

### Daily Orders
**Definition:** Three recommended moves per day (light ~5min, medium ~15min, main ~25+min).

### War Council
**Definition:** An evening ritual where the user writes 1-3 if-then plans for the next day.

### Season Debrief
**Definition:** A 1-2 minute end-of-season reflection covering what worked, obstacles, and what to carry forward/drop.

### 10/90 Heuristic
**Definition:** A guideline that ~10% of time should be spent on planning/editing and ~90% on meaningful actions. Used to detect over-planning patterns.

---

# Appendix A — Engagement & recovery guardrails (MVP contract)

## A1) Why this exists
The MVP uses game feedback to help users start and recover, not to maximize time-in-app. These guardrails exist to prevent guilt loops, toxic reward economies, and unsafe sharing.

## A2) Non-negotiable guardrails
1) No rewards for passive app opens or passive browsing.
2) No harsh penalties for missing a day (no territory loss, no “streak shame”).
3) No random loot / variable rewards disconnected from real actions.
4) No social pressure loops (no leaderboards, no competitive feeds).
5) Sharing is artifact-based and privacy-safe by default.
6) The product reinforces progress and recovery, not guilt and urgency.

## A3) Ritual time budgets (anti-burnout UX)
- Commander check-in: 3–5 seconds.
- Daily Orders selection: under 60 seconds to pick and start.
- War council: under 2 minutes (1–3 if-then plans).
- Season Debrief: 1–2 minutes total (3 short screens).

If a ritual becomes “a form to fill”, it is a bug.

## A4) Prompt budget (anti-spam)
- Max one “strong” hero moment per session.
- Share prompts appear only after meaningful actions and never before action.
- “Export/share” is always optional and skippable.

## A5) The 10/90 heuristic (planning vs doing)
Goal: prevent the product from turning into endless planning.

Heuristic (not a hard rule):
- aim for ~10% “planning/editing” actions and ~90% “meaningful actions” over time.

Implications:
- detect over-planning patterns (splitting/renaming/rewriting without starting);
- nudge toward a low-friction action (e.g., 5-minute raid or supply);
- reduce celebratory intensity when a session has no meaningful action.

## A9) Soft anti-exploit rules (MVP)
These rules exist to keep the game aligned with real project execution.

1) **No “prepare-only victory”:** repeated `prepare` actions (clarify/supply/decompose) should not feel like “beating the game”.
   - UI feedback for prepare is allowed but must be subtle.
   - Strong hero moments must prefer `start/progress/complete/siege_resolve` milestones.
2) **Prepare loop detection (per province):**
   - if a province has 3+ `prepare` meaningful actions without any `start/progress/complete/retreat` in the last 7 days:
     - Daily Orders must bias toward `raid` or `retreat` for that province;
     - show a non-shaming nudge (“Make the first small hit, or retreat”).
3) **Decomposition bounds:** `decompose` should create 3–5 sub-provinces (MVP) to avoid infinite splitting.
4) **No siege avoidance by edits:** siege is based on `lastMeaningfulActionAt`, not `updatedAt` (Appendix C).

## A6) Privacy-safe sharing rules
Public-safe exports MUST exclude by default:
- province/task titles and descriptions;
- deadlines, calendar dates, and any free text (including if-then plan text);
- links, file paths, and any user-entered context notes.

Public-safe exports MAY include:
- abstract progress visuals (colors, shapes, percent, counts);
- campaign theme/emblem chosen by the user;
- high-level labels like “Week 2 / Day 11”.

Private mode can include more detail, but must still be explicit and opt-in.

## A7) Guardrail events (for verification)
See Appendix B for payloads:
- `session_long_no_progress`
- `reward_seen_no_meaningful_action`

## A8) QA checklist (manual)
- Open app, do nothing → no points, no hero moment, no prompts.
- Browse maps for 10+ minutes without action → no celebration; guardrail can trigger.
- Generate share card in `public-safe` → no task titles in the exported image.
- Skip a day → no punishment beyond gentle copy.

---

# Appendix B — Event schema v1 (local-only analytics)

Status: done  
Owner: `<TBD>`

## B1) Goals
- Enable PRD metric calculation without a backend.
- Support “started within 24h after an intervention” analysis.
- Provide guardrail signals for unhealthy engagement (long sessions without progress, rewards without action).

## B2) Conventions
- `eventName`: `snake_case`.
- `eventVersion`: integer, start at `1` and bump only on breaking payload changes.
- `occurredAt`: ISO timestamp (local time) + store `timezone` separately (IANA string).
- `sessionId`: random UUID per app session (tab open → close).
- IDs: `campaignId`, `regionId`, `provinceId`, `seasonId`, `dailyMoveId`, `siegeEventId`, `checkinId`, `seasonReviewId`, `shareCardId`.
- Privacy: avoid storing raw free-text in events. Prefer lengths/counts and enums.

## B3) Common envelope (recommended)
Every event is stored as:
- `eventName` (string)
- `eventVersion` (number)
- `occurredAt` (string)
- `timezone` (string)
- `sessionId` (string)
- `payload` (object)

## B4) “Meaningful action” marker (for metrics)
To compute “meaningful days”, every event that counts as a meaningful action MUST set:
- `payload.isMeaningfulAction = true`
- `payload.meaningfulActionType` (enum; see below)

Recommended `meaningfulActionType` values:
- `clarify` (fog → ready, or adds required clarity fields)
- `prepare` (reduces friction or improves actionability without a “real step” yet; e.g., decomposition, context prep)
- `start` (ready → in_progress)
- `progress` (stage increase / logged real step)
- `siege_resolve` (siege → ready/in_progress/retreated via a tactic)
- `complete` (→ captured)
- `retreat` (→ retreated as a conscious decision)

## B5) Intervention correlation (for “started_24h”)
Any event that *presents* recommendations must include:
- `payload.interventionId` (string; stable for that presentation)
- `payload.interventionType` (enum: `daily_move | siege | codex | season_review | other`)

Any event that *selects/applies* a recommended action should include:
- `payload.interventionId` (string; copied from presentation)
- `payload.recommendedActionId` (string; stable inside the intervention)

Minimum viable approach:
- `daily_move_viewed` creates `interventionId`
- `daily_move_selected` references that `interventionId`

## B6) Event list and payload contracts

### B6.1. Lifecycle (optional in MVP)
**`app_opened`**
- optional: `appVersion`, `schemaVersion`

### B6.2. Campaign / region / province CRUD (P0)
**`campaign_created`**
- required: `campaignId`, `seasonId`
- optional: `archetype?` (`foundation | drive | joy | neutral`)

**`region_created`**
- required: `regionId`, `campaignId`

**`province_created`**
- required: `provinceId`, `regionId`, `campaignId`
- optional: `initialState` (`fog | ready`)

### B6.3. Fog / clarity
**`province_clarified`**
- required: `provinceId`, `campaignId`, `seasonId`
- required: `isMeaningfulAction=true`, `meaningfulActionType=clarify`
- optional (privacy-safe): `desiredOutcomeLen`, `firstStepLen`, `estimatedEntryMinutes`

### B6.4. Progress / completion
**`province_started`**
- required: `provinceId`, `campaignId`, `seasonId`
- required: `isMeaningfulAction=true`, `meaningfulActionType=start`

**`province_decomposed`**
- required: `provinceId`, `campaignId`, `seasonId`
- required: `isMeaningfulAction=true`, `meaningfulActionType=prepare`
- optional: `createdProvinceCount`
- optional: `methodType?` (`engineer | manual | template`)

**`province_fortified`**
- required: `provinceId`, `campaignId`, `seasonId`
- optional: `reasonType?` (`high_effort_no_decomposition | manual | other`)

**`province_supplied`**
- required: `provinceId`, `campaignId`, `seasonId`
- required: `isMeaningfulAction=true`, `meaningfulActionType=prepare`
- optional (privacy-safe): `contextLinkCount`, `contextNotesLen`

**`province_move_logged`**
- required: `provinceId`, `campaignId`, `seasonId`
- required: `isMeaningfulAction=true`, `meaningfulActionType=progress`
- required: `durationMinutes`
- optional: `moveType?` (`raid | assault | other`)
- optional: `fromStage?`, `toStage?` (include only if stage changed)

**`province_completed`**
- required: `provinceId`, `campaignId`, `seasonId`
- required: `isMeaningfulAction=true`, `meaningfulActionType=complete`

**`province_retreated`**
- required: `provinceId`, `campaignId`, `seasonId`
- required: `isMeaningfulAction=true`, `meaningfulActionType=retreat`
- optional: `reasonType?` (enum)

### B6.5. Siege + tactics
**`siege_triggered`**
- required: `siegeEventId`, `provinceId`, `campaignId`, `seasonId`
- required: `stalledDays`
- optional: `reasonType?` (enum)

**`tactic_applied`**
- required: `siegeEventId`, `provinceId`, `campaignId`, `seasonId`
- required: `tacticType` (`scout | supply | engineer | raid | retreat`)
- required: `isMeaningfulAction=true`, `meaningfulActionType=siege_resolve`
- optional: `interventionId?` (if applied from an intervention surface)

### B6.6. Commander check-in + Daily Orders
**`checkin_started`**
- required: `checkinId`, `seasonId`

**`checkin_completed`**
- required: `checkinId`, `seasonId`
- required: `emotionType`, `energyLevel`, `availableMinutes`

**`daily_move_viewed`**
- required: `seasonId`, `interventionId`, `interventionType=daily_move`
- optional: `checkinId?`
- required: `recommendedActions[]` (array of objects):
  - required: `recommendedActionId`, `provinceId`, `moveType`, `durationBucket` (`5 | 15 | 25_plus`)

**`daily_move_selected`**
- required: `dailyMoveId`, `seasonId`
- required: `interventionId`, `recommendedActionId`
- required: `provinceId`, `moveType`, `durationMinutes`
- required: `isMeaningfulAction=true` (if the selection triggers a real action)
- optional: `resultType?` (enum)

### B6.7. War council
**`if_then_plan_created`**
- required: `planId`, `provinceId`, `seasonId`
- optional (privacy-safe): `triggerLen`, `actionLen`

### B6.8. Season review / integration ritual
**`season_review_started`**
- required: `seasonReviewId`, `seasonId`
- required: `interventionId`, `interventionType=season_review`

**`season_review_completed`**
- required: `seasonReviewId`, `seasonId`
- required: `interventionId`
- optional: `workedWellCount`, `mainObstaclesCount`, `carryForwardCount`, `dropListCount`

### B6.9. Hero moments (feedback)
**`hero_moment_triggered`**
- required: `seasonId`, `heroMomentType`
- optional: `provinceId?`, `shareCardId?`

### B6.10. Share cards (safe virality)
**`share_card_generated`**
- required: `shareCardId`, `seasonId`, `cardType`, `privacyMode`
- optional: `sourceSurface` (`season_summary | hero_moment | settings | other`)

**`share_card_exported`**
- required: `shareCardId`, `seasonId`, `cardType`, `privacyMode`
- optional: `exportTarget?` (`system_share | download | clipboard | other`)

### B6.11. Archetypes (Foundation / Drive / Joy)
**`archetype_selected`**
- required: `entityType` (`campaign | region | province`), `entityId`, `archetype`

### B6.12. Guardrails (anti-burnout / anti-toxicity)
**`session_long_no_progress`**
Default trigger (MVP): 10+ minutes in a session with 0 meaningful actions.
- required: `seasonId`
- required: `durationSeconds`
- required: `meaningfulActionCount=0`

**`reward_seen_no_meaningful_action`**
- required: `seasonId`
- required: `rewardType` (enum)
- required: `meaningfulActionCountBeforeReward=0`

## B7) Open questions
- Do we log `app_opened` in MVP, or keep it out until pilot?

---

# Appendix C — Meaningful action, movement, and `updatedAt` (MVP contract)

## C1) Definitions
- **Meaningful action:** a user action that represents real progress, clarification, recovery, or action-prep that materially reduces friction. It can unlock feedback/hero moments and counts toward “meaningful days”.
- **Movement:** for MVP, treat as the same set as meaningful actions (a “movement event” is any meaningful action event).
- **`updatedAt` on Province:** the last persisted change timestamp for that province (any mutation, including non-meaningful edits).
- **`lastMeaningfulActionAt` on Province:** the last timestamp of a meaningful action for that province. It is used for siege detection and “meaningful day” computation.

## C2) What counts as meaningful (MVP)
Meaningful actions MUST:
- change at least one domain-relevant field or state (clarity/state/progress/resources), and
- be represented by an event with `payload.isMeaningfulAction=true` (Appendix B).

Meaningful actions include:
- Clarification that satisfies fog requirements (`province_clarified`).
- First start of work (`province_started`).
- Any real progress step that logs time/effort (`province_move_logged`) — stage may or may not change.
- Completing a province (`province_completed`).
- Conscious retreat/reschedule (`province_retreated`).
- Siege tactics application (`tactic_applied`) including `scout/supply/engineer/raid/retreat`.
- Decomposition/splitting that creates actionable sub-provinces (`province_decomposed`).
- Supplying context/resources outside siege (`province_supplied`).

## C3) What does NOT count as meaningful (MVP)
These actions must never set `isMeaningfulAction=true` and must not unlock strategic progress:
- opening the app; browsing maps; opening a province; reading stats;
- check-ins (`checkin_*`) and viewing recommendations (`daily_move_viewed`);
- creating/editing if-then plans (`if_then_plan_created`);
- renaming, reordering, styling/theme changes that do not change clarity/progress/actionability;
- export/share actions (`share_card_*`).

## C4) `updatedAt` rules (MVP)
Always update `province.updatedAt` when the province is mutated by a domain action (meaningful or not).

Update `province.lastMeaningfulActionAt` only when a meaningful action in C2 happens for that province.

Do NOT update `lastMeaningfulActionAt` for:
- viewing/browsing and navigation-only actions;
- check-ins and viewing recommendations;
- cosmetic edits (title/description), ordering, theme changes;
- generating share cards;
- writing if-then plans.

Rationale: siege must be based on meaningful action timestamps, otherwise it can be farmed/avoided by low-effort edits.

## C5) Siege eligibility
Siege detection should consider provinces in states:
- eligible: `ready`, `in_progress`, `fortified`
- ineligible: `fog`, `siege`, `captured`, `retreated`

Siege detection uses `lastMeaningfulActionAt` (fallback `createdAt`).

---

# Appendix D — Province transition table v1 (state machine contract)

Notes:
- UI must never set `province.state` directly. UI dispatches domain actions; rules derive the next state.
- “Derived” transitions still require an explicit action (e.g., `edit_fields`) to re-evaluate rules.

| From state | Action/event | To state | Conditions (MVP) | Side effects (MVP) | Event(s) / meaningful |
|---|---|---|---|---|---|
| *(new)* | `province_created` | `fog` or `ready` | `fog` if required clarity fields missing | set `createdAt`, `updatedAt=createdAt` | `province_created` (not meaningful) |
| `fog` | `clarify` | `ready` | required clarity fields present after change | set clarity fields; set `updatedAt`; set `lastMeaningfulActionAt` | `province_clarified` (meaningful: `clarify`) |
| `ready` | `start_move` | `in_progress` | first real step is recorded | set `progressStage>=entered`; set `updatedAt`; set `lastMeaningfulActionAt` | `province_started` (meaningful: `start`) |
| `ready` | `decompose/split` | `ready` | creates 3–5 actionable sub-provinces | create new provinces; bump `decompositionCount`; set `updatedAt`; set `lastMeaningfulActionAt` | `province_decomposed` (meaningful: `prepare`) |
| `ready` | `supply` | `ready` | context/resources were added | update `contextLinks/contextNotes`; set `updatedAt`; set `lastMeaningfulActionAt` | `province_supplied` (meaningful: `prepare`) |
| `ready` | `complete` | `captured` | user marks done | set state; set stage to `captured`; set `updatedAt`; set `lastMeaningfulActionAt` | `province_completed` (meaningful: `complete`) |
| `ready` | `retreat/reschedule` | `retreated` | user chooses to defer/remove | set state; set `updatedAt`; set `lastMeaningfulActionAt` | `province_retreated` (meaningful: `retreat`) |
| `ready` | `system_fortify_trigger` | `fortified` | `effortLevel >= 4` AND `decompositionCount == 0` AND not started | set state; set `updatedAt` | `province_fortified` (not meaningful) |
| `ready` | `system_siege_trigger` | `siege` | `stalledDays >= N` where N=3 using `lastMeaningfulActionAt` (fallback `createdAt`) and per C5 eligible | create `SiegeEvent`; set state; set `updatedAt` | `siege_triggered` (not meaningful) |
| `in_progress` | `log_move` | `in_progress` | user logs a real step (Appendix I) | optionally update stage; set `updatedAt`; set `lastMeaningfulActionAt` | `province_move_logged` (meaningful: `progress`) |
| `in_progress` | `supply` | `in_progress` | context/resources were added | update `contextLinks/contextNotes`; set `updatedAt`; set `lastMeaningfulActionAt` | `province_supplied` (meaningful: `prepare`) |
| `in_progress` | `complete` | `captured` | user marks done | set state/stage; set `updatedAt`; set `lastMeaningfulActionAt` | `province_completed` (meaningful: `complete`) |
| `in_progress` | `system_siege_trigger` | `siege` | same as `ready` | create `SiegeEvent`; set state; set `updatedAt` | `siege_triggered` (not meaningful) |
| `fortified` | `decompose/split` | `ready` or `in_progress` | decomposition reduces scope enough to act | create sub-provinces; bump `decompositionCount`; set `updatedAt`; set `lastMeaningfulActionAt` | `province_decomposed` (meaningful: `prepare`) |
| `fortified` | `supply` | `fortified` | context/resources were added | update `contextLinks/contextNotes`; set `updatedAt`; set `lastMeaningfulActionAt` | `province_supplied` (meaningful: `prepare`) |
| `fortified` | `system_siege_trigger` | `siege` | same as `ready` | create `SiegeEvent`; set state; set `updatedAt` | `siege_triggered` (not meaningful) |
| `siege` | `apply_tactic:scout` | `ready` | clarity improved | update clarity fields; set `updatedAt`; set `lastMeaningfulActionAt` | `tactic_applied` (meaningful: `siege_resolve`) |
| `siege` | `apply_tactic:supply` | `ready` | context/resources were added | update `contextLinks/contextNotes`; set `updatedAt`; set `lastMeaningfulActionAt` | `tactic_applied` (meaningful: `siege_resolve`) |
| `siege` | `apply_tactic:engineer` | `ready` | split created actionable sub-provinces | create sub-provinces; bump `decompositionCount`; set `updatedAt`; set `lastMeaningfulActionAt` | `tactic_applied` (meaningful: `siege_resolve`), optionally also `province_decomposed` |
| `siege` | `apply_tactic:raid` | `in_progress` | a 5-minute entry step is started | create a `DailyMove`; set `updatedAt`; set `lastMeaningfulActionAt` | `tactic_applied` (meaningful: `siege_resolve`) |
| `siege` | `apply_tactic:retreat` | `retreated` | user retreats/reschedules | set state; set `updatedAt`; set `lastMeaningfulActionAt` | `tactic_applied` + `province_retreated` (meaningful) |
| `captured` | *(none in MVP)* | `captured` | no reopen in MVP | — | — |
| `retreated` | *(none in MVP)* | `retreated` | no restore in MVP | — | — |

---

# Appendix E — Time contract v1 (timezone, day boundary, seasons)

## E1) Timezone
- Use the user’s **local timezone**.
- Persist timezone as an IANA string (e.g., `Europe/Moscow`) alongside timestamps (see Appendix B conventions).

## E2) Canonical day boundary (MVP decision)
- Canonical day boundary is **04:00 local time**.
- A “meaningful day” is the 24h bucket starting at 04:00 and ending before the next 04:00.

Rationale: reduces late-night “double counting” and makes daily rituals stable for most users.

## E3) Season dayNumber
- Store `season.timezone` at season creation.
- Compute `season.dayNumber` using the season timezone and the 04:00 boundary.
- If the user changes timezone mid-season, keep season aggregation stable by continuing to use `season.timezone` for `dayNumber` (MVP choice).

## E4) DST / timezone shifts (MVP minimum)
- Treat “04:00 local time” as a wall-clock boundary in the relevant timezone.
- Events store their `timezone`; analysis can reconcile later if needed, but in-product aggregation should remain stable.

---

# Appendix F — Copy layering contract v1 (fantasy-first, but not childish)

## F1) Layering rule (non-negotiable)
- **Map/home surfaces:** fantasy-first terms (fog, siege, scout, supply, raid).
- **Action screens:** plain language must be present for clarity fields (Outcome / First step / Entry time). Fantasy can be a label, but the real-world meaning must be obvious.

## F2) Tone constraints (MVP)
- Avoid childish slang; prefer “minimal strategy UI” tone.
- Never use guilt/shame framing.
- Never imply progress without action.

---

# Appendix G — Progress stage contract v1 (MVP)

Goal: make `progressStage` update rules testable and consistent across UI, rules, and analytics.

## G1) Stage enum (stored)
`progressStage` is stored as an enum (not as free-form percent):
- `scouted`
- `prepared`
- `entered`
- `held`
- `captured`

Percentages shown in UI are a display mapping only (MVP suggestion: 15/30/55/80/100).

## G2) Stage update rules (MVP)
Stage can only change via domain actions (never by UI directly).

Minimum rules:
- On `province_clarified` → stage becomes at least `scouted`.
- On `province_supplied` or `province_decomposed` → stage becomes at least `prepared`.
- On `province_started` → stage becomes at least `entered`.
- On `province_move_logged`:
  - if current stage is `entered`, bump to `held`;
  - otherwise keep stage unless a later rule applies.
- On `province_completed` → stage becomes `captured`.

Stage must never decrease in MVP.

---

# Appendix H — UI move ↔ domain action crosswalk (MVP)

Goal: prevent ambiguity between fantasy UI labels (“assault”, “raid”) and domain actions/events.

Legend:
- “Meaningful” means it updates `lastMeaningfulActionAt` and can unlock feedback/chronicle/hero moments.
- “Event” refers to Appendix B event names.

## H1) Move mapping (MVP)

| UI label | Domain action | Allowed province states | Primary data effect | Event | MeaningfulActionType |
|---|---|---|---|---|---|
| Scout | `clarify` | `fog` (also allowed in `ready` to refine clarity) | set `desiredOutcome/firstStep/estimatedEntryMinutes` | `province_clarified` | `clarify` |
| Supply | `supply` | `ready`, `in_progress`, `fortified` | update `contextLinks/contextNotes` | `province_supplied` | `prepare` |
| Engineer | `decompose` | `ready`, `fortified` (also allowed in `siege` via `apply_tactic`) | create sub-provinces; bump `decompositionCount` | `province_decomposed` | `prepare` |
| Raid (5m) | `start_move` | `ready` (also via `apply_tactic:raid` in `siege`) | record first real step (time-capped) | `province_started` (or `tactic_applied`) | `start` (or `siege_resolve`) |
| Assault | `start_move` or `log_move` | `ready` / `in_progress` | record a real step (not time-capped) | `province_started` / `province_move_logged` | `start` / `progress` |
| Retreat | `retreat` / `reschedule` | any except `captured` | set `retreated` or defer | `province_retreated` (or `tactic_applied` in siege) | `retreat` (or `siege_resolve`) |

## H2) Non-meaningful edits (MVP)
UI actions that change metadata (title/description/order/theme/dueDate/etc.) MUST be implemented as a non-meaningful domain action (e.g., `edit_fields`) that:
- updates `updatedAt`,
- does NOT update `lastMeaningfulActionAt`,
- does NOT unlock feedback/chronicle/hero moments.

---

# Appendix I — “Real step” and move logging contract v1 (MVP)

Goal: make `start_move` / `log_move` consistent, non-exploitable, and aligned with real-world project execution.

## I1) Definitions
- **Real step:** a concrete action taken in the real world toward the province outcome (work, communication, delivery, or unblock). It is not merely thinking about the task or reorganizing the app.
- **Move logging:** the in-app representation of a real step. Logging is self-attested in MVP, but must follow the rules below.

## I2) What counts as a real step (MVP examples)
Counts:
- wrote code / produced a draft / edited a real document;
- sent an email/message that advances the task;
- made a call / booked a meeting / requested input;
- created a deliverable artifact (PR, design snippet, outline);
- executed a concrete 5-minute entry action (“opened the repo and ran the tests”, “wrote the first paragraph”).

Does NOT count:
- renaming/reordering provinces, changing theme/banner, browsing maps;
- “I thought about it” without producing an artifact or taking an external action;
- excessive decomposition/supply loops without starting.

## I3) `start_move` vs `log_move`
- `start_move` is used when the province transitions `ready → in_progress` (first entry).
- `log_move` is used for subsequent real steps in `in_progress`.

Both actions are meaningful:
- they must update `lastMeaningfulActionAt`;
- they can count toward “meaningful days”;
- they can unlock feedback (EPIC-11), chronicle entries (EPIC-15), and hero moments when milestone rules allow.

## I4) Minimum payload contract (MVP)
For `log_move`:
- require `durationMinutes` (integer, `>= 1`).
- optional: `moveType` (`raid | assault | other`).
- optional: a free-text note MAY be stored in the province for the user, but MUST NOT be logged into analytics events in raw form (see Appendix B privacy).

## I5) Anti-exploit rules (MVP)
1) **No progress without clarity:** `start_move` is blocked if the province is `fog` (must clarify first).
2) **No celebration for “fake work”:** non-meaningful edits never unlock feedback/chronicle/hero moments (Appendix H2).
3) **Prepare loop detection (soft):** if a province receives 3+ `prepare`-type meaningful actions (`province_supplied`/`province_decomposed`) without any `start/progress/complete/retreat` in the last 7 days:
   - Daily Orders must prefer `raid` or `retreat` for that province;
   - reduce celebratory intensity for further prepare actions until a real step happens.
