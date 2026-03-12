# FEAT-01 T8 - Domain action gating and slot safety

Goal: enforce slot assignment and province action eligibility at the domain/storage boundary, not only in page logic.

Read first:
- `PLANS/FEAT-01-production-readiness-hardening.md`
- `src/pages/province/ProvinceDetailsPage.tsx`
- `src/pages/MapPage.tsx`
- `src/game/rules/transitions.ts`
- `src/shared/services/domainService.ts`
- `src/storage/repositories.ts`
- `epics/QA-MECHANICS-CHECKLIST.md`

Likely code areas:
- Domain service guardrails
- Repository update helpers
- UI validation kept as convenience-only
- Integration tests for stale or duplicate actions

Implementation notes:
- The UI may stay optimistic, but the write boundary must reject invalid transitions.
- Target two failure classes first:
  - duplicate slot assignment / overwrite
  - invalid province action from stale screen state

Steps:
1. Find where slot ownership and action eligibility are currently enforced only in the UI.
2. Add guards in the domain/storage path that owns the mutation.
3. Preserve readable user-facing error handling.
4. Add integration tests for stale writes and second-attempt actions.

Acceptance criteria:
- Invalid actions are blocked even if the page sends them.
- Duplicate slot assignment cannot silently overwrite prior state.
- User-visible errors remain understandable.

Self-check before review:
- The invariant is enforced where data changes, not where buttons render.
- UI validation still exists but is no longer the only protection.
- Tests simulate stale-state behavior instead of only happy-path clicks.

Verification:
- `make smoke`
- `make preflight`
- Targeted integration tests for duplicate assignment and invalid actions

PR must mention:
- Which invariant is now enforced at the boundary
- How the user sees the failure instead of silent corruption
