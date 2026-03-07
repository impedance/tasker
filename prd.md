# PRD: Tasker — MVP browser-based strategy game for goal execution

Date: 2026-03-06  
Source: `rfc.md` (RFC / spec)

## 0. Context and problem

Users with many personal/work projects often get stuck not because of laziness, but due to:
- unclear next steps;
- overload and lack of visible progress;
- emotional resistance;
- high friction to start.

MVP hypothesis: if we replace a to-do list with a strategic map of projects and tie game progress to real micro-actions, it becomes easier to start and keep moving.

## 1. Goals and non-goals

### 1.0. Primary experiential goal
The user should primarily perceive Tasker as a strategy game about campaigns, territories, fog, and sieges; real task progress is the fuel that advances the world, but the first impression is the world.

### 1.1. MVP goals (product)
- Validate the “progress map instead of task list” mechanic.
- Increase the likelihood of starting stalled tasks (entering action).
- Increase decomposition of unclear/large tasks.
- Achieve regular return usage over a 21-day season.
- Support healthy return rituals, not only completion pressure.

### 1.2. User goals
- See projects as “campaigns” on a map.
- Quickly turn vague projects into concrete steps.
- Get rewarded for clarification/start/progress, not only for “done”.
- Get rule-based hints tailored to their friction type.
- Feel safe to recover, reflect, and restart after overload.

### 1.3. Non-goals (out of scope for MVP)
- Full 4X (economy/diplomacy/AI opponents/multiplayer).
- Accounts, cloud sync, payments.
- Advanced ML, procedural maps, “AI decomposition”.
- Integrations: calendars, push notifications, A/B platform.
- Toxic reward economies, random loot, and pressure-driven social loops.

## 2. Users and scenarios

### 2.1. Primary audience
- Knowledge workers with many parallel projects.
- People who procrastinate due to ambiguity/overload/resistance.
- Users who dislike “task manager UI”.

### 2.2. Key scenarios (MVP + near-term extensions)
1. First run → onboarding → create campaign → 1–3 regions → tasks/provinces → the map “comes alive”.
2. Unclear task → fog of war → fill outcome/first step/entry time → fog is removed.
3. Stalled task → siege after N days → choose a tactic → resolve siege (or retreat/reschedule).
4. Commander check-in → daily move → 3 suggested actions (raid/supply/scout/assault/retreat) → do one → game feedback.
5. End of day → war council → 1–3 if-then plans → close the day without chaos.
6. End of season → integration review → carry forward what worked and drop what should not continue.

## 3. Success metrics and measurability

### 3.1. Product metrics
- D1/D7 retention (for pilot: cohort-relative comparison is sufficient).
- Mean “meaningful days” per season (21 days): days with at least 1 meaningful move.
- Average counts:
  - clarified tasks (fog → ready),
  - sieges resolved (siege → ready),
  - tasks with a written first step,
  - tasks advanced through progress stages.
- Share-card generation/export rate (privacy-safe only).

### 3.2. Behavioral metrics
- Time from province creation to first real step.
- Time from entering siege to selecting a tactic.
- Tactic effectiveness: share of cases where a tactic leads to progress (per rules).
- Average session duration and distribution by weekday/time.
- Start within 24 hours after a recommendation/tactic/check-in intervention.
- Long sessions with no meaningful action (guardrail metric).

### 3.3. Qualitative metrics (survey/interviews)
- “It’s easier for me to start”
- “It’s more interesting to return”
- “It feels more like a game than a task list”

### 3.4. Experience KPIs (research prompts)
- `feels_like_a_game_score`
- `desire_to_return_for_world_state`
- `hero_moment_recall`
- `world_attachment_score`
- `started_within_24h_after_move` (already tracked in behavioral metrics)

## 4. MVP scope (priorities)

### 4.1. P0 (must-have)
- SPA, offline, local storage (IndexedDB/localForage), JSON import/export.
- Campaign map and project map in SVG (clickable regions/provinces).
- First-run onboarding with a demo/tutorial campaign (fast “first win”, skippable).
- CRUD: campaigns/regions/provinces.
- Province states + transitions via rule engine.
- Fog-of-war (clarity: outcome/first step/entry time).
- Siege (trigger: N=3 days without updates) + 5 tactics.
- Stage-based province progress (not binary).
- Daily move (3 recommendations) + War council (if-then plans).
- Season (21 days): season day + season summary.
- Baseline rule-based recommendations v1 + “why” explanation (non-personalized).

### 4.2. P1 (nice-to-have if time allows)
- Capture/fog animations and solid feedback copy.
- Daily move history.
- Extended season stats.
- Rule-based adaptation v1 (history-driven personalization).
- Hero moments for meaningful milestones.
- Season integration review.
- Chronicle (local timeline of meaningful actions and season highlights).
- Privacy-safe shareable map cards.
- “Capital” hub panel on the campaign map (UI metaphor only; no new mechanics).
- Tactics codex / personal strategy insights.
- Campaign archetypes (Foundation / Drive / Joy / Neutral).
- Archetype-based theming (“faction identity”) without adding new systems.

### 4.3. P2 (later)
- Multiplayer, cloud, mobile app, AI decomposition, procedural maps.

## 5. UX/UI requirements (implementation design contract)

### 5.1. General principles
- “Minimal strategy”: the map is the main screen; minimal tables and “CRM forms”.
- No more than 3–5 required fields when creating/clarifying a task.
- No more than 1–2 clicks from opening a province to a real action.
- Every “stalled” task should lead to a short ritual (siege → tactic).
- The product should reinforce rhythm and recovery, not only pressure to finish.
- No guilt/FOMO mechanics and no reward for app opens without meaningful action.
- Copy layering rule: map/home surfaces use fantasy-first terms; action screens use plain language for clarity fields (outcome / first step / entry time). Never hide the real-world meaning once the user is inside an action.
- Rituals must stay short by design (see `epics/EPIC-01-foundation.md`, Appendix A).
- Prefer “do” over “plan”: apply the 10/90 heuristic to prevent endless planning (see `epics/EPIC-01-foundation.md`, Appendix A).

### 5.2. Product screens (MVP + P1 IA)
1. Onboarding
2. Campaign map
3. Project map
4. Province/task (details + actions)
5. Siege (tactic selection)
6. Commander check-in (P1)
7. Daily move (3 recommendations)
8. War council (if-then plans)
9. Season summary / stats
10. Season integration review (P1)
11. Settings (import/export, optional debug)

### 5.3. Map interactions
- Hover/selected states.
- Color status by province state (fog/ready/siege/in_progress/fortified/captured/retreated).
- Soft transitions when status changes.
- Responsive scaling (desktop-first, mobile-friendly).

### 5.4. Non-functional requirements (MVP)
- Browser SPA, no backend.
- Offline-first: usable without network after initial load.
- Local persistence; resilient to refresh/tab restart.
- Fast cold start: first meaningful interaction < 10 seconds.
- Mobile-friendly (not perfect mobile UX); desktop-first priority.
- State import/export in JSON.

## 6. Game model and rules (MVP)

### 6.1. Terms (metaphor)
- Campaign = project
- Region = phase / large task
- Province = task / subtask
- Fog = ambiguity
- Siege = stalling/resistance
- Commander check-in = short pre-action ritual that captures current state
- Daily move = “daily turn” (3 suggestions)
- War council = evening ritual (if-then plans)
- Integration review = post-season reflection ritual

### 6.2. Province progress (stages)
Provinces have stage-based progress (example scale):
- scouted: 15%
- decomposed: 30%
- started: 55%
- sustained: 80%
- captured: 100%

Important: stage increases must be tied to real action (or meaningful clarification).

### 6.3. Province states (state machine)
States:
- `fog` — unclear (required clarity fields are missing)
- `ready` — clear and available
- `siege` — no movement for N days (MVP: 3 days)
- `in_progress` — started
- `fortified` — too large/heavy (rule: high effort + no decomposition)
- `captured` — completed
- `retreated` — consciously deferred/removed

Transitions (MVP):
- fog → ready: outcome/firstStep/estimatedEntryMinutes filled
- ready → in_progress: first real step is recorded (move)
- ready → siege: no `updatedAt` changes for N days
- ready → fortified: high effortLevel + no decomposition
- siege → ready: a tactic (or clarification/decomposition) is applied and logged
- in_progress → captured: user marks done
- any → retreated: consciously removed/rescheduled

### 6.4. Siege tactics
MVP set:
- **Scout:** clarify what to do (rewrite outcome/next step)
- **Supply:** prepare environment (links/files/context), reduce friction
- **Siege engineer:** split into 3–5 parts/micro-steps
- **5-minute raid:** smallest entry step with strict time cap
- **Retreat:** change expectations, reschedule, or remove as not relevant

Each tactic must change data/state and be logged.

### 6.5. Morale / emotional state (recommendation signal)
Before acting, the user can mark (MVP list):
anxiety, boredom, fatigue, irritation, fear of outcome, ambiguity.
Based on this, the system suggests tactics or daily move types.

### 6.5.1. Commander check-in
Before daily recommendations, the user can optionally complete a 3–5 second ritual:
- emotion: anxiety / boredom / fatigue / irritation / fear of outcome / ambiguity;
- available time: 5 / 15 / 25+ minutes;
- energy: low / medium / high.

The system should explain why the 3 recommended moves were chosen.

### 6.6. Daily move (3 recommendations)
Every day show 3 suggestions:
- light move (~5 minutes),
- medium move (~15 minutes),
- main move (25+ minutes).

Recommendations are rule-based using:
states, move history, friction, and time-of-day activity.

### 6.7. War council (if-then plans)
In the evening, the user writes 1–3 if-then plans:
“If (trigger), then (action)”, linked to a province and/or time.

### 6.8. Integration review
At the end of the 21-day season, the user completes a short debrief:
- what worked;
- where sieges repeated;
- which tactics helped;
- what to carry into the next season;
- what to let go.

The review should take about 1–2 minutes and support an immediate next-season start.

### 6.9. Hero moments (P1)
Short celebratory feedback moments may appear only after meaningful actions such as:
- first fog → ready transition;
- first started province;
- siege resolved;
- 3 meaningful days in a row;
- capturing a high-effort province.

Rules:
- never trigger from app open or passive browsing;
- no more than one strong hero moment per session;
- animations must be optionally reducible/disableable.

### 6.10. Safe sharing (P1)
The MVP+ social layer is based on exportable artifacts, not online competition:
- weekly map card;
- before/after season card;
- siege recovery card;
- campaign style card.

Public-safe exports should hide task titles, deadlines, and private text by default.

## 7. Data and storage (local)

### 7.1. Entities (minimum required fields)
Campaign:
- `id`, `title`, `description?`, `colorTheme?`, `createdAt`, `seasonId`, `status`, `regionIds[]`
- `archetype?` (`foundation | drive | joy | neutral`)

Region:
- `id`, `campaignId`, `title`, `description?`, `order`, `provinceIds[]`, `progressPercent`, `status`

Province:
- `id`, `regionId`, `title`, `description?`
- `desiredOutcome`, `firstStep`, `estimatedEntryMinutes`
- `dueDate?`, `effortLevel(1..5)`, `clarityLevel(1..5)`, `emotionalFrictionType?`
- `state`, `progressStage`, `resistanceTags[]`
- `updatedAt`, `createdAt`

DailyMove:
- `id`, `date`, `provinceId`, `moveType`, `durationMinutes`, `result`

PlayerCheckIn:
- `id`, `date`, `energyLevel`, `availableMinutes`, `emotionType`
- `recommendedMoveIds[]`, `selectedMoveId?`

SiegeEvent:
- `id`, `provinceId`, `triggeredAt`, `reasonType`, `selectedTactic`, `resolvedAt?`

PlayerProfile:
- `id=local`, `preferredWorkWindow?`, `frictionStats`, `streaks`
- `totalCaptured`, `totalClarified`, `totalStarted`, `totalCompleted`, `currentSeasonId`

Season:
- `id`, `title`, `startedAt`, `endsAt`, `dayNumber`, `goals?`, `score`

SeasonReview:
- `id`, `seasonId`, `workedWell[]`, `mainObstacles[]`, `carryForward[]`, `dropList[]`

HeroMoment:
- `id`, `type`, `provinceId?`, `seasonId`, `triggeredAt`, `shareCardId?`

ShareCard:
- `id`, `type`, `seasonId?`, `generatedAt`, `privacyMode`, `payload`

CampaignArchetypeStats:
- `seasonId`, `foundationCount`, `driveCount`, `joyCount`

IfThenPlan:
- `id`, `provinceId`, `triggerText`, `actionText`, `scheduledFor?`

### 7.2. Storage and migrations
- IndexedDB via localForage.
- Schema versioning + migrations for model changes.
- JSON import/export includes schema version (compatibility).

## 8. Technical architecture (MVP)

Stack (from RFC):
- React + TypeScript + Vite
- Zustand (state management)
- localForage (IndexedDB)
- SVG map + CSS animations
- Vitest + React Testing Library; Playwright for E2E

Architecture principles:
- domain rules and state transitions live in `game/rules` as pure functions;
- UI contains no rule business logic;
- storage adapter is isolated (`storage/...`);
- recommendation engine is separate.

Suggested module layout:
`src/app`, `src/pages`, `src/entities`, `src/features`, `src/game`, `src/storage`, `src/shared`.

## 9. RFC → detailed implementation plan (backlog)

Below is an “executable” plan: epics → concrete tasks/deliverables → acceptance criteria.
Goal: copy into a tracker and deliver within 3 weeks.

### 9.1. Epic A — Foundation (product contract)
Deliverables:
- agreed entity/state glossary;
- province state diagram (at least a transition table);
- MVP screen list and user flows.
- guardrail rules for healthy engagement and anti-burnout.

Acceptance / DoD:
- all P0 items are unambiguous (what counts as a meaningful move; what updates `updatedAt`).

### 9.2. Epic B — Project bootstrap
Tasks:
- Vite+React+TS project, basic layout, minimal router.
- Zustand store skeleton (optional devtools).
- localForage wired with a storage healthcheck.
- Vitest+RTL, Playwright, CI.
- Deploy preview.

Acceptance / DoD:
- unit tests pass; E2E smoke passes locally/in CI.
- app opens and renders the start screen.

### 9.3. Epic C — Domain model + persistence
Tasks:
- TS entity types.
- CRUD repositories + minimal relationship queries.
- Storage schema versioning + migrations.
- JSON export/import.

Acceptance / DoD:
- Refresh does not lose data.
- Exported JSON can be imported back without errors (including schema version).

### 9.4. Epic D — Navigation and map (SVG)
Tasks:
- campaign map (campaign territories).
- project map: clickable regions/provinces.
- binding entities to SVG id/data attributes.
- status colors + hover/selected + transitions.
- responsive scaling.

Acceptance / DoD:
- click a province → open province screen.
- statuses are distinguishable without text.

### 9.5. Epic E — Campaign/region/province creation
Tasks:
- create forms (minimal fields) + validation.
- quick-add multiple provinces.
- auto-start province state:
  - missing clarity fields → `fog`,
  - otherwise → `ready`.

Acceptance / DoD:
- first campaign flow in <2 minutes without bugs.

### 9.6. Epic F — Rule engine: fog, progress, transitions
Tasks:
- implement `fog` rule (required fields).
- implement `progressStage` and stage advancement rules.
- single transition function (e.g., `applyAction(state, action)`).
- domain-level input validation.

Acceptance / DoD:
- all transitions happen only through rules; UI never sets `state` directly.

### 9.7. Epic G — Siege + tactics
Tasks:
- siege trigger: “no movement for N days” + create `SiegeEvent`.
- siege UI: tactic selection + short descriptions.
- 5 tactics implemented as actions with effects (clarify/decompose/retreat/log).
- log tactic effectiveness (which tactics lead to progress).

Acceptance / DoD:
- a stalled province enters `siege` automatically.
- each tactic produces the expected data changes and exits `siege` (or goes `retreated`).

### 9.8. Epic H — Daily loop (Daily move + War council)
Tasks:
- daily move screen (3 recommendations).
- algorithm for selecting 3 moves (rule-based v1).
- war council screen + CRUD for if-then plans.
- daily move history (P1) or at least last N (MVP minimum).

Acceptance / DoD:
- user sees 3 concrete daily suggestions.
- if-then plans persist and are visible next day.

### 9.9. Epic I — Rule-based adaptation (P1 / optional)
Tasks:
- profile signals storage (`frictionStats`, emotions, tactic success, active time).
- 5–8 recommendation rules.
- prioritization + “why” explanation.
Notes:
- Baseline (non-personalized) recommendations + “why” explanation live in Epic H.

Acceptance / DoD:
- for the same task set, recommendations differ after history accumulates.

### 9.10. Epic J — Season (21 days)
Tasks:
- Season entity: start/end, dayNumber.
- auto-start new season on completion.
- weekly focus hints (week 1/2/3) as copy (not a complex mechanic).
- season summary: aggregates and progress.

Acceptance / DoD:
- user sees current season and a summary after day 21.

### 9.11. Epic K — Feedback + guardrails (progress-first) (P1 / optional)
Tasks:
- progress-first feedback model (no points economy in MVP by default).
- a lightweight “meaningful day” indicator (no harsh punishment).
- anti-abuse soft warnings:
  - no progress without clarity,
  - over-planning detection (splitting without starting),
  - too many micro-tasks → suggest merging.
- UI copy: positive, non-toxic feedback.

Acceptance / DoD:
- no celebration/reward is shown for passive browsing or app opens without meaningful actions.

### 9.12. Epic L — Instrumentation (local analytics for pilot) (P1 / optional)
Tasks:
- event schema.
- local event log + export (JSON/CSV).
- optional debug event viewer.

Acceptance / DoD:
- events can be exported and used to compute pilot metrics.

### 9.13. Epic M — Testing/QA + Release
Tasks:
- unit: rule engine, feedback/guardrails, transitions.
- integration: CRUD + migrations + import/export.
- E2E: onboarding → create campaign → create province → clarify → siege → tactic → daily move → season summary.
- release checklist: production build, deploy, README, user guide, known limitations, feedback form.

Acceptance / DoD:
- critical flows are stable; refresh never loses data.

## 10. Weekly execution plan (3 weeks)

### Week 1 — foundation and map (critical path)
Deliverables:
- bootstrap + base navigation.
- domain + persistence with import/export.
- campaign map + project map.
- create flows.

Week 1 exit (DoD):
- user creates campaign/region/province and sees them on a map.
- data persists across refresh; import/export works.

### Week 2 — core mechanics
Deliverables:
- rule engine: fog + transitions + progress.
- siege + 5 tactics.
- feedback v1 (progress-first, no points economy) + basic copy.
- province screen: actions and progress logic.

Week 2 exit (DoD):
- unclear tasks show as fog and can be clarified.
- stalled tasks enter siege and can be resolved via tactics.

### Week 3 — daily rhythm and adaptation
Deliverables:
- daily move + war council.
- season loop + season summary.
- optional: rule-based adaptation v1 (if time allows).
- optional: instrumentation for pilot (if time allows).
- tests/polish/deploy.

Week 3 exit (DoD):
- product is ready for a 21-day pilot: daily ritual, season, event export.

## 11. Risks and mitigations

- SVG map complexity → use 1–2 fixed templates; no procedural generation.
- “Gaming the system” → rewards only for meaningful actions; soft anti-abuse rules.
- Too much manual input → strict limit on required fields.
- “Too childish” perception → clean, minimal visual language; careful copy.
- Weak adaptation → log rule effectiveness and iterate quickly.

## 12. Open questions (decide before/early in implementation)

1. Dark mode in MVP (or P1)?
2. Demo/tutorial campaign during onboarding: confirm exact content + skip/reset behavior.
3. Template-based decomposition (no AI) in MVP?
4. Pomodoro timer in MVP (may distract from core hypothesis)?
5. Local reminders (if any) without push notifications?
