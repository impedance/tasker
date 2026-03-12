/**
 * ChronicleEntry repository implementation
 * Provides CRUD operations for ChronicleEntry entities
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from '../storage';
import type { ChronicleEntry } from '../../entities/types';

export const chronicleEntryRepository = {
  async getById(id: string): Promise<ChronicleEntry | null> {
    return getItem<ChronicleEntry>(`${KEY_PREFIX}chronicleEntry:${id}`);
  },
  async list(): Promise<ChronicleEntry[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}chronicleEntry:`);
    const items = await Promise.all(keys.map(k => getItem<ChronicleEntry>(k)));
    return items.filter((i): i is ChronicleEntry => i !== null);
  },
  async create(data: Omit<ChronicleEntry, 'id' | 'createdAt'>): Promise<ChronicleEntry> {
    const item: ChronicleEntry = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}chronicleEntry:${item.id}`, item);
    return item;
  },
  async update(id: string, data: Partial<ChronicleEntry>): Promise<ChronicleEntry | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const updated: ChronicleEntry = { ...current, ...data, id };
    await setItem(`${KEY_PREFIX}chronicleEntry:${id}`, updated);
    return updated;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}chronicleEntry:${id}`);
    return true;
  }
};
