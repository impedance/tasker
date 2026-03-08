# PRD: Tasker — MVP browser-based strategy game for goal execution

Date: 2026-03-07  
System of record: this document (`prd.md`)  
Epic backlog (system of record): `epics/00-index.md`  
Note: RFC content was merged into this PRD on 2026-03-07.

## 0. Context and problem

Users with many personal/work projects often get stuck not because of laziness, but due to:
- unclear next steps;
- overload and lack of visible progress;
- emotional resistance;
- high friction to start.

MVP hypothesis: if we replace a to-do list with a strategic map of projects and tie game progress to real micro-actions, it becomes easier to start and keep moving.

## 1. Goals and non-goals

### 1.0. Primary experiential goal
The user should primarily perceive Tasker as a **single-player strategy campaign** about reclaiming control over a fractured realm; real task progress is the only fuel that advances the world, but the first impression is a desirable world-state (capital → front situation → map).

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

### 1.4. Product principles (MVP)
1) Game progress must be grounded in real progress.  
2) Reward “good start” and clarification, not only completion.  
3) Stalling is a game situation (siege), not a moral failure; no punishment loops.  
4) The game must not require heavy manual input (strict field budget).  
5) MVP is simple, offline-capable, backend-free.  
6) It must look/feel like a strategy map, not a to-do list with badges.  
7) Adaptation is rule-based in MVP.  
8) Support rhythm, recovery, and reflection — not only conquest.  
9) No rewards for passive app opens or passive browsing.  
10) Pressure is ambient and strategic; never punitive (no territory loss, no streak shame).  
11) Copy is layered: fantasy-first on map/home surfaces, plain language on action screens.  
12) Sharing is artifact-based and privacy-safe by default; never socially coercive.  
13) Home must feel like a capital (world-state first), not a dashboard of forms.

## 2. Users and scenarios

### 2.1. Primary audience
- Knowledge workers with many parallel projects.
- People who procrastinate due to ambiguity/overload/resistance.
- Users who dislike “task manager UI”.

### 2.2. Key scenarios (MVP + near-term extensions)
1. First run → demo mission (tutorial campaign) → first fog clear → first siege ritual → first hero moment → Chronicle entry → arrive at Capital.
2. Daily return → Capital shows front situation + hotspots → Daily Orders → execute 1 meaningful move → immediate map feedback → Chronicle updated.
3. First creation flow → create campaign → pick a clan banner + season name → 1–3 regions → tasks/provinces → region map “comes alive”.
4. Unclear task → fog of war → fill outcome/first step/entry time → fog is removed.
5. Stalled task → siege after N days → choose a tactic → resolve siege (or retreat/reschedule).
6. Commander check-in → Daily Orders → 3 orders (light/medium/main) → do one → world feedback (route + state change) + Chronicle entry.
7. End of day → war council → 1–3 if-then plans → close the day without chaos.
8. End of season → Season Debrief (narrative + strategy) → carry forward what worked and drop what should not continue → next season starts.

## 3. Success metrics and measurability

### 3.1. Product metrics
- D1/D7 retention (for pilot: cohort-relative comparison is sufficient).
- Mean “meaningful days” per season (21 days): days with at least 1 meaningful move.
- `capital_visits_per_meaningful_day`
- `chronicle_open_rate`
- `hero_moment_seen_after_real_action_rate`
- `desire_to_return_for_world_state` (survey-backed)
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
- Shogunate / Warring Provinces fantasy layer (copy + minimal theming; not historical reconstruction).
- Capital Lite (home hub) as the default daily entry surface.
- Chronicle Lite (human-readable campaign history) as a first-class screen.
- Hero Moments Lite (capped celebratory overlays) for meaningful milestones.
- Seasonal fantasy naming (auto-generated + editable campaign/season names).
- Province roles (lightweight flags) + role icons.
- Campaign map + region map in SVG (clickable regions/provinces).
- First-run onboarding with a demo/tutorial campaign (fast “first win”, skippable).
- CRUD: campaigns/regions/provinces.
- Province states + transitions via rule engine.
- Fog-of-war (clarity: outcome/first step/entry time).
- Siege (trigger: N=3 days without meaningful action) + 5 tactics.
- Pressure Layer (ambient non-AI opposition): fog/siege/fortified/front pressure (soft, never punitive).
- Stage-based province progress (not binary) with world-facing capture naming.
- Daily Orders (3 orders) + War council (if-then plans).
- Season (21 days): season day + season summary + Season Debrief.
- Baseline rule-based recommendations v1 + “why” explanation (non-personalized).

### 4.2. P1 (nice-to-have if time allows)
- Capture/fog animations and solid feedback copy.
- Daily Orders history.
- Extended season stats.
- Rule-based adaptation v1 (history-driven personalization).
- Privacy-safe shareable map cards.
- Tactics codex / personal strategy insights.
- Richer capital cosmetics (purely visual).
- Richer Chronicle (filters, highlights, recap cards).
- Stronger clan identity (more banner styles, optional lore snippets).

### 4.3. P2 (later)
- Multiplayer, cloud, mobile app, AI decomposition, procedural maps.

### 4.4. MVP boundaries (explicit)
Included:
- Local-only app (1 user), no registration.
- Demo/tutorial onboarding campaign.
- Capital (home hub) + Chronicle (memory layer) are P0 (world-state first).
- Rule-based recommendations (baseline) and optional rule-based adaptation (P1).

Explicitly excluded from MVP:
- Backend features: accounts, cloud sync, payments, online sharing.
- Competitive/social loops: feeds, leaderboards, coercive streak mechanics.
- Complex economy/diplomacy/AI opponents.

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
- Visual direction (MVP): a clean “political/front map” aesthetic (readability-first) similar to classic grand strategy war maps, with Shogunate theming expressed via iconography/copy rather than painterly terrain.

### 5.2. Product screens (MVP + P1 IA)
1. Demo mission (tutorial campaign)
2. Capital (Home)
3. Campaign map (overview)
4. Region map (primary play surface)
5. Province Drawer (action panel)
6. Siege screen (ritual)
7. Daily Orders (3 orders: light/medium/main)
8. War council (if-then plans)
9. Chronicle (campaign history)
10. Season Debrief (end-of-season debrief)
11. Settings (import/export, accessibility)

### 5.3. Map interactions
- Hover/selected states.
- Color status by province state (fog/ready/siege/in_progress/fortified/captured/retreated).
- Soft transitions when status changes.
- Responsive scaling (desktop-first, mobile-friendly).
- Front-style overlays: pressure/hotspots should read like “frontline attention” highlights, not like terrain or decorative art.

### 5.4. Non-functional requirements (MVP)
- Browser SPA, no backend.
- Offline-first: usable without network after initial load.
- Local persistence; resilient to refresh/tab restart.
- Fast cold start: first meaningful interaction < 10 seconds.
- Mobile-friendly (not perfect mobile UX); desktop-first priority.
- State import/export in JSON.

## 6. Game model and rules (MVP)

Conceptual model: the product should make “the path” visible and rewarding — clarification, splitting, starting, and maintaining focus — not just finishing.

### 6.1. Terms (metaphor)
- Campaign = project
- Region = phase / large task
- Province = task / subtask
- Capital = home hub (campaign seat)
- Chronicle = campaign history (“chronicle lines”)
- Fog = ambiguity
- Siege = stalling/resistance
- Supply = reducing friction / preparing context
- Assault = action now (a real step)
- Commander check-in = short pre-action ritual that captures current state
- Daily Orders = “daily turn” (3 orders)
- War council = evening ritual (if-then plans)
- Season Debrief = post-season reflection ritual

### 6.2. Province progress (stages)
Provinces have stage-based progress (example scale):
- scouted: 15% (fog cleared / clarity achieved)
- prepared: 30% (supply or engineer/split applied; entry is easier)
- entered: 55% (first real step recorded)
- held: 80% (sustained progress / repeat action)
- captured: 100% (completed)

Important: stage increases must be tied to real action (or meaningful clarification).
Contract source of truth for stage updates: `epics/EPIC-01-foundation.md` (Appendix G).

### 6.3. Province states (state machine)
States:
- `fog` — unclear (required clarity fields are missing)
- `ready` — clear and available
- `siege` — no **meaningful action** for N days (MVP: 3 days)
- `in_progress` — started
- `fortified` — too large/heavy (rule: high effort + no decomposition)
- `captured` — completed
- `retreated` — consciously deferred/removed

Transitions (MVP):
- fog → ready: outcome/firstStep/estimatedEntryMinutes filled
- ready → in_progress: first real step is recorded (move)
- ready → siege: no meaningful action for N days (use `lastMeaningfulActionAt`, fallback `createdAt`)
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
Contract source of truth for “real step” and move logging: `epics/EPIC-01-foundation.md` (Appendix I).

### 6.6. Daily Orders (3 orders)
Every day show 3 suggestions:
- light move (~5 minutes),
- medium move (~15 minutes),
- main move (25+ minutes).

Recommendations are rule-based using:
states, move history, friction, and time-of-day activity.

### 6.7. War council (if-then plans)
In the evening, the user writes 1–3 if-then plans:
“If (trigger), then (action)”, linked to a province and/or time.

### 6.8. Season Debrief
At the end of the 21-day season, the user completes a short debrief:
- what worked;
- where sieges repeated;
- which tactics helped;
- what to carry into the next season;
- what to let go.

The review should take about 1–2 minutes and support an immediate next-season start.

### 6.9. Hero moments (MVP Lite)
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

### 6.10. Pressure Layer (non-AI opposition, MVP)
Pressure is ambient and strategic, never punitive:
- fog/siege/fortified remain the core states;
- “front pressure” is a map-level highlight around hotspots (stalled/fortified/repeatedly retreated provinces) to make strategy legible;
- pressure must not remove already captured territory or snowball against the user.

### 6.11. Capital Lite (MVP)
Capital is the default entry and daily hub: campaign + season naming, clan banner, front situation (fog/siege/hotspots), and fast CTAs into Daily Orders / Chronicle / maps.

### 6.12. Chronicle Lite (MVP)
Chronicle is a human-readable campaign memory layer:
- entries are written as short “chronicle lines” after meaningful actions (fog cleared, siege resolved, region captured, meaningful-day streak milestones, season end);
- it is not an analytics event log; it exists to strengthen world attachment.

### 6.13. Safe sharing (P1)
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
- `factionId?`, `factionName?`, `bannerStyle?`
- `seasonFantasyName?`
- `chronicleEnabled` (default `true`)
- `capitalProvinceId?` (or `capitalRegionId?`)

Region:
- `id`, `campaignId`, `title`, `description?`, `order`, `provinceIds[]`, `progressPercent`, `status`
- `mapTemplateId` (default: `region_v1`)
- `mapRole?` (`core | frontier | archive | supply | neutral`)
- `pressureLevel?`
- `adjacentRegionIds[]?`

Province:
- `id`, `regionId`, `title`, `description?`
- `desiredOutcome?`, `firstStep?`, `estimatedEntryMinutes?` (required to exit `fog` and become `ready`)
- `mapSlotId?` (binds province to a fixed SVG slot in the region template; if missing, province is still playable via an “unplaced provinces” list)
- `dueDate?`, `effortLevel(1..5)`, `clarityLevel(1..5)`, `emotionalFrictionType?`
- `state` (`fog | ready | siege | in_progress | fortified | captured | retreated`)
- `progressStage` (`scouted | prepared | entered | held | captured`)
- `resistanceTags[]`
- `provinceRole?` (`standard | fortress | watchtower | archive | depot`)
- `decompositionCount` (default `0`)
- `contextLinks[]?`, `contextNotes?` (used by Supply)
- `adjacentProvinceIds[]` (for adjacency-driven map logic)
- `frontPressureLevel?` (`0..3`)
- `lastMeaningfulActionAt?` (meaningful actions only; used for siege detection)
- `heroMomentShownAt?`
- `isHotspot?`
- `updatedAt` (any persisted mutation), `createdAt`

DailyMove:
- `id`, `date`, `provinceId`, `moveType`, `durationMinutes`, `result`
  - `moveType` (suggested enum): `scout | supply | engineer | raid | assault | retreat`
  - `result` (suggested enum): `started | progressed | clarified | prepared | completed | retreated | skipped | blocked`

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
- `id`, `type`, `provinceId?`, `seasonId`, `triggeredAt`, `shownAt?`, `shareCardId?`

ChronicleEntry:
- `id`, `campaignId`, `seasonId?`, `regionId?`, `provinceId?`
- `entryType`, `title`, `body?`, `importance` (`low | medium | high`)
- `createdAt`

CapitalState:
- `campaignId`, `visualTier`, `unlockedDecor[]`, `lastViewedAt`

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

Status note (2026-03-08):
- This section defines the target MVP stack and module layout.
- The current bootstrap repository already uses React, TypeScript, Vite, React Router, localForage, zod, Vitest, and Playwright.
- Zustand, shadcn/ui, Radix Primitives, Lucide, and `react-zoom-pan-pinch` are planned choices for later epics; they are not yet part of the installed baseline.

Stack:
- React + TypeScript + Vite
- React Router
- Zustand (state management)
- localForage (IndexedDB)
- shadcn/ui (base UI components, as open code)
- Radix Primitives (interaction/accessibility primitives; used directly or via shadcn)
- SVG map + CSS tokens/variables (state-driven styling)
- react-zoom-pan-pinch (map pan/zoom for MVP)
- Motion (selective animation only: state changes + “hero moments”, reduced-motion safe defaults)
- Lucide (temporary system icons; world/map identity uses custom SVG assets)
- Vitest + React Testing Library; Playwright for E2E

Rationale (MVP):
- SVG keeps the map in the DOM (native hover/click, cheap state coloring).
- IndexedDB via localForage avoids `localStorage` size limits and blocking writes.
- Zustand keeps state wiring lightweight while remaining testable/persistable.
- shadcn/Radix reduce UI “low-level” effort without locking the product into a dashboard look.
- A lightweight pan/zoom wrapper is enough for MVP; avoid GIS/canvas/WebGL engines until proven necessary.

Architecture principles:
- domain rules and state transitions live in `game/rules` as pure functions;
- UI contains no rule business logic;
- storage adapter is isolated (`storage/...`);
- recommendation engine is separate.
- Map implementation is split into layers:
  - visual SVG template (slots/paths/labels);
  - map meta (anchors, labels, role badge slots);
  - adjacency/graph data (neighbors), independent from the SVG.

Suggested module layout:
`src/app`, `src/pages`, `src/entities`, `src/features`, `src/game`, `src/map`, `src/storage`, `src/shared`.

## 9. Delivery plan and epic backlog (system of record)

System of record for the detailed “executable” plan (tasks/DoD/acceptance criteria) is the `epics/` folder:
- Index: `epics/00-index.md`
- Foundation contracts (meaningful action, time boundary, event schema, guardrails): `epics/EPIC-01-foundation.md`

Epic map (high level):
- Product foundation contract: `epics/EPIC-01-foundation.md`
- Tech bootstrap: `epics/EPIC-02-bootstrap.md`
- Domain + persistence: `epics/EPIC-03-domain-persistence.md`
- Map UI + navigation: `epics/EPIC-04-map-ui.md`
- Creation flows: `epics/EPIC-05-creation-flows.md`
- Rule engine: `epics/EPIC-06-rule-engine.md`
- Siege + tactics: `epics/EPIC-07-siege-tactics.md`
- Daily loop (Daily Orders + War council): `epics/EPIC-08-daily-loop.md`
- Adaptation (P1): `epics/EPIC-09-adaptation.md`
- Season + debrief: `epics/EPIC-10-season.md`
- Scoring/feedback/anti-abuse: `epics/EPIC-11-scoring-feedback.md`
- Instrumentation (P1): `epics/EPIC-12-instrumentation.md`
- QA/release: `epics/EPIC-13-qa-release.md`
- Safe sharing/export artifacts (P1): `epics/EPIC-14-engagement-sharing.md`
- World shell (Capital/Chronicle/theme): `epics/EPIC-15-world-shell.md`

## 10. Weekly execution plan (3 weeks)

### Week 1 — foundation and map (critical path)
Deliverables:
- EPIC-02 bootstrap + base navigation.
- EPIC-03 domain + persistence with import/export.
- EPIC-04 campaign/region maps + navigation.
- EPIC-05 create flows.

Week 1 exit (DoD):
- user creates campaign/region/province and sees them on a map.
- data persists across refresh; import/export works.

### Week 2 — core mechanics
Deliverables:
- EPIC-06 rule engine: fog + transitions + stage progress.
- EPIC-07 siege + 5 tactics.
- EPIC-11 feedback/anti-abuse guardrails (baseline).

Week 2 exit (DoD):
- unclear tasks show as fog and can be clarified.
- stalled tasks enter siege and can be resolved via tactics.

### Week 3 — daily rhythm and adaptation
Deliverables:
- EPIC-08 daily move + war council.
- EPIC-10 season loop + season summary + debrief.
- Optional: EPIC-09 adaptation v1 (P1).
- Optional: EPIC-12 instrumentation for pilot (P1).
- EPIC-13 tests/polish/release checklist.

Week 3 exit (DoD):
- product is ready for a 21-day pilot: daily ritual + season loop + release checklist.
- if EPIC-12 ships: event export is available for pilot analysis.

## 11. Risks and mitigations

- SVG map complexity → use 1–2 fixed templates; no procedural generation.
- UI drifts into a dashboard/to-do app → enforce map-first surfaces + copy layering; use shadcn/Radix only as interaction mechanics, not as a layout/style template.
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

## 13. Experimental hypotheses (to validate in the pilot)
1) Stage-based progress increases daily returns vs binary done/not-done.  
2) Siege rituals reduce churn after missed days and lower restart friction.  
3) Daily Orders increases the chance of 1 meaningful action/day.  
4) War council (if-then plans) reduces next-day chaos and helps restart.  
5) Rule-based adaptation improves starts vs generic hints (P1).

## 14. Release recommendation (pilot)
- v0.1: one map template, manual creation, local storage, daily loop, season + debrief, import/export.
- v0.2: improved adaptation, extended stats, optional local instrumentation, safe share cards (P1).

## 15. Product pitch (one paragraph)
Tasker is a browser strategy game for personal project execution: real tasks become provinces on a map, and procrastination becomes a game situation — fog of war, sieges, and supply issues — solved by short rituals and tactics. The MVP proves that a map-first UI, anti-procrastination loops, and a 21-day season can make task execution more engaging and more sustainable than a traditional list.
