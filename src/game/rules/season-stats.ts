/**
 * Season summary aggregates — EPIC-10-T4
 * Computes season statistics for summary screen.
 */

import type { Province, SiegeEvent, CampaignArchetypeStats } from '../../entities/types';

export interface SeasonSummary {
    /** Number of provinces clarified (state = ready) */
    clarified: number;
    /** Number of sieges resolved */
    siegesResolved: number;
    /** Number of provinces completed (state = captured) */
    completed: number;
    /** Number of unique days with meaningful actions */
    meaningfulDays: number;
    /** Archetype balance (foundation, drive, joy) */
    archetypeBalance: {
        foundation: number;
        drive: number;
        joy: number;
    };
    /** Total provinces in season */
    totalProvinces: number;
    /** Provinces in progress */
    inProgress: number;
    /** Provinces retreated */
    retreated: number;
}

/**
 * Computes season summary from provinces, siege events, and archetype stats.
 */
export function computeSeasonSummary(
    provinces: Province[],
    siegeEvents: SiegeEvent[],
    archetypeStats: CampaignArchetypeStats | null
): SeasonSummary {
    // Count provinces by state
    const clarified = provinces.filter((p) => p.state === 'ready').length;
    const completed = provinces.filter((p) => p.state === 'captured').length;
    const inProgress = provinces.filter((p) => p.state === 'in_progress').length;
    const retreated = provinces.filter((p) => p.state === 'retreated').length;

    // Count resolved sieges
    const siegesResolved = siegeEvents.filter(
        (s) => s.resolvedAt !== undefined && s.resolvedAt !== null
    ).length;

    // Count meaningful days (unique dates with meaningful actions)
    const meaningfulDates = new Set(
        provinces
            .map((p) => p.lastMeaningfulActionAt)
            .filter((date): date is string => date !== undefined && date !== null)
            .map((date) => new Date(date).toISOString().split('T')[0])
    );
    const meaningfulDays = meaningfulDates.size;

    // Archetype balance
    const archetypeBalance = archetypeStats
        ? {
              foundation: archetypeStats.foundationCount,
              drive: archetypeStats.driveCount,
              joy: archetypeStats.joyCount,
          }
        : {
              foundation: 0,
              drive: 0,
              joy: 0,
          };

    return {
        clarified,
        siegesResolved,
        completed,
        meaningfulDays,
        archetypeBalance,
        totalProvinces: provinces.length,
        inProgress,
        retreated,
    };
}

/**
 * Computes completion rate for a season.
 */
export function computeCompletionRate(summary: SeasonSummary): number {
    if (summary.totalProvinces === 0) {
        return 0;
    }
    return Math.round((summary.completed / summary.totalProvinces) * 100);
}

/**
 * Computes activity rate (meaningful days / season days so far).
 */
export function computeActivityRate(meaningfulDays: number, seasonDays: number): number {
    if (seasonDays === 0) {
        return 0;
    }
    return Math.round((meaningfulDays / seasonDays) * 100);
}

/**
 * Gets the most common province state in a season.
 */
export function getMostCommonState(provinces: Province[]): string | null {
    if (provinces.length === 0) {
        return null;
    }

    const stateCounts: Record<string, number> = {};
    for (const province of provinces) {
        stateCounts[province.state] = (stateCounts[province.state] || 0) + 1;
    }

    let maxCount = 0;
    let mostCommonState: string | null = null;
    for (const [state, count] of Object.entries(stateCounts)) {
        if (count > maxCount) {
            maxCount = count;
            mostCommonState = state;
        }
    }

    return mostCommonState;
}

/**
 * Computes average siege duration for resolved sieges.
 */
export function computeAverageSiegeDuration(siegeEvents: SiegeEvent[]): number {
    const resolved = siegeEvents.filter(
        (s) => s.resolvedAt !== undefined && s.resolvedAt !== null
    );

    if (resolved.length === 0) {
        return 0;
    }

    const totalDuration = resolved.reduce((sum, siege) => {
        const start = new Date(siege.triggeredAt).getTime();
        const end = new Date(siege.resolvedAt!).getTime();
        const durationDays = (end - start) / (1000 * 60 * 60 * 24);
        return sum + durationDays;
    }, 0);

    return Math.round((totalDuration / resolved.length) * 10) / 10;
}
