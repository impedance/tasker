# FEAT-01 T7 - Chronicle taxonomy hardening

Goal: make Chronicle entries narrative, explicit, and stable across import/export.

Read first:
- `PLANS/FEAT-01-production-readiness-hardening.md`
- `src/shared/services/domainService.ts`
- `src/pages/chronicle/ChroniclePage.tsx`
- `src/entities/types.ts`
- `src/entities/schemas.ts`
- `src/game/integration/chronicle-events.test.ts`
- `src/storage/import-export.ts`

Likely code areas:
- Chronicle entry type definitions
- Event-to-chronicle mapping in domain service
- Import/export validation
- Chronicle integration tests

Implementation notes:
- Chronicle should read like story history, not raw analytics taxonomy.
- Centralize mapping logic in one place.
- Passive actions must not create Chronicle noise.

Steps:
1. List the chronicle entries currently produced by meaningful actions.
2. Define the allowed taxonomy and map domain events into it.
3. Update schemas/types together.
4. Add integration coverage for event-to-chronicle mapping and import/export roundtrip.

Acceptance criteria:
- Chronicle entries are readable and intentional.
- Import/export preserves Chronicle meaning.
- Meaningful actions create the expected Chronicle output, passive browsing does not.

Self-check before review:
- Chronicle types are not inferred indirectly from event names.
- Mapping lives in one place.
- Import/export tests cover the changed taxonomy.

Verification:
- `make smoke`
- `make preflight`
- Targeted chronicle and import/export tests

PR must mention:
- The supported Chronicle taxonomy after the change
- Any old event names that were remapped rather than exposed to users
