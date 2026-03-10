/**
 * Repository implementations for domain entities
 * Provides CRUD operations and relationship queries
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from './storage';
import type { Campaign, Region, Province } from '../entities/types';

// ============================================================================
// Campaign Repository
// ============================================================================

export const campaignRepository = {
  /**
   * Get campaign by ID
   */
  async getById(id: string): Promise<Campaign | null> {
    return getItem<Campaign>(`${KEY_PREFIX}campaign:${id}`);
  },

  /**
   * List all campaigns
   */
  async list(): Promise<Campaign[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}campaign:`);
    const items = await Promise.all(keys.map(k => getItem<Campaign>(k)));
    return items.filter((c): c is Campaign => c !== null);
  },

  /**
   * List campaigns by season ID
   */
  async listBySeason(seasonId: string): Promise<Campaign[]> {
    const campaigns = await this.list();
    return campaigns.filter(c => c.seasonId === seasonId);
  },

  /**
   * Create a new campaign
   */
  async create(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'regionIds'>): Promise<Campaign> {
    const campaign: Campaign = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      regionIds: []
    };
    await setItem(`${KEY_PREFIX}campaign:${campaign.id}`, campaign);
    return campaign;
  },

  /**
   * Update an existing campaign
   */
  async update(id: string, data: Partial<Campaign>): Promise<Campaign | null> {
    const campaign = await this.getById(id);
    if (!campaign) {
      return null;
    }
    const updated: Campaign = {
      ...campaign,
      ...data,
      updatedAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}campaign:${id}`, updated);
    return updated;
  },

  /**
   * Delete a campaign (cascades to regions and provinces)
   */
  async delete(id: string): Promise<boolean> {
    const campaign = await this.getById(id);
    if (!campaign) {
      return false;
    }

    // Cascade delete regions
    for (const regionId of campaign.regionIds) {
      await regionRepository.delete(regionId);
    }

    await removeItem(`${KEY_PREFIX}campaign:${id}`);
    return true;
  },

  /**
   * Add region ID to campaign's regionIds array
   */
  async addRegionId(campaignId: string, regionId: string): Promise<Campaign | null> {
    const campaign = await this.getById(campaignId);
    if (!campaign) {
      return null;
    }
    if (!campaign.regionIds.includes(regionId)) {
      campaign.regionIds.push(regionId);
      campaign.updatedAt = new Date().toISOString();
      await setItem(`${KEY_PREFIX}campaign:${campaignId}`, campaign);
    }
    return campaign;
  },

  /**
   * Remove region ID from campaign's regionIds array
   */
  async removeRegionId(campaignId: string, regionId: string): Promise<Campaign | null> {
    const campaign = await this.getById(campaignId);
    if (!campaign) {
      return null;
    }
    const idx = campaign.regionIds.indexOf(regionId);
    if (idx !== -1) {
      campaign.regionIds.splice(idx, 1);
      campaign.updatedAt = new Date().toISOString();
      await setItem(`${KEY_PREFIX}campaign:${campaignId}`, campaign);
    }
    return campaign;
  }
};

// ============================================================================
// Region Repository
// ============================================================================

export const regionRepository = {
  /**
   * Get region by ID
   */
  async getById(id: string): Promise<Region | null> {
    return getItem<Region>(`${KEY_PREFIX}region:${id}`);
  },

  /**
   * List all regions
   */
  async list(): Promise<Region[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}region:`);
    const items = await Promise.all(keys.map(k => getItem<Region>(k)));
    return items.filter((r): r is Region => r !== null);
  },

  /**
   * List regions by campaign ID
   */
  async listByCampaign(campaignId: string): Promise<Region[]> {
    const regions = await this.list();
    return regions
      .filter(r => r.campaignId === campaignId)
      .sort((a, b) => a.order - b.order);
  },

  /**
   * Create a new region
   */
  async create(data: Omit<Region, 'id' | 'createdAt' | 'updatedAt' | 'provinceIds'>): Promise<Region> {
    const region: Region = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      provinceIds: []
    };
    await setItem(`${KEY_PREFIX}region:${region.id}`, region);

    // Add region to campaign
    await campaignRepository.addRegionId(data.campaignId, region.id);

    return region;
  },

  /**
   * Update an existing region
   */
  async update(id: string, data: Partial<Region>): Promise<Region | null> {
    const region = await this.getById(id);
    if (!region) {
      return null;
    }
    const updated: Region = {
      ...region,
      ...data,
      updatedAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}region:${id}`, updated);
    return updated;
  },

  /**
   * Delete a region (cascades to provinces)
   */
  async delete(id: string): Promise<boolean> {
    const region = await this.getById(id);
    if (!region) {
      return false;
    }

    // Remove from campaign's regionIds
    await campaignRepository.removeRegionId(region.campaignId, id);

    // Cascade delete provinces
    for (const provinceId of region.provinceIds) {
      await provinceRepository.delete(provinceId, false); // pass false to avoid updating this region's provinceIds while deleting
    }

    await removeItem(`${KEY_PREFIX}region:${id}`);
    return true;
  },

  /**
   * Add province ID to region's provinceIds array
   */
  async addProvinceId(regionId: string, provinceId: string): Promise<Region | null> {
    const region = await this.getById(regionId);
    if (!region) {
      return null;
    }
    if (!region.provinceIds.includes(provinceId)) {
      region.provinceIds.push(provinceId);
      region.updatedAt = new Date().toISOString();
      await setItem(`${KEY_PREFIX}region:${regionId}`, region);
    }
    return region;
  },

  /**
   * Remove province ID from region's provinceIds array
   */
  async removeProvinceId(regionId: string, provinceId: string): Promise<Region | null> {
    const region = await this.getById(regionId);
    if (!region) {
      return null;
    }
    const idx = region.provinceIds.indexOf(provinceId);
    if (idx !== -1) {
      region.provinceIds.splice(idx, 1);
      region.updatedAt = new Date().toISOString();
      await setItem(`${KEY_PREFIX}region:${regionId}`, region);
    }
    return region;
  }
};

// ============================================================================
// Province Repository
// ============================================================================

export const provinceRepository = {
  /**
   * Get province by ID
   */
  async getById(id: string): Promise<Province | null> {
    return getItem<Province>(`${KEY_PREFIX}province:${id}`);
  },

  /**
   * List all provinces
   */
  async list(): Promise<Province[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}province:`);
    const items = await Promise.all(keys.map(k => getItem<Province>(k)));
    return items.filter((p): p is Province => p !== null);
  },

  /**
   * List provinces by region ID
   */
  async listByRegion(regionId: string): Promise<Province[]> {
    const provinces = await this.list();
    return provinces.filter(p => p.regionId === regionId);
  },

  /**
   * List provinces by campaign ID (through region)
   */
  async listByCampaign(campaignId: string): Promise<Province[]> {
    const regions = await regionRepository.listByCampaign(campaignId);
    const regionIds = regions.map(r => r.id);
    const provinces = await this.list();
    return provinces.filter(p => regionIds.includes(p.regionId));
  },

  /**
   * Find first free map slot ID in a region
   */
  async findFirstFreeMapSlotId(regionId: string): Promise<string> {
    const provinces = await this.listByRegion(regionId);
    const occupiedSlots = new Set(provinces.map(p => p.mapSlotId).filter(Boolean));

    // Simple heuristic for sequential map slots
    for (let i = 1; i <= 100; i++) {
      const slotId = `slot-${i}`;
      if (!occupiedSlots.has(slotId)) {
        return slotId;
      }
    }
    // Fallback if all 100 slots are taken
    return `slot-${uuidv4().slice(0, 8)}`;
  },

  /**
   * Validate adjacency lists
   */
  async validateAdjacencies(adjacentProvinceIds: string[] | undefined): Promise<void> {
    if (!adjacentProvinceIds || adjacentProvinceIds.length === 0) return;
    for (const adjId of adjacentProvinceIds) {
      const exists = await this.getById(adjId);
      if (!exists) {
        throw new Error(`Validation Error: Adjacent province ${adjId} does not exist`);
      }
    }
  },

  /**
   * Create a new province
   */
  async create(data: Omit<Province, 'id' | 'createdAt' | 'updatedAt'>): Promise<Province> {
    await this.validateAdjacencies(data.adjacentProvinceIds);

    const province: Province = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}province:${province.id}`, province);

    // Add province to region
    await regionRepository.addProvinceId(data.regionId, province.id);

    return province;
  },

  /**
   * Update an existing province
   */
  async update(id: string, data: Partial<Province>): Promise<Province | null> {
    if (data.adjacentProvinceIds) {
      await this.validateAdjacencies(data.adjacentProvinceIds);
    }

    const province = await this.getById(id);
    if (!province) {
      return null;
    }
    const updated: Province = {
      ...province,
      ...data,
      updatedAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}province:${id}`, updated);
    return updated;
  },

  /**
   * Delete a province
   */
  async delete(id: string, updateRegion: boolean = true): Promise<boolean> {
    const province = await this.getById(id);
    if (!province) {
      return false;
    }

    if (updateRegion) {
      // Remove from region's provinceIds
      await regionRepository.removeProvinceId(province.regionId, id);
    }

    await removeItem(`${KEY_PREFIX}province:${id}`);
    return true;
  },

  /**
   * Get province by mapSlotId
   */
  async getByMapSlot(regionId: string, mapSlotId: string): Promise<Province | null> {
    const provinces = await this.listByRegion(regionId);
    return provinces.find(p => p.mapSlotId === mapSlotId) || null;
  },

  /**
   * List provinces with mapSlotId in a region
   */
  async listWithMapSlots(regionId: string): Promise<Province[]> {
    const provinces = await this.listByRegion(regionId);
    return provinces.filter(p => p.mapSlotId !== undefined);
  },

  /**
   * Update province map slot binding
   */
  async setMapSlot(provinceId: string, mapSlotId: string | null): Promise<Province | null> {
    const province = await this.getById(provinceId);
    if (!province) {
      return null;
    }
    if (mapSlotId === null) {
      delete province.mapSlotId;
    } else {
      province.mapSlotId = mapSlotId;
    }
    province.updatedAt = new Date().toISOString();
    await setItem(`${KEY_PREFIX}province:${provinceId}`, province);
    return province;
  }
};
