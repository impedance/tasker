/**
 * SiegeEvent repository implementation
 * Provides CRUD operations for SiegeEvent entities
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from '../storage';
import type { SiegeEvent } from '../../entities/types';

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
  async update(id: string, data: Partial<SiegeEvent>): Promise<SiegeEvent | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const updated: SiegeEvent = { ...current, ...data, id };
    await setItem(`${KEY_PREFIX}siegeEvent:${id}`, updated);
    return updated;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}siegeEvent:${id}`);
    return true;
  }
};
