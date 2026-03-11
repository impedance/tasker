/**
 * Streak logic tests — EPIC-11-T3
 */

import { describe, it, expect } from 'vitest';
import {
    isToday,
    isYesterday,
    toDateString,
    updateStreak,
    getStreakState,
    getStreakStatusMessage,
    isStreakAtRisk,
    type StreakState,
} from './streak';
import type { PlayerProfile } from '../../entities/types';

describe('isToday', () => {
    it('should return true for current date', () => {
        const now = new Date('2024-01-15T12:00:00Z');
        expect(isToday(now, now)).toBe(true);
    });

    it('should return false for yesterday', () => {
        const now = new Date('2024-01-15T12:00:00Z');
        const yesterday = new Date('2024-01-14T12:00:00Z');
        expect(isToday(yesterday, now)).toBe(false);
    });
});

describe('isYesterday', () => {
    it('should return true for previous day', () => {
        const now = new Date('2024-01-15T12:00:00Z');
        const yesterday = new Date('2024-01-14T12:00:00Z');
        expect(isYesterday(yesterday, now)).toBe(true);
    });

    it('should return false for today', () => {
        const now = new Date('2024-01-15T12:00:00Z');
        expect(isYesterday(now, now)).toBe(false);
    });

    it('should return false for 2 days ago', () => {
        const now = new Date('2024-01-15T12:00:00Z');
        const twoDaysAgo = new Date('2024-01-13T12:00:00Z');
        expect(isYesterday(twoDaysAgo, now)).toBe(false);
    });
});

describe('toDateString', () => {
    it('should convert date to YYYY-MM-DD format', () => {
        const date = new Date('2024-01-15T12:30:45Z');
        expect(toDateString(date)).toBe('2024-01-15');
    });
});

describe('updateStreak', () => {
    it('should start streak at 1 for first action', () => {
        const initial: StreakState = {
            currentStreak: 0,
            longestStreak: 0,
            lastMeaningfulDate: null,
        };
        const actionDate = new Date('2024-01-15T12:00:00Z');

        const result = updateStreak(initial, actionDate);

        expect(result.currentStreak).toBe(1);
        expect(result.longestStreak).toBe(1);
        expect(result.lastMeaningfulDate).toBe('2024-01-15');
    });

    it('should increment streak for consecutive day', () => {
        const initial: StreakState = {
            currentStreak: 3,
            longestStreak: 3,
            lastMeaningfulDate: '2024-01-14',
        };
        const actionDate = new Date('2024-01-15T12:00:00Z');

        const result = updateStreak(initial, actionDate);

        expect(result.currentStreak).toBe(4);
        expect(result.longestStreak).toBe(4);
        expect(result.lastMeaningfulDate).toBe('2024-01-15');
    });

    it('should not update longest streak when not exceeded', () => {
        const initial: StreakState = {
            currentStreak: 5,
            longestStreak: 7,
            lastMeaningfulDate: '2024-01-14',
        };
        const actionDate = new Date('2024-01-15T12:00:00Z');

        const result = updateStreak(initial, actionDate);

        expect(result.currentStreak).toBe(6);
        expect(result.longestStreak).toBe(7); // Not exceeded
    });

    it('should reset streak after gap', () => {
        const initial: StreakState = {
            currentStreak: 5,
            longestStreak: 7,
            lastMeaningfulDate: '2024-01-10', // 5 days ago
        };
        const actionDate = new Date('2024-01-15T12:00:00Z');

        const result = updateStreak(initial, actionDate);

        expect(result.currentStreak).toBe(1); // Reset to 1
        expect(result.longestStreak).toBe(7); // Keep longest
        expect(result.lastMeaningfulDate).toBe('2024-01-15');
    });

    it('should not change streak for same day action', () => {
        const initial: StreakState = {
            currentStreak: 3,
            longestStreak: 5,
            lastMeaningfulDate: '2024-01-15',
        };
        const actionDate = new Date('2024-01-15T18:00:00Z'); // Same day

        const result = updateStreak(initial, actionDate);

        expect(result.currentStreak).toBe(3); // Unchanged
        expect(result.longestStreak).toBe(5);
        expect(result.lastMeaningfulDate).toBe('2024-01-15');
    });

    it('should handle yesterday action (consecutive day)', () => {
        const now = new Date('2024-01-15T12:00:00Z');
        const initial: StreakState = {
            currentStreak: 3,
            longestStreak: 5,
            lastMeaningfulDate: '2024-01-14', // Yesterday
        };
        const actionDate = new Date('2024-01-15T12:00:00Z'); // Today

        const result = updateStreak(initial, actionDate, now);

        // Today's action should continue streak
        expect(result.currentStreak).toBe(4);
        expect(result.lastMeaningfulDate).toBe('2024-01-15');
    });
});

describe('getStreakState', () => {
    it('should extract streak state from profile', () => {
        const profile = {
            streaks: {
                currentStreak: 5,
                longestStreak: 10,
                lastMeaningfulDate: '2024-01-15' as unknown as number,
            },
        } as unknown as Pick<PlayerProfile, 'streaks'>;

        const state = getStreakState(profile);

        expect(state.currentStreak).toBe(5);
        expect(state.longestStreak).toBe(10);
        expect(state.lastMeaningfulDate).toBe('2024-01-15');
    });

    it('should handle null streaks', () => {
        const profile = {
            streaks: {} as any,
        } as unknown as Pick<PlayerProfile, 'streaks'>;

        const state = getStreakState(profile);

        expect(state.currentStreak).toBe(0);
        expect(state.longestStreak).toBe(0);
        expect(state.lastMeaningfulDate).toBe(null);
    });

    it('should handle undefined streaks', () => {
        const profile = {} as Pick<PlayerProfile, 'streaks'>;

        const state = getStreakState(profile);

        expect(state.currentStreak).toBe(0);
        expect(state.longestStreak).toBe(0);
        expect(state.lastMeaningfulDate).toBe(null);
    });
});

describe('getStreakStatusMessage', () => {
    it('should return motivational message for new streak', () => {
        const state: StreakState = {
            currentStreak: 0,
            longestStreak: 0,
            lastMeaningfulDate: null,
        };
        expect(getStreakStatusMessage(state)).toContain('Start your streak');
    });

    it('should return personal best message', () => {
        const state: StreakState = {
            currentStreak: 5,
            longestStreak: 5,
            lastMeaningfulDate: '2024-01-15',
        };
        expect(getStreakStatusMessage(state)).toContain('Personal best');
    });

    it('should return legendary message for 21+ days', () => {
        const state: StreakState = {
            currentStreak: 21,
            longestStreak: 21,
            lastMeaningfulDate: '2024-01-15',
        };
        expect(getStreakStatusMessage(state)).toContain('Legendary');
    });

    it('should return on a roll message for 7+ days', () => {
        const state: StreakState = {
            currentStreak: 7,
            longestStreak: 10,
            lastMeaningfulDate: '2024-01-15',
        };
        expect(getStreakStatusMessage(state)).toContain('On a roll');
    });
});

describe('isStreakAtRisk', () => {
    it('should return true if no action for 2+ days', () => {
        const now = new Date('2024-01-15T12:00:00Z');
        const state: StreakState = {
            currentStreak: 5,
            longestStreak: 10,
            lastMeaningfulDate: '2024-01-12', // 3 days ago
        };

        expect(isStreakAtRisk(state, now)).toBe(true);
    });

    it('should return false if action was yesterday', () => {
        const now = new Date('2024-01-15T12:00:00Z');
        const state: StreakState = {
            currentStreak: 5,
            longestStreak: 10,
            lastMeaningfulDate: '2024-01-14', // Yesterday (1 day ago)
        };

        expect(isStreakAtRisk(state, now)).toBe(false);
    });

    it('should return false if action was today', () => {
        const now = new Date('2024-01-15T12:00:00Z');
        const state: StreakState = {
            currentStreak: 5,
            longestStreak: 10,
            lastMeaningfulDate: '2024-01-15', // Today
        };

        expect(isStreakAtRisk(state, now)).toBe(false);
    });

    it('should return false for null lastMeaningfulDate', () => {
        const now = new Date('2024-01-15T12:00:00Z');
        const state: StreakState = {
            currentStreak: 0,
            longestStreak: 0,
            lastMeaningfulDate: null,
        };

        expect(isStreakAtRisk(state, now)).toBe(false);
    });
});
