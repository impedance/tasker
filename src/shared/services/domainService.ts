import { provinceRepository, dailyMoveRepository, siegeEventRepository, chronicleEntryRepository, regionRepository } from '../../storage/repositories';
import type { ApplyActionResult } from '../../game/rules/apply-action';
import type { DomainAction } from '../../game/rules/actions';
import { track } from '../events/event-logger';
import type { ChronicleEntryType, Importance } from '../../entities/types';

export const domainService = {
    async persistResult(action: DomainAction, result: Extract<ApplyActionResult, { ok: true }>) {
        const { province, sideEffects } = result;

        // 1. Persist province update
        await provinceRepository.update(province.id, province);

        // 2. Persist side effects
        for (const effect of sideEffects) {
            switch (effect.type) {
                case 'create_daily_move':
                    await dailyMoveRepository.create({
                        date: new Date().toISOString().split('T')[0],
                        provinceId: effect.provinceId,
                        moveType: effect.moveType,
                        durationMinutes: effect.durationMinutes,
                        result: 'started', // Default for now
                    });
                    break;
                case 'resolve_siege_event': {
                    const siegeEvent = await siegeEventRepository.getById(effect.siegeEventId);
                    if (siegeEvent) {
                        await siegeEventRepository.update(effect.siegeEventId, {
                            resolvedAt: new Date().toISOString(),
                        });
                    }
                    break;
                }
                case 'create_siege_event':
                    await siegeEventRepository.create({
                        provinceId: effect.provinceId,
                        reasonType: effect.reasonType,
                    });
                    break;
            }
        }

        // 3. Track events & Chronicle entries
        const region = await regionRepository.getById(province.regionId);
        const campaignId = region?.campaignId || 'unknown';

        const createChronicle = async (entryType: ChronicleEntryType, title: string, importance: Importance = 'medium') => {
            await chronicleEntryRepository.create({
                campaignId,
                regionId: province.regionId,
                provinceId: province.id,
                entryType,
                title,
                importance
            });
        };

        // Chronicle stays narrative-oriented and uses its own taxonomy,
        // while event names remain in the analytics/event layer.
        const narrativeEntryType: ChronicleEntryType = 'meaningful_day_streak';

        if (action.type === 'clarify') {
            await track({ name: 'province_clarified', payload: { provinceId: province.id } });
            await createChronicle('fog_cleared', `Clarified: ${province.title}`);
        } else if (action.type === 'start_move') {
            await track({
                name: 'province_started',
                payload: { provinceId: province.id, timestamp: new Date().toISOString() }
            });
            await createChronicle(narrativeEntryType, `Started: ${province.title}`);
        } else if (action.type === 'log_move') {
            await track({
                name: 'province_move_logged',
                payload: {
                    provinceId: province.id,
                    moveType: action.payload.moveType || 'assault',
                    durationMinutes: action.payload.durationMinutes || 0
                }
            });
            await createChronicle(narrativeEntryType, `Logged Move: ${province.title}`);
        } else if (action.type === 'apply_tactic') {
            await track({
                name: 'siege_resolved',
                payload: {
                    provinceId: province.id,
                    tactic: action.payload.tacticType,
                    siegeDurationDays: 1 // hardcoded or computed
                }
            });
            await createChronicle('siege_resolved', `Siege Resolved: ${province.title}`);
        } else if (action.type === 'complete') {
            await track({ name: 'province_captured', payload: { provinceId: province.id } });
            await createChronicle(narrativeEntryType, `Captured: ${province.title}`, 'high');
        }
    }
};
