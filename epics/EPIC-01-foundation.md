# EPIC-01 — Product foundation (PRD → backlog contract)

**ID:** `EPIC-01`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD/RFC reference:** `prd.md` / `rfc.md`

## 1) Objective (Outcome)
Make the product rules and definitions unambiguous so the team can implement the MVP without guessing, and QA can accept work against testable criteria.

## 2) Context
- `rfc.md` contains many rules and terms, but some need to be turned into an explicit contract (what counts as movement, day boundaries, what is “meaningful”).
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
1) Extract terms from `prd.md`/`rfc.md`.
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
2) Define domain actions: clarify, start_move, log_move, apply_tactic, complete, retreat, split, reschedule.
3) For each action: what fields change and which event is logged.
**Acceptance criteria:**
- Each transition has a condition and an explicit effect.
- No “magic” transitions without an action/event.
**DoD:**
- Transition table is written and reviewed.
**Estimate:** `L`

### T3. Define “meaningful move” and “task update”
**Description:** formalize what increases progress/points and what updates `updatedAt`.  
**Steps:**
1) List actions that are meaningful.
2) List actions that must NOT be meaningful (e.g., “just opened a screen”).
3) Define `updatedAt` update rules (e.g., only on domain actions that change state/progress/clarity).
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
- Daily move screen is stable across refreshes.
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
- Day boundary: 00:00 vs 04:00 local time?
- Do we keep separate actions for “split” vs “decompose”, or treat them as one?

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
- Daily move selection: under 60 seconds to pick and start.
- War council: under 2 minutes (1–3 if-then plans).
- Integration review: 1–2 minutes total (3 short screens).

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

Status: draft  
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

**`province_progressed`**
- required: `provinceId`, `campaignId`, `seasonId`
- required: `isMeaningfulAction=true`, `meaningfulActionType=progress`
- required: `fromStage`, `toStage`

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

### B6.6. Commander check-in + Daily move
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
- What is the canonical day boundary (00:00 vs 04:00) for “meaningful day” aggregation?
