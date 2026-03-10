/**
 * Progress stage computation — T4
 * Pure functions for stage-based progress (progressStage).
 * Stages never decrement (EPIC-01 Appendix G).
 *
 * Stage → percent mapping (display-only):
 *   scouted: 15%, prepared: 30%, entered: 55%, held: 80%, captured: 100%
 */

import type { ProvinceProgressStage } from '../../entities/types';
import type { ActionType } from './actions';

// Ordered stage scale (lowest to highest)
const STAGE_ORDER: ProvinceProgressStage[] = ['scouted', 'prepared', 'entered', 'held', 'captured'];

/** Returns the numeric rank of a stage (higher = more advanced) */
export function stageRank(stage: ProvinceProgressStage): number {
    return STAGE_ORDER.indexOf(stage);
}

/**
 * Returns the stage that is at least `target`, not lower than `current`.
 * Stages never decrement.
 */
function atLeast(current: ProvinceProgressStage, target: ProvinceProgressStage): ProvinceProgressStage {
    return stageRank(current) >= stageRank(target) ? current : target;
}

/**
 * Computes the new progressStage after a domain action.
 * Rules from EPIC-01 Appendix G:
 *   clarify        → at least scouted
 *   supply/decompose → at least prepared
 *   start_move     → at least entered
 *   log_move (when entered) → held; otherwise keep current
 *   apply_tactic:raid → at least entered
 *   complete       → captured
 *   edit_fields/retreat/reschedule → no change
 */
export function advanceProgressStage(
    current: ProvinceProgressStage,
    actionType: ActionType,
    tacticType?: string
): ProvinceProgressStage {
    switch (actionType) {
        case 'clarify':
            return atLeast(current, 'scouted');

        case 'supply':
        case 'decompose':
            return atLeast(current, 'prepared');

        case 'start_move':
            return atLeast(current, 'entered');

        case 'log_move':
            // bump entered → held; otherwise keep
            if (current === 'entered') return 'held';
            return current;

        case 'apply_tactic':
            // raid tactic starts a real step → at least entered
            if (tacticType === 'raid') return atLeast(current, 'entered');
            // supply/engineer tactic → at least prepared
            if (tacticType === 'supply' || tacticType === 'engineer') return atLeast(current, 'prepared');
            // scout → at least scouted
            if (tacticType === 'scout') return atLeast(current, 'scouted');
            return current;

        case 'complete':
            return 'captured';

        case 'retreat':
        case 'reschedule':
        case 'edit_fields':
        default:
            return current;
    }
}

/** Display percentage for a progress stage */
export const STAGE_PERCENT: Record<ProvinceProgressStage, number> = {
    scouted: 15,
    prepared: 30,
    entered: 55,
    held: 80,
    captured: 100,
};
