import { describe, it, expect, beforeEach } from 'vitest';
import { campaignRepository, regionRepository, provinceRepository, seasonRepository } from './repositories';
import { clearAll, initStorage } from './storage';
import { exportAppState, importAppState } from './import-export';

describe('Persistence Integration', () => {
    beforeEach(async () => {
        await clearAll();
        await initStorage();
    });

    describe('Repository CRUD', () => {
        it('should create and retrieve a campaign', async () => {
            const campaign = await campaignRepository.create({
                title: 'Test Campaign',
                seasonId: 'season-1',
                status: 'active',
                chronicleEnabled: true
            });

            expect(campaign.id).toBeDefined();
            const retrieved = await campaignRepository.getById(campaign.id);
            expect(retrieved?.title).toBe('Test Campaign');
        });

        it('should handle relationships (campaign -> region -> province)', async () => {
            const campaign = await campaignRepository.create({
                title: 'Rel Campaign',
                seasonId: 's1',
                status: 'active',
                chronicleEnabled: false
            });

            const region = await regionRepository.create({
                campaignId: campaign.id,
                title: 'Test Region',
                order: 1,
                progressPercent: 0,
                status: 'active',
                mapTemplateId: 'basic'
            });

            const province = await provinceRepository.create({
                regionId: region.id,
                title: 'Test Province',
                state: 'ready',
                progressStage: 'scouted',
                decompositionCount: 0
            });

            // Verify campaign has region
            const updatedCampaign = await campaignRepository.getById(campaign.id);
            expect(updatedCampaign?.regionIds).toContain(region.id);

            // Verify region has province
            const updatedRegion = await regionRepository.getById(region.id);
            expect(updatedRegion?.provinceIds).toContain(province.id);
        });

        it('should cascade delete (campaign -> region -> province)', async () => {
            const campaign = await campaignRepository.create({ title: 'Delete Me', seasonId: 's1', status: 'active', chronicleEnabled: true });
            const region = await regionRepository.create({ campaignId: campaign.id, title: 'R', order: 1, progressPercent: 0, status: 'active', mapTemplateId: 'm' });
            const province = await provinceRepository.create({ regionId: region.id, title: 'P', state: 'ready', progressStage: 'scouted', decompositionCount: 0 });

            await campaignRepository.delete(campaign.id);

            expect(await campaignRepository.getById(campaign.id)).toBeNull();
            expect(await regionRepository.getById(region.id)).toBeNull();
            expect(await provinceRepository.getById(province.id)).toBeNull();
        });
    });

    describe('Import/Export Roundtrip', () => {
        it('should preserve state through export and import', async () => {
            // 1. Setup some data
            const season = await seasonRepository.create({ title: 'Export Season', startedAt: new Date().toISOString(), endsAt: new Date().toISOString(), dayNumber: 1, timezone: 'UTC' });

            // 2. Export
            const exportedJson = await exportAppState();
            const exportedObj = JSON.parse(exportedJson);
            expect(exportedObj.seasons.length).toBeGreaterThan(0);
            expect(exportedObj.seasons[0].title).toBe('Export Season');

            // 3. Clear and Import
            await clearAll();
            await initStorage();

            const importResult = await importAppState(exportedJson);
            expect(importResult.success).toBe(true);

            // 4. Verify
            const importedSeason = await seasonRepository.getById(season.id);
            expect(importedSeason?.title).toBe('Export Season');
        });
    });
});
