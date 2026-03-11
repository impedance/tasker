import { provinceRepository, dailyMoveRepository, siegeEventRepository } from '../../storage/repositories';
import type { ApplyActionResult } from '../../game/rules/apply-action';

export const domainService = {
    async persistResult(result: Extract<ApplyActionResult, { ok: true }>) {
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
                        moveType: effect.moveType as any,
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
    }
};
