/**
 * PlayerCheckIn repository implementation
 * Provides CRUD operations for PlayerCheckIn entities
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from '../storage';
import type { PlayerCheckIn } from '../../entities/types';

export const playerCheckInRepository = {
  async getById(id: string): Promise<PlayerCheckIn | null> {
    return getItem<PlayerCheckIn>(`${KEY_PREFIX}checkIn:${id}`);
  },
  async list(): Promise<PlayerCheckIn[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}checkIn:`);
    const items = await Promise.all(keys.map(k => getItem<PlayerCheckIn>(k)));
    return items.filter((i): i is PlayerCheckIn => i !== null);
  },
  async listByDate(date: string): Promise<PlayerCheckIn[]> {
    const items = await this.list();
    return items.filter(i => i.date === date);
  },
  async create(data: Omit<PlayerCheckIn, 'id' | 'createdAt'>): Promise<PlayerCheckIn> {
    const item: PlayerCheckIn = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
    await setItem(`${KEY_PREFIX}checkIn:${item.id}`, item);
    return item;
  },
  async update(id: string, data: Partial<PlayerCheckIn>): Promise<PlayerCheckIn | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const updated: PlayerCheckIn = { ...current, ...data, id };
    await setItem(`${KEY_PREFIX}checkIn:${id}`, updated);
    return updated;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}checkIn:${id}`);
    return true;
  }
};
