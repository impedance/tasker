import { describe, it, expect } from 'vitest';
import { computeFrontPressureLevel, isHotspot, computePressureMap } from './pressure';

function daysAgo(n: number): string {
    return new Date(Date.now() - n * 24 * 60 * 60 * 1000 - 100).toISOString();
}

const baseProvince = {
    id: 'p-1',
    state: 'ready' as const,
    lastMeaningfulActionAt: undefined,
    createdAt: daysAgo(0),
    isHotspot: false,
    effortLevel: 2,
    decompositionCount: 0,
};

describe('computeFrontPressureLevel', () => {
    it('returns 0 for captured provinces', () => {
        expect(computeFrontPressureLevel({ ...baseProvince, state: 'captured' })).toBe(0);
    });

    it('returns 0 for retreated provinces', () => {
        expect(computeFrontPressureLevel({ ...baseProvince, state: 'retreated' })).toBe(0);
    });

    it('returns 0 for fog provinces', () => {
        expect(computeFrontPressureLevel({ ...baseProvince, state: 'fog' })).toBe(0);
    });

    it('returns 0 for recently active ready province', () => {
        expect(computeFrontPressureLevel({ ...baseProvince, createdAt: daysAgo(0) })).toBe(0);
    });

    it('returns 1 for fortified province', () => {
        expect(computeFrontPressureLevel({ ...baseProvince, state: 'fortified' })).toBe(1);
    });

    it('returns 1 when stalled >= 3 days but < 5 (not yet siege)', () => {
        const p = { ...baseProvince, state: 'ready' as const, createdAt: daysAgo(4) };
        expect(computeFrontPressureLevel(p)).toBe(1);
    });

    it('returns 2 when stalled >= 5 days', () => {
        const p = { ...baseProvince, state: 'ready' as const, createdAt: daysAgo(6) };
        expect(computeFrontPressureLevel(p)).toBe(2);
    });

    it('returns 2 for siege province < 7 days', () => {
        const p = { ...baseProvince, state: 'siege' as const, createdAt: daysAgo(4) };
        expect(computeFrontPressureLevel(p)).toBe(2);
    });

    it('returns 3 for siege + stalled >= 7 days', () => {
        const p = { ...baseProvince, state: 'siege' as const, createdAt: daysAgo(8) };
        expect(computeFrontPressureLevel(p)).toBe(3);
    });

    it('returns 3 for siege + isHotspot', () => {
        const p = { ...baseProvince, state: 'siege' as const, isHotspot: true, createdAt: daysAgo(8) };
        expect(computeFrontPressureLevel(p)).toBe(3);
    });
});

describe('isHotspot', () => {
    it('returns false for recently active province', () => {
        expect(isHotspot({ ...baseProvince, createdAt: daysAgo(1) })).toBe(false);
    });

    it('returns true for siege province stalled >= 7 days', () => {
        expect(isHotspot({ ...baseProvince, state: 'siege' as const, createdAt: daysAgo(8) })).toBe(true);
    });

    it('returns true for fortified province with high effort and no decomposition', () => {
        expect(isHotspot({ ...baseProvince, state: 'fortified' as const, effortLevel: 4, decompositionCount: 0 })).toBe(true);
    });

    it('returns false for fortified province with decomposition', () => {
        expect(isHotspot({ ...baseProvince, state: 'fortified' as const, effortLevel: 4, decompositionCount: 1 })).toBe(false);
    });

    it('returns false for low-effort fortified province', () => {
        expect(isHotspot({ ...baseProvince, state: 'fortified' as const, effortLevel: 2, decompositionCount: 0 })).toBe(false);
    });
});

describe('computePressureMap', () => {
    it('returns a map with correct pressure for each province', () => {
        const provinces = [
            { ...baseProvince, id: 'p-1', state: 'captured' as const },
            { ...baseProvince, id: 'p-2', state: 'siege' as const, createdAt: daysAgo(4) },
        ];
        const map = computePressureMap(provinces);
        expect(map.get('p-1')).toBe(0);
        expect(map.get('p-2')).toBe(2);
    });
});
