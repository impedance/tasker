/**
 * Meaningful-day streak logic — EPIC-11-T3
 * Implements streak counter that breaks softly (no harsh punishment).
 *
 * Meaningful actions (EPIC-01 Appendix A):
 *   - clarify
 *   - prepare (supply/decompose)
 *   - start (start_move)
 *   - progress (log_move)
 *   - siege_resolve (apply_tactic)
 *   - complete
 *   - retreat
 *
 * Streak rules:
 *   - Streak increments on each day with at least one meaningful action
 *   - Streak breaks softly (no reset of territories, no shame copy)
 *   - Track current streak and longest streak
 */

import type { PlayerProfile } from '../../entities/types';

export interface StreakState {
    /** Current consecutive day streak */
    currentStreak: number;
    /** Longest streak ever achieved */
    longestStreak: number;
    /** Date of last meaningful action (YYYY-MM-DD) */
    lastMeaningfulDate: string | null;
}

/**
 * Converts a date to YYYY-MM-DD string.
 */
export function toDateString(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Gets the "day boundary" date for a given date (midnight adjusted for 04:00 day start).
 * Returns a date at midnight of the "game day".
 */
function getGameDay(date: Date): Date {
    const adjusted = new Date(date);
    // If before 04:00, treat as previous day
    if (adjusted.getHours() < 4) {
        adjusted.setDate(adjusted.getDate() - 1);
    }
    adjusted.setHours(0, 0, 0, 0);
    return adjusted;
}

/**
 * Checks if a date is "today" considering the day start hour (04:00).
 */
export function isToday(date: Date, now: Date = new Date()): boolean {
    const gameDayDate = getGameDay(date);
    const gameDayNow = getGameDay(now);
    
    return (
        gameDayDate.getFullYear() === gameDayNow.getFullYear() &&
        gameDayDate.getMonth() === gameDayNow.getMonth() &&
        gameDayDate.getDate() === gameDayNow.getDate()
    );
}

/**
 * Checks if a date is "yesterday" considering the day start hour (04:00).
 */
export function isYesterday(date: Date, now: Date = new Date()): boolean {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return isToday(date, yesterday);
}

/**
 * Updates streak state after a meaningful action.
 */
export function updateStreak(
    current: StreakState,
    actionDate: Date,
    _now: Date = new Date()
): StreakState {
    const actionDateStr = toDateString(actionDate);
    
    // If action is from the same day as last recorded, no change
    if (current.lastMeaningfulDate === actionDateStr) {
        return current;
    }
    
    // Parse lastMeaningfulDate as UTC to match toDateString output
    const lastDate = current.lastMeaningfulDate 
        ? new Date(current.lastMeaningfulDate + 'T12:00:00Z') 
        : null;
    const actionGameDay = getGameDay(actionDate);
    
    let newStreak: number;
    
    if (!lastDate) {
        // First action ever
        newStreak = 1;
    } else {
        // Check if action is consecutive day
        const lastGameDay = getGameDay(lastDate);
        const diffMs = actionGameDay.getTime() - lastGameDay.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Consecutive day
            newStreak = current.currentStreak + 1;
        } else if (diffDays === 0) {
            // Same game day (shouldn't happen due to date string check, but handle it)
            newStreak = current.currentStreak;
        } else {
            // Streak broken - start fresh
            newStreak = 1;
        }
    }
    
    return {
        currentStreak: newStreak,
        longestStreak: Math.max(current.longestStreak, newStreak),
        lastMeaningfulDate: actionDateStr,
    };
}

/**
 * Gets current streak state from player profile.
 */
export function getStreakState(profile: Pick<PlayerProfile, 'streaks'>): StreakState {
    const streaks = profile.streaks || {};
    return {
        currentStreak: (streaks as any)?.currentStreak || 0,
        longestStreak: (streaks as any)?.longestStreak || 0,
        lastMeaningfulDate: (streaks as any)?.lastMeaningfulDate || null,
    };
}

/**
 * Computes streak status message for UI.
 */
export function getStreakStatusMessage(streakState: StreakState): string {
    const { currentStreak, longestStreak } = streakState;
    
    if (currentStreak === 0) {
        return 'Start your streak with a meaningful action!';
    }
    
    if (currentStreak >= 21) {
        return `🏆 ${currentStreak} days! Legendary!`;
    }
    
    if (currentStreak === longestStreak && currentStreak > 1) {
        return `🔥 ${currentStreak} day streak! Personal best!`;
    }
    
    if (currentStreak >= 7) {
        return `🔥 ${currentStreak} days! On a roll!`;
    }
    
    return `${currentStreak} day streak! Keep it up!`;
}

/**
 * Checks if streak is at risk (no action for 2+ days).
 */
export function isStreakAtRisk(streakState: StreakState, now: Date = new Date()): boolean {
    if (!streakState.lastMeaningfulDate) {
        return false;
    }
    
    // Parse lastMeaningfulDate as UTC to match toDateString output
    const lastDate = new Date(streakState.lastMeaningfulDate + 'T12:00:00Z');
    const lastGameDay = getGameDay(lastDate);
    const nowGameDay = getGameDay(now);
    
    const diffMs = nowGameDay.getTime() - lastGameDay.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    // At risk if 2+ days since last action
    return diffDays >= 2;
}
