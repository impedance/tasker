/**
 * Province transition table — T3
 * Encodes the state machine from EPIC-01 Appendix D.
 * Pure functions only; no side effects.
 *
 * Rules:
 *   UI never sets province.state directly.
 *   All state changes go through applyAction → transitions.
 */

import type { ProvinceState } from '../../entities/types';
import type { DomainAction } from './actions';

/** Allowed province states for system-trigger actions */
export const SIEGE_ELIGIBLE_STATES = new Set<ProvinceState>(['ready', 'in_progress', 'fortified']);

/**
 * Returns the next state for a given (currentState, actionType) pair,
 * or null if the transition is not allowed.
 *
 * For apply_tactic, the tacticType further determines the next state.
 * System triggers (system_fortify_trigger, system_siege_trigger) are
 * handled as separate helpers below.
 */
export function getNextState(
    current: ProvinceState,
    action: DomainAction
): ProvinceState | null {
    const t = action.type;

    switch (current) {
        // -------------------------------------------------------------------------
        case 'fog':
            if (t === 'clarify') return 'ready';
            if (t === 'edit_fields') return current; // non-meaningful edits allowed
            return null;

        // -------------------------------------------------------------------------
        case 'ready':
            if (t === 'start_move') return 'in_progress';
            if (t === 'decompose') return 'ready';
            if (t === 'supply') return 'ready';
            if (t === 'complete') return 'captured';
            if (t === 'retreat' || t === 'reschedule') return 'retreated';
            if (t === 'edit_fields') return current;
            return null;

        // -------------------------------------------------------------------------
        case 'in_progress':
            if (t === 'log_move') return 'in_progress';
            if (t === 'supply') return 'in_progress';
            if (t === 'complete') return 'captured';
            if (t === 'retreat' || t === 'reschedule') return 'retreated';
            if (t === 'edit_fields') return current;
            return null;

        // -------------------------------------------------------------------------
        case 'fortified':
            if (t === 'decompose') return 'ready'; // decomposition breaks fortification
            if (t === 'supply') return 'fortified';
            if (t === 'retreat' || t === 'reschedule') return 'retreated';
            if (t === 'edit_fields') return current;
            return null;

        // -------------------------------------------------------------------------
        case 'siege': {
            if (t !== 'apply_tactic') {
                // Only edit_fields is allowed without resolving
                if (t === 'edit_fields') return current;
                return null;
            }
            const tactic = (action.payload as { tacticType: string }).tacticType;
            switch (tactic) {
                case 'scout': return 'ready';
                case 'supply': return 'ready';
                case 'engineer': return 'ready';
                case 'raid': return 'in_progress';
                case 'retreat': return 'retreated';
                default: return null;
            }
        }

        // -------------------------------------------------------------------------
        case 'captured':
        case 'retreated':
            // Terminal states in MVP — no transitions
            if (t === 'edit_fields') return current;
            return null;

        default:
            return null;
    }
}

/** Returns true if the transition is allowed */
export function isTransitionAllowed(current: ProvinceState, action: DomainAction): boolean {
    return getNextState(current, action) !== null;
}

// ============================================================================
// System trigger helpers (called by scheduler / store, not by applyAction)
// ============================================================================

/**
 * Returns true if the province should transition to `fortified`.
 * Condition: effortLevel >= 4 AND decompositionCount == 0 AND state == 'ready'
 * (EPIC-01 Appendix D)
 */
export function shouldFortify(province: {
    state: ProvinceState;
    effortLevel?: number;
    decompositionCount: number;
}): boolean {
    return (
        province.state === 'ready' &&
        (province.effortLevel ?? 0) >= 4 &&
        province.decompositionCount === 0
    );
}

/**
 * Returns true if the province should enter siege.
 * Condition: state is siege-eligible AND days since last meaningful action >= N
 * (EPIC-01 Appendix D + C5; MVP N = 3)
 */
export const SIEGE_DAYS_THRESHOLD = 3;

export function stalledDays(province: {
    lastMeaningfulActionAt?: string;
    createdAt: string;
}, now: Date = new Date()): number {
    const reference = province.lastMeaningfulActionAt ?? province.createdAt;
    const refDate = new Date(reference);
    const diffMs = now.getTime() - refDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function shouldEnterSiege(province: {
    state: ProvinceState;
    lastMeaningfulActionAt?: string;
    createdAt: string;
}, now: Date = new Date()): boolean {
    if (!SIEGE_ELIGIBLE_STATES.has(province.state)) return false;
    return stalledDays(province, now) >= SIEGE_DAYS_THRESHOLD;
}
