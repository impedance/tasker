/**
 * Siege resolution feature - handles siege lifecycle
 * 
 * Use cases:
 * - Check and create sieges for stalled provinces
 * - Resolve siege with tactic
 * - Get siege status
 */

import { provinceRepository, siegeEventRepository } from '../storage/repositories';
import type { Province, SiegeEvent } from '../entities/types';
import { shouldEnterSiege } from '../game/rules/transitions';
import { executeProvinceAction } from './province-actions';

export interface SiegeStatus {
  isInSiege: boolean;
  siegeEvent?: SiegeEvent;
  daysInSiege?: number;
}

/**
 * Check all provinces and create siege events where needed
 * Returns count of new sieges created
 */
export async function checkAndCreateSieges(referenceDate: Date = new Date()): Promise<number> {
  const provinces = await provinceRepository.list();
  let siegeCount = 0;
  
  for (const province of provinces) {
    if (province.state === 'fog' || province.state === 'captured') {
      continue;
    }
    
    const entersSiege = shouldEnterSiege(province, referenceDate);
    
    if (entersSiege) {
      // Check if siege already exists
      const existingSieges = await siegeEventRepository.list();
      const hasActiveSiege = existingSieges.some(
        s => s.provinceId === province.id && !s.resolvedAt
      );
      
      if (!hasActiveSiege) {
        await siegeEventRepository.create({
          provinceId: province.id,
          reasonType: 'no_meaningful_action_3_days',
        });
        siegeCount++;
      }
    }
  }
  
  return siegeCount;
}

/**
 * Get siege status for a province
 */
export async function getSiegeStatus(provinceId: string): Promise<SiegeStatus> {
  const sieges = await siegeEventRepository.list();
  const siege = sieges.find(s => s.provinceId === provinceId && !s.resolvedAt);
  
  if (!siege) {
    return { isInSiege: false };
  }
  
  const triggeredAt = new Date(siege.triggeredAt).getTime();
  const now = new Date().getTime();
  const daysInSiege = Math.floor((now - triggeredAt) / (1000 * 60 * 60 * 24));
  
  return {
    isInSiege: true,
    siegeEvent: siege,
    daysInSiege
  };
}

/**
 * Resolve a siege by applying a tactic
 */
export async function resolveSiege(
  provinceId: string,
  tacticType: string
): Promise<{ ok: true; province: Province } | { ok: false; error: string }> {
  const result = await executeProvinceAction({
    type: 'apply_tactic',
    provinceId,
    payload: { tacticType }
  });
  
  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }
  
  return { ok: true, province: result.province };
}

/**
 * Get all active sieges
 */
export async function getActiveSieges(): Promise<SiegeEvent[]> {
  const sieges = await siegeEventRepository.list();
  return sieges.filter(s => !s.resolvedAt);
}
