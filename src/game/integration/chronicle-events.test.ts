import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { provinceRepository, campaignRepository, regionRepository, chronicleEntryRepository } from '../../storage/repositories';
import { domainService } from '../../shared/services/domainService';
import { applyAction } from '../rules/apply-action';
import { getEventsByName, clearEvents } from '../../shared/events/event-logger';
import { clearAll } from '../../storage/storage';
import { DomainAction } from '../rules/actions';

describe('Integration: Chronicle + Events', () => {
    let testProvinceId: string;

    beforeEach(async () => {
        await clearAll();
        await clearEvents();

        const campaign = await campaignRepository.create({
            title: 'Test Campaign',
            status: 'active',
            seasonId: 's1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            chronicleEnabled: true
        } as any);

        const region = await regionRepository.create({
            campaignId: campaign.id,
            title: 'Test Region',
            order: 1
        } as any);

        const province = await provinceRepository.create({
            regionId: region.id,
            title: 'Test Province',
            state: 'ready',
            progressStage: 'scouted',
            decompositionCount: 0
        } as any);

        testProvinceId = province.id;
    });

    afterEach(async () => {
        await clearAll();
        await clearEvents();
    });

    it('generates event and chronicle on start_move', async () => {
        const province = await provinceRepository.getById(testProvinceId);
        expect(province).toBeDefined();

        const action: DomainAction = {
            type: 'start_move',
            payload: {
                durationMinutes: 10,
                moveType: 'raid'
            }
        };

        const result = applyAction(province!, action);
        expect(result.ok).toBe(true);
        if (!result.ok) return;

        await domainService.persistResult(action, result);

        // check chronicle
        const chronicles = await chronicleEntryRepository.list();
        expect(chronicles.length).toBe(1);
        expect(chronicles[0].entryType as any).toBe('province_started');
        expect(chronicles[0].provinceId).toBe(testProvinceId);

        // check events
        const events = await getEventsByName('province_started');
        expect(events.length).toBe(1);
        expect((events[0].payload as any).provinceId).toBe(testProvinceId);
    });
});
