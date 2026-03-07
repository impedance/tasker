# RFC: Tasker — MVP browser-based strategy game for goal execution

Date: 2026-03-07  
Original (Russian): `rfc.ru.md`

## 1. Summary

Build an MVP browser-based **single-player strategy campaign** where the user’s real projects and tasks become provinces on a conquest map. The product should not only visualize progress but actively help users overcome procrastination, ambiguity, overwhelm, and emotional resistance — while making the world-state desirable on its own (Capital → front situation → map).

Working idea: the user “conquers” territories by doing real tasks, decomposing stalled projects, and taking small entry steps. The game must feel like a strategy game, but almost every meaningful game action must map to a real-world action on a task.

## 2. MVP goals

### Product goals
- Validate “map progress instead of task lists”.
- Increase the probability of starting stalled tasks.
- Increase decomposition of unclear work (not just postponing).
- Confirm users return daily for 3 weeks (pilot season).
- Make returning feel healthy and interesting, not guilt-driven.

### User goals
- See projects as a conquerable map.
- Quickly turn vague projects into concrete next steps.
- Get rewards for clarification, starting, and progress (not only completion).
- Get tips tailored to their resistance type.
- Recover from overload without feeling punished for slowing down.

### Non-goals (MVP)
- Full 4X (economy/diplomacy/AI opponents/multiplayer).
- Full-feature task manager (Notion/Todoist/Jira level).
- Complex backend (accounts/cloud sync/payments).
- Advanced ML (MVP uses rule-based adaptation).
- Toxic reward economies, random loot, and pressure-heavy social loops.

## 3. Product hypothesis

If we replace lists with a strategic project map and link in-game progression to real micro-actions, then:
1) starting tasks becomes easier;
2) stalled tasks are decomposed more often;
3) daily returns increase;
4) perceived progress is higher than with lists.

## 4. Target audience

Primary:
- People with many personal/work projects.
- Procrastinators due to ambiguity/overload/resistance.
- People bored by standard task manager UI.

Secondary:
- Freelancers/solo founders/knowledge workers.
- Strategy/RPG progression fans.

## 5. Product principles

1) Game progress must be grounded in real progress.  
2) Reward not only “finish”, but also “good start”.  
3) A stalled task is not punished; it moves into another interaction mode.  
4) The game must not require heavy manual input.  
5) MVP must be simple, offline-capable, and backend-free.  
6) It must look like a strategy map, not a to-do list with badges.  
7) Adaptation is rule-based in MVP.  
8) The game should support rhythm, recovery, and reflection, not only conquest.  
9) No reward should be granted for passive app opens or empty engagement.  
10) Sharing must be privacy-safe and artifact-based, not socially coercive.
11) Copy must be layered: fantasy-first terms on map/home surfaces, but plain language on action screens (outcome/first step/entry time). Never hide the real-world meaning once the user is inside an action.
12) Pressure must be ambient and strategic, never punitive (no territory loss, no snowball punishment).
13) Home must feel like a **capital**, not a dashboard: it exists to make the campaign state legible and desirable, not to add forms.

## 6. Conceptual model

### Metaphor mapping
- Campaign = project
- Region = phase / large task
- Province = concrete task/subtask
- Fog of war = ambiguity
- Siege = stalling/resistance
- Supply = reducing friction / preparing context
- Assault = action now
- Morale = emotional state
- Commander check-in = pre-action ritual
- War council = end-of-day planning ritual
- Season Debrief = end-of-season reflection ritual

### Meaning
The product should make “the path” visible and rewarding: clarification, splitting, starting, maintaining focus—not just finishing.

## 7. Why this stack (MVP)

Recommended:
- React + TypeScript + Vite
- Zustand for state
- localForage (IndexedDB) for storage
- SVG map + CSS animations for visuals
- Vitest + RTL (unit/integration), Playwright (E2E)
- Deploy via Vercel/Netlify/GitHub Pages

Rationale:
- SVG keeps the map in the DOM: native click/hover events, CSS class-based state coloring, and cheap HTML tooltips.
- localForage (IndexedDB) avoids `localStorage` size limits and blocking writes; persistence stays async and resilient.
- Zustand keeps state wiring lightweight (fewer abstractions than Redux) while still being testable and persistence-friendly.
- If later needed, the map layer can be upgraded (Canvas/Phaser) without rewriting domain rules.

## 8. MVP boundaries

Included:
- Local-only app, no registration, 1 user.
- Shogunate / Warring Provinces fantasy layer (stylized; not historical reconstruction).
- Demo mission (tutorial campaign) onboarding.
- Capital Lite (default daily entry hub).
- Chronicle Lite (human-readable campaign history) as a first-class screen.
- Hero Moments Lite (capped celebratory overlays after meaningful action).
- Seasonal fantasy naming (auto-generated + editable).
- Campaign map + region map (regions + provinces) in SVG.
- Creation of campaigns/regions/provinces.
- Province states (fog/siege/in_progress/captured/etc).
- Province roles (lightweight flags) and role icons.
- Anti-procrastination tactics (5).
- Baseline rule-based recommendations v1 (non-personalized).
- 21-day season loop + daily ritual.
- Basic stats.
- JSON import/export.

Backlog:
- Privacy-safe share cards and export artifacts.
- Richer Chronicle (filters, recap cards).
- Richer capital cosmetics (purely visual).
- Multiplayer/alliances, cloud sync, mobile app.
- AI decomposition, procedural maps.
- Complex economy, avatars, diplomacy, PvP.
- Push notifications, calendar integration, A/B testing, ML recommender.
- Dynamic reward economies, random loot, or pressure-heavy social loops.

## 9. Core user flows

1) First run: demo mission (tutorial campaign) → clear first fog → resolve first siege ritual → first hero moment → Chronicle entry → arrive at Capital.  
2) Unclear task: open province → fog → fill outcome/first step/entry time → fog removed.  
3) Stalled task: no updates N days → siege → pick a tactic → task becomes actionable or is retreated/rescheduled.  
4) Daily return: Capital → Daily Orders (3 orders: light/medium/main) → do one → see map feedback (route + state change) → Chronicle updated.  
5) End of day: war council → write 1–3 if-then plans → close the day.  
6) End of season: Season Debrief (narrative + strategy) → carry forward useful patterns and drop stale fronts → start next season.

## 10. Data entities (MVP, plus optional P1)

Campaign:
- id, title, description, colorTheme, createdAt, seasonId, status, regionIds[], archetype?
- factionId?, factionName?, bannerStyle?
- seasonFantasyName?
- chronicleEnabled (default true)
- capitalProvinceId? (or capitalRegionId?)

Region:
- id, campaignId, title, description, order, provinceIds[], progressPercent, status
- mapRole? (core/frontier/archive/supply/neutral)
- pressureLevel?
- adjacentRegionIds[]?

Province:
- id, regionId, title, description
- desiredOutcome, firstStep, estimatedEntryMinutes
- dueDate?, effortLevel(1–5), clarityLevel(1–5), emotionalFrictionType
- state, progressStage, resistanceTags[]
- updatedAt, createdAt
- provinceRole? (standard/fortress/watchtower/archive/depot)
- adjacentProvinceIds[]
- frontPressureLevel?
- lastMeaningfulActionAt?
- heroMomentShownAt?
- isHotspot?

DailyMove:
- id, date, provinceId, moveType (raid/supply/scout/assault/retreat), durationMinutes, result

PlayerCheckIn:
- id, date, energyLevel, availableMinutes, emotionType, recommendedMoveIds[], selectedMoveId

SiegeEvent:
- id, provinceId, triggeredAt, reasonType, selectedTactic, resolvedAt

PlayerProfile:
- id=local, preferredWorkWindow, frictionStats, streaks,
  totalCaptured/Clarified/Started/Completed, currentSeasonId

Season:
- id, title, startedAt, endsAt, dayNumber, goals, score

SeasonReview:
- id, seasonId, workedWell[], mainObstacles[], carryForward[], dropList[]

HeroMoment:
- id, type, provinceId?, seasonId, triggeredAt, shareCardId?

ShareCard (P1 / optional):
- id, type, seasonId?, generatedAt, privacyMode, payload

IfThenPlan:
- id, provinceId, triggerText, actionText, scheduledFor

ChronicleEntry:
- id, campaignId, seasonId?, provinceId?, regionId?, entryType, title, body?, createdAt, importance (low/medium/high)

CapitalState:
- campaignId, visualTier, unlockedDecor[], lastViewedAt

## 11. Province states (MVP)

States:
- `fog` — unclear
- `ready` — clear and available
- `siege` — stalled
- `in_progress` — started
- `fortified` — too large/heavy
- `captured` — done
- `retreated` — consciously deferred/removed

Transitions:
- fog → ready: clarity fields filled
- ready → in_progress: first real step recorded
- ready → siege: no movement for N days (MVP: N=3)
- ready → fortified: high effort + no decomposition
- siege → ready: tactic applied successfully
- in_progress → captured: user marks done
- any → retreated: user retreats/reschedules

## 12. MVP mechanics

### 12.1. Stage-based capture
Progress stages (example):
- scouted (15%)
- prepared (30%)
- entered (55%)
- held (80%)
- captured (100%)

### 12.2. Fog of war
If outcome/first step/entry time are missing, the province is fogged and visually blocked.

### 12.3. Siege
If there is no movement for X days, province becomes `siege` (MVP: X=3).

### 12.4. Tactics (siege resolution)
- Scout
- Supply
- Engineer (split)
- 5-minute raid
- Retreat (reschedule/remove)

### 12.5. Morale (signal)
User can mark a feeling: anxiety, boredom, fatigue, irritation, fear of outcome, ambiguity. The system uses it to suggest tactics/moves.

### 12.6. Daily Orders
Every day show 3 options: light (5m), medium (15m), main (25m+).

### 12.6.1. Commander check-in
Before recommendations, the user can optionally declare current emotion, energy, and available time.
The system uses it as a short ritual and must explain why the suggested moves fit the current state.

### 12.7. War council
At the end of the day, write 1–3 if-then plans.

### 12.7.1. Season Debrief
At the end of the 21-day season, present a short review flow:
- what worked;
- what repeatedly caused siege;
- which tactics helped;
- what to carry forward;
- what to release.

### 12.8. Rewards (MVP)
Progress-first: progressStage changes + short feedback copy + a lightweight “meaningful day” marker. No points economy by default; rewards only for real steps (or meaningful clarification).

### 12.9. Hero moments (MVP Lite)
Short celebratory feedback is allowed only after meaningful actions and must never replace task progress.

### 12.10. Pressure Layer (non-AI opposition, MVP)
Pressure is ambient and strategic:
- fog/siege/fortified are primary pressure states;
- repeated retreat and chronic stalling increase “front pressure” highlights around hotspots;
- pressure must never remove captured territory or punish missing days.

### 12.11. Province roles (MVP)
Provinces can have lightweight roles (flags) that shape icons, recommended tactics, and Chronicle phrasing:
standard, fortress, watchtower, depot, archive, capital-adjacent.

### 12.12. Command movement + Supply lines (MVP)
In MVP, the “moving” entity is an order (not units). Selecting an action draws a short route from Capital to the target province as a feedback affordance (not a logistics simulator).

### 12.13. Capital Lite + Chronicle Lite (MVP)
- Capital is the daily entry hub showing season/campaign naming, clan banner, front situation, hotspots, and fast CTAs into Daily Orders / maps / Chronicle.
- Chronicle is a human-readable campaign memory layer (short “chronicle lines”), not an analytics log.

### 12.10. Safe sharing (P1)
Sharing is limited to exportable privacy-safe artifacts such as weekly map cards and season comparison cards.

## 13. Rule-based adaptation (v1)

The system tracks where the user gets stuck and adjusts suggestions:
- ambiguity
- too large scope
- emotional aversion
- low energy
- low time
- low urgency (no deadlines)

Examples:
- 3+ “ambiguous” in a row → push Scout + first-step template.
- effort 4–5 often stalls → suggest splitting to 15-minute chunks.
- raid often succeeds → boost raids in Daily Orders.
- morning success → recommend main assault in the morning.
- no deadlines → suggest a soft deadline.
- low energy + low available time → prefer recovery/light moves over main assaults.
- repeated successful tactics → surface them in a personal codex/history layer.

## 14. Season (21-day cycle)

Structure:
- Week 1: scouting and clarifying the map.
- Week 2: sieges and systematic starts.
- Week 3: sustaining tempo and closing regions.

Season metrics:
- provinces clarified
- sieges resolved
- tasks completed
- meaningful days
- integration review completion
- share-card generation/export rate

## 15. UX/UI requirements

Style:
- minimal strategy UI
- map is the main screen
- minimal tables; mostly visual states

Main screens:
demo mission, capital, campaign map, region map, province drawer, siege, commander check-in (optional), daily orders, war council, chronicle, season summary/debrief, settings (export/import, accessibility).

Constraints:
- max 3–5 required fields per task.
- max 1–2 clicks to get to a real action.
- no “CRM feeling”.
- every stalled task leads to a short ritual.
- no guilt/FOMO mechanics.
- no rewards for opening the app without a meaningful action.
- public sharing must hide private task text by default.

## 16. Non-functional requirements

- SPA, desktop-first but mobile-friendly.
- Works offline; local persistence.
- Fast cold start; first meaningful interaction < 10 seconds.
- Robust across refresh.
- JSON import/export.

## 17. Architecture decisions (MVP)

- Component-driven UI.
- Zustand stores.
- Domain models separated from UI.
- Game rules as pure functions.
- Storage adapter separated from UI.
- Recommendation engine separated.
- Versioned serialization.

Suggested folders:
`src/app`, `src/pages`, `src/entities`, `src/features`, `src/game`, `src/storage`, `src/shared`.

## 18. Progression rules (feedback-first)

- MVP: stage-based progress + meaningful-day marker.
- Optional (v0.2+): points buckets (clarify/momentum/capture/recovery) if needed for analytics or richer feedback.

Streak:
- “meaningful-day streak” (>=1 meaningful move per day)
- streak breaks softly; territory never resets

Balance: reward starts, honest decomposition, completions, and returning after a break. Avoid farming and mindless “done”.

## 19. Anti-abuse rules (soft)

- No meaningful progress without clarity.
- Too frequent splitting without starting → mark as over-planning.
- Too many micro-tasks → suggest merging.
- No rewards for opening the app without action.

Contracts:
- Engagement/recovery guardrails: `epics/EPIC-01-foundation.md` (Appendix A).
- Local analytics event schema: `epics/EPIC-01-foundation.md` (Appendix B).

## 20. MVP success metrics

Product:
- D1/D7 retention
- meaningful days over 21 days
- clarified tasks per user
- sieges resolved per user
- share of tasks with first step
- share of fog → ready

Behavioral:
- time to first step
- time from siege to tactic selection
- tactic → progress conversion rate
- session duration
- start within 24 hours after an intervention (Daily Orders / siege / review), via `epics/EPIC-01-foundation.md` (Appendix B)

Qualitative:
- “easier to start”
- “more interesting to return”
- “feels like a game”

## 21. Experimental hypotheses

1) Stage-based capture increases returns.
2) Siege reduces churn after missed days.
3) Daily Orders increases chance of 1 meaningful action/day.
4) War council reduces next-day chaos.
5) Rule-based adaptation boosts starts vs generic hints.

## 22. Epics (high-level backlog)

See detailed epic breakdown in `epics/00-index.md`.

## 23. Development priorities

P0:
bootstrap, local storage, maps, creation, onboarding (demo mission), **capital shell**, **chronicle**, fog, siege + 5 tactics, province roles, pressure layer (front pressure highlights), daily orders, war council, season + debrief, import/export, baseline rule-based recommendations + “why”.

P1:
animations, move history, extended stats, rule-based adaptation (history-driven personalization), feedback/guardrails polish, local instrumentation (if time allows).

P2:
multiplayer, AI decomposition, procedural maps, cross-device sync.

## 24. 3-week execution plan (rough)

Week 1: foundation + persistence + maps + creation + navigation.  
Week 2: core mechanics (fog/siege/tactics/feedback/province screen).  
Week 3: daily loop + war council + season + tests + deploy (optional: adaptation + instrumentation).

## 25. Risks

- SVG map complexity → use fixed templates.
- System gaming → rewards only for meaningful actions + anti-abuse.
- Too much input → strict required-field limit.
- Too childish → clean visual language + careful copy.
- Weak adaptation → log rule effectiveness and iterate.

## 26. Open questions

- Dark mode in MVP?
- Faction/theme customization scope (MVP: banner + naming only; no economy/diplomacy).
- Demo/tutorial campaign in onboarding: confirm exact content + skip/reset behavior.
- Template-based decomposition (no AI)?
- Pomodoro timer in MVP?
- Local reminders (no push)?

## 27. Release recommendation

v0.1: one campaign map type, one project map type, manual creation, one theme, local storage, working daily loop.  
v0.2: improved adaptation, extended stats, templates, optional local instrumentation.

## 28. Product pitch (final)

Tasker is a browser strategy game for personal project execution: real tasks become provinces on a map, and procrastination is treated as a game situation—fog of war, sieges, and supply issues—solved by short rituals and tactics. The MVP must prove that a map, anti-procrastination loops, and a 21-day season can make task execution more engaging and more sustainable than a traditional list.
