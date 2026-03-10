/**
 * Rule engine public API — EPIC-06
 * All domain logic is pure functions; no side effects or DB calls.
 */

// Action types + payload schemas
export * from './actions';

// Fog rule (T2)
export { isFog, getMissingClarityFields } from './fog';

// Progress stages (T4)
export { advanceProgressStage, stageRank, STAGE_PERCENT } from './progress';

// Transition table (T3)
export {
    getNextState,
    isTransitionAllowed,
    shouldFortify,
    shouldEnterSiege,
    stalledDays,
    SIEGE_ELIGIBLE_STATES,
    SIEGE_DAYS_THRESHOLD,
} from './transitions';

// Core entry point (T3)
export { applyAction, checkSiegeTrigger, checkFortifyTrigger } from './apply-action';
export type { ApplyActionResult, SiegeTriggerResult } from './apply-action';

// Province roles (T5)
export { getRoleHints, getPreferredActionsForRole } from './roles';
export type { RoleHint } from './roles';

// Pressure signals (T6)
export { computeFrontPressureLevel, isHotspot, computePressureMap } from './pressure';

// Runtime validation (T7)
export {
    validateActionPayload,
    validateProvinceFields,
    validateRequiredIds,
    mergeValidation,
} from './validation';
export type { ValidationResult } from './validation';
