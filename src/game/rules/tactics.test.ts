/**
 * Tactics tests — EPIC-07-T3
 */

import { describe, it, expect } from 'vitest';
import {
    applyTactic,
    validateTacticPayload,
    getTacticLabel,
    getTacticDescription,
} from './tactics';
import type { Province } from '../../entities/types';
import type { ApplyTacticPayload } from './actions';

function makeProvince(overrides: Partial<Province> = {}): Province {
    const now = new Date().toISOString();
    return {
        id: 'province-1',
        regionId: 'region-1',
        title: 'Test Province',
        state: 'siege',
        progressStage: 'scouted',
        decompositionCount: 0,
        createdAt: now,
        updatedAt: now,
        lastMeaningfulActionAt: now,
        ...overrides,
    } as Province;
}

function makeSiegePayload(overrides: Partial<ApplyTacticPayload> = {}): ApplyTacticPayload {
    return {
        tacticType: 'scout',
        siegeEventId: 'siege-1',
        ...overrides,
    } as ApplyTacticPayload;
}

describe('applyTactic - scout', () => {
    it('should apply scout tactic and transition to ready', () => {
        const province = makeProvince({ state: 'siege' });
        const payload = makeSiegePayload({
            tacticType: 'scout',
            data: {
                tacticType: 'scout',
                desiredOutcome: 'Complete the task',
                firstStep: 'Open the document',
                estimatedEntryMinutes: 15,
            },
        });

        const result = applyTactic(province, payload);

        expect(result.province.state).toBe('ready');
        expect(result.province.desiredOutcome).toBe('Complete the task');
        expect(result.province.firstStep).toBe('Open the document');
        expect(result.province.estimatedEntryMinutes).toBe(15);
        expect(result.province.lastMeaningfulActionAt).toBeDefined();
        expect(result.sideEffects).toHaveLength(1);
        expect(result.sideEffects[0].type).toBe('resolve_siege_event');
        expect(result.explanation).toContain('Scout tactic');
    });

    it('should apply scout tactic with partial data', () => {
        const province = makeProvince({ state: 'siege' });
        const payload = makeSiegePayload({
            tacticType: 'scout',
            data: {
                tacticType: 'scout',
                desiredOutcome: 'Just the outcome',
            },
        });

        const result = applyTactic(province, payload);

        expect(result.province.state).toBe('ready');
        expect(result.province.desiredOutcome).toBe('Just the outcome');
    });
});

describe('applyTactic - supply', () => {
    it('should apply supply tactic and add context', () => {
        const province = makeProvince({ state: 'siege' });
        const payload = makeSiegePayload({
            tacticType: 'supply',
            data: {
                tacticType: 'supply',
                contextLinks: ['https://example.com'],
                contextNotes: 'Some helpful notes',
            },
        });

        const result = applyTactic(province, payload);

        expect(result.province.state).toBe('ready');
        expect(result.province.contextLinks).toEqual(['https://example.com']);
        expect(result.province.contextNotes).toBe('Some helpful notes');
        expect(result.sideEffects).toHaveLength(1);
        expect(result.sideEffects[0].type).toBe('resolve_siege_event');
    });

    it('should apply supply tactic with only notes', () => {
        const province = makeProvince({ state: 'siege' });
        const payload = makeSiegePayload({
            tacticType: 'supply',
            data: {
                tacticType: 'supply',
                contextNotes: 'Just notes',
            },
        });

        const result = applyTactic(province, payload);

        expect(result.province.state).toBe('ready');
        expect(result.province.contextNotes).toBe('Just notes');
    });
});

describe('applyTactic - engineer', () => {
    it('should apply engineer tactic and increment decompositionCount', () => {
        const province = makeProvince({ state: 'siege', decompositionCount: 1 });
        const payload = makeSiegePayload({
            tacticType: 'engineer',
            data: {
                tacticType: 'engineer',
                subProvinceIds: ['sub-1', 'sub-2', 'sub-3'],
            },
        });

        const result = applyTactic(province, payload);

        expect(result.province.state).toBe('ready');
        expect(result.province.decompositionCount).toBe(2);
        expect(result.sideEffects).toHaveLength(1);
        expect(result.sideEffects[0].type).toBe('resolve_siege_event');
        expect(result.explanation).toContain('3 sub-provinces');
    });

    it('should throw error if subProvinceIds are missing', () => {
        const province = makeProvince({ state: 'siege' });
        const payload = makeSiegePayload({
            tacticType: 'engineer',
            data: {
                tacticType: 'engineer',
                subProvinceIds: [],
            },
        });

        expect(() => applyTactic(province, payload)).toThrow('requires subProvinceIds');
    });
});

describe('applyTactic - raid', () => {
    it('should apply raid tactic and transition to in_progress', () => {
        const province = makeProvince({ state: 'siege' });
        const payload = makeSiegePayload({
            tacticType: 'raid',
            data: {
                tacticType: 'raid',
                durationMinutes: 5,
            },
        });

        const result = applyTactic(province, payload);

        expect(result.province.state).toBe('in_progress');
        expect(result.sideEffects).toHaveLength(2);
        expect(result.sideEffects[0].type).toBe('resolve_siege_event');
        expect(result.sideEffects[1].type).toBe('create_daily_move');
        if (result.sideEffects[1].type === 'create_daily_move') {
            expect(result.sideEffects[1].dailyMove.moveType).toBe('raid');
            expect(result.sideEffects[1].dailyMove.durationMinutes).toBe(5);
            expect(result.sideEffects[1].dailyMove.result).toBe('started');
        }
        expect(result.explanation).toContain('5-minute');
    });

    it('should use default 5 minutes if duration not specified', () => {
        const province = makeProvince({ state: 'siege' });
        const payload = makeSiegePayload({
            tacticType: 'raid',
            data: {
                tacticType: 'raid',
                durationMinutes: 5,
            },
        });

        const result = applyTactic(province, payload);

        expect(result.province.state).toBe('in_progress');
        if (result.sideEffects[1].type === 'create_daily_move') {
            expect(result.sideEffects[1].dailyMove.durationMinutes).toBe(5);
        }
    });
});

describe('applyTactic - retreat', () => {
    it('should apply retreat tactic and transition to retreated', () => {
        const province = makeProvince({ state: 'siege' });
        const payload = makeSiegePayload({
            tacticType: 'retreat',
            data: {
                tacticType: 'retreat',
                reason: 'Not enough time',
            },
        });

        const result = applyTactic(province, payload);

        expect(result.province.state).toBe('retreated');
        expect(result.sideEffects).toHaveLength(1);
        expect(result.sideEffects[0].type).toBe('resolve_siege_event');
        expect(result.explanation).toContain('Not enough time');
    });

    it('should apply retreat tactic without reason', () => {
        const province = makeProvince({ state: 'siege' });
        const payload = makeSiegePayload({
            tacticType: 'retreat',
            data: {
                tacticType: 'retreat',
            },
        });

        const result = applyTactic(province, payload);

        expect(result.province.state).toBe('retreated');
        expect(result.explanation).not.toContain('(');
    });
});

describe('validateTacticPayload', () => {
    it('should validate scout payload', () => {
        const payload = makeSiegePayload({
            tacticType: 'scout',
            data: {
                tacticType: 'scout',
                desiredOutcome: 'Test',
            },
        });

        const result = validateTacticPayload(payload);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should invalidate engineer payload without subProvinceIds', () => {
        const payload = makeSiegePayload({
            tacticType: 'engineer',
        });

        const result = validateTacticPayload(payload);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Engineer tactic requires subProvinceIds');
    });

    it('should invalidate raid payload with invalid duration', () => {
        const payload = makeSiegePayload({
            tacticType: 'raid',
            data: {
                tacticType: 'raid',
                durationMinutes: 20,
            },
        });

        const result = validateTacticPayload(payload);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Raid duration must be between 1 and 15 minutes');
    });

    it('should validate raid payload with valid duration', () => {
        const payload = makeSiegePayload({
            tacticType: 'raid',
            data: {
                tacticType: 'raid',
                durationMinutes: 10,
            },
        });

        const result = validateTacticPayload(payload);

        expect(result.valid).toBe(true);
    });
});

describe('getTacticLabel', () => {
    it('should return correct labels', () => {
        expect(getTacticLabel('scout')).toBe('Scout');
        expect(getTacticLabel('supply')).toBe('Supply');
        expect(getTacticLabel('engineer')).toBe('Engineer');
        expect(getTacticLabel('raid')).toBe('Raid');
        expect(getTacticLabel('retreat')).toBe('Retreat');
    });
});

describe('getTacticDescription', () => {
    it('should return descriptions for all tactics', () => {
        expect(getTacticDescription('scout')).toContain('Clarify');
        expect(getTacticDescription('supply')).toContain('context');
        expect(getTacticDescription('engineer')).toContain('Split');
        expect(getTacticDescription('raid')).toContain('quick');
        expect(getTacticDescription('retreat')).toContain('Defer');
    });
});
