/**
 * ShareCard repository implementation
 * Provides CRUD operations for ShareCard entities
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from '../storage';
import type { ShareCard } from '../../entities/types';

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
  async update(id: string, data: Partial<ShareCard>): Promise<ShareCard | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const updated: ShareCard = { ...current, ...data, id };
    await setItem(`${KEY_PREFIX}shareCard:${id}`, updated);
    return updated;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}shareCard:${id}`);
    return true;
  }
};
