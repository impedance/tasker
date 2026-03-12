/**
 * Season repository implementation
 * Provides CRUD operations for Season entities
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from '../storage';
import type { Season } from '../../entities/types';

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
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}season:${id}`);
    return true;
  }
};
