# FEAT-01 T3 - Settings, reset, export semantics

Goal: make reset/import/export behavior truthful in UI copy, docs, and actual persistence behavior.

Read first:
- `PLANS/FEAT-01-production-readiness-hardening.md`
- `src/pages/SettingsPage.tsx`
- `src/storage/storage.ts`
- `src/storage/import-export.ts`
- `docs/E2E-CHECKLIST.md`
- `epics/IMPLEMENTATION-READINESS.md`

Likely code areas:
- Settings page actions and copy
- Storage reset helpers
- Import/export helpers
- Manual QA text and automated reset tests

Implementation notes:
- Resolve the current mismatch explicitly:
  - option A: reset also clears events
  - option B: reset does not clear events, and UI/docs say so clearly
- "Clean state" must be a real product capability, not tester tribal knowledge.

Steps:
1. Confirm current reset scope in code and current wording in UI/docs.
2. Pick the product truth and implement it consistently.
3. Add one automated test for reset semantics.
4. Update Settings text and the QA checklist in the same PR.

Acceptance criteria:
- Reset/import/export behavior is predictable from the Settings screen alone.
- Manual QA does not rely on hidden IndexedDB rituals for the default clean-state path.
- Docs and product behavior say the same thing.

Self-check before review:
- Reset wording matches exactly what the code does.
- Import/export still works after the reset change.
- If events remain separate, that limitation is stated in both Settings and docs.

Verification:
- `make smoke`
- `make preflight`
- Manual: export state, reset app, verify expected storage outcome, re-import

PR must mention:
- Whether reset now clears events or not
- Which user-visible copy changed
