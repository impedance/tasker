/**
 * Season stats tests — EPIC-10-T4
 */

import { describe, it, expect } from 'vitest';
import {
    computeSeasonSummary,
    computeCompletionRate,
    computeActivityRate,
    getMostCommonState,
    computeAverageSiegeDuration,
} from './season-stats';
import type { Province, SiegeEvent, CampaignArchetypeStats } from '../../entities/types';

function makeProvince(overrides: Partial<Province> = {}): Province {
    const now = new Date().toISOString();
    return {
        id: 'province-1',
        regionId: 'region-1',
        title: 'Test Province',
        state: 'ready',
        progressStage: 'scouted',
        decompositionCount: 0,
        createdAt: now,
        updatedAt: now,
        lastMeaningfulActionAt: now,
        ...overrides,
    } as Province;
}

function makeSiegeEvent(overrides: Partial<SiegeEvent> = {}): SiegeEvent {
    const now = new Date().toISOString();
    return {
        id: 'siege-1',
        provinceId: 'province-1',
        triggeredAt: now,
        reasonType: 'no_meaningful_action_3_days',
        ...overrides,
    } as SiegeEvent;
}

describe('computeSeasonSummary', () => {
    it('should compute summary with correct counts', () => {
        const provinces: Province[] = [
            makeProvince({ id: 'p1', state: 'ready' }),
            makeProvince({ id: 'p2', state: 'ready' }),
            makeProvince({ id: 'p3', state: 'captured' }),
            makeProvince({ id: 'p4', state: 'in_progress' }),
        ];

        const siegeEvents: SiegeEvent[] = [
            makeSiegeEvent({ id: 's1', resolvedAt: new Date().toISOString() }),
            makeSiegeEvent({ id: 's2' }), // Not resolved
        ];

        const archetypeStats: CampaignArchetypeStats = {
            seasonId: 'season-1',
            foundationCount: 2,
            driveCount: 1,
            joyCount: 1,
        };

        const summary = computeSeasonSummary(provinces, siegeEvents, archetypeStats);

        expect(summary.clarified).toBe(2);
        expect(summary.completed).toBe(1);
        expect(summary.inProgress).toBe(1);
        expect(summary.siegesResolved).toBe(1);
        expect(summary.totalProvinces).toBe(4);
        expect(summary.archetypeBalance).toEqual({
            foundation: 2,
            drive: 1,
            joy: 1,
        });
    });

    it('should compute meaningful days correctly', () => {
        const provinces: Province[] = [
            makeProvince({ id: 'p1', lastMeaningfulActionAt: new Date().toISOString() }),
            makeProvince({ id: 'p2', lastMeaningfulActionAt: new Date().toISOString() }),
            makeProvince({
                id: 'p3',
                lastMeaningfulActionAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            }),
        ];

        const summary = computeSeasonSummary(provinces, [], null);

        expect(summary.meaningfulDays).toBe(2); // Today and yesterday
    });

    it('should handle empty provinces', () => {
        const summary = computeSeasonSummary([], [], null);

        expect(summary.clarified).toBe(0);
        expect(summary.completed).toBe(0);
        expect(summary.totalProvinces).toBe(0);
    });

    it('should handle null archetype stats', () => {
        const summary = computeSeasonSummary([], [], null);

        expect(summary.archetypeBalance).toEqual({
            foundation: 0,
            drive: 0,
            joy: 0,
        });
    });

    it('should count retreated provinces', () => {
        const provinces: Province[] = [
            makeProvince({ id: 'p1', state: 'retreated' }),
            makeProvince({ id: 'p2', state: 'retreated' }),
            makeProvince({ id: 'p3', state: 'ready' }),
        ];

        const summary = computeSeasonSummary(provinces, [], null);

        expect(summary.retreated).toBe(2);
    });
});

describe('computeCompletionRate', () => {
    it('should compute completion rate correctly', () => {
        const summary = {
            clarified: 2,
            completed: 5,
            totalProvinces: 10,
            siegesResolved: 1,
            meaningfulDays: 5,
            archetypeBalance: { foundation: 0, drive: 0, joy: 0 },
            inProgress: 2,
            retreated: 1,
        };

        const rate = computeCompletionRate(summary);

        expect(rate).toBe(50);
    });

    it('should return 0 for empty season', () => {
        const summary = {
            clarified: 0,
            completed: 0,
            totalProvinces: 0,
            siegesResolved: 0,
            meaningfulDays: 0,
            archetypeBalance: { foundation: 0, drive: 0, joy: 0 },
            inProgress: 0,
            retreated: 0,
        };

        const rate = computeCompletionRate(summary);

        expect(rate).toBe(0);
    });
});

describe('computeActivityRate', () => {
    it('should compute activity rate correctly', () => {
        const rate = computeActivityRate(10, 20);

        expect(rate).toBe(50);
    });

    it('should return 0 for zero season days', () => {
        const rate = computeActivityRate(10, 0);

        expect(rate).toBe(0);
    });

    it('should handle 100% activity', () => {
        const rate = computeActivityRate(21, 21);

        expect(rate).toBe(100);
    });
});

describe('getMostCommonState', () => {
    it('should return most common state', () => {
        const provinces: Province[] = [
            makeProvince({ id: 'p1', state: 'ready' }),
            makeProvince({ id: 'p2', state: 'ready' }),
            makeProvince({ id: 'p3', state: 'captured' }),
            makeProvince({ id: 'p4', state: 'in_progress' }),
        ];

        const state = getMostCommonState(provinces);

        expect(state).toBe('ready');
    });

    it('should return null for empty array', () => {
        const state = getMostCommonState([]);

        expect(state).toBe(null);
    });

    it('should handle tie by returning first encountered', () => {
        const provinces: Province[] = [
            makeProvince({ id: 'p1', state: 'ready' }),
            makeProvince({ id: 'p2', state: 'captured' }),
        ];

        const state = getMostCommonState(provinces);

        expect(state).toBeDefined();
    });
});

describe('computeAverageSiegeDuration', () => {
    it('should compute average siege duration', () => {
        const siegeEvents: SiegeEvent[] = [
            {
                id: 's1',
                provinceId: 'p1',
                triggeredAt: '2024-01-01T00:00:00Z',
                resolvedAt: '2024-01-04T00:00:00Z', // 3 days
                reasonType: 'no_meaningful_action_3_days',
            },
            {
                id: 's2',
                provinceId: 'p2',
                triggeredAt: '2024-01-01T00:00:00Z',
                resolvedAt: '2024-01-06T00:00:00Z', // 5 days
                reasonType: 'no_meaningful_action_3_days',
            },
        ];

        const avg = computeAverageSiegeDuration(siegeEvents);

        expect(avg).toBe(4); // (3 + 5) / 2 = 4
    });

    it('should return 0 for no resolved sieges', () => {
        const siegeEvents: SiegeEvent[] = [
            {
                id: 's1',
                provinceId: 'p1',
                triggeredAt: '2024-01-01T00:00:00Z',
                reasonType: 'no_meaningful_action_3_days',
            },
        ];

        const avg = computeAverageSiegeDuration(siegeEvents);

        expect(avg).toBe(0);
    });

    it('should return 0 for empty array', () => {
        const avg = computeAverageSiegeDuration([]);

        expect(avg).toBe(0);
    });
});
