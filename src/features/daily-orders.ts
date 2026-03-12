/**
 * Daily Orders feature - handles commander check-in and daily orders flow
 * 
 * Use cases:
 * - Load daily orders state
 * - Submit check-in
 * - Execute orders
 */

import { dailyMoveRepository, provinceRepository } from '../storage/repositories';
import type { DailyMove, Province } from '../entities/types';
import { domainService } from '../shared/services/domainService';
import { applyAction } from '../game/rules/apply-action';
import type { DomainAction } from '../game/rules/actions';

export interface DailyOrdersState {
  today: string;
  checkInComplete: boolean;
  orders: DailyMove[];
  availableProvinces: Province[];
}

/**
 * Load daily orders state for today
 */
export async function loadDailyOrders(): Promise<DailyOrdersState> {
  const today = new Date().toISOString().split('T')[0];

  const [moves] = await Promise.all([
    dailyMoveRepository.list()
  ]);

  const todaysMoves = moves.filter(m => m.date === today);
  const checkInComplete = todaysMoves.length > 0;

  // Get available provinces (not fog, not captured)
  const allProvinces = await provinceRepository.list();
  const availableProvinces = allProvinces.filter(p =>
    p.state === 'ready' || p.state === 'siege' || p.state === 'fortified'
  );

  return {
    today,
    checkInComplete,
    orders: todaysMoves,
    availableProvinces
  };
}

/**
 * Submit commander check-in (first daily move)
 */
export async function submitCheckIn(provinceId: string, moveType: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const province = await provinceRepository.getById(provinceId);
    if (!province) {
      return { ok: false, error: 'Province not found' };
    }

    const action: DomainAction = {
      type: 'start_move',
      payload: {
        moveType: moveType as 'assault' | 'scout' | 'supply' | 'raid' | 'engineer' | 'retreat',
        durationMinutes: 5 // Default for check-in
      }
    };
    
    const result = applyAction(province, action);

    if (!result.ok) {
      return { ok: false, error: 'Action not allowed' };
    }

    await domainService.persistResult(action, result);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to submit check-in'
    };
  }
}

/**
 * Execute a daily order (log a move)
 */
export async function executeOrder(provinceId: string, moveType: string, durationMinutes: number): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const province = await provinceRepository.getById(provinceId);
    if (!province) {
      return { ok: false, error: 'Province not found' };
    }

    const action: DomainAction = {
      type: 'log_move',
      payload: {
        moveType: moveType as 'assault' | 'scout' | 'supply' | 'raid' | 'engineer' | 'retreat',
        durationMinutes
      }
    };

    const result = applyAction(province, action);

    if (!result.ok) {
      return { ok: false, error: 'Action not allowed' };
    }
    
    await domainService.persistResult(action, result);
    
    return { ok: true };
  } catch (error) {
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Failed to execute order' 
    };
  }
}
