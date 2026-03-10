/**
 * Export/Import service for full app state JSON
 * Handles validation, migration, and roundtrip integrity
 */

import { AppStateSchema } from '../entities/schemas';
import type { AppState } from '../entities/types';
import { migrate, validateAppState, CURRENT_SCHEMA_VERSION } from './migrations';
import { saveAppState, loadAppState } from './storage';

// ============================================================================
// Export
// ============================================================================

/**
 * Export current app state as JSON string
 */
export async function exportAppState(): Promise<string> {
  const state = await loadAppState();
  if (!state) {
    throw new Error('No app state to export');
  }
  return JSON.stringify(state, null, 2);
}

/**
 * Export current app state as downloadable blob
 */
export async function exportAppStateAsBlob(): Promise<Blob> {
  const json = await exportAppState();
  return new Blob([json], { type: 'application/json' });
}

/**
 * Generate export filename with timestamp
 */
export function getExportFilename(): string {
  const date = new Date();
  const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `tasker-export-${timestamp}.json`;
}

// ============================================================================
// Import
// ============================================================================

export interface ImportResult {
  success: boolean;
  errors: string[];
  migratedFromVersion?: number;
}

/**
 * Validate and parse JSON string to AppState
 */
export function parseImportData(jsonString: string): { state?: AppState; errors: string[] } {
  const errors: string[] = [];

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    errors.push(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { errors };
  }

  // Basic structure validation
  const validation = validateAppState(parsed);
  if (!validation.valid) {
    errors.push(...validation.errors);
    return { errors };
  }

  // Zod schema validation
  const zodResult = AppStateSchema.safeParse(parsed);
  if (!zodResult.success) {
    errors.push(
      ...zodResult.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    );
    return { errors };
  }

  return { state: zodResult.data, errors };
}

/**
 * Import app state from JSON string
 * Validates basic structure, migrates, then strictly validates and saves
 */
export async function importAppState(jsonString: string): Promise<ImportResult> {
  // 1. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    return { success: false, errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`] };
  }

  // 2. Pre-migration validation (basic structure)
  const basicValidation = validateAppState(parsed);
  if (!basicValidation.valid) {
    return { success: false, errors: basicValidation.errors };
  }

  const fromVersion = (parsed as { schemaVersion?: number }).schemaVersion || 0;

  // 3. Migrate to current version
  let migratedState: AppState;
  try {
    // Note: migrate() takes AppState but validateAppState ensures it has the minimum required fields
    // so we can safely cast for migration purposes
    migratedState = migrate(parsed as AppState);
  } catch (error) {
    return { success: false, errors: [`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`] };
  }

  // 4. Post-migration strict validation (Zod)
  const zodResult = AppStateSchema.safeParse(migratedState);
  if (!zodResult.success) {
    const zodErrors = zodResult.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return { success: false, errors: zodErrors };
  }

  const validatedState = zodResult.data;

  // 5. Ensure schema version is set correctly (migration should have handled it, but double check)
  validatedState.schemaVersion = CURRENT_SCHEMA_VERSION;

  // 6. Save to storage
  try {
    await saveAppState(validatedState);
  } catch (error) {
    return { success: false, errors: [`Failed to save imported state: ${error instanceof Error ? error.message : 'Unknown error'}`] };
  }

  return {
    success: true,
    errors: [],
    migratedFromVersion: fromVersion
  };
}

/**
 * Import app state from File object (browser file input)
 */
export async function importAppStateFromFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) {
        resolve({ success: false, errors: ['Failed to read file'] });
        return;
      }
      const result = await importAppState(content);
      resolve(result);
    };
    reader.onerror = () => {
      resolve({ success: false, errors: ['Failed to read file'] });
    };
    reader.readAsText(file);
  });
}

/**
 * Import app state from clipboard text
 */
export async function importAppStateFromClipboard(): Promise<ImportResult> {
  try {
    const text = await navigator.clipboard.readText();
    return await importAppState(text);
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to read clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

// ============================================================================
// Reset/Clear
// ============================================================================

/**
 * Create empty/fresh app state
 */
export function createEmptyAppState(): AppState {
  const now = new Date().toISOString();
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
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
 * Reset app state to empty (fresh start)
 */
export async function resetAppState(): Promise<void> {
  const emptyState = createEmptyAppState();
  await saveAppState(emptyState);
}
