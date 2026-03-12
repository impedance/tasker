/**
 * Export/Import service for full app state JSON
 * Handles validation, migration, and roundtrip integrity
 */

import { AppStateSchema } from '../entities/schemas';
import type { AppState, ChronicleEntryType } from '../entities/types';
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

const SUPPORTED_CHRONICLE_ENTRY_TYPES: ReadonlySet<ChronicleEntryType> = new Set([
  'fog_cleared',
  'siege_resolved',
  'region_captured',
  'meaningful_day_streak',
  'season_end',
  'campaign_created'
]);

function isSupportedChronicleEntryType(value: unknown): value is ChronicleEntryType {
  return typeof value === 'string' && SUPPORTED_CHRONICLE_ENTRY_TYPES.has(value as ChronicleEntryType);
}

function normalizeChronicleEntries(state: AppState): AppState {
  return {
    ...state,
    chronicleEntries: state.chronicleEntries.map((entry) => {
      if (isSupportedChronicleEntryType(entry.entryType)) {
        return entry;
      }

      const legacyType = typeof entry.entryType === 'string' ? entry.entryType : 'unknown';
      const legacyMarker = `[legacy entryType: ${legacyType}]`;
      const normalizedBody = entry.body ? `${legacyMarker} ${entry.body}` : legacyMarker;

      return {
        ...entry,
        entryType: 'meaningful_day_streak',
        body: normalizedBody
      };
    })
  };
}

/**
 * Parse import JSON, validate minimal shape, migrate, and strictly validate.
 */
export function parseImportData(jsonString: string): {
  state?: AppState;
  errors: string[];
  migratedFromVersion?: number;
} {
  const errors: string[] = [];

  // 1) Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    errors.push(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { errors };
  }

  // 2) Basic pre-migration validation
  const validation = validateAppState(parsed);
  if (!validation.valid) {
    errors.push(...validation.errors);
    return { errors };
  }

  const migratedFromVersion = (parsed as { schemaVersion?: number }).schemaVersion || 0;

  // 3) Migration to current schema
  let migratedState: AppState;
  try {
    migratedState = migrate(parsed as AppState);
  } catch (error) {
    errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { errors };
  }

  // 4) Normalize legacy Chronicle entryType drift before strict validation
  const normalizedState = normalizeChronicleEntries(migratedState);

  // 5) Strict post-migration validation
  const zodResult = AppStateSchema.safeParse(normalizedState);
  if (!zodResult.success) {
    errors.push(
      ...zodResult.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    );
    return { errors };
  }

  const validatedState = {
    ...zodResult.data,
    schemaVersion: CURRENT_SCHEMA_VERSION
  };

  return {
    state: validatedState,
    errors,
    migratedFromVersion
  };
}

/**
 * Import app state from JSON string
 * Validates basic structure, migrates, then strictly validates and saves
 */
export async function importAppState(jsonString: string): Promise<ImportResult> {
  const parsed = parseImportData(jsonString);
  if (!parsed.state) {
    return { success: false, errors: parsed.errors };
  }

  // Save migrated + validated state
  try {
    await saveAppState(parsed.state);
  } catch (error) {
    return { success: false, errors: [`Failed to save imported state: ${error instanceof Error ? error.message : 'Unknown error'}`] };
  }

  return {
    success: true,
    errors: [],
    migratedFromVersion: parsed.migratedFromVersion
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
 * This preserves event history for audit/support purposes
 */
export async function resetAppState(): Promise<void> {
  const emptyState = createEmptyAppState();
  await saveAppState(emptyState);
}

/**
 * Reset app state to empty AND clear all event history
 * This is a complete wipe - use with caution
 */
export async function resetAppStateIncludingEvents(): Promise<void> {
  const { clearAllIncludingEvents } = await import('./storage');
  await clearAllIncludingEvents();
  const emptyState = createEmptyAppState();
  await saveAppState(emptyState);
}
