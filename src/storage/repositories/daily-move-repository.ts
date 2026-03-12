/**
 * DailyMove repository implementation
 * Provides CRUD operations for DailyMove entities
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from '../storage';
import type { DailyMove } from '../../entities/types';

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
  async update(id: string, data: Partial<DailyMove>): Promise<DailyMove | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const updated: DailyMove = { ...current, ...data, id };
    await setItem(`${KEY_PREFIX}dailyMove:${id}`, updated);
    return updated;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}dailyMove:${id}`);
    return true;
  }
};
