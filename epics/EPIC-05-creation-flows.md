# EPIC-05 — Creation flows (campaigns/regions/provinces)

**ID:** `EPIC-05`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD reference:** `prd.md` (MVP scope, creation flows)

## 1) Objective (Outcome)
Enable fast creation so a user can create the first campaign/regions/provinces in under 2 minutes, without feeling like they are filling out a CRM.

## 3) Scope
**In scope:**
- create Campaign/Region/Province;
- minimal validation;
- quick-add multiple provinces;
- auto-assign province initial state (`fog` vs `ready`).
- first-run onboarding entry: demo/tutorial campaign template (skippable).

**Out of scope:**
- multiple project templates (“template library”).
- advanced archetype-driven automation.

## 6) Work breakdown

### T0. First-run onboarding: demo/tutorial campaign (P0)
**Steps:**
1) Define a tiny tutorial campaign template:
   - 1 campaign, 1 region, 3 provinces (fog / siege / ready).
   - seed only what is necessary to demonstrate the mechanics.
2) First run detection (empty storage) offers:
   - “Start with tutorial campaign” (recommended),
   - “Start empty”.
3) Guided path (skippable at any step):
   - clarify a fog province (fog → ready),
   - resolve a siege via a tactic (siege → ready/retreated),
   - execute one Daily Order and start it,
   - see a hero moment (if eligible) and a Chronicle entry,
   - arrive at Capital.
4) Provide a reset/remove option in Settings (“Remove tutorial campaign”).
**Acceptance criteria:**
- A user reaches a first meaningful action in ≤60 seconds.
- Tutorial is never forced and can be skipped and removed.
**DoD:**
- The template is stored as versioned seed data and loaded deterministically.
- Tutorial path does not require a network connection.
**Estimate:** `M`

### T1. Campaign creation form
**Steps:**
1) Fields: title (required), description (optional), colorTheme (optional).
2) World shell fields (MVP): factionName (optional), bannerStyle (optional), seasonFantasyName (auto-generated + editable).
2) Persist and navigate to the campaign.
**Acceptance criteria:**
- New campaign appears on the campaign map.
**DoD:**
- Campaign creation is stable.
**Estimate:** `M`

### T2. Region creation form
**Steps:**
1) Fields: title (required), description (optional), order (auto), archetype override (optional P1).
2) Link to campaignId.
**Acceptance criteria:**
- Region appears in project context (map legend/list at minimum).
**DoD:**
- Region creation is stable.
**Estimate:** `M`

### T3. Province (task) creation form
**Steps:**
1) Fields: title (required); optional clarity fields at creation time.
2) Defaults for effortLevel/clarityLevel.
3) Auto state: missing clarity fields → `fog`, else `ready`.
**Acceptance criteria:**
- Province is visible on the map and can be opened.
**DoD:**
- Province creation is stable.
**Estimate:** `L`

### T4. Quick-add multiple provinces
**Steps:**
1) UI: textarea or multi-input list.
2) Each non-empty line becomes a province.
3) Validate and handle duplicates (MVP: trim + ignore empty).
**Acceptance criteria:**
- Create 5–10 tasks in one action.
**DoD:**
- Bulk create works reliably.
**Estimate:** `M`

### T5. Enforce “max 3–5 required fields”
**Steps:**
1) Lock required field list for each create/clarify screen.
2) Ensure forms do not require extras.
**Acceptance criteria:**
- Creating tasks stays lightweight.
**DoD:**
- UX limits are respected.
**Estimate:** `S`

### T6. Optional archetype selection (P1)
**Steps:**
1) Add a lightweight choice: `Foundation`, `Drive`, `Joy`, `Neutral`.
2) Keep it optional and hidden behind progressive disclosure.
3) Store the choice without adding mandatory complexity.
**Acceptance criteria:**
- Archetype can be selected in under 1 extra click/tap.
- Skipping archetype does not harm the core flow.
**DoD:**
- Archetype field is persisted and available to recommendations/season stats.
**Estimate:** `M`
