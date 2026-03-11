/**
 * Tactic effectiveness tests — EPIC-07-T4
 */

import { describe, it, expect } from 'vitest';
import {
    createTacticEffectivenessRecord,
    checkProgressWithin24h,
    checkCompletedWithin7Days,
    updateTacticEffectivenessRecord,
    aggregateTacticEffectiveness,
    exportTacticEffectivenessData,
} from './tactic-effectiveness';
import type { SiegeEvent, Province } from '../../entities/types';

describe('createTacticEffectivenessRecord', () => {
    it('should create a record with correct data', () => {
        const siegeEvent: Pick<SiegeEvent, 'triggeredAt' | 'resolvedAt'> = {
            triggeredAt: '2024-01-01T00:00:00Z',
            resolvedAt: '2024-01-04T00:00:00Z',
        };
        const appliedAt = new Date('2024-01-04T00:00:00Z');

        const record = createTacticEffectivenessRecord(
            'province-123',
            'scout',
            siegeEvent,
            appliedAt
        );

        expect(record.provinceId).toBe('province-123');
        expect(record.tacticType).toBe('scout');
        expect(record.siegeDurationDays).toBe(3);
        expect(record.appliedAt).toBe('2024-01-04T00:00:00.000Z');
        expect(record.progressedWithin24h).toBeUndefined();
        expect(record.completedWithin7Days).toBeUndefined();
    });

    it('should use current time if appliedAt not provided', () => {
        const siegeEvent: Pick<SiegeEvent, 'triggeredAt' | 'resolvedAt'> = {
            triggeredAt: new Date().toISOString(),
            resolvedAt: undefined,
        };

        const record = createTacticEffectivenessRecord('province-456', 'raid', siegeEvent);

        expect(record.provinceId).toBe('province-456');
        expect(record.tacticType).toBe('raid');
        expect(record.appliedAt).toBeDefined();
    });
});

describe('checkProgressWithin24h', () => {
    it('should return true if province progressed within 24h', () => {
        const appliedAt = '2024-01-01T00:00:00Z';
        const province: Pick<Province, 'state' | 'updatedAt'> = {
            state: 'in_progress',
            updatedAt: '2024-01-01T12:00:00Z',
        };

        const result = checkProgressWithin24h(province, appliedAt);

        expect(result).toBe(true);
    });

    it('should return false if province progressed after 24h', () => {
        const appliedAt = '2024-01-01T00:00:00Z';
        const province: Pick<Province, 'state' | 'updatedAt'> = {
            state: 'in_progress',
            updatedAt: '2024-01-03T00:00:00Z',
        };

        const result = checkProgressWithin24h(province, appliedAt);

        expect(result).toBe(false);
    });

    it('should return false if province is not in_progress', () => {
        const appliedAt = '2024-01-01T00:00:00Z';
        const province: Pick<Province, 'state' | 'updatedAt'> = {
            state: 'ready',
            updatedAt: '2024-01-01T12:00:00Z',
        };

        const result = checkProgressWithin24h(province, appliedAt);

        expect(result).toBe(false);
    });
});

describe('checkCompletedWithin7Days', () => {
    it('should return true if province completed within 7 days', () => {
        const appliedAt = '2024-01-01T00:00:00Z';
        const province: Pick<Province, 'state' | 'updatedAt'> = {
            state: 'captured',
            updatedAt: '2024-01-05T00:00:00Z',
        };

        const result = checkCompletedWithin7Days(province, appliedAt);

        expect(result).toBe(true);
    });

    it('should return false if province completed after 7 days', () => {
        const appliedAt = '2024-01-01T00:00:00Z';
        const province: Pick<Province, 'state' | 'updatedAt'> = {
            state: 'captured',
            updatedAt: '2024-01-10T00:00:00Z',
        };

        const result = checkCompletedWithin7Days(province, appliedAt);

        expect(result).toBe(false);
    });

    it('should return false if province is not captured', () => {
        const appliedAt = '2024-01-01T00:00:00Z';
        const province: Pick<Province, 'state' | 'updatedAt'> = {
            state: 'in_progress',
            updatedAt: '2024-01-05T00:00:00Z',
        };

        const result = checkCompletedWithin7Days(province, appliedAt);

        expect(result).toBe(false);
    });
});

describe('updateTacticEffectivenessRecord', () => {
    it('should update record with progress tracking data', () => {
        const baseRecord = {
            provinceId: 'province-123',
            tacticType: 'scout' as const,
            appliedAt: '2024-01-01T00:00:00Z',
            siegeDurationDays: 3,
        };
        // updatedAt at 12 hours (within 24h) for progressedWithin24h = true
        // state is captured at day 5 (within 7 days) for completedWithin7Days = true
        // Note: checkProgressWithin24h requires state === 'in_progress'
        // So we need to test these separately or use in_progress state
        const province: Pick<Province, 'state' | 'updatedAt'> = {
            state: 'in_progress',
            updatedAt: '2024-01-01T12:00:00Z',
        };

        const updated = updateTacticEffectivenessRecord(baseRecord, province);

        expect(updated.progressedWithin24h).toBe(true);
        expect(updated.completedWithin7Days).toBe(false);
        expect(updated.finalState).toBe('in_progress');
    });
});

describe('aggregateTacticEffectiveness', () => {
    it('should aggregate statistics by tactic type', () => {
        const records = [
            {
                id: '1',
                provinceId: 'p1',
                tacticType: 'scout' as const,
                appliedAt: '2024-01-01T00:00:00Z',
                siegeDurationDays: 3,
                progressedWithin24h: true,
                completedWithin7Days: true,
                finalState: 'captured' as const,
            },
            {
                id: '2',
                provinceId: 'p2',
                tacticType: 'scout' as const,
                appliedAt: '2024-01-02T00:00:00Z',
                siegeDurationDays: 4,
                progressedWithin24h: false,
                completedWithin7Days: true,
                finalState: 'captured' as const,
            },
            {
                id: '3',
                provinceId: 'p3',
                tacticType: 'raid' as const,
                appliedAt: '2024-01-03T00:00:00Z',
                siegeDurationDays: 3,
                progressedWithin24h: true,
                completedWithin7Days: false,
                finalState: 'in_progress' as const,
            },
        ];

        const result = aggregateTacticEffectiveness(records);

        expect(result.scout.count).toBe(2);
        expect(result.scout.avgSiegeDuration).toBe(3.5);
        expect(result.scout.progressedWithin24hCount).toBe(1);
        expect(result.scout.progressedWithin24hRate).toBe(0.5);
        expect(result.scout.completedWithin7DaysCount).toBe(2);
        expect(result.scout.completedWithin7DaysRate).toBe(1);

        expect(result.raid.count).toBe(1);
        expect(result.raid.avgSiegeDuration).toBe(3);
        expect(result.raid.progressedWithin24hCount).toBe(1);
        expect(result.raid.progressedWithin24hRate).toBe(1);
        expect(result.raid.completedWithin7DaysCount).toBe(0);
        expect(result.raid.completedWithin7DaysRate).toBe(0);

        expect(result.supply.count).toBe(0);
        expect(result.engineer.count).toBe(0);
        expect(result.retreat.count).toBe(0);
    });

    it('should handle empty records', () => {
        const result = aggregateTacticEffectiveness([]);

        expect(result.scout.count).toBe(0);
        expect(result.raid.count).toBe(0);
    });
});

describe('exportTacticEffectivenessData', () => {
    it('should export data in CSV-friendly format', () => {
        const records: any[] = [
            {
                id: '1',
                provinceId: 'p1',
                tacticType: 'scout' as const,
                appliedAt: '2024-01-01T00:00:00Z',
                siegeDurationDays: 3,
                progressedWithin24h: true,
                completedWithin7Days: true,
                finalState: 'captured' as const,
            },
            {
                id: '2',
                provinceId: 'p2',
                tacticType: 'raid' as const,
                appliedAt: '2024-01-02T00:00:00Z',
                siegeDurationDays: 4,
                progressedWithin24h: false,
                completedWithin7Days: false,
                finalState: 'in_progress' as const,
            },
        ];

        const exported = exportTacticEffectivenessData(records);

        expect(exported).toHaveLength(2);
        expect(exported[0]).toEqual({
            provinceId: 'p1',
            tacticType: 'scout',
            appliedAt: '2024-01-01T00:00:00Z',
            siegeDurationDays: 3,
            progressedWithin24h: true,
            completedWithin7Days: true,
            finalState: 'captured',
        });
        expect(exported[1]).toEqual({
            provinceId: 'p2',
            tacticType: 'raid',
            appliedAt: '2024-01-02T00:00:00Z',
            siegeDurationDays: 4,
            progressedWithin24h: false,
            completedWithin7Days: false,
            finalState: 'in_progress',
        });
    });

    it('should handle undefined progress fields', () => {
        const records: any[] = [
            {
                id: '1',
                provinceId: 'p1',
                tacticType: 'scout' as const,
                appliedAt: '2024-01-01T00:00:00Z',
                siegeDurationDays: 3,
            },
        ];

        const exported = exportTacticEffectivenessData(records);

        expect(exported[0].progressedWithin24h).toBe(false);
        expect(exported[0].completedWithin7Days).toBe(false);
        expect(exported[0].finalState).toBe('unknown');
    });
});
