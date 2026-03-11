/**
 * Guardrails tests — EPIC-11-T4
 */

import { describe, it, expect } from 'vitest';
import {
    checkFogGuard,
    checkOverPlanningGuard,
    checkMicroTasksGuard,
    checkLongSessionGuard,
    checkPromptBudgetGuard,
    runGuardrails,
    hasBlockerWarning,
} from './guardrails';
import type { Province } from '../../entities/types';

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

describe('checkFogGuard', () => {
    it('should return blocker for fog province', () => {
        const province = makeProvince({
            state: 'fog',
            desiredOutcome: undefined,
            firstStep: undefined,
            estimatedEntryMinutes: undefined,
        });

        const warning = checkFogGuard(province);

        expect(warning).toBeDefined();
        expect(warning?.type).toBe('fog_block');
        expect(warning?.severity).toBe('blocker');
    });

    it('should return null for non-fog province', () => {
        const province = makeProvince({ state: 'ready' });

        const warning = checkFogGuard(province);

        expect(warning).toBe(null);
    });

    it('should return null for fog province with clarity fields', () => {
        const province = makeProvince({
            state: 'fog',
            desiredOutcome: 'Test outcome',
            firstStep: 'First step',
            estimatedEntryMinutes: 15,
        });

        const warning = checkFogGuard(province);

        // isFog checks for missing fields, so this should pass
        expect(warning).toBe(null);
    });
});

describe('checkOverPlanningGuard', () => {
    it('should return warning for over-planning', () => {
        const province = makeProvince({ decompositionCount: 4 });
        const history: Array<{ moveType: string; provinceId: string }> = [
            { moveType: 'supply', provinceId: 'province-1' },
            { moveType: 'decompose', provinceId: 'province-1' },
        ];

        const warning = checkOverPlanningGuard(province, history);

        expect(warning).toBeDefined();
        expect(warning?.type).toBe('over_planning');
        expect(warning?.severity).toBe('warning');
    });

    it('should return null if province has started', () => {
        const province = makeProvince({ decompositionCount: 4 });
        const history: Array<{ moveType: string; provinceId: string }> = [
            { moveType: 'supply', provinceId: 'province-1' },
            { moveType: 'raid', provinceId: 'province-1' }, // Started
        ];

        const warning = checkOverPlanningGuard(province, history);

        expect(warning).toBe(null);
    });

    it('should return null for normal decomposition count', () => {
        const province = makeProvince({ decompositionCount: 2 });
        const history: Array<{ moveType: string; provinceId: string }> = [];

        const warning = checkOverPlanningGuard(province, history);

        expect(warning).toBe(null);
    });
});

describe('checkMicroTasksGuard', () => {
    it('should return info for too many micro-tasks', () => {
        const provinces = Array.from({ length: 12 }, (_, i) =>
            makeProvince({
                id: `p-${i}`,
                estimatedEntryMinutes: 3,
            })
        );

        const warning = checkMicroTasksGuard(provinces);

        expect(warning).toBeDefined();
        expect(warning?.type).toBe('micro_tasks');
        expect(warning?.severity).toBe('info');
    });

    it('should return null for normal task sizes', () => {
        const provinces = Array.from({ length: 5 }, (_, i) =>
            makeProvince({
                id: `p-${i}`,
                estimatedEntryMinutes: 15,
            })
        );

        const warning = checkMicroTasksGuard(provinces);

        expect(warning).toBe(null);
    });

    it('should return null for exactly 10 micro-tasks', () => {
        const provinces = Array.from({ length: 10 }, (_, i) =>
            makeProvince({
                id: `p-${i}`,
                estimatedEntryMinutes: 3,
            })
        );

        const warning = checkMicroTasksGuard(provinces);

        expect(warning).toBe(null);
    });
});

describe('checkLongSessionGuard', () => {
    it('should return warning for long session without action', () => {
        const session = {
            startedAt: new Date(Date.now() - 35 * 60 * 1000), // 35 minutes ago
            meaningfulActionCount: 0,
            promptCount: 0,
        };

        const warning = checkLongSessionGuard(session);

        expect(warning).toBeDefined();
        expect(warning?.type).toBe('long_session_no_progress');
        expect(warning?.severity).toBe('warning');
    });

    it('should return null for short session', () => {
        const session = {
            startedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
            meaningfulActionCount: 0,
            promptCount: 0,
        };

        const warning = checkLongSessionGuard(session);

        expect(warning).toBe(null);
    });

    it('should return null if meaningful action was taken', () => {
        const session = {
            startedAt: new Date(Date.now() - 35 * 60 * 1000), // 35 minutes ago
            meaningfulActionCount: 1,
            promptCount: 0,
        };

        const warning = checkLongSessionGuard(session);

        expect(warning).toBe(null);
    });
});

describe('checkPromptBudgetGuard', () => {
    it('should return blocker for exceeded prompt budget', () => {
        const session = {
            startedAt: new Date(),
            meaningfulActionCount: 0,
            promptCount: 5,
        };

        const warning = checkPromptBudgetGuard(session, 5);

        expect(warning).toBeDefined();
        expect(warning?.type).toBe('prompt_budget');
        expect(warning?.severity).toBe('blocker');
    });

    it('should return null for normal prompt count', () => {
        const session = {
            startedAt: new Date(),
            meaningfulActionCount: 0,
            promptCount: 2,
        };

        const warning = checkPromptBudgetGuard(session, 5);

        expect(warning).toBe(null);
    });
});

describe('runGuardrails', () => {
    it('should return all applicable warnings', () => {
        const province = makeProvince({
            state: 'fog',
            decompositionCount: 4,
            desiredOutcome: undefined,
        });
        const provinces = [province];
        const history = [{ moveType: 'supply', provinceId: 'province-1' }];
        const session = {
            startedAt: new Date(Date.now() - 35 * 60 * 1000),
            meaningfulActionCount: 0,
            promptCount: 5,
        };

        const warnings = runGuardrails(province, provinces, history, session);

        expect(warnings.length).toBeGreaterThan(1);
        expect(warnings.map((w) => w.type)).toContain('fog_block');
        expect(warnings.map((w) => w.type)).toContain('over_planning');
    });
});

describe('hasBlockerWarning', () => {
    it('should return true if any blocker exists', () => {
        const warnings = [
            { type: 'fog_block' as const, message: '', severity: 'blocker' as const },
            { type: 'over_planning' as const, message: '', severity: 'warning' as const },
        ];

        expect(hasBlockerWarning(warnings)).toBe(true);
    });

    it('should return false if no blockers', () => {
        const warnings = [
            { type: 'over_planning' as const, message: '', severity: 'warning' as const },
            { type: 'micro_tasks' as const, message: '', severity: 'info' as const },
        ];

        expect(hasBlockerWarning(warnings)).toBe(false);
    });
});
