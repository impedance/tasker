/**
 * Schema migrations for app state evolution
 * Each migration transforms state from version N to N+1
 */

import type { AppState } from '../entities/types';

// ============================================================================
// Migration Types
// ============================================================================

type MigrationFn = (state: AppState) => AppState;

interface Migration {
  version: number;
  name: string;
  migrate: MigrationFn;
}

// ============================================================================
// Migrations
// ============================================================================

/**
 * Migration 1: Initial schema version
 * Backfills missing optional slices from legacy snapshots
 */
const migrationV1: Migration = {
  version: 1,
  name: 'Initial schema version',
  migrate: (state: AppState): AppState => {
    // Backfill missing fields for legacy snapshots while setting schema version.
    const now = new Date().toISOString();
    const legacy = state as Partial<AppState>;
    const profile = (legacy.playerProfile ?? {}) as Partial<AppState['playerProfile']>;

    return {
      schemaVersion: 1,
      campaigns: Array.isArray(legacy.campaigns) ? legacy.campaigns : [],
      regions: Array.isArray(legacy.regions) ? legacy.regions : [],
      provinces: Array.isArray(legacy.provinces) ? legacy.provinces : [],
      dailyMoves: Array.isArray(legacy.dailyMoves) ? legacy.dailyMoves : [],
      checkIns: Array.isArray(legacy.checkIns) ? legacy.checkIns : [],
      siegeEvents: Array.isArray(legacy.siegeEvents) ? legacy.siegeEvents : [],
      seasons: Array.isArray(legacy.seasons) ? legacy.seasons : [],
      seasonReviews: Array.isArray(legacy.seasonReviews) ? legacy.seasonReviews : [],
      heroMoments: Array.isArray(legacy.heroMoments) ? legacy.heroMoments : [],
      chronicleEntries: Array.isArray(legacy.chronicleEntries) ? legacy.chronicleEntries : [],
      ifThenPlans: Array.isArray(legacy.ifThenPlans) ? legacy.ifThenPlans : [],
      shareCards: Array.isArray(legacy.shareCards) ? legacy.shareCards : [],
      capitalStates: Array.isArray(legacy.capitalStates) ? legacy.capitalStates : [],
      archetypeStats: Array.isArray(legacy.archetypeStats) ? legacy.archetypeStats : [],
      playerProfile: {
        id: 'local',
        totalCaptured: profile.totalCaptured ?? 0,
        totalClarified: profile.totalClarified ?? 0,
        totalStarted: profile.totalStarted ?? 0,
        totalCompleted: profile.totalCompleted ?? 0,
        preferredWorkWindow: profile.preferredWorkWindow,
        frictionStats: profile.frictionStats,
        streaks: profile.streaks,
        currentSeasonId: profile.currentSeasonId,
        createdAt: profile.createdAt ?? now,
        updatedAt: profile.updatedAt ?? now
      }
    };
  }
};

// ============================================================================
// Migration Registry
// ============================================================================

export const MIGRATIONS: Migration[] = [migrationV1];

export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Get migration by version number
 */
export function getMigration(version: number): Migration | undefined {
  return MIGRATIONS.find(m => m.version === version);
}

/**
 * Run migrations to bring state to current schema version
 */
export function migrate(state: AppState): AppState {
  const fromVersion = state.schemaVersion || 0;

  if (fromVersion >= CURRENT_SCHEMA_VERSION) {
    return state;
  }

  let migratedState = { ...state };

  // Run migrations sequentially
  for (let targetVersion = fromVersion + 1; targetVersion <= CURRENT_SCHEMA_VERSION; targetVersion++) {
    const migration = getMigration(targetVersion);
    if (!migration) {
      console.warn(`[Migrations] No migration found for version ${targetVersion}, skipping...`);
      continue;
    }

    try {
      console.log(`[Migrations] Running migration ${targetVersion}: ${migration.name}`);
      migratedState = migration.migrate(migratedState);
      migratedState.schemaVersion = targetVersion;
    } catch (error) {
      console.error(`[Migrations] Failed to run migration ${targetVersion}:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Migration ${targetVersion} failed: ${message}`, { cause: error });
    }
  }

  console.log(`[Migrations] Migration complete: ${fromVersion} → ${CURRENT_SCHEMA_VERSION}`);
  return migratedState;
}

/**
 * Validate app state structure (basic checks)
 */
export function validateAppState(state: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!state || typeof state !== 'object') {
    errors.push('App state is not an object');
    return { valid: false, errors };
  }

  const appState = state as Record<string, unknown>;

  // Check required top-level fields
  const requiredFields = [
    'schemaVersion',
    'campaigns',
    'regions',
    'provinces',
    'playerProfile'
  ];

  for (const field of requiredFields) {
    if (!(field in appState)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check array fields are arrays
  const arrayFields = ['campaigns', 'regions', 'provinces', 'dailyMoves', 'checkIns', 'siegeEvents', 'seasons'];
  for (const field of arrayFields) {
    if (field in appState && !Array.isArray(appState[field])) {
      errors.push(`Field '${field}' is not an array`);
    }
  }

  // Check playerProfile exists and is object
  if ('playerProfile' in appState && typeof appState.playerProfile !== 'object') {
    errors.push('playerProfile is not an object');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
