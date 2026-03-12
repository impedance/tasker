import { describe, expect, it } from 'vitest';
import type { Province, ProvinceState } from '../../entities/types';
import { isProvinceActionAvailable } from './ProvinceDetailsPage';

function makeProvince(state: ProvinceState): Province {
    const now = new Date().toISOString();
    return {
        id: 'province-1',
        regionId: 'region-1',
        title: 'Test Province',
        state,
        progressStage: 'scouted',
        decompositionCount: 0,
        createdAt: now,
        updatedAt: now,
    };
}

describe('isProvinceActionAvailable', () => {
    it('fog: only edit_fields is available among primary action buttons', () => {
        const province = makeProvince('fog');
        expect(isProvinceActionAvailable(province, 'start_move')).toBe(false);
        expect(isProvinceActionAvailable(province, 'log_move')).toBe(false);
        expect(isProvinceActionAvailable(province, 'supply')).toBe(false);
        expect(isProvinceActionAvailable(province, 'complete')).toBe(false);
        expect(isProvinceActionAvailable(province, 'retreat')).toBe(false);
        expect(isProvinceActionAvailable(province, 'reschedule')).toBe(false);
        expect(isProvinceActionAvailable(province, 'edit_fields')).toBe(true);
    });

    it('ready: start_move/supply/complete/retreat/reschedule/edit_fields are available; log_move is not', () => {
        const province = makeProvince('ready');
        expect(isProvinceActionAvailable(province, 'start_move')).toBe(true);
        expect(isProvinceActionAvailable(province, 'log_move')).toBe(false);
        expect(isProvinceActionAvailable(province, 'supply')).toBe(true);
        expect(isProvinceActionAvailable(province, 'complete')).toBe(true);
        expect(isProvinceActionAvailable(province, 'retreat')).toBe(true);
        expect(isProvinceActionAvailable(province, 'reschedule')).toBe(true);
        expect(isProvinceActionAvailable(province, 'edit_fields')).toBe(true);
    });

    it('in_progress: log_move/supply/complete/retreat/reschedule/edit_fields are available; start_move is not', () => {
        const province = makeProvince('in_progress');
        expect(isProvinceActionAvailable(province, 'start_move')).toBe(false);
        expect(isProvinceActionAvailable(province, 'log_move')).toBe(true);
        expect(isProvinceActionAvailable(province, 'supply')).toBe(true);
        expect(isProvinceActionAvailable(province, 'complete')).toBe(true);
        expect(isProvinceActionAvailable(province, 'retreat')).toBe(true);
        expect(isProvinceActionAvailable(province, 'reschedule')).toBe(true);
        expect(isProvinceActionAvailable(province, 'edit_fields')).toBe(true);
    });

    it('captured: only edit_fields remains available', () => {
        const province = makeProvince('captured');
        expect(isProvinceActionAvailable(province, 'start_move')).toBe(false);
        expect(isProvinceActionAvailable(province, 'log_move')).toBe(false);
        expect(isProvinceActionAvailable(province, 'supply')).toBe(false);
        expect(isProvinceActionAvailable(province, 'complete')).toBe(false);
        expect(isProvinceActionAvailable(province, 'retreat')).toBe(false);
        expect(isProvinceActionAvailable(province, 'reschedule')).toBe(false);
        expect(isProvinceActionAvailable(province, 'edit_fields')).toBe(true);
    });
});
