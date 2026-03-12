# FEAT-01 T11 - Release and pilot docs

Goal: add the minimum docs required to hand the MVP to pilot users and reviewers without developer hand-holding.

Read first:
- `PLANS/FEAT-01-production-readiness-hardening.md`
- `docs/index.md`
- `docs/E2E-CHECKLIST.md`
- `epics/EPIC-13-qa-release.md`
- `README.md` if it already exists

Likely code areas:
- `README.md`
- New docs under `docs/`
- Cross-links from `docs/index.md`

Implementation notes:
- Document current reality, not aspirational future behavior.
- Keep the doc set small and discoverable.
- The target set is:
  - repo README
  - concise user guide
  - known limitations
  - release checklist
  - pilot feedback template

Steps:
1. Inventory what a new user cannot currently learn from repo docs alone.
2. Add the missing docs with short, task-oriented sections.
3. Link everything from `docs/index.md`.
4. Make sure the docs reflect the actual shipped behavior after FEAT-01 changes.

Acceptance criteria:
- A new contributor can run and verify the app from repo docs.
- A pilot user can understand the core loop and known limits without a live walkthrough.
- Release verification has a concrete checklist.

Self-check before review:
- The docs set is small enough to read in one sitting.
- No doc still describes bootstrap-only behavior as current.
- Known limitations are explicit rather than implied.

Verification:
- `make smoke`
- `make preflight`
- Manual: follow the docs from a clean shell and confirm the instructions are complete

PR must mention:
- Which docs were added
- Which outdated instructions were removed or corrected
