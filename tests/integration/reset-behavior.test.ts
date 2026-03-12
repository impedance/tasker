/**
 * Reset behavior tests - T3 acceptance criteria
 * Verifies that reset behavior is explicit and consistent
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { resetAppState, resetAppStateIncludingEvents } from '../../src/storage/import-export';
import { loadAppState, initStorage } from '../../src/storage/storage';
import { clearEvents, track } from '../../src/shared/events/event-logger';
import { createTutorialAppState } from '../../src/storage/tutorial-seed';
import { saveAppState } from '../../src/storage/storage';

describe('Reset Behavior (T3)', () => {
  beforeEach(async () => {
    await initStorage();
    await clearEvents();
  });

  it('resetAppState preserves event history', async () => {
    // Seed tutorial data
    const tutorialState = createTutorialAppState();
    await saveAppState(tutorialState);

    // Log some events
    await track({ name: 'province_captured', payload: { provinceId: 'test-1' } });
    await track({ name: 'meaningful_day', payload: { date: new Date().toISOString().split('T')[0], actionCount: 1 } });

    // Reset app state (should preserve events)
    await resetAppState();

    // Verify app data is cleared
    const state = await loadAppState();
    expect(state).toBeTruthy();
    expect(state!.campaigns).toHaveLength(0);
    expect(state!.provinces).toHaveLength(0);

    // Verify events are preserved
    const { getEvents } = await import('../../src/shared/events/event-logger');
    const events = await getEvents();
    expect(events.length).toBeGreaterThan(0);
  });

  it('resetAppStateIncludingEvents clears everything', async () => {
    // Seed tutorial data
    const tutorialState = createTutorialAppState();
    await saveAppState(tutorialState);

    // Log some events
    await track({ name: 'province_captured', payload: { provinceId: 'test-1' } });
    await track({ name: 'meaningful_day', payload: { date: new Date().toISOString().split('T')[0], actionCount: 1 } });

    // Reset including events
    await resetAppStateIncludingEvents();

    // Verify app data is cleared
    const state = await loadAppState();
    expect(state).toBeTruthy();
    expect(state!.campaigns).toHaveLength(0);
    expect(state!.provinces).toHaveLength(0);

    // Verify events are also cleared
    const { getEvents } = await import('../../src/shared/events/event-logger');
    const events = await getEvents();
    expect(events).toHaveLength(0);
  });

  it('reset creates valid empty state with current schema version', async () => {
    await resetAppState();

    const state = await loadAppState();
    expect(state).toBeTruthy();
    expect(state!.schemaVersion).toBeGreaterThan(0);
    expect(state!.playerProfile).toBeTruthy();
    expect(state!.playerProfile.id).toBe('local');
  });
});
