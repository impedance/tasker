# FEAT-01 Execution Pack

Purpose: keep `PLANS/FEAT-01-production-readiness-hardening.md` as the umbrella plan, and move implementation handoff into small, executable task files for juniors.

How to use this folder:
- Pick work in the wave order below unless a lead explicitly reorders it.
- Each task file is a standalone brief: read it, implement it, run the listed checks, and attach the self-check notes in the PR.
- If a task file says "blocked by", do not start it until the dependency lands.
- Keep PRs small. One task file should usually map to one PR. If a file has an internal split suggestion, land those as separate PRs.

Non-negotiable handoff rules:
- Preserve product behavior unless the task explicitly changes it.
- For user-visible changes, update docs/tests in the same PR.
- Do not expand scope into unrelated cleanup.
- Run `make smoke` on every task. Run `make preflight` on cross-cutting tasks.

Recommended wave order:
- Wave 1: [T1](./T1-capital-first-entry.md), [T2](./T2-onboarding-first-action.md), [T3](./T3-settings-reset-export-semantics.md), [T10](./T10-deterministic-test-helpers.md)
- Wave 2: [T5](./T5-injectable-clock-boundary.md), [T4](./T4-feature-layer-critical-flows.md), [T6](./T6-tighten-critical-type-boundaries.md), [T7](./T7-chronicle-taxonomy-hardening.md), [T8](./T8-domain-action-gating-and-slot-safety.md)
- Wave 3: [T9](./T9-black-box-mvp-flows.md), [T11](./T11-release-and-pilot-docs.md), [T12](./T12-offline-and-release-packaging-review.md), [T13](./T13-final-ship-gate.md)

Suggested ownership split:
- FE-heavy: T1, T2, T3, T4, T9, T11
- Shared FE/BE: T5, T7, T12, T13
- Domain/storage-heavy: T6, T8, T10

Definition of done for any FEAT-01 child task:
- Code behavior matches the task acceptance criteria.
- Automated verification listed in the task file is green.
- Manual checks listed in the task file were actually performed.
- User-facing docs/checklists are updated when behavior changed.
- PR summary includes: what changed, what was verified, what remains out of scope.

Source documents:
- Umbrella plan: `PLANS/FEAT-01-production-readiness-hardening.md`
- Product/system of record: `prd.md`
- Current repo snapshot: `epics/00-index.md`
- Alignment constraints: `epics/IMPLEMENTATION-READINESS.md`
- Architecture boundaries: `docs/architecture.md`
- Manual QA baseline: `docs/E2E-CHECKLIST.md`
- Mechanics QA baseline: `epics/QA-MECHANICS-CHECKLIST.md`
