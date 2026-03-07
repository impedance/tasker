# RFC: Tasker — MVP browser-based strategy game for goal execution

Date: 2026-03-06  
Original (Russian): `rfc.ru.md`

## 1. Summary

Build an MVP browser-based strategy game where the user’s real projects and tasks become a conquest map. The product should not only visualize progress but actively help users overcome procrastination, ambiguity, overwhelm, and emotional resistance.

Working idea: the user “conquers” territories by doing real tasks, decomposing stalled projects, and taking small entry steps. The game must feel like a strategy game, but almost every meaningful game action must map to a real-world action on a task.

## 2. MVP goals

### Product goals
- Validate “map progress instead of task lists”.
- Increase the probability of starting stalled tasks.
- Increase decomposition of unclear work (not just postponing).
- Confirm users return daily for 3 weeks (pilot season).

### User goals
- See projects as a conquerable map.
- Quickly turn vague projects into concrete next steps.
- Get rewards for clarification, starting, and progress (not only completion).
- Get tips tailored to their resistance type.

### Non-goals (MVP)
- Full 4X (economy/diplomacy/AI opponents/multiplayer).
- Full-feature task manager (Notion/Todoist/Jira level).
- Complex backend (accounts/cloud sync/payments).
- Advanced ML (MVP uses rule-based adaptation).

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
- War council = end-of-day planning ritual

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

Rationale: SVG is fast to iterate and keeps complexity low. If later needed, the map can be moved to Phaser.

## 8. MVP boundaries

Included:
- Local-only app, no registration, 1 user.
- Campaign map + project map (regions + provinces).
- Creation of campaigns/regions/provinces.
- Province states (fog/siege/in_progress/captured/etc).
- Anti-procrastination tactics (5).
- Rule-based adaptation v1.
- 21-day season loop + daily ritual.
- Basic stats.
- JSON import/export.

Backlog:
- Multiplayer/alliances, cloud sync, mobile app.
- AI decomposition, procedural maps.
- Complex economy, avatars, diplomacy, PvP.
- Push notifications, calendar integration, A/B testing, ML recommender.

## 9. Core user flows

1) First run: onboarding → create campaign → add 1–3 regions → add tasks → see the map filled.  
2) Unclear task: open province → fog → fill outcome/first step/entry time → fog removed.  
3) Stalled task: no updates N days → siege → pick a tactic → task becomes actionable or is retreated/rescheduled.  
4) Daily turn: see 3 recommended actions (light/medium/main) → do one → see map feedback.  
5) End of day: war council → write 1–3 if-then plans → close the day.

## 10. Data entities (MVP)

Campaign:
- id, title, description, colorTheme, createdAt, seasonId, status, regionIds[]

Region:
- id, campaignId, title, description, order, provinceIds[], progressPercent, status

Province:
- id, regionId, title, description
- desiredOutcome, firstStep, estimatedEntryMinutes
- dueDate?, effortLevel(1–5), clarityLevel(1–5), emotionalFrictionType
- state, progressStage, resistanceTags[]
- updatedAt, createdAt

DailyMove:
- id, date, provinceId, moveType (raid/supply/scout/assault/retreat), durationMinutes, result

SiegeEvent:
- id, provinceId, triggeredAt, reasonType, selectedTactic, resolvedAt

PlayerProfile:
- id=local, preferredWorkWindow, frictionStats, streaks,
  totalCaptured/Clarified/Started/Completed, currentSeasonId

Season:
- id, title, startedAt, endsAt, dayNumber, goals, score

IfThenPlan:
- id, provinceId, triggerText, actionText, scheduledFor

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
- decomposed (30%)
- started (55%)
- sustained (80%)
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

### 12.6. Daily move
Every day show 3 options: light (5m), medium (15m), main (25m+).

### 12.7. War council
At the end of the day, write 1–3 if-then plans.

### 12.8. Rewards (MVP)
Simple: influence points, intel, supplies, morale/streaks. Rewards only for real steps (or meaningful clarification).

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
- raid often succeeds → boost raids in daily move.
- morning success → recommend main assault in the morning.
- no deadlines → suggest a soft deadline.

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

## 15. UX/UI requirements

Style:
- minimal strategy UI
- map is the main screen
- minimal tables; mostly visual states

Main screens:
onboarding, campaign map, project map, province, siege, daily move, war council, season summary, settings (export/import).

Constraints:
- max 3–5 required fields per task.
- max 1–2 clicks to get to a real action.
- no “CRM feeling”.
- every stalled task leads to a short ritual.

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

## 18. Progression rules (scoring)

- Clarify points
- Momentum points
- Capture points
- Recovery points

Streak:
- “meaningful-day streak” (>=1 meaningful move per day)
- streak breaks softly; territory never resets

Balance: reward starts, honest decomposition, completions, and returning after a break. Avoid farming and mindless “done”.

## 19. Anti-abuse rules (soft)

- No meaningful progress without clarity.
- Too frequent splitting without starting → mark as over-planning.
- Too many micro-tasks → suggest merging.
- No rewards for opening the app without action.

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

Qualitative:
- “easier to start”
- “more interesting to return”
- “feels like a game”

## 21. Experimental hypotheses

1) Stage-based capture increases returns.
2) Siege reduces churn after missed days.
3) Daily move increases chance of 1 meaningful action/day.
4) War council reduces next-day chaos.
5) Rule-based adaptation boosts starts vs generic hints.

## 22. Epics (high-level backlog)

See detailed epic breakdown in `epics/00-index.md`.

## 23. Development priorities

P0:
bootstrap, local storage, maps, creation, fog, siege + 5 tactics, daily move, war council, season, adaptation v1, import/export.

P1:
animations, move history, extended stats, better onboarding.

P2:
multiplayer, AI decomposition, procedural maps, cross-device sync.

## 24. 3-week execution plan (rough)

Week 1: foundation + persistence + maps + creation + navigation.  
Week 2: core mechanics (fog/siege/tactics/scoring/province screen).  
Week 3: daily loop + war council + season + adaptation + tests + deploy.

## 25. Risks

- SVG map complexity → use fixed templates.
- System gaming → rewards only for meaningful actions + anti-abuse.
- Too much input → strict required-field limit.
- Too childish → clean visual language + careful copy.
- Weak adaptation → log rule effectiveness and iterate.

## 26. Open questions

- Dark mode in MVP?
- Faction/theme customization?
- Demo project in onboarding?
- Template-based decomposition (no AI)?
- Pomodoro timer in MVP?
- Local reminders (no push)?

## 27. Release recommendation

v0.1: one campaign map type, one project map type, manual creation, one theme, local storage, working daily loop.  
v0.2: improved adaptation, extended stats, templates, better onboarding.

## 28. Product pitch (final)

Tasker is a browser strategy game for personal project execution: real tasks become provinces on a map, and procrastination is treated as a game situation—fog of war, sieges, and supply issues—solved by short rituals and tactics. The MVP must prove that a map, anti-procrastination loops, and a 21-day season can make task execution more engaging and more sustainable than a traditional list.

