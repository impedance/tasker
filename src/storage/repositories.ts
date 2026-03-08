/**
 * Repository implementations for domain entities
 * Provides CRUD operations and relationship queries
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_APP_STATE, getItem, setItem } from './storage';
import { CURRENT_SCHEMA_VERSION } from './migrations';
import type { Campaign, Region, Province, AppState } from '../entities/types';

// ============================================================================
// Helper
// ============================================================================

/**
 * Load app state or return empty state
 */
async function loadState(): Promise<AppState> {
  const existing = await getItem<AppState>(KEY_APP_STATE);
  if (existing) {
    return existing;
  }
  // Return empty state with current schema version
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    campaigns: [],
    regions: [],
    provinces: [],
    dailyMoves: [],
    checkIns: [],
    siegeEvents: [],
    seasons: [],
    seasonReviews: [],
    heroMoments: [],
    chronicleEntries: [],
    ifThenPlans: [],
    shareCards: [],
    playerProfile: {
      id: 'local',
      totalCaptured: 0,
      totalClarified: 0,
      totalStarted: 0,
      totalCompleted: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    capitalStates: [],
    archetypeStats: []
  };
}

/**
 * Save app state
 */
async function saveState(state: AppState): Promise<void> {
  await setItem(KEY_APP_STATE, state);
}

// ============================================================================
// Campaign Repository
// ============================================================================

export const campaignRepository = {
  /**
   * Get campaign by ID
   */
  async getById(id: string): Promise<Campaign | null> {
    const state = await loadState();
    return state.campaigns.find(c => c.id === id) || null;
  },

  /**
   * List all campaigns
   */
  async list(): Promise<Campaign[]> {
    const state = await loadState();
    return state.campaigns;
  },

  /**
   * List campaigns by season ID
   */
  async listBySeason(seasonId: string): Promise<Campaign[]> {
    const state = await loadState();
    return state.campaigns.filter(c => c.seasonId === seasonId);
  },

  /**
   * Create a new campaign
   */
  async create(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'regionIds'>): Promise<Campaign> {
    const state = await loadState();
    const campaign: Campaign = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      regionIds: []
    };
    state.campaigns.push(campaign);
    await saveState(state);
    return campaign;
  },

  /**
   * Update an existing campaign
   */
  async update(id: string, data: Partial<Campaign>): Promise<Campaign | null> {
    const state = await loadState();
    const index = state.campaigns.findIndex(c => c.id === id);
    if (index === -1) {
      return null;
    }
    state.campaigns[index] = {
      ...state.campaigns[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    await saveState(state);
    return state.campaigns[index];
  },

  /**
   * Delete a campaign (cascades to regions and provinces)
   */
  async delete(id: string): Promise<boolean> {
    const state = await loadState();
    const index = state.campaigns.findIndex(c => c.id === id);
    if (index === -1) {
      return false;
    }

    // Get region IDs to cascade delete
    const regionIdsToDelete = state.campaigns[index].regionIds;

    // Remove campaign
    state.campaigns.splice(index, 1);

    // Cascade delete regions
    state.regions = state.regions.filter(r => !regionIdsToDelete.includes(r.id));

    // Cascade delete provinces
    state.provinces = state.provinces.filter(p => !regionIdsToDelete.some(rid => rid === p.regionId));

    await saveState(state);
    return true;
  },

  /**
   * Add region ID to campaign's regionIds array
   */
  async addRegionId(campaignId: string, regionId: string): Promise<Campaign | null> {
    const state = await loadState();
    const campaign = state.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      return null;
    }
    if (!campaign.regionIds.includes(regionId)) {
      campaign.regionIds.push(regionId);
      campaign.updatedAt = new Date().toISOString();
      await saveState(state);
    }
    return campaign;
  },

  /**
   * Remove region ID from campaign's regionIds array
   */
  async removeRegionId(campaignId: string, regionId: string): Promise<Campaign | null> {
    const state = await loadState();
    const campaign = state.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      return null;
    }
    const idx = campaign.regionIds.indexOf(regionId);
    if (idx !== -1) {
      campaign.regionIds.splice(idx, 1);
      campaign.updatedAt = new Date().toISOString();
      await saveState(state);
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
    const state = await loadState();
    return state.regions.find(r => r.id === id) || null;
  },

  /**
   * List all regions
   */
  async list(): Promise<Region[]> {
    const state = await loadState();
    return state.regions;
  },

  /**
   * List regions by campaign ID
   */
  async listByCampaign(campaignId: string): Promise<Region[]> {
    const state = await loadState();
    return state.regions
      .filter(r => r.campaignId === campaignId)
      .sort((a, b) => a.order - b.order);
  },

  /**
   * Create a new region
   */
  async create(data: Omit<Region, 'id' | 'createdAt' | 'updatedAt' | 'provinceIds'>): Promise<Region> {
    const state = await loadState();
    const region: Region = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      provinceIds: []
    };
    state.regions.push(region);
    await saveState(state);

    // Add region to campaign
    await campaignRepository.addRegionId(data.campaignId, region.id);

    return region;
  },

  /**
   * Update an existing region
   */
  async update(id: string, data: Partial<Region>): Promise<Region | null> {
    const state = await loadState();
    const index = state.regions.findIndex(r => r.id === id);
    if (index === -1) {
      return null;
    }
    state.regions[index] = {
      ...state.regions[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    await saveState(state);
    return state.regions[index];
  },

  /**
   * Delete a region (cascades to provinces)
   */
  async delete(id: string): Promise<boolean> {
    const state = await loadState();
    const index = state.regions.findIndex(r => r.id === id);
    if (index === -1) {
      return false;
    }

    const region = state.regions[index];

    // Remove from campaign's regionIds
    await campaignRepository.removeRegionId(region.campaignId, id);

    // Remove region
    state.regions.splice(index, 1);

    // Cascade delete provinces
    state.provinces = state.provinces.filter(p => p.regionId !== id);

    await saveState(state);
    return true;
  },

  /**
   * Add province ID to region's provinceIds array
   */
  async addProvinceId(regionId: string, provinceId: string): Promise<Region | null> {
    const state = await loadState();
    const region = state.regions.find(r => r.id === regionId);
    if (!region) {
      return null;
    }
    if (!region.provinceIds.includes(provinceId)) {
      region.provinceIds.push(provinceId);
      region.updatedAt = new Date().toISOString();
      await saveState(state);
    }
    return region;
  },

  /**
   * Remove province ID from region's provinceIds array
   */
  async removeProvinceId(regionId: string, provinceId: string): Promise<Region | null> {
    const state = await loadState();
    const region = state.regions.find(r => r.id === regionId);
    if (!region) {
      return null;
    }
    const idx = region.provinceIds.indexOf(provinceId);
    if (idx !== -1) {
      region.provinceIds.splice(idx, 1);
      region.updatedAt = new Date().toISOString();
      await saveState(state);
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
    const state = await loadState();
    return state.provinces.find(p => p.id === id) || null;
  },

  /**
   * List all provinces
   */
  async list(): Promise<Province[]> {
    const state = await loadState();
    return state.provinces;
  },

  /**
   * List provinces by region ID
   */
  async listByRegion(regionId: string): Promise<Province[]> {
    const state = await loadState();
    return state.provinces.filter(p => p.regionId === regionId);
  },

  /**
   * List provinces by campaign ID (through region)
   */
  async listByCampaign(campaignId: string): Promise<Province[]> {
    const state = await loadState();
    const regionIds = state.regions
      .filter(r => r.campaignId === campaignId)
      .map(r => r.id);
    return state.provinces.filter(p => regionIds.includes(p.regionId));
  },

  /**
   * Create a new province
   */
  async create(data: Omit<Province, 'id' | 'createdAt' | 'updatedAt'>): Promise<Province> {
    const state = await loadState();
    const province: Province = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.provinces.push(province);
    await saveState(state);

    // Add province to region
    await regionRepository.addProvinceId(data.regionId, province.id);

    return province;
  },

  /**
   * Update an existing province
   */
  async update(id: string, data: Partial<Province>): Promise<Province | null> {
    const state = await loadState();
    const index = state.provinces.findIndex(p => p.id === id);
    if (index === -1) {
      return null;
    }
    state.provinces[index] = {
      ...state.provinces[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    await saveState(state);
    return state.provinces[index];
  },

  /**
   * Delete a province
   */
  async delete(id: string): Promise<boolean> {
    const state = await loadState();
    const index = state.provinces.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }

    const province = state.provinces[index];

    // Remove from region's provinceIds
    await regionRepository.removeProvinceId(province.regionId, id);

    // Remove province
    state.provinces.splice(index, 1);

    await saveState(state);
    return true;
  },

  /**
   * Get province by mapSlotId
   */
  async getByMapSlot(regionId: string, mapSlotId: string): Promise<Province | null> {
    const state = await loadState();
    return state.provinces.find(
      p => p.regionId === regionId && p.mapSlotId === mapSlotId
    ) || null;
  },

  /**
   * List provinces with mapSlotId in a region
   */
  async listWithMapSlots(regionId: string): Promise<Province[]> {
    const state = await loadState();
    return state.provinces.filter(
      p => p.regionId === regionId && p.mapSlotId !== undefined
    );
  },

  /**
   * Update province map slot binding
   */
  async setMapSlot(provinceId: string, mapSlotId: string | null): Promise<Province | null> {
    const state = await loadState();
    const province = state.provinces.find(p => p.id === provinceId);
    if (!province) {
      return null;
    }
    if (mapSlotId === null) {
      delete province.mapSlotId;
    } else {
      province.mapSlotId = mapSlotId;
    }
    province.updatedAt = new Date().toISOString();
    await saveState(state);
    return province;
  }
};
