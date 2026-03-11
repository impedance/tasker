/**
 * Feedback consumer hook — EPIC-11-T3
 * Consumes feedback signals from applyAction and triggers UI effects.
 * Manages hero moment display with session-based rate limiting.
 */

import { useState, useCallback } from 'react';
import type { FeedbackSignal } from '../../game/rules/feedback';
import { track } from '../events/event-logger';

const HERO_MOMENT_SESSION_KEY = 'lastHeroMoment';
const HERO_MOMENT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown

export function useFeedbackConsumer() {
    const [pendingSignals, setPendingSignals] = useState<FeedbackSignal[]>([]);

    /**
     * Consumes feedback signals and triggers UI effects.
     * Hero moments are rate-limited to once per hour per session.
     */
    const consumeSignals = useCallback(async (signals: FeedbackSignal[]) => {
        setPendingSignals(signals);

        // Log feedback seen events using hero_moment_triggered for milestone events
        for (const signal of signals) {
            if (signal.type === 'milestone') {
                void track({
                    name: 'hero_moment_triggered',
                    payload: {
                        type: signal.trigger,
                    },
                });
            }
        }

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setPendingSignals([]);
        }, 5000);
    }, []);

    /**
     * Consumes signals and triggers hero moment if eligible.
     * Hero moments are shown for milestone signals with session cooldown.
     */
    const consumeSignalsWithHeroMoment = useCallback(async (signals: FeedbackSignal[]) => {
        const milestoneSignals = signals.filter((s) => s.type === 'milestone');

        // Check if eligible for hero moment
        const lastHeroMoment = sessionStorage.getItem(HERO_MOMENT_SESSION_KEY);
        const now = Date.now();
        const isEligible =
            !lastHeroMoment || now - parseInt(lastHeroMoment, 10) > HERO_MOMENT_COOLDOWN_MS;

        if (milestoneSignals.length > 0 && isEligible) {
            // Set hero moment timestamp
            sessionStorage.setItem(HERO_MOMENT_SESSION_KEY, now.toString());

            // Log hero moment triggered
            void track({
                name: 'hero_moment_triggered',
                payload: {
                    type: milestoneSignals[0].trigger,
                },
            });
        }

        // Consume all signals (hero moment overlay will handle display)
        setPendingSignals(signals);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setPendingSignals([]);
        }, 5000);
    }, []);

    /**
     * Clears all pending signals.
     */
    const clearSignals = useCallback(() => {
        setPendingSignals([]);
    }, []);

    return {
        pendingSignals,
        consumeSignals,
        consumeSignalsWithHeroMoment,
        clearSignals,
    };
}
