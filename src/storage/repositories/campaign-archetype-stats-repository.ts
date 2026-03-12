/**
 * CampaignArchetypeStats repository implementation
 * Provides CRUD operations for CampaignArchetypeStats entities
 */

import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from '../storage';
import type { CampaignArchetypeStats } from '../../entities/types';

export const campaignArchetypeStatsRepository = {
  async getBySeasonId(seasonId: string): Promise<CampaignArchetypeStats | null> {
    return getItem<CampaignArchetypeStats>(`${KEY_PREFIX}archetypeStats:${seasonId}`);
  },
  async list(): Promise<CampaignArchetypeStats[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}archetypeStats:`);
    const items = await Promise.all(keys.map(k => getItem<CampaignArchetypeStats>(k)));
    return items.filter((i): i is CampaignArchetypeStats => i !== null);
  },
  async create(data: CampaignArchetypeStats): Promise<CampaignArchetypeStats> {
    await setItem(`${KEY_PREFIX}archetypeStats:${data.seasonId}`, data);
    return data;
  },
  async update(seasonId: string, data: Partial<CampaignArchetypeStats>): Promise<CampaignArchetypeStats | null> {
    const current = await this.getBySeasonId(seasonId);
    if (!current) return null;
    const updated: CampaignArchetypeStats = { ...current, ...data, seasonId };
    await setItem(`${KEY_PREFIX}archetypeStats:${seasonId}`, updated);
    return updated;
  },
  async delete(seasonId: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}archetypeStats:${seasonId}`);
    return true;
  }
};
