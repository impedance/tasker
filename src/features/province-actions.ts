/**
 * Province actions feature - handles province-level actions
 *
 * Use cases:
 * - Clarify fog province
 * - Start move
 * - Complete province
 * - Apply tactic to siege
 *
 * This feature layer orchestrates:
 * - Loading province data
 * - Applying actions via useApplyAction hook
 * - Persisting results
 *
 * Pages should use these hooks instead of importing repositories directly.
 */

import { useCallback } from 'react';
import React from 'react';
import { provinceRepository, siegeEventRepository } from '../storage/repositories';
import type { Province, SiegeEvent } from '../entities/types';
import { useApplyAction } from '../shared/hooks/useApplyAction';
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
 * Hook for executing province actions
 */
export function useProvinceActions() {
  const { execute } = useApplyAction();

  const executeAction = useCallback(async (
    action: ProvinceAction
  ): Promise<{ ok: true; province: Province } | { ok: false; error: ProvinceActionError }> => {
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

      const result = await execute(province, domainAction);

      if (!result.ok) {
        return {
          ok: false,
          error: {
            type: 'rule_violation',
            message: 'Action not allowed'
          }
        };
      }

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
  }, [execute]);

  return { executeAction };
}

/**
 * Hook for loading and refreshing a province
 */
export function useProvince(provinceId: string | undefined) {
  const [province, setProvince] = React.useState<Province | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      if (!provinceId) {
        setLoading(false);
        return;
      }
      try {
        setError(null);
        const p = await provinceRepository.getById(provinceId);
        if (p) {
          setProvince(p);
        } else {
          setError('Province not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load province');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [provinceId]);

  const refresh = useCallback(async () => {
    if (!provinceId) return;
    try {
      const p = await provinceRepository.getById(provinceId);
      if (p) {
        setProvince(p);
      }
    } catch (err) {
      // Silently fail on refresh
      console.error('Failed to refresh province:', err);
    }
  }, [provinceId]);

  return { province, loading, error, refresh };
}

/**
 * Get siege event for a province
 */
export async function getSiegeForProvince(provinceId: string): Promise<SiegeEvent | null> {
  const sieges = await siegeEventRepository.list();
  return sieges.find(s => s.provinceId === provinceId && !s.resolvedAt) || null;
}
