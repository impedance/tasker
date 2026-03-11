/**
 * Siege Integration Tests
 * Tests for siege auto-trigger functionality
 */

import { describe, it, expect } from 'vitest';
import { checkSiege } from '../../src/game/rules/siege';
import type { Province } from '../../src/entities/types';

describe('Siege Detection', () => {
    it('should detect siege for province with no meaningful action for 3+ days', () => {
        // Setup: Province with lastMeaningfulActionAt 4 days ago
        const fourDaysAgo = new Date();
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

        const province: Province = {
            id: 'test-province-1',
            regionId: 'test-region',
            title: 'Stalled Province',
            state: 'ready',
            progressStage: 'scouted',
            clarityLevel: 3,
            effortLevel: 3,
            decompositionCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMeaningfulActionAt: fourDaysAgo.toISOString(),
        };

        // Action: Check siege
        const result = checkSiege(province, new Date());

        // Assert: Siege should trigger
        expect(result.shouldTrigger).toBe(true);
        expect(result.reasonType).toBe('no_meaningful_action_3_days');
        expect(result.daysStalled).toBeGreaterThanOrEqual(3);
    });

    it('should not detect siege for recently active provinces', () => {
        // Setup: Province with lastMeaningfulActionAt 1 day ago
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const province: Province = {
            id: 'test-province-2',
            regionId: 'test-region',
            title: 'Active Province',
            state: 'ready',
            progressStage: 'scouted',
            clarityLevel: 3,
            effortLevel: 3,
            decompositionCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMeaningfulActionAt: oneDayAgo.toISOString(),
        };

        // Action: Check siege
        const result = checkSiege(province, new Date());

        // Assert: Siege should not trigger
        expect(result.shouldTrigger).toBe(false);
        expect(result.daysStalled).toBe(1);
    });

    it('should not detect siege for provinces in fog state', () => {
        // Setup: Fog province (not siege-eligible)
        const fourDaysAgo = new Date();
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

        const province: Province = {
            id: 'test-province-3',
            regionId: 'test-region',
            title: 'Fog Province',
            state: 'fog',
            progressStage: 'scouted',
            clarityLevel: 0,
            effortLevel: 0,
            decompositionCount: 0,
            createdAt: fourDaysAgo.toISOString(),
            updatedAt: fourDaysAgo.toISOString(),
        };

        // Action: Check siege
        const result = checkSiege(province, new Date());

        // Assert: Siege should not trigger (fog not eligible)
        expect(result.shouldTrigger).toBe(false);
    });

    it('should detect siege for high effort provinces without decomposition', () => {
        // Setup: High effort province without decomposition, stalled 3+ days
        const fourDaysAgo = new Date();
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

        const province: Province = {
            id: 'test-province-4',
            regionId: 'test-region',
            title: 'Fortress Province',
            state: 'ready',
            progressStage: 'scouted',
            clarityLevel: 3,
            effortLevel: 5, // High effort
            decompositionCount: 0, // No decomposition
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMeaningfulActionAt: fourDaysAgo.toISOString(),
        };

        // Action: Check siege
        const result = checkSiege(province, new Date());

        // Assert: Siege should trigger with fortress reason
        expect(result.shouldTrigger).toBe(true);
        expect(result.reasonType).toBe('high_effort_no_decomposition');
    });
});
