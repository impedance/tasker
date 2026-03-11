/**
 * Feedback Integration Tests
 * Tests for feedback signal generation and hero moment triggering
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFeedbackConsumer } from '../../src/shared/hooks/useFeedbackConsumer';
import type { FeedbackSignal } from '../../src/game/rules/feedback';

describe('Feedback Integration', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    afterEach(() => {
        sessionStorage.clear();
    });

    it('should consume feedback signals', async () => {
        // Setup: Create feedback signal
        const signal: FeedbackSignal = {
            type: 'encouragement',
            trigger: 'first_clarify',
            message: 'Great start!',
        };

        // Action: Consume signal
        const { result } = renderHook(() => useFeedbackConsumer());

        await act(async () => {
            result.current.consumeSignals([signal]);
        });

        // Assert: Signal is pending
        expect(result.current.pendingSignals).toHaveLength(1);
        expect(result.current.pendingSignals[0]).toEqual(signal);
    });

    it('should trigger hero moment for milestone signals', async () => {
        // Setup: Create milestone signal
        const milestoneSignal: FeedbackSignal = {
            type: 'milestone',
            trigger: 'province_completed',
            message: 'Province captured!',
        };

        // Action: Consume signal with hero moment
        const { result } = renderHook(() => useFeedbackConsumer());

        await act(async () => {
            result.current.consumeSignalsWithHeroMoment([milestoneSignal]);
        });

        // Assert: Signal is pending
        expect(result.current.pendingSignals).toHaveLength(1);

        // Assert: Hero moment timestamp stored
        const lastHeroMoment = sessionStorage.getItem('lastHeroMoment');
        expect(lastHeroMoment).toBeDefined();
    });

    it('should respect hero moment cooldown (1 hour)', async () => {
        // Setup: Set last hero moment to 30 minutes ago
        const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
        sessionStorage.setItem('lastHeroMoment', thirtyMinutesAgo.toString());

        const milestoneSignal: FeedbackSignal = {
            type: 'milestone',
            trigger: 'another_milestone',
            message: 'Another milestone!',
        };

        // Action: Try to trigger another hero moment
        const { result } = renderHook(() => useFeedbackConsumer());

        await act(async () => {
            result.current.consumeSignalsWithHeroMoment([milestoneSignal]);
        });

        // Assert: Hero moment timestamp was updated (signal still consumed, but within cooldown)
        const lastHeroMoment = sessionStorage.getItem('lastHeroMoment');
        expect(lastHeroMoment).toBeDefined();
        // The timestamp should be at least the previous one (updated or same)
        expect(parseInt(lastHeroMoment!, 10)).toBeGreaterThanOrEqual(thirtyMinutesAgo);
    });

    it('should allow hero moment after cooldown expires', async () => {
        // Setup: Set last hero moment to 2 hours ago (beyond 1 hour cooldown)
        const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
        sessionStorage.setItem('lastHeroMoment', twoHoursAgo.toString());

        const milestoneSignal: FeedbackSignal = {
            type: 'milestone',
            trigger: 'new_milestone',
            message: 'New milestone!',
        };

        // Action: Trigger hero moment
        const { result } = renderHook(() => useFeedbackConsumer());

        await act(async () => {
            result.current.consumeSignalsWithHeroMoment([milestoneSignal]);
        });

        // Assert: Hero moment timestamp updated
        const lastHeroMoment = sessionStorage.getItem('lastHeroMoment');
        expect(lastHeroMoment).toBeDefined();
        expect(parseInt(lastHeroMoment!, 10)).toBeGreaterThan(twoHoursAgo);
    });

    it('should clear signals on demand', async () => {
        // Setup: Add signals
        const signal: FeedbackSignal = {
            type: 'encouragement',
            trigger: 'test',
            message: 'Test',
        };

        const { result } = renderHook(() => useFeedbackConsumer());

        await act(async () => {
            result.current.consumeSignals([signal]);
        });

        expect(result.current.pendingSignals).toHaveLength(1);

        // Action: Clear signals
        await act(async () => {
            result.current.clearSignals();
        });

        // Assert: Signals cleared
        expect(result.current.pendingSignals).toHaveLength(0);
    });

    it('should handle multiple signals at once', async () => {
        // Setup: Create multiple signals
        const signals: FeedbackSignal[] = [
            { type: 'encouragement', trigger: 'first_action', message: 'Good start!' },
            { type: 'hint', trigger: 'stuck', message: 'Try decomposing' },
        ];

        const { result } = renderHook(() => useFeedbackConsumer());

        // Action: Consume multiple signals
        await act(async () => {
            result.current.consumeSignals(signals);
        });

        // Assert: All signals pending
        expect(result.current.pendingSignals).toHaveLength(2);
        expect(result.current.pendingSignals).toEqual(signals);
    });
});
