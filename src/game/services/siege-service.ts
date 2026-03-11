/**
 * Siege service — EPIC-07-T1
 * Auto-triggers siege detection for all provinces at app startup.
 * Creates SiegeEvent entries for provinces that meet siege criteria.
 */

import { provinceRepository, siegeEventRepository } from '../../storage/repositories';
import { checkSiege, createSiegeEvent } from '../../game/rules/siege';
import type { Province } from '../../entities/types';

/**
 * Checks all provinces for siege conditions and creates siege events.
 * Returns the number of new siege events created.
 * 
 * Siege trigger condition:
 *   - state is siege-eligible (ready, in_progress, fortified)
 *   - days since lastMeaningfulActionAt (or createdAt) >= 3
 *   - province is not already in siege state
 */
export async function checkAndCreateSieges(now: Date = new Date()): Promise<number> {
    const provinces = await provinceRepository.list();
    let siegeCount = 0;

    for (const province of provinces) {
        // Skip if already in siege state
        if (province.state === 'siege') {
            continue;
        }

        const siegeCheck = checkSiege(province, now);

        if (siegeCheck.shouldTrigger) {
            // Update province state to siege
            const updatedProvince: Province = {
                ...province,
                state: 'siege',
                updatedAt: now.toISOString(),
            };
            await provinceRepository.update(province.id, updatedProvince);

            // Create siege event
            const siegeEventData = createSiegeEvent(province.id, siegeCheck.reasonType);
            await siegeEventRepository.create(siegeEventData);

            siegeCount++;
        }
    }

    return siegeCount;
}

/**
 * Checks a single province for siege conditions.
 * Returns true if siege was triggered.
 */
export async function checkProvinceForSiege(
    provinceId: string,
    now: Date = new Date()
): Promise<boolean> {
    const province = await provinceRepository.getById(provinceId);
    if (!province) {
        return false;
    }

    // Skip if already in siege state
    if (province.state === 'siege') {
        return false;
    }

    const siegeCheck = checkSiege(province, now);

    if (siegeCheck.shouldTrigger) {
        // Update province state to siege
        const updatedProvince: Province = {
            ...province,
            state: 'siege',
            updatedAt: now.toISOString(),
        };
        await provinceRepository.update(province.id, updatedProvince);

        // Create siege event
        const siegeEventData = createSiegeEvent(province.id, siegeCheck.reasonType);
        await siegeEventRepository.create(siegeEventData);

        return true;
    }

    return false;
}
