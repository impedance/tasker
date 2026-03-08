# EPIC-02..05 — Junior tickets (Week 1 usable slice)

**ID:** `PLAN-02-05`  
**Priority:** `P0`  
**Status:** `ready`  
**Owner:** `<assign>`  
**PRD/RFC reference:** `prd.md:440` (epic map), `prd.md:463` (Week 1 exit DoD)

## 1) Objective (Outcome)
Ship a first usable MVP slice: a user can create a campaign/region/province, see provinces on an SVG region map, open a province drawer, and the whole state persists across refresh with import/export.

## 2) Context
- This is the Week 1 critical path in the PRD: EPIC-02/03/04/05. (`prd.md:465`)
- Goal is to unblock junior execution with small, verifiable tickets (1–4h).
- EPIC specs remain the source of truth; this plan is the “executable” ticket list.

## 3) Scope
**In scope:**
- EPIC-02 bootstrap app skeleton + tests/CI.
- EPIC-03 domain model + local persistence + import/export + migrations (minimal).
- EPIC-04 SVG region map surface + province binding + drawer skeleton + unplaced list.
- EPIC-05 creation flows + tutorial seed + quick-add.

**Out of scope (explicit non-goals):**
- Rule engine and state transitions (EPIC-06).
- Siege/tactics (EPIC-07).
- Daily loop/season loop (EPIC-08/10).
- Instrumentation and share artifacts (EPIC-12/14) unless needed for import/export.

## 4) Deliverables
- A working Vite+React+TS app skeleton with routing and baseline UI shell.
- Persistent storage layer (IndexedDB via localForage) with versioned schema + migrations.
- Import/export of full app state (JSON) via a Settings screen.
- Minimal creation flows: create Campaign/Region/Province + bulk province add.
- Region SVG map rendering with province state styling hooks + click → drawer.

## 5) Dependencies
- Specs:
  - EPIC-02: `epics/EPIC-02-bootstrap.md`
  - EPIC-03: `epics/EPIC-03-domain-persistence.md`
  - EPIC-04: `epics/EPIC-04-map-ui.md`
  - EPIC-05: `epics/EPIC-05-creation-flows.md`
- Readiness checklist: `epics/IMPLEMENTATION-READINESS.md`
- Mechanics QA checklist (for later mechanics validation, but keep it visible): `epics/QA-MECHANICS-CHECKLIST.md`
- Map asset conventions: `epics/ASSET-PLAN.md`

## 6) Work breakdown (junior-friendly tasks)
Conventions for tickets:
- Keep each task 1–4 hours (target).
- Every task must have acceptance criteria + a quick “how to verify”.
- Use PRs per task; avoid multi-day “mega PRs”.
- Add `**Track:** FE|BE|SHARED` so staffing is explicit.

## 6.1) Week 1 trackers (use as the only handoff)
How to use this tracker:
- For every checkbox you complete, change `[ ]` → `[x]`.
- Add a PR link or commit hash in parentheses.
- If blocked, add a 1-line `BLOCKED:` note under the item.

### Frontend (FE) checklist

EPIC-02:
- [ ] `02-T1` Init Vite + React + TS (PR/commit: )
- [ ] `02-T2` Routing + 3 stub pages (PR/commit: )
- [ ] `02-T3` PRD-aligned `src/` skeleton (PR/commit: )

Shared (can be taken by FE if needed):
- [ ] `02-T4` Vitest + RTL smoke (PR/commit: )
- [ ] `02-T5` Playwright E2E smoke (PR/commit: )
- [ ] `02-T6` Minimal CI workflow (PR/commit: )

EPIC-04:
- [ ] `04-T1` SVG templates + slot ID convention (PR/commit: )
- [ ] `04-T2` Map CSS tokens + province class mapping (PR/commit: )
- [ ] `04-T5` Province Drawer skeleton (PR/commit: )
- [ ] `04-T4` Unplaced provinces list panel (PR/commit: )
- [ ] `04-T3` Province-to-slot binding (PR/commit: )  
  - BLOCKED:
- [ ] `04-T6` Hover/selected + reduced motion (PR/commit: )

EPIC-05:
- [ ] `05-T1` Campaign create flow (PR/commit: )
- [ ] `05-T2` Region create flow (PR/commit: )
- [ ] `05-T3` Province create flow (PR/commit: )
- [ ] `05-T4` Quick-add provinces (bulk) (PR/commit: )

Shared (coordination-heavy):
- [ ] `05-T5` First-run tutorial seed (FE: onboarding UI + “remove tutorial”) (PR/commit: )  
  - BLOCKED:

### Domain/Backend (BE) checklist

EPIC-03:
- [ ] `03-T1` Runtime validation strategy + wire into import (PR/commit: )
- [ ] `03-T2` P0 entity types (Campaign/Region/Province) (PR/commit: )
- [ ] `03-T3` Storage adapter + key namespaces (PR/commit: )
- [ ] `03-T4` Campaign repository CRUD (PR/commit: )
- [ ] `03-T5` Region repository CRUD + listByCampaignId (PR/commit: )
- [ ] `03-T6` Province repository CRUD + listByRegionId + slot helper (PR/commit: )
- [ ] `03-T7` SchemaVersion + migrations runner (PR/commit: )
- [ ] `03-T8` Import/export pipeline (validate → migrate → write) (PR/commit: )

Shared (coordination-heavy):
- [ ] `05-T5` First-run tutorial seed (BE: seed data + deterministic loader + removal/reset mechanics) (PR/commit: )  
  - BLOCKED:

### EPIC-02 — Tech setup and project bootstrap
Source: `epics/EPIC-02-bootstrap.md`, PRD Week 1 (`prd.md:465`).

#### 02-T1. Initialize Vite + React + TypeScript
**Track:** `FE`  
**Description:** Create the project and make sure it runs locally.  
**Steps:**
1) Create Vite React TS app.
2) Ensure `npm run dev` works and renders a placeholder home page.
**Acceptance criteria:**
- Local dev server starts without errors.
- Home page renders with a visible “Tasker MVP” placeholder.
**DoD (done when):**
- App boots in dev mode on a clean checkout.
**How to verify:**
- `npm install` then `npm run dev`.
**Estimate:** `S`

#### 02-T2. Add routing + 3 stub pages
**Track:** `FE`  
**Description:** Add stable navigation primitives early.  
**Steps:**
1) Add React Router.
2) Add pages: `Home`, `Campaigns`, `Settings` (stubs ok).
3) Add header/nav links and direct URL support.
**Acceptance criteria:**
- Direct URL loads each page without blank screen.
**DoD (done when):**
- Routes exist and are navigable.
**How to verify:**
- Open `/`, `/campaigns`, `/settings` in the browser.
**Estimate:** `S`

#### 02-T3. Create `src/` module skeleton (PRD-aligned)
**Track:** `FE`  
**Description:** Align folder structure to PRD conventions.  
**Steps:**
1) Add folders: `src/app`, `src/pages`, `src/entities`, `src/features`, `src/game`, `src/storage`, `src/shared`.
2) Move routing + app shell under `src/app`.
**Acceptance criteria:**
- No circular imports introduced.
**DoD (done when):**
- Folder layout matches `prd.md:437`.
**How to verify:**
- `npm run build` succeeds.
**Estimate:** `S`

#### 02-T4. Configure Vitest + React Testing Library (one smoke)
**Track:** `SHARED`  
**Description:** Unit test harness baseline.  
**Steps:**
1) Add Vitest + RTL.
2) Add one test: renders App and shows “Tasker MVP”.
**Acceptance criteria:**
- `npm test` green.
**DoD (done when):**
- Tests run locally and in CI.
**How to verify:**
- `npm test`.
**Estimate:** `S`

#### 02-T5. Configure Playwright E2E (one smoke)
**Track:** `SHARED`  
**Description:** E2E baseline to catch routing/build regressions.  
**Steps:**
1) Add Playwright.
2) Add one test: open Home → navigate to Campaigns → open Settings.
**Acceptance criteria:**
- E2E passes reliably (run 3 times).
**DoD (done when):**
- E2E runs locally and in CI.
**How to verify:**
- `npm run e2e` (or documented equivalent) 3×.
**Estimate:** `M`

#### 02-T6. Add minimal CI workflow
**Track:** `SHARED`  
**Description:** PR checks must be non-optional.  
**Steps:**
1) Add CI: install → unit tests → build → e2e (optional if too slow).
2) Add dependency cache.
**Acceptance criteria:**
- CI runs on PRs and is green.
**DoD (done when):**
- A PR shows checks in GitHub Actions.
**How to verify:**
- Open CI run logs for a PR.
**Estimate:** `M`

---

### EPIC-03 — Domain model and local persistence
Source: `epics/EPIC-03-domain-persistence.md`.

#### 03-T1. Pick runtime validation strategy (decision + baseline)
**Track:** `BE`  
**Description:** Reduce “it compiles but crashes at runtime” risk.  
**Steps:**
1) Choose `zod` (recommended) or a tiny custom validator module.
2) Add one example schema + parser (e.g., `Campaign`).
**Acceptance criteria:**
- Invalid imported JSON fails with a human-readable error.
**DoD (done when):**
- One validation path exists and is used by import.
**How to verify:**
- Try importing a broken JSON and confirm error message.
**Estimate:** `S`

#### 03-T2. Define P0 entity types (Campaign/Region/Province)
**Track:** `BE`  
**Description:** P0 entities needed for Week 1 exit.  
**Steps:**
1) Add TS types for `Campaign`, `Region`, `Province`.
2) Include map binding fields: `region.mapTemplateId`, `province.mapSlotId?`. (EPIC-04 contract)
3) Export from a single public barrel for usage.
**Acceptance criteria:**
- Types compile and are used by repositories.
**DoD (done when):**
- P0 types exist and are imported by code using them.
**How to verify:**
- `npm run build` succeeds.
**Estimate:** `S`

#### 03-T3. Storage adapter (localForage) + key namespaces
**Track:** `BE`  
**Description:** A single stable storage API for the app.  
**Steps:**
1) Initialize localForage with an app-level store name/version.
2) Define key conventions (e.g., `campaign:<id>`, `region:<id>`, `province:<id>`) and list keys.
3) Add a lightweight “storage health” helper for debug.
**Acceptance criteria:**
- Can write and read an entity in the browser.
**DoD (done when):**
- Storage module is used by one repository.
**How to verify:**
- Create a Campaign and refresh: it still exists.
**Estimate:** `M`

#### 03-T4. Repository: Campaign (CRUD)
**Track:** `BE`  
**Description:** First repository to establish patterns.  
**Steps:**
1) Implement `create/getById/list/update/delete` for Campaign.
2) Keep IDs stable (UUID) and timestamps consistent.
**Acceptance criteria:**
- A created campaign shows up in a list and survives refresh.
**DoD (done when):**
- Campaign CRUD works via UI.
**How to verify:**
- Create/edit/delete a campaign, refresh between steps.
**Estimate:** `M`

#### 03-T5. Repository: Region (CRUD + list by campaign)
**Track:** `BE`  
**Description:** Relationship query baseline.  
**Steps:**
1) Implement Region CRUD.
2) Implement `listByCampaignId(campaignId)`.
3) Ensure deleting a Campaign handles its Regions (explicit behavior: cascade or block with message).
**Acceptance criteria:**
- Regions are always scoped to a Campaign.
**DoD (done when):**
- Region list is correct after refresh.
**How to verify:**
- Create 2 campaigns; confirm regions don’t mix.
**Estimate:** `M`

#### 03-T6. Repository: Province (CRUD + list by region + mapSlot assignment helper)
**Track:** `BE`  
**Description:** Province storage and the minimum helpers EPIC-04/05 rely on.  
**Steps:**
1) Implement Province CRUD.
2) Implement `listByRegionId(regionId)`.
3) Add helper: `findFirstFreeMapSlotId(region)` based on map template slots.
**Acceptance criteria:**
- Provinces appear for the correct region and keep `mapSlotId` stable.
**DoD (done when):**
- Province creation flow persists + reloads correctly.
**How to verify:**
- Create a province and reload; `mapSlotId` unchanged.
**Estimate:** `M`

#### 03-T7. Schema version + migration pipeline (minimal)
**Track:** `BE`  
**Description:** Avoid “breaking users” when types evolve.  
**Steps:**
1) Store `schemaVersion` in storage.
2) On app start: run migrations until current.
3) Add one sample migration (even if no-op) to prove wiring.
**Acceptance criteria:**
- App can load old schemaVersion and upgrade without data loss.
**DoD (done when):**
- Migration runner exists and is tested or manually verified.
**How to verify:**
- Force an old schemaVersion in storage and reload.
**Estimate:** `M`

#### 03-T8. JSON export/import (Settings)
**Track:** `BE`  
**Description:** Week 1 exit requires import/export. (`prd.md:468`)  
**Steps:**
1) Export: gather all entities + schemaVersion into one JSON.
2) Import: validate, migrate if needed, then write to storage.
3) UI: Settings page with “Export” and “Import” (paste/upload).
**Acceptance criteria:**
- Export → clear storage → import restores the same campaigns/regions/provinces.
**DoD (done when):**
- Roundtrip works reliably.
**How to verify:**
- Manual roundtrip with at least 1 campaign, 1 region, 5 provinces.
**Estimate:** `M`

---

### EPIC-05 — Creation flows (campaigns/regions/provinces)
Source: `epics/EPIC-05-creation-flows.md`.

#### 05-T1. Campaign create flow (minimal form)
**Track:** `FE`  
**Description:** Create Campaign in under 30 seconds.  
**Steps:**
1) UI form: title required; description optional.
2) On submit: persist via repo; navigate to Campaign context.
**Acceptance criteria:**
- Newly created campaign appears in Campaigns list.
**DoD (done when):**
- Create/edit/delete of Campaign works.
**How to verify:**
- Create 2 campaigns; refresh; they persist.
**Estimate:** `S`

#### 05-T2. Region create flow (scoped to campaign)
**Track:** `FE`  
**Description:** Regions must always belong to a campaign.  
**Steps:**
1) UI form: title required; description optional.
2) Persist via repo; show under campaign details.
**Acceptance criteria:**
- Region appears under the correct campaign.
**DoD (done when):**
- Region list is correct after refresh.
**How to verify:**
- Create regions in 2 campaigns; ensure separation.
**Estimate:** `S`

#### 05-T3. Province create flow (auto mapSlot + fog/ready)
**Track:** `FE`  
**Description:** Provinces are the main “tasks”; keep the form lightweight.  
**Steps:**
1) UI: title required; optional clarity fields.
2) Auto-assign `mapSlotId` to first free slot; if no slots, leave unplaced.
3) Set initial state: missing clarity → `fog`, else `ready` (store as an enum/string).
**Acceptance criteria:**
- Province is visible (on map if placed; otherwise in “Unplaced” list).
**DoD (done when):**
- Province persists and can be opened from UI.
**How to verify:**
- Create 10 provinces; at least some become unplaced; all are accessible.
**Estimate:** `M`

#### 05-T4. Quick-add multiple provinces (bulk)
**Track:** `FE`  
**Description:** Create 5–10 tasks in one action.  
**Steps:**
1) Add a textarea: one province per line.
2) Trim/ignore empty lines.
3) Persist in a batch (sequential ok for MVP).
**Acceptance criteria:**
- Bulk add creates the expected number of provinces.
**DoD (done when):**
- Bulk flow doesn’t create empty/duplicate junk from whitespace.
**How to verify:**
- Paste 10 lines with blanks and whitespace; confirm correct results.
**Estimate:** `S`

#### 05-T5. First-run tutorial seed (versioned)
**Track:** `SHARED`  
**Description:** Offer a deterministic tutorial campaign on first run.  
**Steps:**
1) Define seed data: 1 campaign, 1 region, 3 provinces with mixed initial states.
2) Detect first run (empty storage) and show choice: tutorial vs empty.
3) Add Settings action: “Remove tutorial campaign”.
**Acceptance criteria:**
- First meaningful action possible in ≤60 seconds.
- Tutorial is skippable and removable.
**DoD (done when):**
- Seed is versioned and deterministic.
**How to verify:**
- Clear storage → reload → pick tutorial → see entities → remove tutorial.
**Estimate:** `M`

---

### EPIC-04 — Map UI and navigation (SVG)
Source: `epics/EPIC-04-map-ui.md`, asset conventions `epics/ASSET-PLAN.md`.

#### 04-T1. Add SVG templates (placeholders ok) + slot ID convention
**Track:** `FE`  
**Description:** Establish the “map slot” contract early.  
**Steps:**
1) Add two SVG assets (campaign + region) with `data-slot-id="p01"` style markers.
2) Document slot convention in a short README in the assets folder.
3) Ensure unplaced provinces are still playable via list panel (EPIC-04 contract).
**Acceptance criteria:**
- SVG renders in the browser.
- Clicking a slot logs/opens something (even if stub).
**DoD (done when):**
- Slot ID contract is implemented and documented.
**How to verify:**
- Click multiple SVG slots and confirm they are distinguishable in code.
**Estimate:** `S`

#### 04-T2. Map CSS tokens file + province class mapping
**Track:** `FE`  
**Description:** Implement the CSS contract so UI stays consistent.  
**Steps:**
1) Add `src/shared/theme/map.css` (or equivalent).
2) Implement province state classes: `.province--fog`, `.province--ready`, etc. (EPIC-04 contract).
3) Ensure `fog/siege/fortified` differ by more than color (pattern/outline).
**Acceptance criteria:**
- In grayscale (simulated), fog/siege/fortified are still distinguishable.
**DoD (done when):**
- Tokens and classes exist and are applied to SVG shapes.
**How to verify:**
- Take a screenshot and desaturate (or use browser dev tools) to confirm.
**Estimate:** `M`

#### 04-T3. Region map page: bind provinces to SVG slots
**Track:** `FE`  
**Description:** Show real province data on the map.  
**Steps:**
1) Load provinces for the selected region.
2) For each province with `mapSlotId`, find SVG element with that `data-slot-id`.
3) Apply exactly one province state class.
**Acceptance criteria:**
- Creating provinces updates map UI after reload.
**DoD (done when):**
- Province-to-slot binding works and is stable.
**How to verify:**
- Create provinces, reload, confirm same provinces occupy same slots.
**Estimate:** `M`

#### 04-T4. Unplaced provinces list panel
**Track:** `FE`  
**Description:** No province can become “unreachable” due to missing slots.  
**Steps:**
1) List provinces with missing `mapSlotId`.
2) Clicking an item opens the same drawer as map click.
**Acceptance criteria:**
- All unplaced provinces are accessible and actionable.
**DoD (done when):**
- List exists and is kept in sync with storage.
**How to verify:**
- Create more provinces than slots; open at least one from the list.
**Estimate:** `S`

#### 04-T5. Province Drawer skeleton (map click → drawer)
**Track:** `FE`  
**Description:** Keep primary interaction lightweight (drawer over map).  
**Steps:**
1) Implement drawer component (open/close).
2) Minimum contents: title, current state, 1–2 placeholder CTAs (no rule engine yet).
**Acceptance criteria:**
- Map click opens drawer in ≤2 interactions.
**DoD (done when):**
- Drawer works on desktop and mobile sizes.
**How to verify:**
- Click province; drawer opens; close; repeat.
**Estimate:** `M`

#### 04-T6. Hover/selected styles + reduced motion
**Track:** `FE`  
**Description:** Make the map feel responsive but not distracting.  
**Steps:**
1) Add hover and selected visuals.
2) Respect reduced-motion preference (disable transitions).
**Acceptance criteria:**
- No jank; selected province is always readable.
**DoD (done when):**
- Interaction styles ship with a reduced-motion mode.
**How to verify:**
- Toggle reduced motion in OS or dev tools; confirm behavior changes.
**Estimate:** `S`

## 7) Testing and QA
- Unit:
  - Smoke render test for App (02-T4).
  - Storage adapter unit tests where feasible (key helpers).
- Integration:
  - CRUD flows: create campaign/region/province → refresh persists.
  - Import/export roundtrip restores state (03-T8).
- E2E:
  - Home → create campaign → create region → create province → open drawer (Playwright).
- Manual checklist (Week 1 exit DoD):
  - Create 1 campaign, 1 region, 10 provinces.
  - Confirm some provinces are unplaced but accessible.
  - Refresh: everything persists.
  - Export → clear storage → import restores same state.

## 8) Metrics / Events (if applicable)
- Not required for Week 1; keep import/export errors visible in UI for debugging.

## 9) Risks and mitigations
- Too-large tickets → enforce the 1–4h rule; split PRs.
- Map complexity → start with placeholder SVG templates; keep DOM/SVG-first.
- Persistence bugs → keep a single storage adapter; add roundtrip testing early.

## 10) Open questions
- Validation library: `zod` vs custom minimal validators.
- ID generation: UUID library vs `crypto.randomUUID()`.
- State management: keep it light (Zustand suggested in PRD) vs minimal React state until EPIC-06.

## Later (not sliced yet)
After Week 1 is stable, slice the next EPICs in this order:
- EPIC-06 + EPIC-07 (core mechanics),
- EPIC-11 + EPIC-15 (feedback + shell),
- EPIC-08 + EPIC-10 (daily + season),
- EPIC-13 (QA hardening + pilot kit).
