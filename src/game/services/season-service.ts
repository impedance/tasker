/**
 * Season service — EPIC-10-T1, T4
 * Auto-starts new season when current season reaches day 21.
 * Handles season transition including province state migration.
 *
 * Time contract (EPIC-01):
 *   - Season lasts 21 days
 *   - Day starts at 04:00 local time
 *   - On season end: active provinces (in_progress) transition to ready
 */

import { seasonRepository, provinceRepository, playerProfileRepository } from '../../storage/repositories';
import { getSeasonDayNumber, SEASON_LENGTH_DAYS, createSeason } from '../../game/rules/season';
import type { Season, Province } from '../../entities/types';

/**
 * Checks if current season has ended and creates a new season if needed.
 * Returns the new season if created, null otherwise.
 *
 * Season end condition:
 *   - dayNumber >= 21
 *
 * On season transition:
 *   - New season is created with dayNumber = 1
 *   - PlayerProfile.currentSeasonId is updated
 *   - Active provinces (in_progress) transition to ready
 */
export async function checkAndStartNewSeason(now: Date = new Date()): Promise<Season | null> {
    const seasons = await seasonRepository.list();
    const currentSeason = seasons[seasons.length - 1];

    if (!currentSeason) {
        return null;
    }

    const dayNumber = getSeasonDayNumber(currentSeason, now);

    if (dayNumber >= SEASON_LENGTH_DAYS) {
        // Check if already migrated (new season already exists)
        if (seasons.length > seasons.indexOf(currentSeason) + 1) {
            // A newer season already exists
            return null;
        }

        // Create new season
        const newSeasonData = createSeason(
            `Season ${seasons.length + 1}`,
            now,
            currentSeason.timezone || 'UTC'
        );

        const created = await seasonRepository.create(newSeasonData);

        // Update player profile with new season ID
        await playerProfileRepository.update({
            currentSeasonId: created.id,
        });

        // Migrate active provinces (in_progress → ready)
        const provinces = await provinceRepository.list();
        for (const province of provinces) {
            if (province.state === 'in_progress') {
                const updatedProvince: Province = {
                    ...province,
                    state: 'ready',
                    updatedAt: now.toISOString(),
                };
                await provinceRepository.update(province.id, updatedProvince);
            }
        }

        return created;
    }

    return null;
}

/**
 * Gets the current active season.
 * Returns the most recent season that hasn't ended.
 */
export async function getCurrentSeason(): Promise<Season | null> {
    const seasons = await seasonRepository.list();
    if (seasons.length === 0) {
        return null;
    }

    // Return the most recent season
    return seasons[seasons.length - 1];
}

/**
 * Gets season statistics.
 */
export async function getSeasonStats(
    season: Season
): Promise<{
    dayNumber: number;
    daysRemaining: number;
    progress: number;
    phase: 'early' | 'mid' | 'late' | 'ended';
}> {
    const dayNumber = getSeasonDayNumber(season, new Date());
    const daysRemaining = Math.max(0, SEASON_LENGTH_DAYS - dayNumber);
    const progress = Math.round((dayNumber / SEASON_LENGTH_DAYS) * 100);

    const phase: 'early' | 'mid' | 'late' | 'ended' =
        dayNumber >= SEASON_LENGTH_DAYS
            ? 'ended'
            : dayNumber <= 7
              ? 'early'
              : dayNumber <= 14
                ? 'mid'
                : 'late';

    return {
        dayNumber,
        daysRemaining,
        progress,
        phase,
    };
}
