/**
 * Fog rule — T2
 * Pure functions for computing and enforcing fog-of-war state.
 * Province is "in fog" when any required clarity field is missing.
 */

import type { Province } from '../../entities/types';

/**
 * Returns true if the province is missing one or more required clarity fields.
 * Required clarity fields (EPIC-01 Appendix Z3):
 *   desiredOutcome, firstStep, estimatedEntryMinutes
 */
export function isFog(province: Pick<Province, 'desiredOutcome' | 'firstStep' | 'estimatedEntryMinutes'>): boolean {
    return (
        !province.desiredOutcome ||
        province.desiredOutcome.trim() === '' ||
        !province.firstStep ||
        province.firstStep.trim() === '' ||
        province.estimatedEntryMinutes === undefined ||
        province.estimatedEntryMinutes === null ||
        province.estimatedEntryMinutes < 1
    );
}

/**
 * Returns a list of missing clarity field names (for user-friendly error messages).
 */
export function getMissingClarityFields(
    province: Pick<Province, 'desiredOutcome' | 'firstStep' | 'estimatedEntryMinutes'>
): Array<'desiredOutcome' | 'firstStep' | 'estimatedEntryMinutes'> {
    const missing: Array<'desiredOutcome' | 'firstStep' | 'estimatedEntryMinutes'> = [];

    if (!province.desiredOutcome || province.desiredOutcome.trim() === '') {
        missing.push('desiredOutcome');
    }
    if (!province.firstStep || province.firstStep.trim() === '') {
        missing.push('firstStep');
    }
    if (
        province.estimatedEntryMinutes === undefined ||
        province.estimatedEntryMinutes === null ||
        province.estimatedEntryMinutes < 1
    ) {
        missing.push('estimatedEntryMinutes');
    }

    return missing;
}
