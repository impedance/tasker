/**
 * Province roles — T5
 * Lightweight rule hooks for province roles.
 * Roles NEVER create new mechanics; they only influence recommendations/copy/icons.
 * Roles are optional and safe to ignore without breaking flows.
 */

import type { Province, ProvinceRole } from '../../entities/types';
import type { ActionType } from './actions';

export interface RoleHint {
    /** Human-readable suggestion (fantasy-layer terms for map; plain on action screen) */
    suggestion: string;
    /** Preferred action types for this role */
    preferredActions: ActionType[];
}

/**
 * Returns lightweight hints for a province based on its role.
 * Returns empty array for 'standard' or unset roles.
 */
export function getRoleHints(province: Pick<Province, 'provinceRole' | 'state'>): RoleHint[] {
    const role: ProvinceRole = province.provinceRole ?? 'standard';

    switch (role) {
        case 'fortress':
            // Prefer engineer/supply before assault
            return [
                {
                    suggestion: 'Strengthen your position before assault — consider engineering or supply actions first.',
                    preferredActions: ['decompose', 'supply'],
                },
            ];

        case 'watchtower':
            // Prefer scout/fog clearing actions
            return [
                {
                    suggestion: 'Watchtowers reward thorough scouting — clarify your target deeply before striking.',
                    preferredActions: ['clarify'],
                },
            ];

        case 'depot':
        case 'archive':
            // Prefer supply/clarify actions
            return [
                {
                    suggestion: 'Depots and archives thrive on careful preparation — supply and clarify before committing.',
                    preferredActions: ['supply', 'clarify'],
                },
            ];

        case 'standard':
        default:
            return [];
    }
}

/**
 * Returns the preferred action types for a province role.
 * Shorthand used by recommendation engine.
 */
export function getPreferredActionsForRole(role: ProvinceRole | undefined): ActionType[] {
    const hints = getRoleHints({ provinceRole: role, state: 'ready' });
    return hints.flatMap((h) => h.preferredActions);
}
