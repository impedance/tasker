/**
 * Region repository implementation
 * Provides CRUD operations and relationship queries for Region entities
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from '../storage';
import type { Region } from '../../entities/types';
import { campaignRepository } from './campaign-repository';
import { provinceRepository } from './province-repository';

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
      await provinceRepository.delete(provinceId, false);
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
