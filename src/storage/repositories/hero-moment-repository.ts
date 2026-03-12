/**
 * HeroMoment repository implementation
 * Provides CRUD operations for HeroMoment entities
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from '../storage';
import type { HeroMoment } from '../../entities/types';

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
  async update(id: string, data: Partial<HeroMoment>): Promise<HeroMoment | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const updated: HeroMoment = { ...current, ...data, id };
    await setItem(`${KEY_PREFIX}heroMoment:${id}`, updated);
    return updated;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}heroMoment:${id}`);
    return true;
  }
};
