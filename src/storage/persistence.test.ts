// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { campaignRepository, regionRepository, provinceRepository, seasonRepository } from './repositories';
import { clearAll, initStorage, loadAppState, db } from './storage';
import { createEmptyAppState, exportAppState, importAppState } from './import-export';
import { CURRENT_SCHEMA_VERSION } from './migrations';

describe('Persistence Integration', () => {
    afterAll(async () => {
        await db.dropInstance();
    });

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

        it('should return undefined when 16 map slots are occupied', async () => {
            const campaign = await campaignRepository.create({ title: 'Test', seasonId: 's1', status: 'active', chronicleEnabled: true });
            const region = await regionRepository.create({ campaignId: campaign.id, title: 'R', order: 1, progressPercent: 0, status: 'active', mapTemplateId: 'm' });

            // Fill all 16 slots
            for (let i = 1; i <= 16; i++) {
                await provinceRepository.create({
                    regionId: region.id,
                    title: `P${i}`,
                    state: 'ready',
                    progressStage: 'scouted',
                    decompositionCount: 0,
                    mapSlotId: `p${i.toString().padStart(2, '0')}`
                });
            }

            const freeSlotId = await provinceRepository.findFirstFreeMapSlotId(region.id);
            expect(freeSlotId).toBeUndefined();
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

        it('should migrate and save a legacy snapshot through public import flow', async () => {
            const now = new Date().toISOString();
            const legacySnapshot = {
                schemaVersion: 0,
                campaigns: [
                    {
                        id: 'c-1',
                        title: 'Legacy Campaign',
                        seasonId: 's-1',
                        status: 'active',
                        chronicleEnabled: true,
                        regionIds: ['r-1'],
                        createdAt: now,
                        updatedAt: now
                    }
                ],
                regions: [
                    {
                        id: 'r-1',
                        campaignId: 'c-1',
                        title: 'Legacy Region',
                        order: 1,
                        provinceIds: ['p-1'],
                        progressPercent: 0,
                        status: 'active',
                        mapTemplateId: 'basic',
                        createdAt: now,
                        updatedAt: now
                    }
                ],
                provinces: [
                    {
                        id: 'p-1',
                        regionId: 'r-1',
                        title: 'Legacy Province',
                        state: 'ready',
                        progressStage: 'scouted',
                        decompositionCount: 0,
                        createdAt: now,
                        updatedAt: now
                    }
                ],
                playerProfile: {
                    id: 'local',
                    totalCaptured: 1,
                    totalClarified: 2,
                    totalStarted: 3,
                    totalCompleted: 4,
                    createdAt: now,
                    updatedAt: now
                }
            };

            const importResult = await importAppState(JSON.stringify(legacySnapshot));
            expect(importResult.success).toBe(true);
            expect(importResult.migratedFromVersion).toBe(0);

            const loadedState = await loadAppState();
            expect(loadedState).not.toBeNull();
            expect(loadedState?.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
            expect(loadedState?.campaigns[0]?.title).toBe('Legacy Campaign');
            expect(loadedState?.provinces[0]?.id).toBe('p-1');
        });

        it('should import legacy chronicle entries with unknown entryType', async () => {
            const now = new Date().toISOString();
            const snapshot = createEmptyAppState();
            snapshot.chronicleEntries = [
                {
                    id: 'chron-legacy-1',
                    campaignId: 'camp-1',
                    entryType: 'province_started' as any,
                    title: 'Started: Legacy Province',
                    importance: 'medium',
                    createdAt: now
                }
            ];

            const importResult = await importAppState(JSON.stringify(snapshot));
            expect(importResult.success).toBe(true);

            const loadedState = await loadAppState();
            expect(loadedState?.chronicleEntries).toHaveLength(1);
            // T4: province_started is now a valid chronicle entry type, so it should be preserved
            expect(loadedState?.chronicleEntries[0]?.entryType).toBe('province_started');
        });

        it('should keep normalized chronicle entries after export/import roundtrip', async () => {
            const now = new Date().toISOString();
            const snapshot = createEmptyAppState();
            snapshot.chronicleEntries = [
                {
                    id: 'chron-legacy-2',
                    campaignId: 'camp-1',
                    entryType: 'province_move_logged' as any,
                    title: 'Logged Move: Legacy Province',
                    importance: 'medium',
                    createdAt: now
                }
            ];

            const firstImport = await importAppState(JSON.stringify(snapshot));
            expect(firstImport.success).toBe(true);

            const exportedJson = await exportAppState();
            await clearAll();
            await initStorage();

            const secondImport = await importAppState(exportedJson);
            expect(secondImport.success).toBe(true);

            const loadedState = await loadAppState();
            expect(loadedState?.chronicleEntries).toHaveLength(1);
            // T4: province_move_logged is now a valid chronicle entry type, so it should be preserved
            expect(loadedState?.chronicleEntries[0]?.entryType).toBe('province_move_logged');
        });
    });
});
