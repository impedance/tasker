# Production Readiness Hardening Plan

Execution model:
- This file is the umbrella plan and ship gate for `FEAT-01`.
- Junior-ready execution briefs live in `PLANS/FEAT-01/` and should be used for day-to-day implementation handoff.

**ID:** `FEAT-01`  
**Priority:** `P0`  
**Status:** `draft`  
**Owner:** `Architecture / Product Engineering`  
**PRD/RFC reference:** `prd.md` sections 1.0, 4.1, 5.2, 5.4; `epics/00-index.md`; `epics/IMPLEMENTATION-READINESS.md`

## 1) Objective (Outcome)
Ship Tasker as a coherent MVP that users can actually adopt as a daily game loop and that engineering can safely iterate on. After this plan, the app should open into the intended Capital-first experience, preserve MVP contracts for fog/siege/daily orders/season flows, expose no major documentation-to-product mismatches, pass a meaningful black-box regression suite, and include enough release documentation and pilot guidance to hand to early users without developer hand-holding.

## 2) Context
- The repo is already beyond bootstrap and contains substantial implementation across maps, rules, persistence, Daily Orders, season logic, Chronicle, and feedback.
- The remaining gap is not “build the game from scratch”; it is to close the mismatch between implemented mechanics and a trustworthy release candidate.
- Current highest-risk issues are product-entry drift, page-level orchestration drift, time-boundary fragility, release-doc incompleteness, and shallow end-to-end verification.
- If these are not addressed before pilot/release, the team will spend time debugging regression fallout and explaining product behavior manually instead of learning from real usage.

## 3) Scope
**In scope:**
- Make the Capital/home hub the real default entry and align first-run flows with PRD expectations.
- Remove product/documentation mismatches that affect user trust or QA correctness.
- Introduce a first-class feature/use-case orchestration layer for the most critical route flows.
- Centralize time access behind a clock boundary for time-sensitive mechanics.
- Tighten unsafe type boundaries on critical mechanic paths.
- Expand black-box verification from route smoke to real user-path coverage.
- Complete release/pilot documentation for local MVP distribution.
- Reduce obvious operational risks in offline/release behavior where feasible within MVP scope.

**Out of scope (explicit non-goals):**
- Backend, accounts, sync, payments, cloud sharing, or multiplayer.
- Rule-based adaptation v1 beyond what is already needed to preserve current contracts.
- Privacy-safe share cards and engagement surfaces from `EPIC-14`.
- Major visual redesign or a new design system.
- Rewriting all route pages at once; only critical paths should move first.

## 4) Deliverables
- A corrected default app entry flow that lands users in Capital/home behavior instead of a bootstrap placeholder.
- A reduced-drift route architecture for critical paths using `src/features/**` orchestration modules.
- A shared clock boundary used by season, siege, recommendations, and other time-sensitive flows.
- Stronger type coverage on critical action pipelines (`daily orders`, `siege`, `domain service`, storage helpers).
- Settings/reset behavior aligned with actual storage/event semantics and reflected in docs.
- A black-box regression suite that covers onboarding, create/clarify, siege, Daily Orders, Chronicle, Capital, season rollover, import/export, and reset behavior.
- Release/pilot docs: README, user guide, known limitations, release checklist, feedback template.
- A production hardening checklist that explicitly separates P0 ship blockers from follow-up cleanup.

## 5) Dependencies
- Technical:
  - Existing rules contracts in `epics/EPIC-01-foundation.md`
  - Current architecture and alignment docs in `docs/architecture.md` and `epics/IMPLEMENTATION-READINESS.md`
  - Existing harness commands: `make smoke`, `make preflight`, `npm run e2e`
- Product/design:
  - PRD decision that Capital is the default daily entry surface
  - Existing copy layering rule: fantasy-first on map/home surfaces, plain language on action surfaces
- Data/tools:
  - IndexedDB/localForage persistence
  - Existing tutorial seed and onboarding dialog
  - Vitest, RTL, Playwright, CI workflows

## 6) Work breakdown (junior-friendly tasks)
Rules:
- Ship in waves. Each wave must leave the repo in a releasable state.
- Prefer anti-fragile changes: improve boundaries and verification before adding more behavior.
- Every critical mechanic change must add a black-box or integration test proving the behavior from the outside.

Recommended execution order:
- Wave 1: `T1`, `T2`, `T3`, `T10`  (fix product-entry truth and create deterministic test foundations)
- Wave 2: `T5`, `T4`, `T6`, `T7`, `T8`  (stabilize boundaries, then migrate critical orchestration)
- Wave 3: `T9`, `T11`, `T12`, `T13`  (expand black-box coverage, finish release docs, then run ship gate)

### T1. Replace bootstrap home with Capital-first entry
**Description:** Make `/` reflect the PRD home contract. The default experience should route to Capital or render the Capital surface directly, while preserving onboarding/tutorial behavior and avoiding duplicate entry concepts.  
**Steps:**
1) Decide the single source of truth for “home”: route redirect to `/capital` or `HomePage` becomes the actual Capital surface.
2) Remove/bootstrap-archive the placeholder copy and ensure first-run onboarding still appears correctly.
3) Update route smoke/E2E expectations and manual QA checklist.
**Acceptance criteria:**
- Opening `/` lands a user in the intended home hub experience.
- The first impression is world-state-first, not bootstrap placeholder copy.
- Tutorial/onboarding still works from a clean profile.
**DoD (done when):**
- Root route behavior matches PRD and is covered by an automated black-box test.
- No obsolete bootstrap wording remains on user-facing home entry surfaces.
**Estimate:** `M`  
**Risks/notes:** Anti-fragile solution: reduce entry ambiguity to one canonical home surface before any further UX polish.

### T2. Align onboarding, tutorial, and first meaningful action path
**Description:** Ensure first-run experience leads quickly into a real gameplay action and then naturally returns to Capital, matching the MVP scenario.  
**Steps:**
1) Review the tutorial seed path against the desired sequence: tutorial -> fog clear -> first move -> Chronicle -> Capital.
2) Fix any missing CTA or navigation dead ends after tutorial actions.
3) Add one black-box scenario covering a clean browser profile from onboarding to first meaningful action.
**Acceptance criteria:**
- A first-run user can complete the tutorial without needing DevTools or route guessing.
- The path to a first meaningful action is short and deterministic.
- The post-action surface leads to the intended home loop.
**DoD (done when):**
- One automated end-to-end scenario covers first-run onboarding through first meaningful action.
- Manual checklist matches shipped flow without workaround notes.
**Estimate:** `L`  
**Risks/notes:** Anti-fragile solution: test from clean storage only, because this is the easiest place for drift to hide.

### T3. Align Settings/reset/export semantics with actual behavior
**Description:** Fix the mismatch between Settings copy, reset behavior, event storage semantics, and QA docs.  
**Steps:**
1) Decide product behavior: either reset clears events too, or the UI/docs explicitly state that event history is separate.
2) Implement the chosen behavior in reset and any helper used by docs/tests.
3) Update Settings copy, manual QA checklist, and any related tests.
**Acceptance criteria:**
- Reset behavior and copy are consistent.
- Manual QA no longer requires hidden knowledge to get a clean state.
- Import/export/reset behavior is predictable to a pilot user.
**DoD (done when):**
- A black-box or integration test proves reset behavior.
- Docs and UI describe the same behavior.
**Estimate:** `S`  
**Risks/notes:** Anti-fragile solution: make “clean state” a real product capability, not a tester-only ritual.

### T4. Introduce `src/features/**` for critical gameplay flows
**Description:** Create a thin feature/use-case layer for the highest-risk routes so pages stop directly mixing repositories, rule translation, and navigation decisions.  
**Steps:**
1) Start after T5 defines the shared clock boundary used by time-sensitive flows.
2) Define minimal feature modules for `daily orders`, `province actions`, `siege resolution`, and `capital loading`.
3) Move orchestration logic out of route pages into typed use-case functions/hooks.
4) Leave simple display-only pages untouched to avoid scope explosion.
**Acceptance criteria:**
- Critical route pages no longer directly encode core orchestration logic.
- Domain rules remain pure and storage remains an adapter.
- The migration is incremental and does not require rewriting the whole app.
**DoD (done when):**
- Selected critical pages depend on feature-layer modules instead of ad hoc repository choreography.
- Tests cover use-case modules at integration level.
**Estimate:** `XL`  
**Risks/notes:** Anti-fragile solution: migrate only hot paths first; avoid a big-bang “architecture cleanup” that delays release.

### T5. Add an injectable clock boundary
**Description:** Replace direct `new Date()` usage in critical mechanics with a shared clock boundary so 04:00 day semantics and time-based rules remain deterministic.  
**Steps:**
1) Introduce a minimal clock interface and default implementation.
2) Adopt the clock in season, siege detection, Daily Orders date bucketing, reset/export timestamps where relevant, and any follow-up feature-layer flows.
3) Add focused tests for before/after 04:00 behavior and season rollover.
**Acceptance criteria:**
- Critical time-sensitive mechanics can be tested with injected time.
- No new mechanic path introduced in this plan reads current time directly.
- Existing behavior remains unchanged except where it becomes more deterministic.
**DoD (done when):**
- Time-sensitive services and feature modules use the clock boundary.
- Contract tests cover 04:00 boundary behavior and stable daily bucketing.
**Estimate:** `XL`  
**Risks/notes:** Anti-fragile solution: centralize time before more release logic is added; otherwise regressions become harder to isolate.

### T6. Tighten critical type boundaries
**Description:** Remove remaining unsafe `any` and weak casts on production-critical paths.  
**Steps:**
1) Audit `daily orders`, `siege`, `domainService`, storage helpers, and related tests.
2) Replace `any` with domain types, discriminated unions, or `unknown` plus validation.
3) Add focused tests for payload mapping and side-effect persistence.
**Acceptance criteria:**
- Critical action flows no longer rely on `any`.
- Compile-time types match actual rule/service expectations.
- Lint warnings on critical app paths are eliminated or intentionally documented.
**DoD (done when):**
- The remaining `any` usage is limited to non-critical tests or legacy scaffolding with explicit justification.
- Type-safe payload mapping is covered by tests.
**Estimate:** `L`  
**Risks/notes:** Anti-fragile solution: shrink ambiguity at boundaries, not only inside tests.

### T7. Harden Chronicle/event taxonomy
**Description:** Ensure Chronicle entries are narrative, explicit, and stable across import/export and that event names are not leaking as accidental story taxonomy.  
**Steps:**
1) Define the allowed Chronicle entry taxonomy and event-to-chronicle mapping.
2) Update `domainService` and related helpers to use explicit narrative types.
3) Add import/export and event-to-chronicle integration coverage.
**Acceptance criteria:**
- Chronicle entries read as narrative history, not analytics event names.
- Import/export roundtrip preserves Chronicle meaning.
- Meaningful actions create expected Chronicle output; passive actions do not.
**DoD (done when):**
- Mapping is centralized and covered by tests.
- Docs/reference notes reflect the supported entry taxonomy.
**Estimate:** `M`  
**Risks/notes:** Anti-fragile solution: formalize taxonomy now so content drift does not compound with new mechanics.

### T8. Move map slot assignment and action gating to domain boundaries
**Description:** Ensure slot assignment safety and action eligibility are enforced beyond page logic.  
**Steps:**
1) Add domain/storage guards for duplicate slot assignment and invalid transitions.
2) Keep the UI validation, but treat it as a convenience layer only.
3) Add race-like tests using stale data / second action attempts.
**Acceptance criteria:**
- A stale UI cannot silently overwrite slot ownership.
- Invalid province actions are blocked even if a page tries to send them.
- Error messages remain readable to the user.
**DoD (done when):**
- Domain-level protection exists and is covered by integration tests.
- Manual QA scenario for overflow/stale assignment passes without special handling.
**Estimate:** `M`  
**Risks/notes:** Anti-fragile solution: enforce invariants where data changes happen, not where buttons render.

### T9. Expand Playwright from route smoke to black-box MVP flows
**Description:** Build a real black-box acceptance suite that checks the shipped game loop instead of just route availability.  
**Steps:**
1) Start after T10 lands deterministic state/time/bootstrap helpers.
2) Keep the current route smoke tests as a fast layer.
3) Add user-path specs for:
   - clean onboarding/tutorial,
   - create -> clarify -> ready,
   - siege trigger/resolution,
   - Daily Orders check-in -> execute,
   - complete -> Hero Moment -> Chronicle,
   - season rollover,
   - reset/import-export sanity.
4) Split long scenarios into deterministic reusable helpers.
**Acceptance criteria:**
- E2E covers the main MVP loops, not just headings and URLs.
- Failures point to a specific broken user journey.
- Scenarios can run in CI without manual DevTools edits where feasible.
**DoD (done when):**
- Playwright suite includes at least one spec per P0 user path.
- Existing manual checklist can shrink because repeated critical paths are automated.
**Estimate:** `XL`  
**Risks/notes:** Anti-fragile solution: prefer black-box tests at route/UI level for product contracts and integration tests for storage/rules contracts.

### T10. Add deterministic test helpers for storage/time/bootstrap state
**Description:** Support the black-box and integration suite with reusable setup utilities instead of ad hoc test mutations.  
**Steps:**
1) Add helpers to seed tutorial, clear local state, seed dated provinces/seasons, and freeze time.
2) Reuse them across Playwright and Vitest where possible.
3) Remove duplicated test setup logic and DevTools-dependent assumptions.
**Acceptance criteria:**
- New tests do not require manual IndexedDB editing steps.
- Time and storage setup is readable and reusable.
- Test failures are easier to diagnose because fixtures are explicit.
**DoD (done when):**
- Shared helpers exist and are used by new critical-path tests.
- Manual QA checklists reserve DevTools for exploratory checks, not primary validation.
**Estimate:** `L`  
**Risks/notes:** Anti-fragile solution: invest in reusable fixtures first so new regressions are cheaper to isolate.

### T11. Complete release and pilot documentation
**Description:** Add the missing docs needed to hand the MVP to pilot users or reviewers without a developer walkthrough.  
**Steps:**
1) Add `README.md` with run/build/test instructions and product summary.
2) Add a concise user guide covering the 5 core scenarios.
3) Add known limitations, release checklist, and pilot feedback template.
4) Cross-link them from `docs/index.md`.
**Acceptance criteria:**
- A new contributor or pilot user can run and understand the app from repo docs.
- Known limitations are explicit instead of tribal knowledge.
- Release verification has a clear checklist.
**DoD (done when):**
- Required EPIC-13 docs exist and are discoverable from the docs hub.
- Docs reflect current shipped behavior, not aspirational behavior.
**Estimate:** `L`  
**Risks/notes:** Anti-fragile solution: document the real cutline so pilot feedback targets the product, not missing setup instructions.

### T12. Review offline/release packaging risks
**Description:** Close the highest-value non-functional gaps that materially affect local release quality.  
**Steps:**
1) Verify whether current MVP truly meets “usable offline after initial load”; if not, document the limitation and decide whether a minimal PWA/offline cache slice is required for this release.
2) Review build output warnings and identify low-risk chunking/code-splitting wins.
3) Add a release note for any accepted non-goal (for example, “offline after initial load is limited without PWA install”).
**Acceptance criteria:**
- Offline/release behavior is explicitly understood, not assumed.
- Build warnings are either reduced or intentionally accepted with documentation.
- No hidden non-functional surprises remain in the pilot handoff.
**DoD (done when):**
- Release notes/known limitations explicitly state the true offline and packaging behavior.
- Any low-risk chunking fix included in scope is implemented and verified.
**Estimate:** `M`  
**Risks/notes:** Anti-fragile solution: prefer explicit limitation plus test coverage over half-finished infrastructure that is hard to trust.

### T13. Final ship gate and cutline review
**Description:** Create an explicit ship decision checkpoint so the team does not keep mixing release blockers with post-release cleanup.  
**Steps:**
1) Define P0 ship blockers vs follow-up backlog items.
2) Run smoke, preflight, build, and black-box suite.
3) Perform one dry-run pilot handoff using only repo docs.
**Acceptance criteria:**
- The team can answer “is this release-ready for pilot?” with objective criteria.
- Remaining issues are triaged into “blocker” or “post-release”.
- No known contradiction remains between code, docs, and QA entry points.
**DoD (done when):**
- A release checklist run is recorded in the repo.
- Post-release cleanup items are moved out of the ship path.
**Estimate:** `M`  
**Risks/notes:** Anti-fragile solution: force an explicit cutline review to avoid endless hardening churn.

## 7) Testing and QA
- Unit:
  - Keep pure-rule coverage for fog, siege, season, guardrails, and streak logic.
  - Add unit coverage for clock helpers and taxonomy mapping where logic is pure.
- Integration:
  - Feature/use-case modules for Daily Orders, province actions, siege resolution, and Chronicle mapping.
  - Reset/import-export roundtrip including event-state semantics.
  - Domain/storage enforcement for map slot assignment and action gating.
- E2E:
  - Maintain route smoke as a fast entry check.
  - Add black-box user-path specs:
    - `first_run_tutorial_to_first_action`
    - `create_clarify_ready`
    - `stale_province_enters_and_resolves_siege`
    - `daily_orders_checkin_and_execute`
    - `complete_province_triggers_hero_moment_and_chronicle`
    - `season_rollover_preserves_state_contracts`
    - `reset_and_import_export_are_truthful`
- Manual checklist:
  - Reduce the current checklist to exploratory and visual verification that automation cannot reliably assert.
  - Keep a short production sanity pass: load app, first-run path, one meaningful move, reset/import, season page, settings/export.

### Black-box acceptance suite
- Black-box tests must assert externally visible outcomes only:
  - visible home surface,
  - navigable CTA flow,
  - province state color/status changes,
  - Chronicle entry presence,
  - Hero Moment presence/absence,
  - season day/phase output,
  - exported file availability and parseability,
  - reset behavior from the user perspective.
- Black-box tests must not depend on internal implementation details such as repository method names or localStorage key shapes unless the test is explicitly an integration test.

## 8) Metrics / Events (if applicable)
- No new analytics scope is required for MVP release, but existing local events should be made reliable enough to compute:
  - `capital_visits_per_meaningful_day`
  - `chronicle_open_rate`
  - `hero_moment_seen_after_real_action_rate`
  - `time_from_siege_to_tactic`
- If event semantics change while hardening Chronicle/reset behavior, update event documentation and export expectations in the same task.
- Add a minimal verification note showing which event names back each release metric and which metrics remain approximate in a local-only MVP.

## 9) Risks and mitigations
- Risk: scope explosion from trying to “clean architecture everywhere”.
  - Mitigation: only migrate critical routes to `src/features/**` in this plan.
- Risk: time-boundary changes introduce subtle regressions.
  - Mitigation: add clock boundary first, then regression tests around 04:00 and season rollover before broader refactors.
- Risk: E2E becomes flaky if it relies on manual timing or uncontrolled storage state.
  - Mitigation: add deterministic fixtures/helpers and prefer explicit seed/reset steps.
- Risk: product/docs drift reappears after fixes.
  - Mitigation: treat doc alignment as part of DoD for every user-visible behavior change.
- Risk: release gets delayed by P1 work disguised as polish.
  - Mitigation: enforce the T13 ship gate with explicit blocker vs backlog separation.

## 10) Open questions
- Should `/` redirect to `/capital`, or should `HomePage` be replaced by the Capital surface to preserve route semantics?
- Should reset clear event history by default, or should events be treated as a separate support/audit layer?
- Is a minimal offline cache/PWA slice required for this release to honestly claim “offline after initial load”, or is explicit documentation of the current limitation acceptable for pilot?
- Which remaining `any` usage, if any, is acceptable to defer after the pilot cutline?
