/**
 * PlayerProfile repository implementation
 * Provides CRUD operations for PlayerProfile entities
 */

import { KEY_PREFIX, getItem, setItem } from '../storage';
import type { PlayerProfile } from '../../entities/types';

export const playerProfileRepository = {
  async get(): Promise<PlayerProfile | null> {
    return getItem<PlayerProfile>(`${KEY_PREFIX}playerProfile`);
  },
  async update(data: Partial<PlayerProfile>): Promise<PlayerProfile> {
    const current = await this.get();
    const updated: PlayerProfile = {
      ...(current || {
        id: 'local',
        totalCaptured: 0,
        totalClarified: 0,
        totalStarted: 0,
        totalCompleted: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      ...data,
      id: 'local',
      updatedAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}playerProfile`, updated);
    return updated;
  }
};
