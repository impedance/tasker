/**
 * Siege detection tests — EPIC-07-T1
 */

import { describe, it, expect } from 'vitest';
import {
    checkSiege,
    createSiegeEvent,
    checkAllProvincesForSiege,
    isSiegeActive,
    getSiegeDurationDays,
} from './siege';
import type { Province, SiegeEvent } from '../../entities/types';

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

describe('checkSiege', () => {
    it('should not trigger siege for province with recent action', () => {
        const now = new Date();
        const province = makeProvince({
            state: 'ready',
            lastMeaningfulActionAt: now.toISOString(),
        });

        const result = checkSiege(province, now);

        expect(result.shouldTrigger).toBe(false);
        expect(result.daysStalled).toBe(0);
    });

    it('should trigger siege after 3 days without meaningful action', () => {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const province = makeProvince({
            state: 'ready',
            lastMeaningfulActionAt: threeDaysAgo.toISOString(),
            createdAt: threeDaysAgo.toISOString(),
        });

        const result = checkSiege(province, now);

        expect(result.shouldTrigger).toBe(true);
        expect(result.reasonType).toBe('no_meaningful_action_3_days');
        expect(result.daysStalled).toBeGreaterThanOrEqual(3);
    });

    it('should trigger siege for high effort without decomposition', () => {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const province = makeProvince({
            state: 'ready',
            effortLevel: 4,
            decompositionCount: 0,
            lastMeaningfulActionAt: threeDaysAgo.toISOString(),
            createdAt: threeDaysAgo.toISOString(),
        });

        const result = checkSiege(province, now);

        expect(result.shouldTrigger).toBe(true);
        expect(result.reasonType).toBe('high_effort_no_decomposition');
    });

    it('should not trigger siege for fog state', () => {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const province = makeProvince({
            state: 'fog',
            lastMeaningfulActionAt: threeDaysAgo.toISOString(),
        });

        const result = checkSiege(province, now);

        expect(result.shouldTrigger).toBe(false);
    });

    it('should not trigger siege for captured state', () => {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const province = makeProvince({
            state: 'captured',
            lastMeaningfulActionAt: threeDaysAgo.toISOString(),
        });

        const result = checkSiege(province, now);

        expect(result.shouldTrigger).toBe(false);
    });

    it('should not trigger siege for retreated state', () => {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const province = makeProvince({
            state: 'retreated',
            lastMeaningfulActionAt: threeDaysAgo.toISOString(),
        });

        const result = checkSiege(province, now);

        expect(result.shouldTrigger).toBe(false);
    });

    it('should trigger siege for in_progress state after 3 days', () => {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const province = makeProvince({
            state: 'in_progress',
            lastMeaningfulActionAt: threeDaysAgo.toISOString(),
        });

        const result = checkSiege(province, now);

        expect(result.shouldTrigger).toBe(true);
    });

    it('should trigger siege for fortified state after 3 days', () => {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const province = makeProvince({
            state: 'fortified',
            lastMeaningfulActionAt: threeDaysAgo.toISOString(),
        });

        const result = checkSiege(province, now);

        expect(result.shouldTrigger).toBe(true);
    });

    it('should use createdAt if lastMeaningfulActionAt is not set', () => {
        const now = new Date();
        const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
        const province = makeProvince({
            state: 'ready',
            lastMeaningfulActionAt: undefined,
            createdAt: fourDaysAgo.toISOString(),
        });

        const result = checkSiege(province, now);

        expect(result.shouldTrigger).toBe(true);
    });

    it('should not trigger siege at exactly 2 days', () => {
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        const province = makeProvince({
            state: 'ready',
            lastMeaningfulActionAt: twoDaysAgo.toISOString(),
        });

        const result = checkSiege(province, now);

        expect(result.shouldTrigger).toBe(false);
    });
});

describe('createSiegeEvent', () => {
    it('should create a siege event with correct data', () => {
        const event = createSiegeEvent('province-123', 'no_meaningful_action_3_days');

        expect(event.provinceId).toBe('province-123');
        expect(event.reasonType).toBe('no_meaningful_action_3_days');
        expect(event.selectedTactic).toBeUndefined();
        expect(event.resolvedAt).toBeUndefined();
    });

    it('should create a siege event for high_effort_no_decomposition', () => {
        const event = createSiegeEvent('province-456', 'high_effort_no_decomposition');

        expect(event.provinceId).toBe('province-456');
        expect(event.reasonType).toBe('high_effort_no_decomposition');
    });
});

describe('checkAllProvincesForSiege', () => {
    it('should return empty array when no provinces need siege', () => {
        const now = new Date();
        const provinces = [
            makeProvince({ id: 'p1', lastMeaningfulActionAt: now.toISOString() }),
            makeProvince({ id: 'p2', lastMeaningfulActionAt: now.toISOString() }),
        ];

        const results = checkAllProvincesForSiege(provinces, now);

        expect(results).toHaveLength(0);
    });

    it('should return provinces that need siege', () => {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const provinces = [
            makeProvince({ id: 'p1', lastMeaningfulActionAt: now.toISOString() }),
            makeProvince({
                id: 'p2',
                lastMeaningfulActionAt: threeDaysAgo.toISOString(),
                createdAt: threeDaysAgo.toISOString(),
            }),
        ];

        const results = checkAllProvincesForSiege(provinces, now);

        expect(results).toHaveLength(1);
        expect(results[0].provinceId).toBe('p2');
        expect(results[0].reasonType).toBe('no_meaningful_action_3_days');
    });
});

describe('isSiegeActive', () => {
    it('should return true for unresolved siege', () => {
        const siege = { triggeredAt: new Date().toISOString(), resolvedAt: undefined } as Pick<SiegeEvent, 'triggeredAt' | 'resolvedAt'>;
        expect(isSiegeActive(siege)).toBe(true);
    });

    it('should return false for resolved siege', () => {
        const siege = {
            triggeredAt: new Date().toISOString(),
            resolvedAt: new Date().toISOString(),
        } as Pick<SiegeEvent, 'triggeredAt' | 'resolvedAt'>;
        expect(isSiegeActive(siege)).toBe(false);
    });
});

describe('getSiegeDurationDays', () => {
    it('should compute duration for unresolved siege', () => {
        const now = new Date('2024-01-10T00:00:00Z');
        const triggered = new Date('2024-01-05T00:00:00Z');
        const siege = { triggeredAt: triggered.toISOString() };

        const duration = getSiegeDurationDays(siege, now);

        expect(duration).toBe(5);
    });

    it('should compute duration for resolved siege', () => {
        const triggered = new Date('2024-01-05T00:00:00Z');
        const resolved = new Date('2024-01-08T00:00:00Z');
        const siege = {
            triggeredAt: triggered.toISOString(),
            resolvedAt: resolved.toISOString(),
        };

        const duration = getSiegeDurationDays(siege);

        expect(duration).toBe(3);
    });
});
