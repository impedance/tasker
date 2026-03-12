/**
 * SeasonReview repository implementation
 * Provides CRUD operations for SeasonReview entities
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from '../storage';
import type { SeasonReview } from '../../entities/types';

export const seasonReviewRepository = {
  async getById(id: string): Promise<SeasonReview | null> {
    return getItem<SeasonReview>(`${KEY_PREFIX}seasonReview:${id}`);
  },
  async list(): Promise<SeasonReview[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}seasonReview:`);
    const items = await Promise.all(keys.map(k => getItem<SeasonReview>(k)));
    return items.filter((i): i is SeasonReview => i !== null);
  },
  async create(data: Omit<SeasonReview, 'id' | 'createdAt'>): Promise<SeasonReview> {
    const item: SeasonReview = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}seasonReview:${item.id}`, item);
    return item;
  },
  async update(id: string, data: Partial<SeasonReview>): Promise<SeasonReview | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const updated: SeasonReview = { ...current, ...data, id };
    await setItem(`${KEY_PREFIX}seasonReview:${id}`, updated);
    return updated;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}seasonReview:${id}`);
    return true;
  }
};
