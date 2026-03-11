import { describe, it, expect, beforeEach } from 'vitest';
import { provinceRepository, campaignRepository, regionRepository } from '../../storage/repositories';
import { domainService } from '../../shared/services/domainService';
import { applyAction } from '../rules/apply-action';

describe('Integration: Clarify Flow', () => {
    let testProvinceId: string;

    beforeEach(async () => {
        // Setup minimal valid province hierarchy
        const campaign = await campaignRepository.create({
            title: 'Test Campaign',
            status: 'active',
            seasonId: 's1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as any);

        const region = await regionRepository.create({
            campaignId: campaign.id,
            title: 'Test Region',
            order: 1
        } as any);

        const province = await provinceRepository.create({
            regionId: region.id,
            title: 'Test Fog Province',
            state: 'fog',
            progressStage: 'scouted',
            decompositionCount: 0
        } as any);

        testProvinceId = province.id;
    });

    it('clarify action persists ready state and timestamps', async () => {
        // 1. Fetch province
        const province = await provinceRepository.getById(testProvinceId);
        expect(province).not.toBeNull();
        expect(province!.state).toBe('fog');
        expect(province!.lastMeaningfulActionAt).toBeUndefined();

        // 2. Apply tracking action
        const actionResult = applyAction(province!, {
            type: 'clarify',
            payload: {
                desiredOutcome: 'Integration success',
                firstStep: 'Run vitest',
                estimatedEntryMinutes: 5
            }
        });

        expect(actionResult.ok).toBe(true);
        if (!actionResult.ok) return;

        // 3. Persist via domainService
        await domainService.persistResult(actionResult);

        // 4. Reload from repository
        const reloaded = await provinceRepository.getById(testProvinceId);
        expect(reloaded).not.toBeNull();

        // 5. Assert fields
        expect(reloaded!.state).toBe('ready');
        expect(reloaded!.desiredOutcome).toBe('Integration success');
        expect(reloaded!.firstStep).toBe('Run vitest');
        expect(reloaded!.estimatedEntryMinutes).toBe(5);
        expect(reloaded!.lastMeaningfulActionAt).toBeDefined();
        // Since we didn't inject a specific date to applyAction, it defaults to Date.now
        const meaningfulDate = new Date(reloaded!.lastMeaningfulActionAt!);
        expect(meaningfulDate.getTime()).toBeLessThanOrEqual(Date.now());
    });
});
