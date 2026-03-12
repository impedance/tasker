/**
 * Siege resolution feature - handles siege lifecycle
 *
 * Use cases:
 * - Check and create sieges for stalled provinces
 * - Resolve siege with tactic
 * - Get siege status
 */

import { siegeEventRepository } from '../storage/repositories';
import type { SiegeEvent } from '../entities/types';
import { checkAndCreateSieges as serviceCheckAndCreateSieges } from '../game/services/siege-service';
import type { Clock } from '../shared/services/clock';

export interface SiegeStatus {
  isInSiege: boolean;
  siegeEvent?: SiegeEvent;
  daysInSiege?: number;
}

/**
 * Check all provinces and create siege events where needed
 * Returns count of new sieges created
 */
export async function checkAndCreateSieges(referenceDate: Date = new Date(), clock: Clock = { now: () => referenceDate }): Promise<number> {
  // Delegate to service layer which uses Clock boundary
  return serviceCheckAndCreateSieges(referenceDate, clock);
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
 * Get all active sieges
 */
export async function getActiveSieges(): Promise<SiegeEvent[]> {
  const sieges = await siegeEventRepository.list();
  return sieges.filter(s => !s.resolvedAt);
}
