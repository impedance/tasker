import { describe, it, expect } from 'vitest';
import { isFog, getMissingClarityFields } from './fog';

const FULL = {
    desiredOutcome: 'Published API docs',
    firstStep: 'Open the repo',
    estimatedEntryMinutes: 10,
};

describe('isFog', () => {
    it('returns false when all clarity fields are present', () => {
        expect(isFog(FULL)).toBe(false);
    });

    it('returns true when desiredOutcome is missing', () => {
        expect(isFog({ ...FULL, desiredOutcome: undefined })).toBe(true);
    });

    it('returns true when desiredOutcome is empty string', () => {
        expect(isFog({ ...FULL, desiredOutcome: '   ' })).toBe(true);
    });

    it('returns true when firstStep is missing', () => {
        expect(isFog({ ...FULL, firstStep: undefined })).toBe(true);
    });

    it('returns true when firstStep is empty string', () => {
        expect(isFog({ ...FULL, firstStep: '' })).toBe(true);
    });

    it('returns true when estimatedEntryMinutes is missing', () => {
        expect(isFog({ ...FULL, estimatedEntryMinutes: undefined })).toBe(true);
    });

    it('returns true when estimatedEntryMinutes is 0', () => {
        expect(isFog({ ...FULL, estimatedEntryMinutes: 0 })).toBe(true);
    });

    it('returns true when all fields are missing', () => {
        expect(isFog({ desiredOutcome: undefined, firstStep: undefined, estimatedEntryMinutes: undefined })).toBe(true);
    });
});

describe('getMissingClarityFields', () => {
    it('returns empty array when all fields are present', () => {
        expect(getMissingClarityFields(FULL)).toEqual([]);
    });

    it('returns all three field names when all are missing', () => {
        const missing = getMissingClarityFields({
            desiredOutcome: undefined,
            firstStep: undefined,
            estimatedEntryMinutes: undefined,
        });
        expect(missing).toContain('desiredOutcome');
        expect(missing).toContain('firstStep');
        expect(missing).toContain('estimatedEntryMinutes');
        expect(missing).toHaveLength(3);
    });

    it('returns only estimatedEntryMinutes when other fields are filled', () => {
        const missing = getMissingClarityFields({ ...FULL, estimatedEntryMinutes: undefined });
        expect(missing).toEqual(['estimatedEntryMinutes']);
    });
});
