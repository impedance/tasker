# EPIC-14 — Engagement, recovery, and safe sharing

**ID:** `EPIC-14`  
**Priority:** `P1`  
**Status:** `draft`  
**Owner:** `<TBD>`  
**PRD/RFC reference:** `prd.md` (Hero moments, safe sharing, archetypes) / `rfc.md` (safe sharing, recovery)

## 1) Objective (Outcome)
Add a second engagement layer that increases return motivation without toxicity: privacy-safe share cards, recovery-friendly feedback surfaces, and lightweight personal strategy artifacts.

## 3) Scope
**In scope:**
- shareable map cards generated locally;
- private/public-safe export modes;
- links from season summary and hero moments into export flows;
- minimum design contract for recovery-friendly celebratory surfaces.
- a local Chronicle view (timeline of meaningful actions and season highlights), derived from existing events (no new mechanics).

**Out of scope:**
- online social graph;
- multiplayer/co-op;
- competitive leaderboards;
- backend sharing infrastructure.

## 4) Deliverables
- Share card type list and payload contract.
- Local render/export flow for cards.
- Privacy-safe defaults.
- Entry points from season summary / hero moments / tactics codex.
- Chronicle view IA + minimal implementation plan (P1).

## 5) Dependencies
- EPIC-03 for `ShareCard` persistence.
- EPIC-10 for season summary entry points.
- EPIC-11 for hero moment entry points.
- EPIC-12 for export/share instrumentation.

## 6) Work breakdown

### T1. Define share card taxonomy
**Steps:**
1) Lock the initial card set: weekly map, before/after season, siege recovery, campaign style.
2) Define what data each card can use.
3) Define what private content must never be included in public-safe mode.
**Acceptance criteria:**
- Each card has a clear use case and privacy rule.
**DoD:**
- Card taxonomy is documented.
**Estimate:** `M`

### T2. Implement local card generation
**Steps:**
1) Create a render pipeline for image-ready cards from local state.
2) Support at least one portable output format.
3) Save card metadata for later analytics/export history.
**Acceptance criteria:**
- Card generation works fully offline.
**DoD:**
- At least one card type can be generated end-to-end.
**Estimate:** `L`

### T3. Add privacy modes
**Steps:**
1) Default to `public-safe`.
2) Strip task titles, deadlines, and sensitive free text in public-safe mode.
3) Offer an explicit `private` mode for local export only.
**Acceptance criteria:**
- Public-safe export never leaks raw task text by default.
**DoD:**
- Privacy mode is visible and testable.
- Public-safe redaction rules match EPIC-01 Appendix A.
**Estimate:** `M`

### T4. Connect export entry points
**Steps:**
1) Add export CTA to season summary.
2) Add export CTA to hero moments where appropriate.
3) Optionally reference the tactics codex for “campaign style” cards.
**Acceptance criteria:**
- Export entry points feel contextual, not spammy.
**DoD:**
- Users can reach export from at least two meaningful contexts.
- Export prompts respect the prompt budget in EPIC-01 Appendix A.
**Estimate:** `M`

### T5. Chronicle view (local-only)
**Goal:** provide a lightweight “world memory” surface that increases return motivation without adding grind or requiring extra input.

**Inputs (preferred):**
- event log / meaningful-action markers (EPIC-01 Appendix B; implemented in EPIC-12).
- season boundaries and summary (EPIC-10).

**Steps:**
1) Define chronicle entry types (e.g., fog cleared, siege resolved, first start, high-effort capture, season end).
2) Implement a simple timeline screen (reverse chronological) with strict privacy rules.
3) Add entry points from season summary and (optionally) from the campaign “Capital” hub panel (EPIC-04 T6).

**Acceptance criteria:**
- Chronicle contains only derived/structured data in public-safe contexts (no raw task text by default).
- No chronicle prompts appear before action; it’s discoverable but not spammy (EPIC-01 Appendix A).

**Estimate:** `M`

## 7) Risks and mitigations
- Risk: sharing becomes vanity noise → keep export optional and tied to real progress.
- Risk: privacy leaks → default to public-safe and exclude raw task text.
- Risk: cards overshadow the task loop → cap prompts and avoid pre-action rewards.
