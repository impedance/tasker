/**
 * Event schema v1 — EPIC-12-T1
 * Defines event schema from EPIC-01 Appendix B.
 * Used for local event logging and export.
 */

import { z } from 'zod';

// ============================================================================
// Event types from EPIC-01 Appendix B
// ============================================================================

/** Check-in started event */
export const CheckinStartedEventSchema = z.object({
    name: z.literal('checkin_started'),
    payload: z.object({
        date: z.string(),
    }),
});

/** Check-in completed event */
export const CheckinCompletedEventSchema = z.object({
    name: z.literal('checkin_completed'),
    payload: z.object({
        date: z.string(),
        emotionType: z.string(),
        availableMinutes: z.number(),
    }),
});

/** Daily move viewed event */
export const DailyMoveViewedEventSchema = z.object({
    name: z.literal('daily_move_viewed'),
    payload: z.object({
        date: z.string(),
        interventionId: z.string(),
    }),
});

/** Daily move selected event */
export const DailyMoveSelectedEventSchema = z.object({
    name: z.literal('daily_move_selected'),
    payload: z.object({
        date: z.string(),
        interventionId: z.string(),
        provinceId: z.string(),
        moveType: z.string(),
    }),
});

/** Province started event */
export const ProvinceStartedEventSchema = z.object({
    name: z.literal('province_started'),
    payload: z.object({
        provinceId: z.string(),
        timestamp: z.string(),
    }),
});

/** Province move logged event */
export const ProvinceMoveLoggedEventSchema = z.object({
    name: z.literal('province_move_logged'),
    payload: z.object({
        provinceId: z.string(),
        moveType: z.string(),
        durationMinutes: z.number(),
    }),
});

/** Siege resolved event */
export const SiegeResolvedEventSchema = z.object({
    name: z.literal('siege_resolved'),
    payload: z.object({
        provinceId: z.string(),
        tactic: z.string(),
        siegeDurationDays: z.number(),
    }),
});

/** Hero moment triggered event */
export const HeroMomentTriggeredEventSchema = z.object({
    name: z.literal('hero_moment_triggered'),
    payload: z.object({
        type: z.string(),
        provinceId: z.string().optional(),
    }),
});

/** Capital viewed event */
export const CapitalViewedEventSchema = z.object({
    name: z.literal('capital_viewed'),
    payload: z.object({
        date: z.string(),
    }),
});

/** Chronicle viewed event */
export const ChronicleViewedEventSchema = z.object({
    name: z.literal('chronicle_viewed'),
    payload: z.object({
        date: z.string(),
    }),
});

/** Season debrief completed event */
export const SeasonDebriefCompletedEventSchema = z.object({
    name: z.literal('season_debrief_completed'),
    payload: z.object({
        seasonId: z.string(),
    }),
});

/** Session long no progress event */
export const SessionLongNoProgressEventSchema = z.object({
    name: z.literal('session_long_no_progress'),
    payload: z.object({
        sessionDurationMinutes: z.number(),
    }),
});

/** Tactic applied event */
export const TacticAppliedEventSchema = z.object({
    name: z.literal('tactic_applied'),
    payload: z.object({
        provinceId: z.string(),
        tacticType: z.string(),
        siegeDurationDays: z.number(),
    }),
});

/** Province clarified event */
export const ProvinceClarifiedEventSchema = z.object({
    name: z.literal('province_clarified'),
    payload: z.object({
        provinceId: z.string(),
    }),
});

/** Province captured event */
export const ProvinceCapturedEventSchema = z.object({
    name: z.literal('province_captured'),
    payload: z.object({
        provinceId: z.string(),
    }),
});

/** Meaningful day event */
export const MeaningfulDayEventSchema = z.object({
    name: z.literal('meaningful_day'),
    payload: z.object({
        date: z.string(),
        actionCount: z.number(),
    }),
});

// ============================================================================
// Union schema for all events
// ============================================================================

export const GameEventSchema = z.discriminatedUnion('name', [
    CheckinStartedEventSchema,
    CheckinCompletedEventSchema,
    DailyMoveViewedEventSchema,
    DailyMoveSelectedEventSchema,
    ProvinceStartedEventSchema,
    ProvinceMoveLoggedEventSchema,
    SiegeResolvedEventSchema,
    HeroMomentTriggeredEventSchema,
    CapitalViewedEventSchema,
    ChronicleViewedEventSchema,
    SeasonDebriefCompletedEventSchema,
    SessionLongNoProgressEventSchema,
    TacticAppliedEventSchema,
    ProvinceClarifiedEventSchema,
    ProvinceCapturedEventSchema,
    MeaningfulDayEventSchema,
]);

// ============================================================================
// Type exports
// ============================================================================

export type GameEvent = z.infer<typeof GameEventSchema>;
export type GameEventName = GameEvent['name'];

/** Event envelope for storage with metadata */
export interface EventEnvelope {
    id: string;
    eventName: GameEventName;
    payload: Record<string, unknown>;
    occurredAt: string;
    timezone: string;
    sessionId: string;
}

// ============================================================================
// Event helpers
// ============================================================================

/** Schema version for export compatibility */
export const EVENT_SCHEMA_VERSION = 1;

/**
 * Creates an event envelope for storage.
 */
export function createEventEnvelope(
    event: GameEvent,
    sessionId: string,
    timezone: string = 'UTC'
): Omit<EventEnvelope, 'id'> {
    return {
        eventName: event.name,
        payload: event.payload as Record<string, unknown>,
        occurredAt: new Date().toISOString(),
        timezone,
        sessionId,
    };
}

/**
 * Validates an event against the schema.
 */
export function validateGameEvent(event: unknown): event is GameEvent {
    const result = GameEventSchema.safeParse(event);
    return result.success;
}

/**
 * Gets all valid event names.
 */
export function getValidEventNames(): GameEventName[] {
    return [
        'checkin_started',
        'checkin_completed',
        'daily_move_viewed',
        'daily_move_selected',
        'province_started',
        'province_move_logged',
        'siege_resolved',
        'hero_moment_triggered',
        'capital_viewed',
        'chronicle_viewed',
        'season_debrief_completed',
        'session_long_no_progress',
        'tactic_applied',
        'province_clarified',
        'province_captured',
        'meaningful_day',
    ];
}
