/**
 * Tactics implementation — EPIC-07-T3
 * Implements 5 tactics as domain actions with explicit data effects.
 *
 * Tactics are used to resolve siege states:
 *   - scout: drive clarification (set outcome/firstStep/entry time)
 *   - supply: store context (contextLinks[], contextNotes)
 *   - engineer: split into 3-5 sub-provinces
 *   - raid: create a 5-minute DailyMove, update progressStage
 *   - retreat: set state to retreated or reschedule
 *
 * Each tactic:
 *   - Accepts payload
 *   - Returns new province state
 *   - Logs side effects (Chronicle entry, SiegeEvent resolution)
 */

import type { Province, TacticType, DailyMove } from '../../entities/types';
import type { ApplyTacticPayload } from './actions';

export interface TacticResult {
    /** New province state after tactic application */
    province: Province;
    /** Side effects to persist (DailyMoves, Chronicle entries, etc.) */
    sideEffects: Array<
        | { type: 'create_daily_move'; dailyMove: Omit<DailyMove, 'id' | 'createdAt'> }
        | { type: 'resolve_siege_event'; siegeEventId: string }
        | { type: 'create_sub_province'; subProvinceData: Omit<Province, 'id' | 'createdAt' | 'updatedAt'> }
    >;
    /** Human-readable explanation of what the tactic did */
    explanation: string;
}

/**
 * Applies a tactic to a province in siege state.
 * Returns new province state and side effects.
 */
export function applyTactic(
    province: Province,
    payload: ApplyTacticPayload,
    now: Date = new Date()
): TacticResult {
    const { tacticType, siegeEventId } = payload;
    const nowIso = now.toISOString();

    switch (tacticType) {
        case 'scout':
            return applyScoutTactic(province, payload, siegeEventId, nowIso);
        case 'supply':
            return applySupplyTactic(province, payload, siegeEventId, nowIso);
        case 'engineer':
            return applyEngineerTactic(province, payload, siegeEventId, nowIso);
        case 'raid':
            return applyRaidTactic(province, payload, siegeEventId, nowIso);
        case 'retreat':
            return applyRetreatTactic(province, payload, siegeEventId, nowIso);
        default:
            throw new Error(`Unknown tactic type: ${tacticType}`);
    }
}

/**
 * Scout tactic: drives clarification by setting outcome/firstStep/entry time.
 * Resolves siege and transitions province to 'ready' state.
 */
function applyScoutTactic(
    province: Province,
    payload: ApplyTacticPayload,
    siegeEventId: string,
    nowIso: string
): TacticResult {
    const data = payload.data?.tacticType === 'scout' ? payload.data : undefined;

    const updatedProvince: Province = {
        ...province,
        state: 'ready',
        updatedAt: nowIso,
        lastMeaningfulActionAt: nowIso,
        // Apply scout-specific changes
        ...(data?.desiredOutcome && { desiredOutcome: data.desiredOutcome }),
        ...(data?.firstStep && { firstStep: data.firstStep }),
        ...(data?.estimatedEntryMinutes && { estimatedEntryMinutes: data.estimatedEntryMinutes }),
    };

    return {
        province: updatedProvince,
        sideEffects: [{ type: 'resolve_siege_event', siegeEventId }],
        explanation: 'Scout tactic: clarified the province by defining outcome, first step, and entry time.',
    };
}

/**
 * Supply tactic: adds context links and notes.
 * Resolves siege and transitions province to 'ready' state.
 */
function applySupplyTactic(
    province: Province,
    payload: ApplyTacticPayload,
    siegeEventId: string,
    nowIso: string
): TacticResult {
    const data = payload.data?.tacticType === 'supply' ? payload.data : undefined;

    const updatedProvince: Province = {
        ...province,
        state: 'ready',
        updatedAt: nowIso,
        lastMeaningfulActionAt: nowIso,
        // Apply supply-specific changes
        ...(data?.contextLinks && { contextLinks: data.contextLinks }),
        ...(data?.contextNotes && { contextNotes: data.contextNotes }),
    };

    return {
        province: updatedProvince,
        sideEffects: [{ type: 'resolve_siege_event', siegeEventId }],
        explanation: 'Supply tactic: added context and resources to support the province.',
    };
}

/**
 * Engineer tactic: splits province into 3-5 sub-provinces.
 * Resolves siege and transitions province to 'ready' state.
 * Sub-provinces are created as side effects.
 */
function applyEngineerTactic(
    province: Province,
    payload: ApplyTacticPayload,
    siegeEventId: string,
    nowIso: string
): TacticResult {
    const data = payload.data?.tacticType === 'engineer' ? payload.data : undefined;

    if (!data?.subProvinceIds || data.subProvinceIds.length === 0) {
        throw new Error('Engineer tactic requires subProvinceIds to be provided');
    }

    const updatedProvince: Province = {
        ...province,
        state: 'ready',
        updatedAt: nowIso,
        lastMeaningfulActionAt: nowIso,
        decompositionCount: province.decompositionCount + 1,
    };

    // Note: sub-provinces are created by the caller using the subProvinceData
    // The actual province creation happens in the repository layer
    const sideEffects: TacticResult['sideEffects'] = [
        { type: 'resolve_siege_event', siegeEventId },
    ];

    return {
        province: updatedProvince,
        sideEffects,
        explanation: `Engineer tactic: decomposed province into ${data.subProvinceIds.length} sub-provinces for easier management.`,
    };
}

/**
 * Raid tactic: creates a 5-minute entry step.
 * Resolves siege and transitions province to 'in_progress' state.
 */
function applyRaidTactic(
    province: Province,
    payload: ApplyTacticPayload,
    siegeEventId: string,
    nowIso: string
): TacticResult {
    const data = payload.data?.tacticType === 'raid' ? payload.data : undefined;
    const duration = data?.durationMinutes ?? 5;

    const updatedProvince: Province = {
        ...province,
        state: 'in_progress',
        updatedAt: nowIso,
        lastMeaningfulActionAt: nowIso,
    };

    return {
        province: updatedProvince,
        sideEffects: [
            { type: 'resolve_siege_event', siegeEventId },
            {
                type: 'create_daily_move',
                dailyMove: {
                    date: nowIso.split('T')[0],
                    provinceId: province.id,
                    moveType: 'raid',
                    durationMinutes: duration,
                    result: 'started',
                },
            },
        ],
        explanation: `Raid tactic: initiated a quick ${duration}-minute action to break the siege and start progress.`,
    };
}

/**
 * Retreat tactic: defers the province.
 * Resolves siege and transitions province to 'retreated' state.
 */
function applyRetreatTactic(
    province: Province,
    payload: ApplyTacticPayload,
    siegeEventId: string,
    nowIso: string
): TacticResult {
    const data = payload.data?.tacticType === 'retreat' ? payload.data : undefined;

    const updatedProvince: Province = {
        ...province,
        state: 'retreated',
        updatedAt: nowIso,
        lastMeaningfulActionAt: nowIso,
    };

    return {
        province: updatedProvince,
        sideEffects: [{ type: 'resolve_siege_event', siegeEventId }],
        explanation: `Retreat tactic: deferred the province${data?.reason ? ` (${data.reason})` : ''}.`,
    };
}

/**
 * Validates that a tactic payload is complete for the given tactic type.
 */
export function validateTacticPayload(payload: ApplyTacticPayload): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const { tacticType, data } = payload;

    if (!tacticType) {
        errors.push('tacticType is required');
        return { valid: false, errors };
    }

    // Validate tactic-specific data
    if (tacticType === 'engineer') {
        const engineerData = data?.tacticType === 'engineer' ? data : undefined;
        if (!engineerData?.subProvinceIds || engineerData.subProvinceIds.length === 0) {
            errors.push('Engineer tactic requires subProvinceIds');
        }
    }

    if (tacticType === 'raid') {
        const raidData = data?.tacticType === 'raid' ? data : undefined;
        if (raidData?.durationMinutes !== undefined) {
            if (raidData.durationMinutes < 1 || raidData.durationMinutes > 15) {
                errors.push('Raid duration must be between 1 and 15 minutes');
            }
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Returns a human-readable label for a tactic type.
 */
export function getTacticLabel(tacticType: TacticType): string {
    const labels: Record<TacticType, string> = {
        scout: 'Scout',
        supply: 'Supply',
        engineer: 'Engineer',
        raid: 'Raid',
        retreat: 'Retreat',
    };
    return labels[tacticType];
}

/**
 * Returns a short description of what each tactic does.
 */
export function getTacticDescription(tacticType: TacticType): string {
    const descriptions: Record<TacticType, string> = {
        scout: 'Clarify the province by defining outcome, first step, and entry time.',
        supply: 'Add context links and notes to support the province.',
        engineer: 'Split the province into smaller, manageable sub-provinces.',
        raid: 'Take a quick 5-minute action to break the siege.',
        retreat: 'Defer the province to a later time.',
    };
    return descriptions[tacticType];
}
