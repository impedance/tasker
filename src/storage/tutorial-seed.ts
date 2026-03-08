/**
 * Tutorial seed data and deterministic loader
 * Provides first-run experience with sample campaign/region/provinces
 */

import type { AppState, Campaign, Region, Province, Season } from '../entities/types';
import { CURRENT_SCHEMA_VERSION } from './migrations';

// ============================================================================
// Constants
// ============================================================================

export const TUTORIAL_SEASON_ID = 'season-tutorial';
export const TUTORIAL_CAMPAIGN_ID = 'campaign-tutorial';
export const TUTORIAL_REGION_ID = 'region-tutorial';

// Tutorial province IDs (deterministic for tutorial flow)
export const TUTORIAL_PROVINCE_IDS = {
  WELCOME: 'province-tutorial-welcome',
  CLARIFY: 'province-tutorial-clarify',
  FIRST_STEP: 'province-tutorial-first-step'
};

// ============================================================================
// Seed Data Factory
// ============================================================================

/**
 * Create tutorial season
 */
function createTutorialSeason(): Season {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 21);

  return {
    id: TUTORIAL_SEASON_ID,
    title: 'Tutorial Season',
    startedAt: now.toISOString(),
    endsAt: endDate.toISOString(),
    dayNumber: 1,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

/**
 * Create tutorial campaign
 */
function createTutorialCampaign(seasonId: string): Campaign {
  const now = new Date().toISOString();
  return {
    id: TUTORIAL_CAMPAIGN_ID,
    title: 'Welcome to Tasker',
    description: 'Learn the basics by completing these provinces',
    colorTheme: 'blue',
    createdAt: now,
    updatedAt: now,
    seasonId,
    status: 'active',
    regionIds: [TUTORIAL_REGION_ID],
    archetype: 'foundation',
    chronicleEnabled: true
  };
}

/**
 * Create tutorial region
 */
function createTutorialRegion(campaignId: string): Region {
  const now = new Date().toISOString();
  return {
    id: TUTORIAL_REGION_ID,
    campaignId,
    title: 'Getting Started',
    description: 'Complete these provinces to learn the basics',
    order: 1,
    provinceIds: Object.values(TUTORIAL_PROVINCE_IDS),
    progressPercent: 0,
    status: 'active',
    mapTemplateId: 'tutorial-map-1',
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Create tutorial provinces
 */
function createTutorialProvinces(regionId: string): Province[] {
  const now = new Date().toISOString();

  return [
    {
      id: TUTORIAL_PROVINCE_IDS.WELCOME,
      regionId,
      title: 'Welcome to Your Campaign',
      description: 'This is your first province. Every journey begins with a single step.',
      desiredOutcome: 'Understand what a province is',
      firstStep: 'Read this description',
      estimatedEntryMinutes: 1,
      state: 'ready',
      progressStage: 'scouted',
      decompositionCount: 0,
      createdAt: now,
      updatedAt: now
    },
    {
      id: TUTORIAL_PROVINCE_IDS.CLARIFY,
      regionId,
      title: 'Clarify a Fog Province',
      description: 'Some provinces start unclear (in "fog"). You need to clarify them before starting.',
      state: 'fog',
      progressStage: 'scouted',
      decompositionCount: 0,
      createdAt: now,
      updatedAt: now
    },
    {
      id: TUTORIAL_PROVINCE_IDS.FIRST_STEP,
      regionId,
      title: 'Take Your First Step',
      description: 'Once a province is clear, you can start working on it. Try logging a 5-minute raid!',
      desiredOutcome: 'Complete a small action',
      firstStep: 'Click the "Log Move" button',
      estimatedEntryMinutes: 5,
      state: 'ready',
      progressStage: 'scouted',
      decompositionCount: 0,
      createdAt: now,
      updatedAt: now
    }
  ];
}

/**
 * Create complete tutorial app state
 */
export function createTutorialAppState(): AppState {
  const season = createTutorialSeason();
  const campaign = createTutorialCampaign(season.id);
  const region = createTutorialRegion(campaign.id);
  const provinces = createTutorialProvinces(region.id);

  const now = new Date().toISOString();

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    campaigns: [campaign],
    regions: [region],
    provinces,
    dailyMoves: [],
    checkIns: [],
    siegeEvents: [],
    seasons: [season],
    seasonReviews: [],
    heroMoments: [],
    chronicleEntries: [
      {
        id: 'chron-tutorial-1',
        campaignId: campaign.id,
        seasonId: season.id,
        entryType: 'campaign_created',
        title: 'Campaign Created',
        body: 'Welcome to Tasker! This tutorial campaign will guide you through the basics.',
        importance: 'high',
        createdAt: now
      }
    ],
    ifThenPlans: [],
    shareCards: [],
    playerProfile: {
      id: 'local',
      totalCaptured: 0,
      totalClarified: 0,
      totalStarted: 0,
      totalCompleted: 0,
      currentSeasonId: season.id,
      createdAt: now,
      updatedAt: now
    },
    capitalStates: [
      {
        campaignId: campaign.id,
        visualTier: 1,
        unlockedDecor: ['basic-flag'],
        lastViewedAt: now
      }
    ],
    archetypeStats: [
      {
        seasonId: season.id,
        foundationCount: 1,
        driveCount: 0,
        joyCount: 0
      }
    ]
  };
}

// ============================================================================
// Loader
// ============================================================================

export interface LoadTutorialOptions {
  /** Force reload even if tutorial already exists */
  force?: boolean;
}

/**
 * Check if tutorial has already been shown
 */
export async function hasTutorialBeenShown(): Promise<boolean> {
  const { loadAppState } = await import('./storage');
  const state = await loadAppState();

  if (!state) {
    return false;
  }

  // Check if tutorial campaign exists
  const hasTutorialCampaign = state.campaigns.some(c => c.id === TUTORIAL_CAMPAIGN_ID);
  const hasTutorialSeason = state.seasons.some(s => s.id === TUTORIAL_SEASON_ID);

  return hasTutorialCampaign && hasTutorialSeason;
}

/**
 * Load tutorial seed data if first run
 * Returns true if tutorial was loaded, false if already exists or skipped
 */
export async function loadTutorialIfFirstRun(options: LoadTutorialOptions = {}): Promise<boolean> {
  const { loadAppState, saveAppState, hasData } = await import('./storage');

  // Check if there's any existing data
  const existingData = await hasData();
  if (existingData && !options.force) {
    return false;
  }

  // Check if tutorial already exists
  const existingState = await loadAppState();
  if (existingState && !options.force) {
    const hasTutorial =
      existingState.campaigns.some(c => c.id === TUTORIAL_CAMPAIGN_ID) ||
      existingState.seasons.some(s => s.id === TUTORIAL_SEASON_ID);
    if (hasTutorial) {
      return false;
    }
  }

  // Create and save tutorial state
  const tutorialState = createTutorialAppState();

  // If there's existing state, merge tutorial into it
  if (existingState) {
    tutorialState.campaigns = [...existingState.campaigns, ...tutorialState.campaigns];
    tutorialState.regions = [...existingState.regions, ...tutorialState.regions];
    tutorialState.provinces = [...existingState.provinces, ...tutorialState.provinces];
    tutorialState.seasons = [...existingState.seasons, ...tutorialState.seasons];
    tutorialState.chronicleEntries = [
      ...existingState.chronicleEntries,
      ...tutorialState.chronicleEntries
    ];
    tutorialState.capitalStates = [
      ...existingState.capitalStates,
      ...tutorialState.capitalStates
    ];
    tutorialState.archetypeStats = [
      ...existingState.archetypeStats,
      ...tutorialState.archetypeStats
    ];
  }

  await saveAppState(tutorialState);
  return true;
}

/**
 * Remove tutorial data (for reset/testing)
 */
export async function removeTutorialData(): Promise<void> {
  const { loadAppState, saveAppState } = await import('./storage');

  const state = await loadAppState();
  if (!state) {
    return;
  }

  // Filter out tutorial entities
  state.campaigns = state.campaigns.filter(c => c.id !== TUTORIAL_CAMPAIGN_ID);
  state.regions = state.regions.filter(r => r.id !== TUTORIAL_REGION_ID);
  state.provinces = state.provinces.filter(
    p => !Object.values(TUTORIAL_PROVINCE_IDS).includes(p.id)
  );
  state.seasons = state.seasons.filter(s => s.id !== TUTORIAL_SEASON_ID);
  state.chronicleEntries = state.chronicleEntries.filter(
    c => c.id !== 'chron-tutorial-1'
  );
  state.capitalStates = state.capitalStates.filter(
    c => c.campaignId !== TUTORIAL_CAMPAIGN_ID
  );
  state.archetypeStats = state.archetypeStats.filter(
    s => s.seasonId !== TUTORIAL_SEASON_ID
  );

  // Update campaign regionIds
  for (const campaign of state.campaigns) {
    campaign.regionIds = campaign.regionIds.filter(rid => rid !== TUTORIAL_REGION_ID);
  }

  // Update region provinceIds (for non-tutorial regions)
  for (const region of state.regions) {
    region.provinceIds = region.provinceIds.filter(
      pid => !Object.values(TUTORIAL_PROVINCE_IDS).includes(pid)
    );
  }

  await saveAppState(state);
}

/**
 * Reset to tutorial-only state (for testing)
 */
export async function resetToTutorialOnly(): Promise<void> {
  const { saveAppState } = await import('./storage');
  const tutorialState = createTutorialAppState();
  await saveAppState(tutorialState);
}
