import { describe, expect, it } from 'vitest';
import { resolveSlotSelection } from './UnplacedProvincesList';

describe('resolveSlotSelection', () => {
    it('keeps current selection when still valid', () => {
        expect(resolveSlotSelection('p02', ['p01', 'p02', 'p03'])).toBe('p02');
    });

    it('switches to first free slot when current selection becomes invalid', () => {
        expect(resolveSlotSelection('p02', ['p04', 'p05'])).toBe('p04');
    });

    it('returns empty selection when there are no free slots', () => {
        expect(resolveSlotSelection('p02', [])).toBe('');
    });
});
