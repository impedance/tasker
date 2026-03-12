/**
 * Deterministic test helpers for storage, time, and bootstrap state
 * Supports both Vitest (integration) and Playwright (E2E) tests
 */

import type { AppState, Campaign, Province, Season } from '../entities/types';
import { createTutorialAppState, TUTORIAL_CAMPAIGN_ID } from '../storage/tutorial-seed';
import { saveAppState, loadAppState, clearAll, initStorage } from '../storage/storage';

// ============================================================================
// Storage Helpers
// ============================================================================

/**
 * Clear all application state (for test cleanup)
 */
export async function clearAppState(): Promise<void> {
  await initStorage();
  await clearAll();
}

/**
 * Load tutorial seed data
 * Returns true if tutorial was loaded, false if already exists
 */
export async function loadTutorialSeed(): Promise<boolean> {
  const existingState = await loadAppState();
  
  // Check if tutorial already exists
  if (existingState) {
    const hasTutorial = existingState.campaigns.some(c => c.id === TUTORIAL_CAMPAIGN_ID);
    if (hasTutorial) {
      return false;
    }
  }
  
  const tutorialState = createTutorialAppState();
  await saveAppState(tutorialState);
  return true;
}

/**
 * Create a minimal clean state (no tutorial)
 */
export function createCleanAppState(): AppState {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    campaigns: [],
    regions: [],
    provinces: [],
    dailyMoves: [],
    checkIns: [],
    siegeEvents: [],
    seasons: [],
    seasonReviews: [],
    heroMoments: [],
    chronicleEntries: [],
    ifThenPlans: [],
    shareCards: [],
    playerProfile: {
      id: 'local',
      totalCaptured: 0,
      totalClarified: 0,
      totalStarted: 0,
      totalCompleted: 0,
      createdAt: now,
      updatedAt: now
    },
    capitalStates: [],
    archetypeStats: []
  };
}

/**
 * Reset to completely clean state (no tutorial, no data)
 */
export async function resetToCleanState(): Promise<void> {
  await clearAppState();
  const cleanState = createCleanAppState();
  await saveAppState(cleanState);
}

/**
 * Seed a specific campaign/region/province setup for testing
 */
export async function seedTestState(options: {
  campaign?: Partial<Campaign>;
  provinces?: Partial<Province>[];
  season?: Partial<Season>;
}): Promise<{ campaign: Campaign; provinces: Province[]; season: Season }> {
  const now = new Date().toISOString();

  const campaign: Campaign = {
    id: 'campaign-test',
    title: options.campaign?.title || 'Test Campaign',
    description: 'Test campaign for E2E',
    colorTheme: 'blue',
    createdAt: now,
    updatedAt: now,
    seasonId: 'season-test',
    status: 'active',
    regionIds: ['region-test'],
    archetype: 'foundation',
    chronicleEnabled: true,
    ...options.campaign
  };

  const season: Season = {
    id: 'season-test',
    title: options.season?.title || 'Test Season',
    startedAt: now,
    endsAt: options.season?.endsAt || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    dayNumber: options.season?.dayNumber || 1,
    timezone: 'UTC',
    createdAt: now,
    updatedAt: now,
    ...options.season
  };

  const region: import('../entities/types').Region = {
    id: 'region-test',
    campaignId: campaign.id,
    title: 'Test Region',
    description: 'Test region',
    order: 1,
    provinceIds: options.provinces?.map((_, i) => `province-test-${i}`) || [],
    progressPercent: 0,
    status: 'active',
    mapTemplateId: 'region_v1',
    createdAt: now,
    updatedAt: now
  };

  const provinces: Province[] = (options.provinces || []).map((p, index) => ({
    id: `province-test-${index}`,
    regionId: 'region-test',
    title: p.title || `Test Province ${index}`,
    description: p.description || 'Test province',
    state: p.state || 'fog',
    progressStage: p.progressStage || 'scouted',
    decompositionCount: p.decompositionCount || 0,
    mapSlotId: p.mapSlotId || `p${String(index + 1).padStart(2, '0')}`,
    createdAt: now,
    updatedAt: now,
    ...p
  }));

  const state: AppState = {
    ...createCleanAppState(),
    campaigns: [campaign],
    regions: [region],
    seasons: [season],
    provinces,
  };

  await saveAppState(state);
  
  return { campaign, provinces, season };
}

// ============================================================================
// Time Helpers (for T5 - injectable clock)
// ============================================================================

/**
 * Freeze time for deterministic testing
 * Returns a function to restore real time
 */
export function freezeTime(frozenDate: Date | string): () => void {
  const frozenTime = new Date(frozenDate).getTime();
  const originalDate = Date;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Date = class MockDate {
    constructor(date?: Date | string | number) {
      if (date !== undefined) {
        return new originalDate(date);
      }
      return new originalDate(frozenTime);
    }
    
    static now() {
      return frozenTime;
    }
    
    static parse = originalDate.parse;
    static UTC = originalDate.UTC;
  } as any;
  
  return () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).Date = originalDate;
  };
}

/**
 * Advance time by specified milliseconds
 */
export function advanceTime(ms: number): void {
  const currentTime = Date.now();
  freezeTime(new Date(currentTime + ms));
}

// ============================================================================
// Bootstrap State Helpers
// ============================================================================

/**
 * Check if onboarding has been shown (no data exists)
 */
export async function isFirstRun(): Promise<boolean> {
  const state = await loadAppState();
  return !state || state.campaigns.length === 0;
}

/**
 * Simulate completing onboarding by seeding tutorial
 */
export async function completeOnboarding(): Promise<void> {
  await loadTutorialSeed();
}

/**
 * Get the current first province in tutorial (for navigation testing)
 */
export async function getFirstTutorialProvince(): Promise<Province | null> {
  const state = await loadAppState();
  if (!state) return null;
  
  const tutorialCampaign = state.campaigns.find(c => c.id === TUTORIAL_CAMPAIGN_ID);
  if (!tutorialCampaign) return null;
  
  const tutorialRegion = state.regions.find(r => r.campaignId === tutorialCampaign.id);
  if (!tutorialRegion) return null;
  
  const firstProvince = state.provinces.find(p => 
    p.regionId === tutorialRegion.id && p.mapSlotId === 'p01'
  );
  
  return firstProvince || null;
}
