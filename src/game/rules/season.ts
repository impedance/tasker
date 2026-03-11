/**
 * Season system — EPIC-10-T1, T2, T4
 * Implements season day computation, boundaries, and auto-start logic.
 *
 * Time contract (EPIC-01):
 *   - Day starts at 04:00 local time
 *   - Season lasts 21 days
 *   - dayNumber is computed from startedAt
 */

import type { Season } from '../../entities/types';

/** Season length in days */
export const SEASON_LENGTH_DAYS = 21;

/** Hour at which a new day starts (04:00 local) */
export const DAY_START_HOUR = 4;

/**
 * Computes the current day number for a season.
 * Day starts at 04:00 local time.
 * Returns a number between 1 and 21.
 */
export function getSeasonDayNumber(season: Pick<Season, 'startedAt' | 'timezone'>, now: Date = new Date()): number {
    const startedAt = new Date(season.startedAt);
    
    // Adjust for day start hour (04:00)
    const adjustedNow = adjustForDayStart(now, DAY_START_HOUR);
    const adjustedStart = adjustForDayStart(startedAt, DAY_START_HOUR);
    
    // Calculate days elapsed
    const diffMs = adjustedNow.getTime() - adjustedStart.getTime();
    const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Day 1 is the first day, so add 1
    const dayNumber = daysElapsed + 1;
    
    // Cap at 21
    return Math.min(dayNumber, SEASON_LENGTH_DAYS);
}

/**
 * Adjusts a date to the day start hour.
 * If the time is before DAY_START_HOUR, it belongs to the previous day.
 */
function adjustForDayStart(date: Date, dayStartHour: number): Date {
    const adjusted = new Date(date);
    if (adjusted.getHours() < dayStartHour) {
        adjusted.setDate(adjusted.getDate() - 1);
    }
    adjusted.setHours(0, 0, 0, 0);
    return adjusted;
}

/**
 * Checks if a season has ended (reached day 21).
 */
export function checkSeasonEnd(season: Pick<Season, 'startedAt' | 'timezone'>, now: Date = new Date()): boolean {
    return getSeasonDayNumber(season, now) >= SEASON_LENGTH_DAYS;
}

/**
 * Computes the endsAt date for a season based on startedAt.
 */
export function computeSeasonEndsAt(startedAt: string, _timezone: string): string {
    const start = new Date(startedAt);
    const end = new Date(start);
    end.setDate(end.getDate() + SEASON_LENGTH_DAYS);
    return end.toISOString();
}

/**
 * Creates a new season entity.
 */
export function createSeason(
    title: string,
    startedAt: Date = new Date(),
    timezone: string = 'UTC'
): Omit<Season, 'id' | 'createdAt' | 'updatedAt'> {
    const startedAtIso = startedAt.toISOString();
    return {
        title,
        startedAt: startedAtIso,
        endsAt: computeSeasonEndsAt(startedAtIso, timezone),
        dayNumber: 1,
        timezone,
    };
}

/**
 * Returns the current season phase.
 */
export type SeasonPhase = 'early' | 'mid' | 'late' | 'ended';

export function getSeasonPhase(season: Pick<Season, 'startedAt' | 'timezone'>, now: Date = new Date()): SeasonPhase {
    const dayNumber = getSeasonDayNumber(season, now);
    
    if (dayNumber >= SEASON_LENGTH_DAYS) {
        return 'ended';
    }
    if (dayNumber <= 7) {
        return 'early';
    }
    if (dayNumber <= 14) {
        return 'mid';
    }
    return 'late';
}

/**
 * Computes days remaining in the season.
 */
export function getDaysRemaining(season: Pick<Season, 'startedAt' | 'timezone'>, now: Date = new Date()): number {
    const dayNumber = getSeasonDayNumber(season, now);
    return Math.max(0, SEASON_LENGTH_DAYS - dayNumber);
}

/**
 * Computes the percentage of season completed.
 */
export function getSeasonProgress(season: Pick<Season, 'startedAt' | 'timezone'>, now: Date = new Date()): number {
    const dayNumber = getSeasonDayNumber(season, now);
    return Math.round((dayNumber / SEASON_LENGTH_DAYS) * 100);
}
