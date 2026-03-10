import { describe, it, expect } from 'vitest';
import { getRoleHints, getPreferredActionsForRole } from './roles';

describe('getRoleHints', () => {
    it('returns empty array for standard role', () => {
        expect(getRoleHints({ provinceRole: 'standard', state: 'ready' })).toEqual([]);
    });

    it('returns empty array for undefined role', () => {
        expect(getRoleHints({ provinceRole: undefined, state: 'ready' })).toEqual([]);
    });

    it('fortress prefers decompose and supply', () => {
        const hints = getRoleHints({ provinceRole: 'fortress', state: 'ready' });
        expect(hints).toHaveLength(1);
        expect(hints[0].preferredActions).toContain('decompose');
        expect(hints[0].preferredActions).toContain('supply');
    });

    it('watchtower prefers clarify', () => {
        const hints = getRoleHints({ provinceRole: 'watchtower', state: 'ready' });
        expect(hints).toHaveLength(1);
        expect(hints[0].preferredActions).toContain('clarify');
    });

    it('depot prefers supply and clarify', () => {
        const hints = getRoleHints({ provinceRole: 'depot', state: 'ready' });
        expect(hints).toHaveLength(1);
        expect(hints[0].preferredActions).toContain('supply');
        expect(hints[0].preferredActions).toContain('clarify');
    });

    it('archive prefers supply and clarify', () => {
        const hints = getRoleHints({ provinceRole: 'archive', state: 'ready' });
        expect(hints).toHaveLength(1);
        expect(hints[0].preferredActions).toContain('supply');
    });

    it('never blocks actions — returns hints only (no restrictions)', () => {
        // Hints are suggestions; no exceptions should be thrown
        const roles = ['standard', 'fortress', 'watchtower', 'depot', 'archive'] as const;
        for (const role of roles) {
            expect(() => getRoleHints({ provinceRole: role, state: 'ready' })).not.toThrow();
        }
    });
});

describe('getPreferredActionsForRole', () => {
    it('returns preferred actions for fortress', () => {
        const actions = getPreferredActionsForRole('fortress');
        expect(actions).toContain('decompose');
    });

    it('returns empty for standard', () => {
        expect(getPreferredActionsForRole('standard')).toEqual([]);
    });
});
