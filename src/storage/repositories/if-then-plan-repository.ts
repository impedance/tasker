/**
 * IfThenPlan repository implementation
 * Provides CRUD operations for IfThenPlan entities
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from '../storage';
import type { IfThenPlan } from '../../entities/types';

export const ifThenPlanRepository = {
  async getById(id: string): Promise<IfThenPlan | null> {
    return getItem<IfThenPlan>(`${KEY_PREFIX}ifThenPlan:${id}`);
  },
  async list(): Promise<IfThenPlan[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}ifThenPlan:`);
    const items = await Promise.all(keys.map(k => getItem<IfThenPlan>(k)));
    return items.filter((i): i is IfThenPlan => i !== null);
  },
  async create(data: Omit<IfThenPlan, 'id' | 'createdAt'>): Promise<IfThenPlan> {
    const item: IfThenPlan = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}ifThenPlan:${item.id}`, item);
    return item;
  },
  async update(id: string, data: Partial<IfThenPlan>): Promise<IfThenPlan | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const updated: IfThenPlan = { ...current, ...data, id };
    await setItem(`${KEY_PREFIX}ifThenPlan:${id}`, updated);
    return updated;
  },
  async delete(id: string): Promise<boolean> {
    await removeItem(`${KEY_PREFIX}ifThenPlan:${id}`);
    return true;
  }
};
