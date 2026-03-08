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
 * No-op migration for bootstrapping
 */
const migrationV1: Migration = {
  version: 1,
  name: 'Initial schema version',
  migrate: (state: AppState): AppState => {
    // Ensure all required fields exist with defaults
    return {
      ...state,
      schemaVersion: 1
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
      throw new Error(`Migration ${targetVersion} failed`, { cause: error });
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
