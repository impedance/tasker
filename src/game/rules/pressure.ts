/**
 * Pressure signals — T6
 * Computes front pressure level and hotspot tagging.
 * Pressure is ambient and strategic — NEVER punitive.
 * No territory loss, no streak shame, no score penalties.
 * (EPIC-01 Appendix A, prd.md §6.10)
 */

import type { Province, ProvinceState } from '../../entities/types';
import { SIEGE_DAYS_THRESHOLD, stalledDays } from './transitions';

/**
 * Computes the front pressure level (0..3) for a province.
 *
 * Inputs / thresholds (MVP):
 *   0 — no pressure (fog, captured, retreated, or recently active)
 *   1 — mild: >= 1 day stalled in siege-eligible state, or fortified
 *   2 — moderate: siege state, or stalled >= 5 days, or in_progress with no move >= 5 days
 *   3 — high: siege + stalled >= 7 days, or repeated retreats (isHotspot)
 *
 * Pressure never removes territory or applies negative scoring.
 */
export function computeFrontPressureLevel(
    province: Pick<Province, 'state' | 'lastMeaningfulActionAt' | 'createdAt' | 'isHotspot'>,
    now: Date = new Date()
): 0 | 1 | 2 | 3 {
    const state: ProvinceState = province.state;

    // Terminal / inactive states → no pressure
    if (state === 'captured' || state === 'retreated' || state === 'fog') {
        return 0;
    }

    const days = stalledDays(province, now);

    // Level 3: siege hotspot or very long stall
    if (province.isHotspot && state === 'siege') return 3;
    if (state === 'siege' && days >= 7) return 3;

    // Level 2: currently in siege, or stalled >= 5 days
    if (state === 'siege') return 2;
    if (days >= 5) return 2;

    // Level 1: fortified or mild stall in eligible state
    if (state === 'fortified') return 1;
    if (days >= SIEGE_DAYS_THRESHOLD) return 1; // >= 3 days stalled (but not yet siege)

    return 0;
}

/**
 * A province is a "hotspot" (map-level attention highlight) when it
 * has high recurring pressure — siege or fortified for a long time,
 * or repeated retreats. This field can be persisted if needed for performance.
 *
 * MVP rule: hotspot if:
 *   - currently in siege and stalled >= 7 days, OR
 *   - currently fortified with effortLevel >= 4 and no decomposition
 *
 * Pressure is always presented as a map highlight, never as a penalty.
 */
export function isHotspot(
    province: Pick<Province, 'state' | 'lastMeaningfulActionAt' | 'createdAt' | 'effortLevel' | 'decompositionCount'>,
    now: Date = new Date()
): boolean {
    const days = stalledDays(province, now);

    if (province.state === 'siege' && days >= 7) return true;
    if (
        province.state === 'fortified' &&
        (province.effortLevel ?? 0) >= 4 &&
        province.decompositionCount === 0
    ) {
        return true;
    }

    return false;
}

/**
 * Computes pressure for a set of provinces (e.g., all in a region).
 * Returns a map from provinceId → frontPressureLevel.
 * Never mutates input.
 */
export function computePressureMap(
    provinces: Array<Pick<Province, 'id' | 'state' | 'lastMeaningfulActionAt' | 'createdAt' | 'isHotspot'>>,
    now: Date = new Date()
): Map<string, 0 | 1 | 2 | 3> {
    const result = new Map<string, 0 | 1 | 2 | 3>();
    for (const p of provinces) {
        result.set(p.id, computeFrontPressureLevel(p, now));
    }
    return result;
}
