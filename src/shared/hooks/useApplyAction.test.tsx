import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useApplyAction } from './useApplyAction';
import { resetAppState } from '../../storage/import-export';
import { campaignRepository, provinceRepository, regionRepository } from '../../storage/repositories';

describe('useApplyAction map slot assignment', () => {
    beforeEach(async () => {
        await resetAppState();
        sessionStorage.clear();
    });

    it('prevents stale UI from assigning an already occupied slot', async () => {
        const campaign = await campaignRepository.create({
            title: 'Hook Test Campaign',
            status: 'active',
            seasonId: 'season-1',
            chronicleEnabled: true,
        });
        const region = await regionRepository.create({
            campaignId: campaign.id,
            title: 'Hook Test Region',
            order: 1,
            status: 'active',
            progressPercent: 0,
            mapTemplateId: 'region_v1',
        });

        const provinceA = await provinceRepository.create({
            regionId: region.id,
            title: 'Province A',
            state: 'ready',
            progressStage: 'scouted',
            decompositionCount: 0,
        });
        const provinceB = await provinceRepository.create({
            regionId: region.id,
            title: 'Province B',
            state: 'ready',
            progressStage: 'scouted',
            decompositionCount: 0,
        });

        const staleProvinceB = await provinceRepository.getById(provinceB.id);
        expect(staleProvinceB).not.toBeNull();
        const { result } = renderHook(() => useApplyAction());

        await result.current.execute(provinceA, {
            type: 'edit_fields',
            payload: { mapSlotId: 'p01' },
        });

        const reloadedA = await provinceRepository.getById(provinceA.id);
        expect(reloadedA?.mapSlotId).toBe('p01');

        await expect(
            result.current.execute(staleProvinceB!, {
                type: 'edit_fields',
                payload: { mapSlotId: 'p01' },
            })
        ).rejects.toThrow(/already assigned/i);

        const reloadedB = await provinceRepository.getById(provinceB.id);
        expect(reloadedB?.mapSlotId).toBeUndefined();
    });
});
