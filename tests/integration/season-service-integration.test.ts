/**
 * Season Service Integration Tests
 * Tests for season day computation and auto-start logic
 */

import { describe, it, expect } from 'vitest';
import { getSeasonDayNumber, getSeasonPhase, getDaysRemaining, getSeasonProgress } from '../../src/game/rules/season';
import type { Season } from '../../src/entities/types';

describe('Season Rules', () => {
    it('should compute day number correctly for season started 10 days ago', () => {
        // Setup: Season that started 10 days ago
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const season: Season = {
            id: 'season-1',
            title: 'Season 1',
            startedAt: tenDaysAgo.toISOString(),
            endsAt: new Date().toISOString(),
            dayNumber: 1,
            timezone: 'UTC',
            createdAt: tenDaysAgo.toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Action: Get day number
        const dayNumber = getSeasonDayNumber(season, new Date());

        // Assert: Day 11 (10 days elapsed + 1)
        expect(dayNumber).toBe(11);
    });

    it('should compute day number correctly for season started 20 days ago', () => {
        // Setup: Season that started 20 days ago
        const twentyDaysAgo = new Date();
        twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

        const season: Season = {
            id: 'season-1',
            title: 'Season 1',
            startedAt: twentyDaysAgo.toISOString(),
            endsAt: new Date().toISOString(),
            dayNumber: 1,
            timezone: 'UTC',
            createdAt: twentyDaysAgo.toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Action: Get day number
        const dayNumber = getSeasonDayNumber(season, new Date());

        // Assert: Day 21 (20 days elapsed + 1)
        expect(dayNumber).toBe(21);
    });

    it('should cap day number at 21', () => {
        // Setup: Season that started 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const season: Season = {
            id: 'season-1',
            title: 'Season 1',
            startedAt: thirtyDaysAgo.toISOString(),
            endsAt: new Date().toISOString(),
            dayNumber: 1,
            timezone: 'UTC',
            createdAt: thirtyDaysAgo.toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Action: Get day number
        const dayNumber = getSeasonDayNumber(season, new Date());

        // Assert: Capped at 21
        expect(dayNumber).toBe(21);
    });

    it('should return correct season phase', () => {
        const scenarios = [
            { daysAgo: 3, expectedPhase: 'early' },   // Day 4 (1-7 early)
            { daysAgo: 6, expectedPhase: 'early' },   // Day 7 (1-7 early)
            { daysAgo: 10, expectedPhase: 'mid' },    // Day 11 (8-14 mid)
            { daysAgo: 13, expectedPhase: 'mid' },    // Day 14 (8-14 mid)
            { daysAgo: 18, expectedPhase: 'late' },   // Day 19 (15-20 late)
            { daysAgo: 21, expectedPhase: 'ended' },  // Day 22 (capped at 21 = ended)
        ];

        for (const { daysAgo, expectedPhase } of scenarios) {
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            const season: Season = {
                id: 'season-1',
                title: 'Season 1',
                startedAt: date.toISOString(),
                endsAt: new Date().toISOString(),
                dayNumber: 1,
                timezone: 'UTC',
                createdAt: date.toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const phase = getSeasonPhase(season, new Date());
            expect(phase).toBe(expectedPhase);
        }
    });

    it('should return correct days remaining', () => {
        // Setup: Season that started 10 days ago (day 11)
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const season: Season = {
            id: 'season-1',
            title: 'Season 1',
            startedAt: tenDaysAgo.toISOString(),
            endsAt: new Date().toISOString(),
            dayNumber: 1,
            timezone: 'UTC',
            createdAt: tenDaysAgo.toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Action: Get days remaining
        const daysRemaining = getDaysRemaining(season, new Date());

        // Assert: 10 days remaining (21 - 11)
        expect(daysRemaining).toBe(10);
    });

    it('should return correct season progress percentage', () => {
        // Setup: Season that started 10 days ago (day 11)
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const season: Season = {
            id: 'season-1',
            title: 'Season 1',
            startedAt: tenDaysAgo.toISOString(),
            endsAt: new Date().toISOString(),
            dayNumber: 1,
            timezone: 'UTC',
            createdAt: tenDaysAgo.toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Action: Get progress
        const progress = getSeasonProgress(season, new Date());

        // Assert: ~52% (11/21 * 100)
        expect(progress).toBeGreaterThanOrEqual(50);
        expect(progress).toBeLessThanOrEqual(55);
    });
});