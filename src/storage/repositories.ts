/**
 * Repository implementations for domain entities
 * Provides CRUD operations and relationship queries
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from './storage';
import type {
  Campaign, Region, Province, DailyMove, PlayerProfile,
  Season, SiegeEvent, IfThenPlan, SeasonReview, HeroMoment,
  ChronicleEntry, ShareCard
} from '../entities/types';

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

// ============================================================================
// DailyMove Repository
// ============================================================================

export const dailyMoveRepository = {
  async getById(id: string): Promise<DailyMove | null> {
    return getItem<DailyMove>(`${KEY_PREFIX}dailyMove:${id}`);
  },
  async list(): Promise<DailyMove[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}dailyMove:`);
    const items = await Promise.all(keys.map(k => getItem<DailyMove>(k)));
    return items.filter((i): i is DailyMove => i !== null);
  },
  async listByDate(date: string): Promise<DailyMove[]> {
    const items = await this.list();
    return items.filter(i => i.date === date);
  },
  async create(data: Omit<DailyMove, 'id' | 'createdAt'>): Promise<DailyMove> {
    const item: DailyMove = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
    await setItem(`${KEY_PREFIX}dailyMove:${item.id}`, item);
    return item;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}dailyMove:${id}`);
    return true;
  }
};

// ============================================================================
// PlayerProfile Repository
// ============================================================================

export const playerProfileRepository = {
  async get(): Promise<PlayerProfile | null> {
    return getItem<PlayerProfile>(`${KEY_PREFIX}playerProfile`);
  },
  async update(data: Partial<PlayerProfile>): Promise<PlayerProfile> {
    const current = await this.get();
    const updated: PlayerProfile = {
      ...(current || {
        id: 'local',
        totalCaptured: 0,
        totalClarified: 0,
        totalStarted: 0,
        totalCompleted: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      ...data,
      id: 'local',
      updatedAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}playerProfile`, updated);
    return updated;
  }
};

// ============================================================================
// Season Repository
// ============================================================================

export const seasonRepository = {
  async getById(id: string): Promise<Season | null> {
    return getItem<Season>(`${KEY_PREFIX}season:${id}`);
  },
  async list(): Promise<Season[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}season:`);
    const items = await Promise.all(keys.map(k => getItem<Season>(k)));
    return items.filter((i): i is Season => i !== null);
  },
  async create(data: Omit<Season, 'id' | 'createdAt' | 'updatedAt'>): Promise<Season> {
    const item: Season = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}season:${item.id}`, item);
    return item;
  },
  async update(id: string, data: Partial<Season>): Promise<Season | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const updated: Season = { ...current, ...data, updatedAt: new Date().toISOString() };
    await setItem(`${KEY_PREFIX}season:${id}`, updated);
    return updated;
  }
};

// ============================================================================
// SiegeEvent Repository
// ============================================================================

export const siegeEventRepository = {
  async getById(id: string): Promise<SiegeEvent | null> {
    return getItem<SiegeEvent>(`${KEY_PREFIX}siegeEvent:${id}`);
  },
  async list(): Promise<SiegeEvent[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}siegeEvent:`);
    const items = await Promise.all(keys.map(k => getItem<SiegeEvent>(k)));
    return items.filter((i): i is SiegeEvent => i !== null);
  },
  async create(data: Omit<SiegeEvent, 'id' | 'triggeredAt'>): Promise<SiegeEvent> {
    const item: SiegeEvent = {
      ...data,
      id: uuidv4(),
      triggeredAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}siegeEvent:${item.id}`, item);
    return item;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}siegeEvent:${id}`);
    return true;
  }
};

// ============================================================================
// IfThenPlan Repository
// ============================================================================

export const ifThenPlanRepository = {
  async getById(id: string): Promise<IfThenPlan | null> {
    return getItem<IfThenPlan>(`${KEY_PREFIX}ifThenPlan:${id}`);
  },
  async list(): Promise<IfThenPlan[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}ifThenPlan:`);
    const items = await Promise.all(keys.map(k => getItem<IfThenPlan>(k)));
    return items.filter((i): i is IfThenPlan => i !== null);
  },
  async create(data: Omit<IfThenPlan, 'id' | 'createdAt'>): Promise<IfThenPlan> {
    const item: IfThenPlan = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}ifThenPlan:${item.id}`, item);
    return item;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}ifThenPlan:${id}`);
    return true;
  }
};

// ============================================================================
// SeasonReview Repository
// ============================================================================

export const seasonReviewRepository = {
  async getById(id: string): Promise<SeasonReview | null> {
    return getItem<SeasonReview>(`${KEY_PREFIX}seasonReview:${id}`);
  },
  async list(): Promise<SeasonReview[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}seasonReview:`);
    const items = await Promise.all(keys.map(k => getItem<SeasonReview>(k)));
    return items.filter((i): i is SeasonReview => i !== null);
  },
  async create(data: Omit<SeasonReview, 'id' | 'createdAt'>): Promise<SeasonReview> {
    const item: SeasonReview = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}seasonReview:${item.id}`, item);
    return item;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}seasonReview:${id}`);
    return true;
  }
};

// ============================================================================
// HeroMoment Repository
// ============================================================================

export const heroMomentRepository = {
  async getById(id: string): Promise<HeroMoment | null> {
    return getItem<HeroMoment>(`${KEY_PREFIX}heroMoment:${id}`);
  },
  async list(): Promise<HeroMoment[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}heroMoment:`);
    const items = await Promise.all(keys.map(k => getItem<HeroMoment>(k)));
    return items.filter((i): i is HeroMoment => i !== null);
  },
  async create(data: Omit<HeroMoment, 'id' | 'triggeredAt'>): Promise<HeroMoment> {
    const item: HeroMoment = {
      ...data,
      id: uuidv4(),
      triggeredAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}heroMoment:${item.id}`, item);
    return item;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}heroMoment:${id}`);
    return true;
  }
};

// ============================================================================
// ChronicleEntry Repository
// ============================================================================

export const chronicleEntryRepository = {
  async getById(id: string): Promise<ChronicleEntry | null> {
    return getItem<ChronicleEntry>(`${KEY_PREFIX}chronicleEntry:${id}`);
  },
  async list(): Promise<ChronicleEntry[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}chronicleEntry:`);
    const items = await Promise.all(keys.map(k => getItem<ChronicleEntry>(k)));
    return items.filter((i): i is ChronicleEntry => i !== null);
  },
  async create(data: Omit<ChronicleEntry, 'id' | 'createdAt'>): Promise<ChronicleEntry> {
    const item: ChronicleEntry = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}chronicleEntry:${item.id}`, item);
    return item;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}chronicleEntry:${id}`);
    return true;
  }
};

// ============================================================================
// ShareCard Repository
// ============================================================================

export const shareCardRepository = {
  async getById(id: string): Promise<ShareCard | null> {
    return getItem<ShareCard>(`${KEY_PREFIX}shareCard:${id}`);
  },
  async list(): Promise<ShareCard[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}shareCard:`);
    const items = await Promise.all(keys.map(k => getItem<ShareCard>(k)));
    return items.filter((i): i is ShareCard => i !== null);
  },
  async create(data: Omit<ShareCard, 'id' | 'generatedAt'>): Promise<ShareCard> {
    const item: ShareCard = {
      ...data,
      id: uuidv4(),
      generatedAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}shareCard:${item.id}`, item);
    return item;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}shareCard:${id}`);
    return true;
  }
};

