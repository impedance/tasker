/**
 * Campaign repository implementation
 * Provides CRUD operations and relationship queries for Campaign entities
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from '../storage';
import type { Campaign } from '../../entities/types';
import { regionRepository } from './region-repository';

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
