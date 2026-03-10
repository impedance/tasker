# EPIC-03 — Domain model and local persistence

**ID:** `EPIC-03`  
**Priority:** `P0`  
**Status:** `in-progress`  
**Owner:** `<TBD>`  
**PRD reference:** `prd.md` (Data & storage)

## 1) Objective (Outcome)
Implement domain types and reliable local persistence (CRUD + import/export + migrations) so data survives refresh and supports future schema evolution.

## 3) Scope
**In scope:**
- TS domain models;
- repositories (CRUD + relationship queries);
- schema versioning + migrations;
- JSON import/export.

**Out of scope:**
- rule engine transitions (EPIC-06);
- analytics implementation (EPIC-12), except technical import/export events.

## 4) Deliverables
- Entities: Campaign/Region/Province/Season/PlayerProfile/DailyMove/SiegeEvent/IfThenPlan.
- Extended entities: PlayerCheckIn/SeasonReview/HeroMoment/ChronicleEntry/CapitalState.
- Optional (P1) entities: ShareCard.
- Repositories with relationship queries and the following API classes:
  - standard entities: `getById/list/create/update/delete`;
  - singleton entities (`PlayerProfile`): `get/update` only;
  - natural-key entities (`CapitalState` by `campaignId`, `CampaignArchetypeStats` by `seasonId`):
    key-based `get/list/create/update/delete`.
- Stored `schemaVersion` and migration pipeline.
- Export/import of full app state.

## 5) Dependencies
- EPIC-01 decisions: timestamp semantics (`updatedAt` vs `lastMeaningfulActionAt`), event naming/fields for import/export.

## 6) Work breakdown

### T1. Define TypeScript domain types
**Steps:**
1) Create entity model files (e.g., `entities/*/model.ts`).
2) Add minimal runtime validation strategy (library or custom).
**Acceptance criteria:**
- Types cover PRD fields, including map binding (`region.mapTemplateId`, `province.mapSlotId?`), world shell entities (Capital/Chronicle), and role fields.
**DoD:**
- All entities are typed and exported.
**Estimate:** `L`

### T2. Storage adapter (localForage) + initialization
**Steps:**
1) Implement storage initialization.
2) Define key/namespace conventions.
3) Add basic error handling/diagnostics.
**Acceptance criteria:**
- Read/write works in the browser.
**DoD:**
- Storage adapter is ready for repositories.
**Estimate:** `M`

### T3. Implement CRUD repositories
**Steps:**
1) For each entity: `getById`, `list`, `create`, `update`, `delete`.
2) Relationship queries: regions by campaign, provinces by region.
3) Keep relationship arrays consistent (regionIds/provinceIds).
4) Support adjacency lists on provinces (store + validate IDs).
**Acceptance criteria:**
- Relationship operations keep data consistent.
**DoD:**
- CRUD works for all P0 entities.
**Estimate:** `XL`

### T4. Schema versioning + migrations
**Steps:**
1) Store `schemaVersion`.
2) On startup: run migrations to current version.
3) Add at least one example migration and test.
**Acceptance criteria:**
- Upgrades keep user data.
**DoD:**
- Migration pipeline exists with tests.
**Estimate:** `L`

### T5. JSON export/import
**Steps:**
1) Export: gather full state + schema version.
2) Import: validate, migrate if needed, write to storage.
3) Add a minimal UI entry in Settings (upload/paste JSON).
**Acceptance criteria:**
- Export → import roundtrip restores the same state.
**DoD:**
- Export/import is stable.
**Estimate:** `L`

### T6. Persistence tests
**Steps:**
1) Integration tests for CRUD and relationships.
2) Import/export roundtrip test.
3) Migration test.
**Acceptance criteria:**
- Tests are stable and cover critical operations.
**DoD:**
- Test suite is green in CI.
**Estimate:** `L`
