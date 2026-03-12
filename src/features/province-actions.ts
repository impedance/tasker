/**
 * Province actions feature - handles province-level actions
 * 
 * Use cases:
 * - Clarify fog province
 * - Start move
 * - Complete province
 * - Apply tactic to siege
 */

import { provinceRepository, siegeEventRepository } from '../storage/repositories';
import type { Province, SiegeEvent } from '../entities/types';
import { domainService } from '../shared/services/domainService';
import { applyAction } from '../game/rules/apply-action';
import type { DomainAction } from '../game/rules/actions';

export interface ProvinceAction {
  type: 'clarify' | 'start_move' | 'complete' | 'apply_tactic';
  provinceId: string;
  payload?: {
    moveType?: string;
    durationMinutes?: number;
    tacticType?: string;
  };
}

export interface ProvinceActionError {
  type: 'not_found' | 'invalid_state' | 'rule_violation' | 'unknown';
  message: string;
}

/**
 * Execute a province action
 */
export async function executeProvinceAction(
  action: ProvinceAction
): Promise<{ ok: true; province: Province } | { ok: false; error: ProvinceActionError }> {
  try {
    const province = await provinceRepository.getById(action.provinceId);
    
    if (!province) {
      return {
        ok: false,
        error: {
          type: 'not_found',
          message: 'Province not found'
        }
      };
    }
    
    let domainAction: DomainAction;
    
    if (action.type === 'clarify') {
      domainAction = { type: 'clarify', payload: { desiredOutcome: '', firstStep: '', estimatedEntryMinutes: 5 } };
    } else if (action.type === 'complete') {
      domainAction = { type: 'complete', payload: {} };
    } else if (action.type === 'apply_tactic') {
      domainAction = { 
        type: 'apply_tactic',
        payload: { 
          tacticType: (action.payload?.tacticType || 'scout') as 'scout' | 'supply' | 'raid' | 'engineer' | 'retreat',
          siegeEventId: 'unknown'
        }
      };
    } else {
      domainAction = {
        type: action.type,
        payload: {
          durationMinutes: action.payload?.durationMinutes || 5,
          moveType: (action.payload?.moveType || 'assault') as 'assault' | 'scout' | 'supply' | 'raid' | 'engineer' | 'retreat'
        }
      };
    }
    
    const result = applyAction(province, domainAction);
    
    if (!result.ok) {
      return {
        ok: false,
        error: {
          type: 'rule_violation',
          message: 'Action not allowed'
        }
      };
    }
    
    await domainService.persistResult(domainAction, result);
    
    return {
      ok: true,
      province: result.province
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        type: 'unknown',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    };
  }
}

/**
 * Clarify a fog province
 */
export async function clarifyProvince(provinceId: string): Promise<{ ok: true; province: Province } | { ok: false; error: ProvinceActionError }> {
  return executeProvinceAction({
    type: 'clarify',
    provinceId
  });
}

/**
 * Start a move on a province
 */
export async function startMove(
  provinceId: string,
  moveType: string,
  durationMinutes: number = 5
): Promise<{ ok: true; province: Province } | { ok: false; error: ProvinceActionError }> {
  return executeProvinceAction({
    type: 'start_move',
    provinceId,
    payload: { moveType, durationMinutes }
  });
}

/**
 * Complete a province
 */
export async function completeProvince(provinceId: string): Promise<{ ok: true; province: Province } | { ok: false; error: ProvinceActionError }> {
  return executeProvinceAction({
    type: 'complete',
    provinceId
  });
}

/**
 * Apply a tactic to resolve a siege
 */
export async function applyTactic(
  provinceId: string,
  tacticType: string
): Promise<{ ok: true; province: Province } | { ok: false; error: ProvinceActionError }> {
  return executeProvinceAction({
    type: 'apply_tactic',
    provinceId,
    payload: { tacticType }
  });
}

/**
 * Get siege event for a province
 */
export async function getSiegeForProvince(provinceId: string): Promise<SiegeEvent | null> {
  const sieges = await siegeEventRepository.list();
  return sieges.find(s => s.provinceId === provinceId && !s.resolvedAt) || null;
}
