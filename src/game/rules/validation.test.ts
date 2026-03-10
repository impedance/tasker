import { describe, it, expect } from 'vitest';
import { validateActionPayload, validateProvinceFields, validateRequiredIds, mergeValidation } from './validation';
import type { DomainAction } from './actions';

describe('validateActionPayload', () => {
    it('validates a valid clarify action', () => {
        const action: DomainAction = {
            type: 'clarify',
            payload: { desiredOutcome: 'Publish API docs', firstStep: 'Open repo', estimatedEntryMinutes: 10 },
        };
        expect(validateActionPayload(action).valid).toBe(true);
    });

    it('rejects clarify with missing desiredOutcome', () => {
        const action = { type: 'clarify', payload: { firstStep: 'Open repo', estimatedEntryMinutes: 10 } } as unknown as DomainAction;
        const result = validateActionPayload(action);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    it('validates a valid log_move action', () => {
        const action: DomainAction = { type: 'log_move', payload: { durationMinutes: 25 } };
        expect(validateActionPayload(action).valid).toBe(true);
    });

    it('rejects log_move with durationMinutes = 0', () => {
        const action: DomainAction = { type: 'log_move', payload: { durationMinutes: 0 } };
        expect(validateActionPayload(action).valid).toBe(false);
    });

    it('validates a valid edit_fields action', () => {
        const action: DomainAction = { type: 'edit_fields', payload: { effortLevel: 3 } };
        expect(validateActionPayload(action).valid).toBe(true);
    });

    it('rejects apply_tactic with invalid tacticType', () => {
        const action = {
            type: 'apply_tactic',
            payload: { tacticType: 'nuke', siegeEventId: 'se-1' },
        } as unknown as DomainAction;
        expect(validateActionPayload(action).valid).toBe(false);
    });

    it('validates a valid apply_tactic:scout', () => {
        const action: DomainAction = {
            type: 'apply_tactic',
            payload: {
                tacticType: 'scout',
                siegeEventId: 'se-1',
                data: { tacticType: 'scout', desiredOutcome: 'New outcome', firstStep: 'Step 1', estimatedEntryMinutes: 5 },
            },
        };
        expect(validateActionPayload(action).valid).toBe(true);
    });
});

describe('validateProvinceFields', () => {
    it('passes valid effortLevel and clarityLevel', () => {
        expect(validateProvinceFields({ effortLevel: 3, clarityLevel: 5 }).valid).toBe(true);
    });

    it('rejects effortLevel = 0', () => {
        expect(validateProvinceFields({ effortLevel: 0 }).valid).toBe(false);
    });

    it('rejects effortLevel = 6', () => {
        expect(validateProvinceFields({ effortLevel: 6 }).valid).toBe(false);
    });

    it('rejects clarityLevel = 0', () => {
        expect(validateProvinceFields({ clarityLevel: 0 }).valid).toBe(false);
    });

    it('passes when fields are undefined (not validated)', () => {
        expect(validateProvinceFields({}).valid).toBe(true);
    });
});

describe('validateRequiredIds', () => {
    it('passes non-empty string IDs', () => {
        expect(validateRequiredIds({ provinceId: 'p-1', regionId: 'r-1' }).valid).toBe(true);
    });

    it('rejects empty string ID', () => {
        expect(validateRequiredIds({ provinceId: '' }).valid).toBe(false);
    });

    it('rejects null ID', () => {
        expect(validateRequiredIds({ provinceId: null }).valid).toBe(false);
    });
});

describe('mergeValidation', () => {
    it('is valid when all results are valid', () => {
        expect(mergeValidation({ valid: true, errors: [] }, { valid: true, errors: [] }).valid).toBe(true);
    });

    it('merges errors from multiple results', () => {
        const r = mergeValidation(
            { valid: false, errors: ['field1: bad'] },
            { valid: false, errors: ['field2: bad'] }
        );
        expect(r.valid).toBe(false);
        expect(r.errors).toHaveLength(2);
    });
});
