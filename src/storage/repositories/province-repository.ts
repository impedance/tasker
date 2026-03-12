/**
 * Province repository implementation
 * Provides CRUD operations and relationship queries for Province entities
 */

import { v4 as uuidv4 } from 'uuid';
import { KEY_PREFIX, getItem, setItem, removeItem, getKeysByPrefix } from '../storage';
import type { Province } from '../../entities/types';
import { regionRepository } from './region-repository';

export const provinceRepository = {
  /**
   * Get province by ID
   */
  async getById(id: string): Promise<Province | null> {
    return getItem<Province>(`${KEY_PREFIX}province:${id}`);
  },

  /**
   * List all provinces
   */
  async list(): Promise<Province[]> {
    const keys = await getKeysByPrefix(`${KEY_PREFIX}province:`);
    const items = await Promise.all(keys.map(k => getItem<Province>(k)));
    return items.filter((p): p is Province => p !== null);
  },

  /**
   * List provinces by region ID
   */
  async listByRegion(regionId: string): Promise<Province[]> {
    const provinces = await this.list();
    return provinces.filter(p => p.regionId === regionId);
  },

  /**
   * List provinces by campaign ID (through region)
   */
  async listByCampaign(campaignId: string): Promise<Province[]> {
    const regions = await regionRepository.listByCampaign(campaignId);
    const regionIds = regions.map(r => r.id);
    const provinces = await this.list();
    return provinces.filter(p => regionIds.includes(p.regionId));
  },

  /**
   * Find first free map slot ID in a region
   */
  async findFirstFreeMapSlotId(regionId: string): Promise<string | undefined> {
    const provinces = await this.listByRegion(regionId);
    const occupiedSlots = new Set(provinces.map(p => p.mapSlotId).filter(Boolean));

    // Map template uses p01-p16
    for (let i = 1; i <= 16; i++) {
      const slotId = `p${i.toString().padStart(2, '0')}`;
      if (!occupiedSlots.has(slotId)) {
        return slotId;
      }
    }
    // Return undefined if all 16 slots are taken
    return undefined;
  },

  /**
   * Validate adjacency lists
   */
  async validateAdjacencies(adjacentProvinceIds: string[] | undefined): Promise<void> {
    if (!adjacentProvinceIds || adjacentProvinceIds.length === 0) return;
    for (const adjId of adjacentProvinceIds) {
      const exists = await this.getById(adjId);
      if (!exists) {
        throw new Error(`Validation Error: Adjacent province ${adjId} does not exist`);
      }
    }
  },

  /**
   * Create a new province
   */
  async create(data: Omit<Province, 'id' | 'createdAt' | 'updatedAt'>): Promise<Province> {
    await this.validateAdjacencies(data.adjacentProvinceIds);

    const province: Province = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}province:${province.id}`, province);

    // Add province to region
    await regionRepository.addProvinceId(data.regionId, province.id);

    return province;
  },

  /**
   * Update an existing province
   */
  async update(id: string, data: Partial<Province>): Promise<Province | null> {
    if (data.adjacentProvinceIds) {
      await this.validateAdjacencies(data.adjacentProvinceIds);
    }

    const province = await this.getById(id);
    if (!province) {
      return null;
    }
    const updated: Province = {
      ...province,
      ...data,
      updatedAt: new Date().toISOString()
    };
    await setItem(`${KEY_PREFIX}province:${id}`, updated);
    return updated;
  },

  /**
   * Delete a province
   */
  async delete(id: string, updateRegion: boolean = true): Promise<boolean> {
    const province = await this.getById(id);
    if (!province) {
      return false;
    }

    if (updateRegion) {
      // Remove from region's provinceIds
      await regionRepository.removeProvinceId(province.regionId, id);
    }

    await removeItem(`${KEY_PREFIX}province:${id}`);
    return true;
  },

  /**
   * Get province by mapSlotId
   */
  async getByMapSlot(regionId: string, mapSlotId: string): Promise<Province | null> {
    const provinces = await this.listByRegion(regionId);
    return provinces.find(p => p.mapSlotId === mapSlotId) || null;
  },

  /**
   * List provinces with mapSlotId in a region
   */
  async listWithMapSlots(regionId: string): Promise<Province[]> {
    const provinces = await this.listByRegion(regionId);
    return provinces.filter(p => p.mapSlotId !== undefined);
  },

  /**
   * Update province map slot binding
   */
  async setMapSlot(provinceId: string, mapSlotId: string | null): Promise<Province | null> {
    const province = await this.getById(provinceId);
    if (!province) {
      return null;
    }
    if (mapSlotId === null) {
      delete province.mapSlotId;
    } else {
      province.mapSlotId = mapSlotId;
    }
    province.updatedAt = new Date().toISOString();
    await setItem(`${KEY_PREFIX}province:${provinceId}`, province);
    return province;
  }
};
