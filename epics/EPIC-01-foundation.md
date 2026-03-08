# EPIC-01 — Product foundation (PRD → backlog contract)

**ID:** `EPIC-01`  
**Priority:** `P0`  
**Status:** `draft`  
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
- Use a single domain action name `decompose` (UI may call it “split”); avoid duplicating actions for the same intent.

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
- Any real progress step that changes stage (`province_progressed`).
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
| `in_progress` | `log_move` | `in_progress` | user logs real progress | update stage if criteria met; set `updatedAt`; set `lastMeaningfulActionAt` | `province_progressed` (meaningful: `progress`, if stage changes) |
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
- On `province_progressed`:
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
| Assault | `start_move` or `log_move` | `ready` / `in_progress` | record a real step (not time-capped) | `province_started` / `province_progressed` | `start` / `progress` |
| Retreat | `retreat` / `reschedule` | any except `captured` | set `retreated` or defer | `province_retreated` (or `tactic_applied` in siege) | `retreat` (or `siege_resolve`) |

## H2) Non-meaningful edits (MVP)
UI actions that change metadata (title/description/order/theme/dueDate/etc.) MUST be implemented as a non-meaningful domain action (e.g., `edit_fields`) that:
- updates `updatedAt`,
- does NOT update `lastMeaningfulActionAt`,
- does NOT unlock feedback/chronicle/hero moments.
