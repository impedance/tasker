import { describe, it, expect } from 'vitest';
import { advanceProgressStage, stageRank, STAGE_PERCENT } from './progress';

describe('advanceProgressStage', () => {
    it('clarify → at least scouted', () => {
        expect(advanceProgressStage('scouted', 'clarify')).toBe('scouted');
        // if somehow below (e.g. hypothetical), it should raise
        // In practice province starts at scouted after clarify
    });

    it('supply → at least prepared', () => {
        expect(advanceProgressStage('scouted', 'supply')).toBe('prepared');
        expect(advanceProgressStage('prepared', 'supply')).toBe('prepared');
        expect(advanceProgressStage('entered', 'supply')).toBe('entered'); // already higher
    });

    it('decompose → at least prepared', () => {
        expect(advanceProgressStage('scouted', 'decompose')).toBe('prepared');
        expect(advanceProgressStage('held', 'decompose')).toBe('held'); // already higher
    });

    it('start_move → at least entered', () => {
        expect(advanceProgressStage('scouted', 'start_move')).toBe('entered');
        expect(advanceProgressStage('prepared', 'start_move')).toBe('entered');
        expect(advanceProgressStage('held', 'start_move')).toBe('held'); // already higher
    });

    it('log_move when entered → held', () => {
        expect(advanceProgressStage('entered', 'log_move')).toBe('held');
    });

    it('log_move when already held → held (no double bump)', () => {
        expect(advanceProgressStage('held', 'log_move')).toBe('held');
    });

    it('log_move when prepared → prepared (no skip)', () => {
        expect(advanceProgressStage('prepared', 'log_move')).toBe('prepared');
    });

    it('apply_tactic:raid → at least entered', () => {
        expect(advanceProgressStage('scouted', 'apply_tactic', 'raid')).toBe('entered');
        expect(advanceProgressStage('held', 'apply_tactic', 'raid')).toBe('held');
    });

    it('apply_tactic:supply → at least prepared', () => {
        expect(advanceProgressStage('scouted', 'apply_tactic', 'supply')).toBe('prepared');
    });

    it('apply_tactic:scout → at least scouted', () => {
        expect(advanceProgressStage('scouted', 'apply_tactic', 'scout')).toBe('scouted');
    });

    it('complete → captured regardless of current', () => {
        expect(advanceProgressStage('scouted', 'complete')).toBe('captured');
        expect(advanceProgressStage('held', 'complete')).toBe('captured');
    });

    it('retreat/reschedule/edit_fields → no change', () => {
        expect(advanceProgressStage('entered', 'retreat')).toBe('entered');
        expect(advanceProgressStage('prepared', 'reschedule')).toBe('prepared');
        expect(advanceProgressStage('held', 'edit_fields')).toBe('held');
    });

    it('stage never decrements', () => {
        // supply on a held province should not drop it to prepared
        expect(advanceProgressStage('held', 'supply')).toBe('held');
        expect(advanceProgressStage('captured', 'clarify')).toBe('captured');
    });
});

describe('stageRank', () => {
    it('returns correct ordering', () => {
        expect(stageRank('scouted')).toBeLessThan(stageRank('prepared'));
        expect(stageRank('prepared')).toBeLessThan(stageRank('entered'));
        expect(stageRank('entered')).toBeLessThan(stageRank('held'));
        expect(stageRank('held')).toBeLessThan(stageRank('captured'));
    });
});

describe('STAGE_PERCENT', () => {
    it('maps all stages to expected percentages', () => {
        expect(STAGE_PERCENT.scouted).toBe(15);
        expect(STAGE_PERCENT.prepared).toBe(30);
        expect(STAGE_PERCENT.entered).toBe(55);
        expect(STAGE_PERCENT.held).toBe(80);
        expect(STAGE_PERCENT.captured).toBe(100);
    });
});
