import { describe, it, expect } from 'vitest';
import { getNextState, isTransitionAllowed, shouldFortify, shouldEnterSiege, stalledDays, SIEGE_DAYS_THRESHOLD } from './transitions';
import type { DomainAction } from './actions';

// Helper to build a minimal action
function action(type: DomainAction['type'], extra: Record<string, unknown> = {}): DomainAction {
    const payloads: Record<string, unknown> = {
        clarify: { desiredOutcome: 'X', firstStep: 'Y', estimatedEntryMinutes: 5, ...extra },
        supply: { contextLinks: [], ...extra },
        decompose: { subProvinceIds: ['p-2'], ...extra },
        start_move: { durationMinutes: 10, ...extra },
        log_move: { durationMinutes: 10, ...extra },
        apply_tactic: { tacticType: 'scout', siegeEventId: 'se-1', ...extra },
        complete: { ...extra },
        retreat: { ...extra },
        reschedule: { ...extra },
        edit_fields: { ...extra },
    };
    return { type, payload: payloads[type] } as DomainAction;
}

describe('getNextState — fog transitions', () => {
    it('fog + clarify → ready', () => expect(getNextState('fog', action('clarify'))).toBe('ready'));
    it('fog + edit_fields → fog', () => expect(getNextState('fog', action('edit_fields'))).toBe('fog'));
    it('fog + start_move → null', () => expect(getNextState('fog', action('start_move'))).toBeNull());
});

describe('getNextState — ready transitions', () => {
    it('ready + start_move → in_progress', () => expect(getNextState('ready', action('start_move'))).toBe('in_progress'));
    it('ready + decompose → ready', () => expect(getNextState('ready', action('decompose'))).toBe('ready'));
    it('ready + supply → ready', () => expect(getNextState('ready', action('supply'))).toBe('ready'));
    it('ready + complete → captured', () => expect(getNextState('ready', action('complete'))).toBe('captured'));
    it('ready + retreat → retreated', () => expect(getNextState('ready', action('retreat'))).toBe('retreated'));
    it('ready + reschedule → retreated', () => expect(getNextState('ready', action('reschedule'))).toBe('retreated'));
    it('ready + apply_tactic → null (not in siege)', () => expect(getNextState('ready', action('apply_tactic'))).toBeNull());
});

describe('getNextState — in_progress transitions', () => {
    it('in_progress + log_move → in_progress', () => expect(getNextState('in_progress', action('log_move'))).toBe('in_progress'));
    it('in_progress + complete → captured', () => expect(getNextState('in_progress', action('complete'))).toBe('captured'));
    it('in_progress + retreat → retreated', () => expect(getNextState('in_progress', action('retreat'))).toBe('retreated'));
    it('in_progress + clarify → null', () => expect(getNextState('in_progress', action('clarify'))).toBeNull());
});

describe('getNextState — fortified transitions', () => {
    it('fortified + decompose → ready', () => expect(getNextState('fortified', action('decompose'))).toBe('ready'));
    it('fortified + supply → fortified', () => expect(getNextState('fortified', action('supply'))).toBe('fortified'));
    it('fortified + retreat → retreated', () => expect(getNextState('fortified', action('retreat'))).toBe('retreated'));
});

describe('getNextState — siege transitions (apply_tactic)', () => {
    it('siege + scout → ready', () => expect(getNextState('siege', action('apply_tactic', { tacticType: 'scout', siegeEventId: 'se-1' }))).toBe('ready'));
    it('siege + supply → ready', () => expect(getNextState('siege', action('apply_tactic', { tacticType: 'supply', siegeEventId: 'se-1' }))).toBe('ready'));
    it('siege + engineer → ready', () => expect(getNextState('siege', action('apply_tactic', { tacticType: 'engineer', siegeEventId: 'se-1' }))).toBe('ready'));
    it('siege + raid → in_progress', () => expect(getNextState('siege', action('apply_tactic', { tacticType: 'raid', siegeEventId: 'se-1' }))).toBe('in_progress'));
    it('siege + retreat tactic → retreated', () => expect(getNextState('siege', action('apply_tactic', { tacticType: 'retreat', siegeEventId: 'se-1' }))).toBe('retreated'));
    it('siege + start_move (not tactic) → null', () => expect(getNextState('siege', action('start_move'))).toBeNull());
});

describe('getNextState — terminal states', () => {
    it('captured + anything → null (except edit_fields)', () => {
        expect(getNextState('captured', action('complete'))).toBeNull();
        expect(getNextState('captured', action('edit_fields'))).toBe('captured');
    });
    it('retreated + anything → null (except edit_fields)', () => {
        expect(getNextState('retreated', action('start_move'))).toBeNull();
        expect(getNextState('retreated', action('edit_fields'))).toBe('retreated');
    });
});

describe('isTransitionAllowed', () => {
    it('returns true for valid transitions', () => expect(isTransitionAllowed('fog', action('clarify'))).toBe(true));
    it('returns false for invalid transitions', () => expect(isTransitionAllowed('fog', action('start_move'))).toBe(false));
});

describe('shouldFortify', () => {
    it('returns true when effortLevel >= 4 and no decomposition in ready state', () => {
        expect(shouldFortify({ state: 'ready', effortLevel: 4, decompositionCount: 0 })).toBe(true);
        expect(shouldFortify({ state: 'ready', effortLevel: 5, decompositionCount: 0 })).toBe(true);
    });
    it('returns false when decomposed', () => {
        expect(shouldFortify({ state: 'ready', effortLevel: 4, decompositionCount: 1 })).toBe(false);
    });
    it('returns false when effortLevel < 4', () => {
        expect(shouldFortify({ state: 'ready', effortLevel: 3, decompositionCount: 0 })).toBe(false);
    });
    it('returns false when not in ready state', () => {
        expect(shouldFortify({ state: 'in_progress', effortLevel: 5, decompositionCount: 0 })).toBe(false);
    });
});

describe('stalledDays', () => {
    it('computes days since lastMeaningfulActionAt', () => {
        const province = {
            lastMeaningfulActionAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        };
        expect(stalledDays(province)).toBe(4);
    });

    it('falls back to createdAt when lastMeaningfulActionAt is absent', () => {
        const province = {
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        };
        expect(stalledDays(province)).toBe(5);
    });
});

describe('shouldEnterSiege', () => {
    const staleEnough = new Date(Date.now() - SIEGE_DAYS_THRESHOLD * 24 * 60 * 60 * 1000 - 1000).toISOString();

    it(`returns true after ${SIEGE_DAYS_THRESHOLD} days in 'ready'`, () => {
        expect(shouldEnterSiege({ state: 'ready', createdAt: staleEnough })).toBe(true);
    });
    it('returns false for fog state', () => {
        expect(shouldEnterSiege({ state: 'fog', createdAt: staleEnough })).toBe(false);
    });
    it('returns false for captured', () => {
        expect(shouldEnterSiege({ state: 'captured', createdAt: staleEnough })).toBe(false);
    });
    it('returns false when not stalled long enough', () => {
        const fresh = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
        expect(shouldEnterSiege({ state: 'ready', createdAt: fresh })).toBe(false);
    });
});
