/**
 * Anti-abuse heuristics (guardrails) — EPIC-11-T4
 * Implements guardrails to prevent gaming the system.
 *
 * Guardrails (EPIC-01 Appendix A):
 *   - Prevent progress without clarity (fog check)
 *   - Detect over-planning: decompositionCount > 3 without start_move
 *   - Detect too many micro-tasks: >10 provinces with estimatedEntryMinutes < 5
 *   - Detect long sessions without meaningful action: session >30 min, no meaningful actions
 *   - No rewards without action
 *   - Prompt budget (max N prompts per session)
 *
 * Returns warnings (not errors) from applyAction.
 */

import type { Province } from '../../entities/types';
import type { DomainAction } from './actions';
import { isFog } from './fog';

export interface GuardrailWarning {
    /** Warning type for UI to handle appropriately */
    type: GuardrailType;
    /** Human-readable message */
    message: string;
    /** Severity level */
    severity: 'info' | 'warning' | 'blocker';
}

export type GuardrailType =
    | 'fog_block'
    | 'over_planning'
    | 'micro_tasks'
    | 'long_session_no_progress'
    | 'prompt_budget'
    | 'map_slot_collision';

export interface SessionState {
    /** Session start time */
    startedAt: Date;
    /** Count of meaningful actions in session */
    meaningfulActionCount: number;
    /** Count of prompts shown in session */
    promptCount: number;
    /** Last meaningful action time */
    lastMeaningfulActionAt?: Date;
}

/**
 * Checks if a province can be started (not in fog).
 * Returns blocker if fog fields are missing.
 *
 * Exempts certain actions that are intended to resolve the fog.
 */
export function checkFogGuard(province: Province, action?: DomainAction): GuardrailWarning | null {
    // Exempt actions that resolve fog
    if (action?.type === 'clarify' ||
        (action?.type === 'apply_tactic' && action.payload.tacticType === 'scout')) {
        return null;
    }

    if (province.state === 'fog' && isFog(province)) {
        return {
            type: 'fog_block',
            message: 'Please clarify the province before starting. Define the outcome, first step, and estimated time.',
            severity: 'blocker',
        };
    }
    return null;
}

/**
 * Detects over-planning pattern (decompose >3 times without start).
 */
export function checkOverPlanningGuard(
    province: Province,
    history: Array<{ moveType: string; provinceId: string }>
): GuardrailWarning | null {
    if (province.decompositionCount > 3) {
        const provinceMoves = history.filter((m) => m.provinceId === province.id);
        const hasStarted = provinceMoves.some(
            (m) => m.moveType === 'raid' || m.moveType === 'assault' || m.moveType === 'start_move'
        );

        if (!hasStarted) {
            return {
                type: 'over_planning',
                message: 'You\'ve broken this down multiple times. Consider taking action instead of further planning.',
                severity: 'warning',
            };
        }
    }
    return null;
}

/**
 * Detects too many micro-tasks (>10 provinces with estimatedEntryMinutes < 5).
 */
export function checkMicroTasksGuard(provinces: Province[]): GuardrailWarning | null {
    const microTasks = provinces.filter(
        (p) => p.estimatedEntryMinutes !== undefined && p.estimatedEntryMinutes < 5
    );

    if (microTasks.length > 10) {
        return {
            type: 'micro_tasks',
            message: 'You have many very small tasks. Consider combining them into larger, more meaningful actions.',
            severity: 'info',
        };
    }
    return null;
}

/**
 * Detects long sessions without meaningful action.
 */
export function checkLongSessionGuard(session: SessionState, now: Date = new Date()): GuardrailWarning | null {
    const sessionDurationMs = now.getTime() - session.startedAt.getTime();
    const sessionDurationMinutes = sessionDurationMs / (1000 * 60);

    if (sessionDurationMinutes > 30 && session.meaningfulActionCount === 0) {
        return {
            type: 'long_session_no_progress',
            message: 'You\'ve been browsing for a while without taking action. Consider starting with a small step.',
            severity: 'warning',
        };
    }
    return null;
}

/**
 * Checks prompt budget (max N prompts per session).
 */
export function checkPromptBudgetGuard(session: SessionState, maxPrompts: number = 5): GuardrailWarning | null {
    if (session.promptCount >= maxPrompts) {
        return {
            type: 'prompt_budget',
            message: 'You\'ve reached the prompt limit for this session. Take some action before seeing more suggestions.',
            severity: 'blocker',
        };
    }
    return null;
}

/**
 * Blocks duplicate map slot assignment within the same region.
 */
export function checkMapSlotCollisionGuard(
    province: Province,
    provinces: Province[],
    action?: DomainAction
): GuardrailWarning | null {
    if (action?.type !== 'edit_fields' || !action.payload.mapSlotId) {
        return null;
    }

    const conflictingProvince = provinces.find(
        (candidate) =>
            candidate.id !== province.id &&
            candidate.regionId === province.regionId &&
            candidate.mapSlotId === action.payload.mapSlotId
    );

    if (!conflictingProvince) {
        return null;
    }

    return {
        type: 'map_slot_collision',
        message: `Slot ${action.payload.mapSlotId} is already assigned to "${conflictingProvince.title}". Choose another slot.`,
        severity: 'blocker',
    };
}

/**
 * Runs all guardrails and returns array of warnings.
 */
export function runGuardrails(
    province: Province,
    provinces: Province[],
    history: Array<{ moveType: string; provinceId: string }>,
    session: SessionState,
    action?: DomainAction,
    now: Date = new Date()
): GuardrailWarning[] {
    const warnings: GuardrailWarning[] = [];

    // Per-province guards
    const fogWarning = checkFogGuard(province, action);
    if (fogWarning) warnings.push(fogWarning);

    const overPlanningWarning = checkOverPlanningGuard(province, history);
    if (overPlanningWarning) warnings.push(overPlanningWarning);

    // Global guards
    const microTasksWarning = checkMicroTasksGuard(provinces);
    if (microTasksWarning) warnings.push(microTasksWarning);

    const longSessionWarning = checkLongSessionGuard(session, now);
    if (longSessionWarning) warnings.push(longSessionWarning);

    const promptBudgetWarning = checkPromptBudgetGuard(session);
    if (promptBudgetWarning) warnings.push(promptBudgetWarning);

    const slotCollisionWarning = checkMapSlotCollisionGuard(province, provinces, action);
    if (slotCollisionWarning) warnings.push(slotCollisionWarning);

    return warnings;
}

/**
 * Checks if any guardrail is a blocker.
 */
export function hasBlockerWarning(warnings: GuardrailWarning[]): boolean {
    return warnings.some((w) => w.severity === 'blocker');
}

/**
 * Gets all blocker warnings.
 */
export function getBlockerWarnings(warnings: GuardrailWarning[]): GuardrailWarning[] {
    return warnings.filter((w) => w.severity === 'blocker');
}

/**
 * Gets all non-blocker warnings (info/warning).
 */
export function getNonBlockerWarnings(warnings: GuardrailWarning[]): GuardrailWarning[] {
    return warnings.filter((w) => w.severity !== 'blocker');
}
