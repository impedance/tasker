import { useCallback } from 'react';
import { applyAction } from '../../game/rules/apply-action';
import { domainService } from '../services/domainService';
import { generateFeedbackSignal, shouldTriggerHeroMoment } from '../../game/rules/feedback';
import { runGuardrails, hasBlockerWarning, getBlockerWarnings, getNonBlockerWarnings } from '../../game/rules/guardrails';
import { useFeedbackStore } from '../store/useFeedbackStore';
import { provinceRepository, dailyMoveRepository } from '../../storage/repositories';
import type { Province } from '../../entities/types';
import type { DomainAction } from '../../game/rules/actions';

export function useApplyAction() {
    const triggerSignal = useFeedbackStore(s => s.triggerSignal);
    const triggerHeroMoment = useFeedbackStore(s => s.triggerHeroMoment);
    const triggerWarning = useFeedbackStore(s => s.triggerWarning);

    const execute = useCallback(async (province: Province, action: DomainAction) => {
        // Fetch data for guardrails
        const [allProvinces, history] = await Promise.all([
            provinceRepository.list(),
            dailyMoveRepository.list()
        ]);

        // Run guardrails
        const warnings = runGuardrails(province, allProvinces, history, {
            startedAt: new Date(sessionStorage.getItem('session_start') || new Date().toISOString()),
            meaningfulActionCount: parseInt(sessionStorage.getItem('meaningful_actions') || '0'),
            promptCount: 0 // Mock for now
        });

        if (hasBlockerWarning(warnings)) {
            throw new Error(getBlockerWarnings(warnings)[0].message);
        }

        // Trigger non-blocker warnings
        const nonBlockers = getNonBlockerWarnings(warnings);
        if (nonBlockers.length > 0) {
            triggerWarning(nonBlockers[0].message);
        }

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
