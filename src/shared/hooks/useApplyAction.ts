import { useCallback } from 'react';
import { applyAction } from '../../game/rules/apply-action';
import { domainService } from '../services/domainService';
import { generateFeedbackSignal, shouldTriggerHeroMoment } from '../../game/rules/feedback';
import { useFeedbackStore } from '../store/useFeedbackStore';
import type { Province } from '../../entities/types';
import type { DomainAction } from '../../game/rules/actions';

export function useApplyAction() {
    const triggerSignal = useFeedbackStore(s => s.triggerSignal);
    const triggerHeroMoment = useFeedbackStore(s => s.triggerHeroMoment);

    const execute = useCallback(async (province: Province, action: DomainAction) => {
        const result = applyAction(province, action);
        if (!result.ok) {
            throw new Error(result.error);
        }

        // Persist province and side effects
        await domainService.persistResult(result);

        // Trigger feedback
        const signal = generateFeedbackSignal({
            provinceState: province.state,
            actionType: action.type,
            isFirstTime: province.state === 'fog' && action.type === 'clarify',
            isSiegeResolution: action.type === 'apply_tactic'
        });

        if (signal) {
            const hero = shouldTriggerHeroMoment(
                action.type,
                province.state === 'fog' && action.type === 'clarify',
                action.type === 'apply_tactic',
                1, // Mock streak
                0  // Mock session hero moments
            );

            if (hero) {
                triggerHeroMoment(signal);
            } else {
                triggerSignal(signal);
            }
        }

        return result;
    }, [triggerSignal, triggerHeroMoment]);

    return { execute };
}
