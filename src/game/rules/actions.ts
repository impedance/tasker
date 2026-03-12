/**
 * Domain action types and payload schemas for the rule engine
 * EPIC-06 — T1: Define domain action set
 *
 * Action taxonomy (from EPIC-01 Appendix D + H):
 *   Meaningful: clarify, supply, decompose, start_move, log_move, apply_tactic, complete, retreat, reschedule
 *   Non-meaningful: edit_fields (cosmetic/administrative updates)
 *
 * These actions are dispatched by UI; never set province.state directly.
 */

import { z } from 'zod';
import { TacticTypeSchema, MoveTypeSchema } from '../../entities/schemas';
import type { MoveType } from '../../entities/types';

// ============================================================================
// Payload schemas
// ============================================================================

/** clarify: fills fog-required clarity fields, transitions fog → ready */
export const ClarifyPayloadSchema = z.object({
    desiredOutcome: z.string().min(1),
    firstStep: z.string().min(1),
    estimatedEntryMinutes: z.number().int().min(1),
    // Optional refinements
    clarityLevel: z.number().int().min(1).max(5).optional(),
});

/** supply: adds context links/notes; reduce friction (prepare) */
export const SupplyPayloadSchema = z.object({
    contextLinks: z.array(z.string()).optional(),
    contextNotes: z.string().optional(),
});

/** decompose/split: creates sub-provinces; bumps decompositionCount */
export const DecomposePayloadSchema = z.object({
    /** IDs of newly created sub-provinces (created before dispatching this action) */
    subProvinceIds: z.array(z.string()).min(1).max(10),
});

/** start_move: first real step → ready → in_progress */
export const StartMovePayloadSchema = z.object({
    durationMinutes: z.number().int().min(1),
    moveType: MoveTypeSchema.optional(),
});

/** log_move: subsequent real steps while in_progress */
export const LogMovePayloadSchema = z.object({
    durationMinutes: z.number().int().min(1),
    moveType: MoveTypeSchema.optional(),
    /** optional note stored on province (never reaches analytics in raw form) */
    note: z.string().optional(),
});

/** apply_tactic: resolves siege by applying one of 5 tactics */
export const ApplyTacticPayloadSchema = z.object({
    tacticType: TacticTypeSchema,
    /** siege event that triggered this tactic */
    siegeEventId: z.string(),
    /** tactic-specific carry-along data */
    data: z
        .discriminatedUnion('tacticType', [
            // scout: rewrites clarity fields
            z.object({
                tacticType: z.literal('scout'),
                desiredOutcome: z.string().min(1).optional(),
                firstStep: z.string().min(1).optional(),
                estimatedEntryMinutes: z.number().int().min(1).optional(),
            }),
            // supply: adds context
            z.object({
                tacticType: z.literal('supply'),
                contextLinks: z.array(z.string()).optional(),
                contextNotes: z.string().optional(),
            }),
            // engineer: decompose
            z.object({
                tacticType: z.literal('engineer'),
                subProvinceIds: z.array(z.string()).min(1).max(10),
            }),
            // raid: 5-minute entry step → in_progress
            z.object({
                tacticType: z.literal('raid'),
                durationMinutes: z.number().int().min(1).max(15),
            }),
            // retreat: reschedule/remove
            z.object({
                tacticType: z.literal('retreat'),
                reason: z.string().optional(),
            }),
        ])
        .optional(),
});

/** complete: user marks province done → captured */
export const CompletePayloadSchema = z.object({
    note: z.string().optional(),
});

/** retreat: conscious deferral outside siege */
export const RetreatPayloadSchema = z.object({
    reason: z.string().optional(),
});

/** reschedule: same as retreat semantically in MVP */
export const ReschedulePayloadSchema = z.object({
    dueDate: z.string().optional(),
    reason: z.string().optional(),
});

/** edit_fields: non-meaningful cosmetic/administrative updates */
export const EditFieldsPayloadSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    effortLevel: z.number().int().min(1).max(5).optional(),
    clarityLevel: z.number().int().min(1).max(5).optional(),
    emotionalFrictionType: z
        .enum(['anxiety', 'boredom', 'fatigue', 'irritation', 'fear_of_outcome', 'ambiguity'])
        .optional(),
    provinceRole: z.enum(['standard', 'fortress', 'watchtower', 'archive', 'depot']).optional(),
    mapSlotId: z.string().optional(),
});

// ============================================================================
// Domain action union
// ============================================================================

export type ClarifyPayload = z.infer<typeof ClarifyPayloadSchema>;
export type SupplyPayload = z.infer<typeof SupplyPayloadSchema>;
export type DecomposePayload = z.infer<typeof DecomposePayloadSchema>;
export type StartMovePayload = z.infer<typeof StartMovePayloadSchema>;
export type LogMovePayload = z.infer<typeof LogMovePayloadSchema>;
export type ApplyTacticPayload = z.infer<typeof ApplyTacticPayloadSchema>;
export type CompletePayload = z.infer<typeof CompletePayloadSchema>;
export type RetreatPayload = z.infer<typeof RetreatPayloadSchema>;
export type ReschedulePayload = z.infer<typeof ReschedulePayloadSchema>;
export type EditFieldsPayload = z.infer<typeof EditFieldsPayloadSchema>;

export type DomainAction =
    | { type: 'clarify'; payload: ClarifyPayload }
    | { type: 'supply'; payload: SupplyPayload }
    | { type: 'decompose'; payload: DecomposePayload }
    | { type: 'start_move'; payload: StartMovePayload }
    | { type: 'log_move'; payload: LogMovePayload }
    | { type: 'apply_tactic'; payload: ApplyTacticPayload }
    | { type: 'complete'; payload: CompletePayload }
    | { type: 'retreat'; payload: RetreatPayload }
    | { type: 'reschedule'; payload: ReschedulePayload }
    | { type: 'edit_fields'; payload: EditFieldsPayload };

export type ActionType = DomainAction['type'];

/** Meaningful actions update lastMeaningfulActionAt and unlock feedback */
export const MEANINGFUL_ACTION_TYPES = new Set<ActionType>([
    'clarify',
    'supply',
    'decompose',
    'start_move',
    'log_move',
    'apply_tactic',
    'complete',
    'retreat',
    'reschedule',
]);

export function isMeaningfulAction(action: DomainAction): boolean {
    return MEANINGFUL_ACTION_TYPES.has(action.type);
}

// ============================================================================
// Side effects returned by applyAction
// ============================================================================

/** Side effects are returned from applyAction; callers persist them */
export type SideEffect =
    | {
        type: 'create_siege_event';
        provinceId: string;
        reasonType: 'no_meaningful_action_3_days' | 'high_effort_no_decomposition' | 'manual' | 'other';
    }
    | {
        type: 'resolve_siege_event';
        siegeEventId: string;
    }
    | {
        type: 'create_daily_move';
        provinceId: string;
        moveType: MoveType;
        durationMinutes: number;
    };
