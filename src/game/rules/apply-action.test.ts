import { describe, it, expect } from 'vitest';
import { applyAction, checkSiegeTrigger, checkFortifyTrigger } from './apply-action';
import type { Province } from '../../entities/types';
import type { DomainAction } from './actions';

// ============================================================================
// Helpers
// ============================================================================

const NOW = new Date('2026-03-10T10:00:00Z');

function makeProvince(overrides: Partial<Province> = {}): Province {
    return {
        id: 'p-1',
        regionId: 'r-1',
        title: 'Test Province',
        state: 'fog',
        progressStage: 'scouted',
        decompositionCount: 0,
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-03-01T10:00:00Z',
        ...overrides,
    };
}

// ============================================================================
// T2 fog + clarify
// ============================================================================
describe('applyAction — clarify (fog → ready)', () => {
    it('transitions fog → ready when all clarity fields provided', () => {
        const province = makeProvince({ state: 'fog' });
        const action: DomainAction = {
            type: 'clarify',
            payload: { desiredOutcome: 'Published docs', firstStep: 'Open repo', estimatedEntryMinutes: 10 },
        };
        const result = applyAction(province, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.province.state).toBe('ready');
            expect(result.province.desiredOutcome).toBe('Published docs');
            expect(result.province.progressStage).toBe('scouted'); // already scouted
            expect(result.province.lastMeaningfulActionAt).toBe(NOW.toISOString());
        }
    });

    it('rejects clarify when payload is incomplete', () => {
        const province = makeProvince({ state: 'fog' });
        const action = {
            type: 'clarify',
            payload: { desiredOutcome: '', firstStep: 'X', estimatedEntryMinutes: 5 },
        } as DomainAction;
        const result = applyAction(province, action, NOW);
        expect(result.ok).toBe(false);
    });

    it('does not set lastMeaningfulActionAt for non-meaningful edit_fields', () => {
        const province = makeProvince({ state: 'fog' });
        const action: DomainAction = { type: 'edit_fields', payload: { title: 'New title' } };
        const result = applyAction(province, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.province.lastMeaningfulActionAt).toBeUndefined();
            expect(result.province.title).toBe('New title');
        }
    });
});

// ============================================================================
// T3 transitions
// ============================================================================
describe('applyAction — ready → in_progress (start_move)', () => {
    const ready = makeProvince({ state: 'ready', progressStage: 'scouted' });

    it('transitions ready → in_progress and emits create_daily_move', () => {
        const action: DomainAction = { type: 'start_move', payload: { durationMinutes: 25 } };
        const result = applyAction(ready, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.province.state).toBe('in_progress');
            expect(result.province.progressStage).toBe('entered');
            expect(result.sideEffects.some(e => e.type === 'create_daily_move')).toBe(true);
        }
    });

    it('rejects start_move on fog province', () => {
        const fogProvince = makeProvince({ state: 'fog' });
        const action: DomainAction = { type: 'start_move', payload: { durationMinutes: 25 } };
        expect(applyAction(fogProvince, action, NOW).ok).toBe(false);
    });
});

describe('applyAction — in_progress → captured (complete)', () => {
    it('transitions in_progress → captured', () => {
        const province = makeProvince({ state: 'in_progress', progressStage: 'held' });
        const action: DomainAction = { type: 'complete', payload: {} };
        const result = applyAction(province, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.province.state).toBe('captured');
            expect(result.province.progressStage).toBe('captured');
        }
    });
});

describe('applyAction — any → retreated', () => {
    it('ready + retreat → retreated', () => {
        const province = makeProvince({ state: 'ready' });
        const result = applyAction(province, { type: 'retreat', payload: {} }, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.province.state).toBe('retreated');
    });

    it('in_progress + retreat → retreated', () => {
        const province = makeProvince({ state: 'in_progress' });
        const result = applyAction(province, { type: 'retreat', payload: {} }, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.province.state).toBe('retreated');
    });
});

describe('applyAction — invalid transitions return errors', () => {
    it('captured + start_move → error', () => {
        const province = makeProvince({ state: 'captured' });
        expect(applyAction(province, { type: 'start_move', payload: { durationMinutes: 5 } }, NOW).ok).toBe(false);
    });

    it('retreated + complete → error', () => {
        const province = makeProvince({ state: 'retreated' });
        expect(applyAction(province, { type: 'complete', payload: {} }, NOW).ok).toBe(false);
    });

    it('ready + apply_tactic (not in siege) → error', () => {
        const province = makeProvince({ state: 'ready' });
        const action: DomainAction = { type: 'apply_tactic', payload: { tacticType: 'scout', siegeEventId: 'se-1' } };
        expect(applyAction(province, action, NOW).ok).toBe(false);
    });
});

describe('applyAction — siege tactics', () => {
    const siegeProvince = makeProvince({ state: 'siege', progressStage: 'scouted' });

    it('scout tactic resolves siege → ready', () => {
        const action: DomainAction = {
            type: 'apply_tactic',
            payload: {
                tacticType: 'scout',
                siegeEventId: 'se-1',
                data: { tacticType: 'scout', desiredOutcome: 'New outcome', firstStep: 'New step', estimatedEntryMinutes: 5 },
            },
        };
        const result = applyAction(siegeProvince, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.province.state).toBe('ready');
            expect(result.province.desiredOutcome).toBe('New outcome');
            expect(result.sideEffects.some(e => e.type === 'resolve_siege_event')).toBe(true);
        }
    });

    it('raid tactic → in_progress and emits daily_move', () => {
        const action: DomainAction = {
            type: 'apply_tactic',
            payload: {
                tacticType: 'raid',
                siegeEventId: 'se-1',
                data: { tacticType: 'raid', durationMinutes: 5 },
            },
        };
        const result = applyAction(siegeProvince, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.province.state).toBe('in_progress');
            expect(result.province.progressStage).toBe('entered');
            expect(result.sideEffects.some(e => e.type === 'create_daily_move')).toBe(true);
        }
    });

    it('retreat tactic → retreated', () => {
        const action: DomainAction = {
            type: 'apply_tactic',
            payload: { tacticType: 'retreat', siegeEventId: 'se-1' },
        };
        const result = applyAction(siegeProvince, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.province.state).toBe('retreated');
    });
});

describe('applyAction — decompose', () => {
    it('bumps decompositionCount and advances to at least prepared', () => {
        const province = makeProvince({ state: 'ready', progressStage: 'scouted' });
        const action: DomainAction = { type: 'decompose', payload: { subProvinceIds: ['p-2', 'p-3'] } };
        const result = applyAction(province, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.province.decompositionCount).toBe(1);
            expect(result.province.progressStage).toBe('prepared');
        }
    });

    it('fortified + decompose → ready', () => {
        const province = makeProvince({ state: 'fortified' });
        const result = applyAction(province, { type: 'decompose', payload: { subProvinceIds: ['p-2'] } }, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.province.state).toBe('ready');
    });
});

describe('applyAction — edit_fields with fortify re-evaluation', () => {
    it('edit_fields setting effortLevel >= 4 with no decomposition triggers fortified', () => {
        const province = makeProvince({ state: 'ready', effortLevel: 2, decompositionCount: 0 });
        const action: DomainAction = { type: 'edit_fields', payload: { effortLevel: 5 } };
        const result = applyAction(province, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.province.state).toBe('fortified');
    });

    it('edit_fields on fog province stays fog', () => {
        const province = makeProvince({ state: 'fog' });
        const action: DomainAction = { type: 'edit_fields', payload: { title: 'Renamed' } };
        const result = applyAction(province, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.province.state).toBe('fog');
    });
});

describe('applyAction — log_move stage advancement', () => {
    it('log_move on entered province advances to held', () => {
        const province = makeProvince({ state: 'in_progress', progressStage: 'entered' });
        const result = applyAction(province, { type: 'log_move', payload: { durationMinutes: 30 } }, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.province.progressStage).toBe('held');
            expect(result.sideEffects.some(e => e.type === 'create_daily_move')).toBe(true);
        }
    });
});

describe('applyAction — immutability', () => {
    it('does not mutate the original province', () => {
        const province = makeProvince({ state: 'fog' });
        const originalState = province.state;
        applyAction(province, { type: 'clarify', payload: { desiredOutcome: 'X', firstStep: 'Y', estimatedEntryMinutes: 5 } }, NOW);
        expect(province.state).toBe(originalState);
    });
});

// ============================================================================
// System triggers
// ============================================================================
describe('checkSiegeTrigger', () => {
    it('returns triggered=true for stale ready province', () => {
        const province = makeProvince({ state: 'ready', createdAt: '2026-03-01T00:00:00Z' });
        const result = checkSiegeTrigger(province, NOW);
        expect(result.triggered).toBe(true);
        if (result.triggered) {
            expect(result.province!.state).toBe('siege');
            expect(result.sideEffect!.type).toBe('create_siege_event');
        }
    });

    it('returns triggered=false for recently active province', () => {
        const province = makeProvince({ state: 'ready', createdAt: NOW.toISOString() });
        expect(checkSiegeTrigger(province, NOW).triggered).toBe(false);
    });

    it('returns triggered=false for fog province', () => {
        const province = makeProvince({ state: 'fog', createdAt: '2026-03-01T00:00:00Z' });
        expect(checkSiegeTrigger(province, NOW).triggered).toBe(false);
    });
});

describe('checkFortifyTrigger', () => {
    it('returns fortified province when conditions met', () => {
        const province = makeProvince({ state: 'ready', effortLevel: 5, decompositionCount: 0 });
        const result = checkFortifyTrigger(province);
        expect(result).not.toBeNull();
        expect(result!.state).toBe('fortified');
    });

    it('returns null when not fortifiable', () => {
        const province = makeProvince({ state: 'ready', effortLevel: 2, decompositionCount: 0 });
        expect(checkFortifyTrigger(province)).toBeNull();
    });
});

// ============================================================================
// T1 — Integration tests for apply_tactic payload shapes (UI → domain)
// ============================================================================
describe('applyAction — apply_tactic integration', () => {
    const siegeProvince = makeProvince({ state: 'siege' });

    it('applies scout tactic with full data', () => {
        const action: DomainAction = {
            type: 'apply_tactic',
            payload: {
                tacticType: 'scout',
                siegeEventId: 'siege-1',
                data: {
                    tacticType: 'scout',
                    desiredOutcome: 'Published docs',
                    firstStep: 'Open repo',
                    estimatedEntryMinutes: 15,
                },
            },
        };
        const result = applyAction(siegeProvince, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.province.state).toBe('ready');
            expect(result.province.desiredOutcome).toBe('Published docs');
            expect(result.sideEffects.some(e => e.type === 'resolve_siege_event')).toBe(true);
        }
    });

    it('applies supply tactic with context', () => {
        const action: DomainAction = {
            type: 'apply_tactic',
            payload: {
                tacticType: 'supply',
                siegeEventId: 'siege-1',
                data: {
                    tacticType: 'supply',
                    contextLinks: ['https://example.com'],
                    contextNotes: 'Helpful notes',
                },
            },
        };
        const result = applyAction(siegeProvince, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.province.state).toBe('ready');
            expect(result.province.contextLinks).toEqual(['https://example.com']);
            expect(result.sideEffects.some(e => e.type === 'resolve_siege_event')).toBe(true);
        }
    });

    it('applies engineer tactic with subProvinceIds', () => {
        const action: DomainAction = {
            type: 'apply_tactic',
            payload: {
                tacticType: 'engineer',
                siegeEventId: 'siege-1',
                data: {
                    tacticType: 'engineer',
                    subProvinceIds: ['sub-1', 'sub-2', 'sub-3'],
                },
            },
        };
        const result = applyAction(siegeProvince, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.province.state).toBe('ready');
            expect(result.province.decompositionCount).toBe(1);
            expect(result.sideEffects.some(e => e.type === 'resolve_siege_event')).toBe(true);
        }
    });

    it('applies raid tactic and creates daily move', () => {
        const action: DomainAction = {
            type: 'apply_tactic',
            payload: {
                tacticType: 'raid',
                siegeEventId: 'siege-1',
                data: {
                    tacticType: 'raid',
                    durationMinutes: 5,
                },
            },
        };
        const result = applyAction(siegeProvince, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.province.state).toBe('in_progress');
            const dailyMove = result.sideEffects.find(e => e.type === 'create_daily_move');
            expect(dailyMove).toBeDefined();
            if (dailyMove?.type === 'create_daily_move') {
                expect(dailyMove.moveType).toBe('raid');
                expect(dailyMove.durationMinutes).toBe(5);
            }
            expect(result.sideEffects.some(e => e.type === 'resolve_siege_event')).toBe(true);
        }
    });

    it('applies retreat tactic', () => {
        const action: DomainAction = {
            type: 'apply_tactic',
            payload: {
                tacticType: 'retreat',
                siegeEventId: 'siege-1',
                data: {
                    tacticType: 'retreat',
                    reason: 'Not the right time',
                },
            },
        };
        const result = applyAction(siegeProvince, action, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.province.state).toBe('retreated');
            expect(result.sideEffects.some(e => e.type === 'resolve_siege_event')).toBe(true);
        }
    });
});
