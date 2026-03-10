/**
 * applyAction — core rule engine entry point — T3
 * EPIC-06: province state transitions via pure functions.
 *
 * Contract:
 *   - Takes current province + domain action, returns new province + side effects (or error).
 *   - Never mutates input.
 *   - UI must never set province.state directly; always goes through applyAction.
 *   - Side effects (siege events, daily moves) are returned for the caller to persist.
 */

import type { Province, ProvinceState } from '../../entities/types';
import type { DomainAction, SideEffect } from './actions';
import { isMeaningfulAction } from './actions';
import { isFog, getMissingClarityFields } from './fog';
import { advanceProgressStage } from './progress';
import { getNextState, shouldFortify } from './transitions';
import { validateActionPayload, validateProvinceFields, mergeValidation } from './validation';

// ============================================================================
// Result type
// ============================================================================

export type ApplyActionResult =
    | { ok: true; province: Province; sideEffects: SideEffect[] }
    | { ok: false; error: string };

// ============================================================================
// applyAction
// ============================================================================

/**
 * Applies a domain action to a province.
 * Returns a new province state and a list of side effects to persist.
 * On invalid transitions or validation failure, returns { ok: false, error }.
 */
export function applyAction(
    province: Province,
    action: DomainAction,
    now: Date = new Date()
): ApplyActionResult {
    const nowIso = now.toISOString();
    const sideEffects: SideEffect[] = [];

    // ------------------------------------------------------------------
    // Step 1: validate the action payload (T7)
    // ------------------------------------------------------------------
    const payloadValidation = validateActionPayload(action);
    const fieldValidation =
        action.type === 'edit_fields'
            ? validateProvinceFields(action.payload)
            : { valid: true, errors: [] as string[] };
    const validation = mergeValidation(payloadValidation, fieldValidation);

    if (!validation.valid) {
        return { ok: false, error: `Validation failed: ${validation.errors.join('; ')}` };
    }

    // ------------------------------------------------------------------
    // Step 2: check transition is allowed (T3)
    // ------------------------------------------------------------------
    const nextState = getNextState(province.state, action);
    if (nextState === null) {
        return {
            ok: false,
            error: `Transition '${action.type}' is not allowed from state '${province.state}'`,
        };
    }

    // ------------------------------------------------------------------
    // Step 3: action-specific guards
    // ------------------------------------------------------------------

    // clarify: verify that after applying the payload the province would not be fog
    if (action.type === 'clarify') {
        const merged = {
            desiredOutcome: action.payload.desiredOutcome,
            firstStep: action.payload.firstStep,
            estimatedEntryMinutes: action.payload.estimatedEntryMinutes,
        };
        if (isFog(merged)) {
            return {
                ok: false,
                error: `Clarify action does not satisfy all fog requirements. Missing: ${getMissingClarityFields(merged).join(', ')}`,
            };
        }
    }



    // ------------------------------------------------------------------
    // Step 4: build next province (immutable update)
    // ------------------------------------------------------------------
    let nextProvince: Province = {
        ...province,
        state: nextState,
        updatedAt: nowIso,
    };

    // Update meaningful timestamp
    if (isMeaningfulAction(action)) {
        nextProvince = { ...nextProvince, lastMeaningfulActionAt: nowIso };
    }

    // ------------------------------------------------------------------
    // Step 5: action-specific field mutations
    // ------------------------------------------------------------------

    switch (action.type) {
        case 'clarify':
            nextProvince = {
                ...nextProvince,
                desiredOutcome: action.payload.desiredOutcome,
                firstStep: action.payload.firstStep,
                estimatedEntryMinutes: action.payload.estimatedEntryMinutes,
                ...(action.payload.clarityLevel !== undefined && {
                    clarityLevel: action.payload.clarityLevel,
                }),
            };
            break;

        case 'supply':
            nextProvince = {
                ...nextProvince,
                ...(action.payload.contextLinks !== undefined && {
                    contextLinks: action.payload.contextLinks,
                }),
                ...(action.payload.contextNotes !== undefined && {
                    contextNotes: action.payload.contextNotes,
                }),
            };
            break;

        case 'decompose':
            nextProvince = {
                ...nextProvince,
                decompositionCount: province.decompositionCount + 1,
            };
            break;

        case 'log_move':
            // Create a side effect so the caller can persist a DailyMove
            sideEffects.push({
                type: 'create_daily_move',
                provinceId: province.id,
                moveType: action.payload.moveType ?? 'assault',
                durationMinutes: action.payload.durationMinutes,
            });
            break;

        case 'start_move':
            sideEffects.push({
                type: 'create_daily_move',
                provinceId: province.id,
                moveType: action.payload.moveType ?? 'raid',
                durationMinutes: action.payload.durationMinutes,
            });
            break;

        case 'apply_tactic': {
            const { tacticType, siegeEventId, data } = action.payload;

            // Resolve the siege event
            sideEffects.push({ type: 'resolve_siege_event', siegeEventId });

            // Tactic-specific mutations
            if (tacticType === 'scout' && data && data.tacticType === 'scout') {
                nextProvince = {
                    ...nextProvince,
                    ...(data.desiredOutcome !== undefined && { desiredOutcome: data.desiredOutcome }),
                    ...(data.firstStep !== undefined && { firstStep: data.firstStep }),
                    ...(data.estimatedEntryMinutes !== undefined && {
                        estimatedEntryMinutes: data.estimatedEntryMinutes,
                    }),
                };
            } else if (tacticType === 'supply' && data && data.tacticType === 'supply') {
                nextProvince = {
                    ...nextProvince,
                    ...(data.contextLinks !== undefined && { contextLinks: data.contextLinks }),
                    ...(data.contextNotes !== undefined && { contextNotes: data.contextNotes }),
                };
            } else if (tacticType === 'engineer' && data && data.tacticType === 'engineer') {
                nextProvince = {
                    ...nextProvince,
                    decompositionCount: province.decompositionCount + 1,
                };
            } else if (tacticType === 'raid' && data && data.tacticType === 'raid') {
                sideEffects.push({
                    type: 'create_daily_move',
                    provinceId: province.id,
                    moveType: 'raid',
                    durationMinutes: data.durationMinutes,
                });
            }
            break;
        }

        case 'edit_fields':
            // Non-meaningful: only update allowed fields
            nextProvince = {
                ...nextProvince,
                ...(action.payload.title !== undefined && { title: action.payload.title }),
                ...(action.payload.description !== undefined && { description: action.payload.description }),
                ...(action.payload.dueDate !== undefined && { dueDate: action.payload.dueDate }),
                ...(action.payload.effortLevel !== undefined && { effortLevel: action.payload.effortLevel }),
                ...(action.payload.clarityLevel !== undefined && { clarityLevel: action.payload.clarityLevel }),
                ...(action.payload.emotionalFrictionType !== undefined && {
                    emotionalFrictionType: action.payload.emotionalFrictionType,
                }),
                ...(action.payload.provinceRole !== undefined && { provinceRole: action.payload.provinceRole }),
                ...(action.payload.mapSlotId !== undefined && { mapSlotId: action.payload.mapSlotId }),
            };
            // After edit_fields: re-evaluate fortify rule
            if (shouldFortify(nextProvince)) {
                nextProvince = { ...nextProvince, state: 'fortified' };
            }
            // After edit_fields: if fog fields now all present, allow state to become ready
            // (but don't auto-transition fog → ready; user must call clarify action)
            break;

        default:
            break;
    }

    // ------------------------------------------------------------------
    // Step 6: advance progressStage
    // ------------------------------------------------------------------
    const tacticTypeForProgress =
        action.type === 'apply_tactic' ? action.payload.tacticType : undefined;

    nextProvince = {
        ...nextProvince,
        progressStage: advanceProgressStage(province.progressStage, action.type, tacticTypeForProgress),
    };

    return { ok: true, province: nextProvince, sideEffects };
}

// ============================================================================
// System trigger: checkSiegeTrigger
// Exposed for the store/scheduler to call periodically — not part of applyAction.
// ============================================================================

import { shouldEnterSiege } from './transitions';

export interface SiegeTriggerResult {
    triggered: boolean;
    province?: Province;
    sideEffect?: SideEffect;
}

/**
 * Returns a new province in 'siege' state and a create_siege_event side-effect
 * if the siege trigger condition is met. Otherwise returns { triggered: false }.
 *
 * Callers must persist the side effect (create SiegeEvent in DB).
 */
export function checkSiegeTrigger(
    province: Province,
    now: Date = new Date()
): SiegeTriggerResult {
    if (!shouldEnterSiege(province, now)) return { triggered: false };

    const nowIso = now.toISOString();
    const nextProvince: Province = {
        ...province,
        state: 'siege' as ProvinceState,
        updatedAt: nowIso,
    };

    return {
        triggered: true,
        province: nextProvince,
        sideEffect: {
            type: 'create_siege_event',
            provinceId: province.id,
            reasonType: 'no_meaningful_action_3_days',
        },
    };
}

/**
 * Returns a new province in 'fortified' state if the fortify trigger is met.
 * Called after edit_fields changes effortLevel or decompositionCount.
 */
export function checkFortifyTrigger(province: Province): Province | null {
    if (!shouldFortify(province)) return null;
    return { ...province, state: 'fortified', updatedAt: new Date().toISOString() };
}
