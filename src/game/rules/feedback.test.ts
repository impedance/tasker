/**
 * Feedback tests — EPIC-11-T1, T2
 */

import { describe, it, expect } from 'vitest';
import {
    shouldTriggerFeedback,
    getFeedbackTypeForAction,
    generateFeedbackSignal,
    shouldTriggerHeroMoment,
} from './feedback';
import type { FeedbackContext } from './feedback';

describe('shouldTriggerFeedback', () => {
    it('should return true for meaningful actions', () => {
        expect(shouldTriggerFeedback('clarify')).toBe(true);
        expect(shouldTriggerFeedback('supply')).toBe(true);
        expect(shouldTriggerFeedback('decompose')).toBe(true);
        expect(shouldTriggerFeedback('start_move')).toBe(true);
        expect(shouldTriggerFeedback('log_move')).toBe(true);
        expect(shouldTriggerFeedback('apply_tactic')).toBe(true);
        expect(shouldTriggerFeedback('complete')).toBe(true);
        expect(shouldTriggerFeedback('retreat')).toBe(true);
    });

    it('should return false for passive actions', () => {
        expect(shouldTriggerFeedback('edit_fields')).toBe(false);
        expect(shouldTriggerFeedback('reschedule')).toBe(false);
    });
});

describe('getFeedbackTypeForAction', () => {
    it('should return subtle for clarify, supply, decompose', () => {
        expect(getFeedbackTypeForAction('clarify')).toBe('subtle');
        expect(getFeedbackTypeForAction('supply')).toBe('subtle');
        expect(getFeedbackTypeForAction('decompose')).toBe('subtle');
    });

    it('should return strong for start_move, log_move', () => {
        expect(getFeedbackTypeForAction('start_move')).toBe('strong');
        expect(getFeedbackTypeForAction('log_move')).toBe('strong');
    });

    it('should return milestone for apply_tactic, complete', () => {
        expect(getFeedbackTypeForAction('apply_tactic')).toBe('milestone');
        expect(getFeedbackTypeForAction('complete')).toBe('milestone');
    });

    it('should return null for passive actions', () => {
        expect(getFeedbackTypeForAction('edit_fields')).toBe(null);
        expect(getFeedbackTypeForAction('reschedule')).toBe(null);
    });
});

describe('generateFeedbackSignal', () => {
    it('should generate subtle feedback for clarify', () => {
        const context: FeedbackContext = {
            provinceState: 'fog',
            actionType: 'clarify',
            isFirstTime: true,
        };

        const signal = generateFeedbackSignal(context);

        expect(signal).toBeDefined();
        expect(signal?.type).toBe('subtle');
        expect(signal?.message).toContain('Clarity');
    });

    it('should generate strong feedback for start_move', () => {
        const context: FeedbackContext = {
            provinceState: 'ready',
            actionType: 'start_move',
            isFirstTime: true,
        };

        const signal = generateFeedbackSignal(context);

        expect(signal).toBeDefined();
        expect(signal?.type).toBe('strong');
        expect(signal?.message).toContain('First step');
    });

    it('should generate milestone feedback for siege resolution', () => {
        const context: FeedbackContext = {
            provinceState: 'siege',
            actionType: 'apply_tactic',
            isFirstTime: false,
            isSiegeResolution: true,
        };

        const signal = generateFeedbackSignal(context);

        expect(signal).toBeDefined();
        expect(signal?.type).toBe('milestone');
        expect(signal?.message).toContain('Siege resolved');
    });

    it('should generate milestone feedback for complete', () => {
        const context: FeedbackContext = {
            provinceState: 'in_progress',
            actionType: 'complete',
            isFirstTime: false,
        };

        const signal = generateFeedbackSignal(context);

        expect(signal).toBeDefined();
        expect(signal?.type).toBe('milestone');
        expect(signal?.message).toContain('captured');
    });

    it('should return null for passive actions', () => {
        const context: FeedbackContext = {
            provinceState: 'ready',
            actionType: 'edit_fields',
            isFirstTime: false,
        };

        const signal = generateFeedbackSignal(context);

        expect(signal).toBe(null);
    });
});

describe('shouldTriggerHeroMoment', () => {
    it('should trigger for siege resolution', () => {
        expect(
            shouldTriggerHeroMoment('apply_tactic', false, true, 0, 0)
        ).toBe(true);
    });

    it('should trigger for first clarity', () => {
        expect(
            shouldTriggerHeroMoment('clarify', true, false, 0, 0)
        ).toBe(true);
    });

    it('should trigger for first start', () => {
        expect(
            shouldTriggerHeroMoment('start_move', true, false, 0, 0)
        ).toBe(true);
    });

    it('should trigger for 3+ day streak', () => {
        expect(
            shouldTriggerHeroMoment('clarify', false, false, 3, 0)
        ).toBe(true);
    });

    it('should not trigger if already 1 hero moment this session', () => {
        expect(
            shouldTriggerHeroMoment('apply_tactic', false, true, 0, 1)
        ).toBe(false);
    });

    it('should not trigger for non-hero actions', () => {
        expect(
            shouldTriggerHeroMoment('supply', false, false, 0, 0)
        ).toBe(false);
    });
});
