/**
 * Siege detection and SiegeEvent creation — EPIC-07-T1
 * Pure functions for siege auto-trigger after N=3 days without meaningful action.
 *
 * Siege rule (EPIC-01 Appendix D):
 *   - Province enters siege when stalled for >= 3 days in siege-eligible state
 *   - SiegeEvent is created with timestamp and reason
 */

import type { Province, SiegeEvent } from '../../entities/types';
import { SIEGE_DAYS_THRESHOLD, stalledDays, SIEGE_ELIGIBLE_STATES } from './transitions';

export interface SiegeCheckResult {
    shouldTrigger: boolean;
    reasonType: 'no_meaningful_action_3_days' | 'high_effort_no_decomposition' | 'manual' | 'other';
    daysStalled: number;
}

/**
 * Checks if a province should enter siege state.
 * Returns siege check result with reason and days stalled.
 *
 * Siege trigger condition (MVP):
 *   - state is siege-eligible (ready, in_progress, fortified)
 *   - days since lastMeaningfulActionAt (or createdAt) >= 3
 */
export function checkSiege(
    province: Pick<Province, 'state' | 'lastMeaningfulActionAt' | 'createdAt' | 'effortLevel' | 'decompositionCount'>,
    now: Date = new Date()
): SiegeCheckResult {
    const daysStalled = stalledDays(province, now);

    // Check for high effort without decomposition (fortress rule)
    if (
        province.state === 'ready' &&
        (province.effortLevel ?? 0) >= 4 &&
        province.decompositionCount === 0 &&
        daysStalled >= SIEGE_DAYS_THRESHOLD
    ) {
        return {
            shouldTrigger: true,
            reasonType: 'high_effort_no_decomposition',
            daysStalled,
        };
    }

    // Standard siege: no meaningful action for 3+ days
    if (SIEGE_ELIGIBLE_STATES.has(province.state) && daysStalled >= SIEGE_DAYS_THRESHOLD) {
        return {
            shouldTrigger: true,
            reasonType: 'no_meaningful_action_3_days',
            daysStalled,
        };
    }

    return {
        shouldTrigger: false,
        reasonType: 'other',
        daysStalled,
    };
}

/**
 * Creates a SiegeEvent entity for a province entering siege.
 * Caller must persist this event via siegeEventRepository.
 */
export function createSiegeEvent(
    provinceId: string,
    reasonType: 'no_meaningful_action_3_days' | 'high_effort_no_decomposition' | 'manual' | 'other'
): Omit<SiegeEvent, 'id' | 'triggeredAt'> {
    return {
        provinceId,
        reasonType,
    };
}

/**
 * Checks all provinces for siege conditions.
 * Returns list of province IDs that should enter siege.
 * Used at app startup or on province list load.
 */
export function checkAllProvincesForSiege(
    provinces: Array<Pick<Province, 'id' | 'state' | 'lastMeaningfulActionAt' | 'createdAt' | 'effortLevel' | 'decompositionCount'>>,
    now: Date = new Date()
): Array<{ provinceId: string; reasonType: SiegeCheckResult['reasonType']; daysStalled: number }> {
    const results: Array<{
        provinceId: string;
        reasonType: SiegeCheckResult['reasonType'];
        daysStalled: number;
    }> = [];

    for (const province of provinces) {
        const result = checkSiege(province, now);
        if (result.shouldTrigger) {
            results.push({
                provinceId: province.id,
                reasonType: result.reasonType,
                daysStalled: result.daysStalled,
            });
        }
    }

    return results;
}

/**
 * Returns true if a siege event is still active (not resolved).
 * Siege is resolved when resolvedAt is set.
 */
export function isSiegeActive(siegeEvent: Pick<SiegeEvent, 'resolvedAt'>): boolean {
    return siegeEvent.resolvedAt === undefined || siegeEvent.resolvedAt === null;
}

/**
 * Computes siege duration in days for a siege event.
 */
export function getSiegeDurationDays(
    siegeEvent: Pick<SiegeEvent, 'triggeredAt' | 'resolvedAt'>,
    now: Date = new Date()
): number {
    const end = siegeEvent.resolvedAt ? new Date(siegeEvent.resolvedAt) : now;
    const start = new Date(siegeEvent.triggeredAt);
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
