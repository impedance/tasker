/**
 * Tactic effectiveness logging — EPIC-07-T4
 * Tracks tactic application and subsequent progress for later analysis.
 *
 * Tracks:
 *   - provinceId
 *   - tacticType
 *   - timestamp
 *   - siegeDuration_days
 *
 * Subsequent progress:
 *   - province moved to in_progress within 24h
 *   - province completed within 7 days
 */

import type { TacticType, SiegeEvent, Province, ProvinceState } from '../../entities/types';
import { getSiegeDurationDays } from './siege';

export interface TacticEffectivenessRecord {
    /** Unique ID for this tactic application */
    id: string;
    /** Province the tactic was applied to */
    provinceId: string;
    /** Type of tactic applied */
    tacticType: TacticType;
    /** When the tactic was applied */
    appliedAt: string;
    /** How long the province was in siege before tactic */
    siegeDurationDays: number;
    /** Whether province moved to in_progress within 24h */
    progressedWithin24h?: boolean;
    /** Whether province was completed within 7 days */
    completedWithin7Days?: boolean;
    /** Final state of province (for analysis) */
    finalState?: ProvinceState;
}

/**
 * Creates a tactic effectiveness record from a siege event and tactic application.
 */
export function createTacticEffectivenessRecord(
    provinceId: string,
    tacticType: TacticType,
    siegeEvent: Pick<SiegeEvent, 'triggeredAt' | 'resolvedAt'>,
    appliedAt: Date = new Date()
): Omit<TacticEffectivenessRecord, 'id'> {
    const siegeDurationDays = getSiegeDurationDays(siegeEvent, appliedAt);

    return {
        provinceId,
        tacticType,
        appliedAt: appliedAt.toISOString(),
        siegeDurationDays,
    };
}

/**
 * Checks if a province progressed within 24 hours after tactic application.
 */
export function checkProgressWithin24h(
    province: Pick<Province, 'state' | 'updatedAt'>,
    tacticAppliedAt: string
): boolean {
    const appliedDate = new Date(tacticAppliedAt);
    const updatedDate = new Date(province.updatedAt);
    const hoursDiff = (updatedDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60);

    return (
        province.state === 'in_progress' &&
        hoursDiff >= 0 &&
        hoursDiff <= 24
    );
}

/**
 * Checks if a province was completed within 7 days after tactic application.
 */
export function checkCompletedWithin7Days(
    province: Pick<Province, 'state' | 'updatedAt'>,
    tacticAppliedAt: string
): boolean {
    const appliedDate = new Date(tacticAppliedAt);
    const updatedDate = new Date(province.updatedAt);
    const daysDiff = (updatedDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24);

    return (
        province.state === 'captured' &&
        daysDiff >= 0 &&
        daysDiff <= 7
    );
}

/**
 * Updates a tactic effectiveness record with progress tracking data.
 */
export function updateTacticEffectivenessRecord(
    record: Omit<TacticEffectivenessRecord, 'id'>,
    province: Pick<Province, 'state' | 'updatedAt'>
): Omit<TacticEffectivenessRecord, 'id'> {
    return {
        ...record,
        progressedWithin24h: checkProgressWithin24h(province, record.appliedAt),
        completedWithin7Days: checkCompletedWithin7Days(province, record.appliedAt),
        finalState: province.state,
    };
}

/**
 * Aggregates tactic effectiveness statistics.
 * Returns counts and success rates by tactic type.
 */
export function aggregateTacticEffectiveness(
    records: TacticEffectivenessRecord[]
): Record<
    TacticType,
    {
        count: number;
        avgSiegeDuration: number;
        progressedWithin24hCount: number;
        progressedWithin24hRate: number;
        completedWithin7DaysCount: number;
        completedWithin7DaysRate: number;
    }
> {
    const tacticTypes: TacticType[] = ['scout', 'supply', 'engineer', 'raid', 'retreat'];
    const result: Record<
        TacticType,
        {
            count: number;
            avgSiegeDuration: number;
            progressedWithin24hCount: number;
            progressedWithin24hRate: number;
            completedWithin7DaysCount: number;
            completedWithin7DaysRate: number;
        }
    > = {} as any;

    for (const tacticType of tacticTypes) {
        const tacticRecords = records.filter((r) => r.tacticType === tacticType);
        const count = tacticRecords.length;

        if (count === 0) {
            result[tacticType] = {
                count: 0,
                avgSiegeDuration: 0,
                progressedWithin24hCount: 0,
                progressedWithin24hRate: 0,
                completedWithin7DaysCount: 0,
                completedWithin7DaysRate: 0,
            };
            continue;
        }

        const totalSiegeDuration = tacticRecords.reduce((sum, r) => sum + r.siegeDurationDays, 0);
        const progressedCount = tacticRecords.filter((r) => r.progressedWithin24h).length;
        const completedCount = tacticRecords.filter((r) => r.completedWithin7Days).length;

        result[tacticType] = {
            count,
            avgSiegeDuration: Math.round((totalSiegeDuration / count) * 10) / 10,
            progressedWithin24hCount: progressedCount,
            progressedWithin24hRate: Math.round((progressedCount / count) * 100) / 100,
            completedWithin7DaysCount: completedCount,
            completedWithin7DaysRate: Math.round((completedCount / count) * 100) / 100,
        };
    }

    return result;
}

/**
 * Exports tactic effectiveness data for correlation analysis.
 * Returns data in a format suitable for CSV export or analytics.
 */
export function exportTacticEffectivenessData(
    records: TacticEffectivenessRecord[]
): Array<{
    provinceId: string;
    tacticType: string;
    appliedAt: string;
    siegeDurationDays: number;
    progressedWithin24h: boolean;
    completedWithin7Days: boolean;
    finalState: string;
}> {
    return records.map((r) => ({
        provinceId: r.provinceId,
        tacticType: r.tacticType,
        appliedAt: r.appliedAt,
        siegeDurationDays: r.siegeDurationDays,
        progressedWithin24h: r.progressedWithin24h ?? false,
        completedWithin7Days: r.completedWithin7Days ?? false,
        finalState: r.finalState ?? 'unknown',
    }));
}
