/**
 * CapitalState repository implementation
 * Provides CRUD operations for CapitalState entities
 */

import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from '../storage';
import type { CapitalState } from '../../entities/types';

export const capitalStateRepository = {
  async getByCampaignId(campaignId: string): Promise<CapitalState | null> {
    return getItem<CapitalState>(`${KEY_PREFIX}capitalState:${campaignId}`);
  },
  async list(): Promise<CapitalState[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}capitalState:`);
    const items = await Promise.all(keys.map(k => getItem<CapitalState>(k)));
    return items.filter((i): i is CapitalState => i !== null);
  },
  async create(data: CapitalState): Promise<CapitalState> {
    await setItem(`${KEY_PREFIX}capitalState:${data.campaignId}`, data);
    return data;
  },
  async update(campaignId: string, data: Partial<CapitalState>): Promise<CapitalState | null> {
    const current = await this.getByCampaignId(campaignId);
    if (!current) return null;
    const updated: CapitalState = { ...current, ...data, campaignId };
    await setItem(`${KEY_PREFIX}capitalState:${campaignId}`, updated);
    return updated;
  },
  async delete(campaignId: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}capitalState:${campaignId}`);
    return true;
  }
};
