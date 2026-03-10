/**
 * Storage adapter using localForage for IndexedDB persistence
 * Provides key namespace conventions and error handling
 */

import localforage from 'localforage';
import type { AppState } from '../entities/types';
import { CURRENT_SCHEMA_VERSION } from './migrations';

// ============================================================================
// Constants
// ============================================================================

export const DB_NAME = 'tasker-db';
export const DB_STORE_NAME = 'tasker-store';

// Key namespaces
export const KEY_PREFIX = 'tasker:';
export const KEY_SCHEMA_VERSION = `${KEY_PREFIX}schema-version`;

// ============================================================================
// Storage Instance
// ============================================================================

export const db = localforage.createInstance({
  name: DB_NAME,
  storeName: DB_STORE_NAME,
  description: 'Tasker local persistence store'
});

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize storage and ensure schema version is set
 */
export async function initStorage(): Promise<void> {
  try {
    const existingVersion = await db.getItem<number>(KEY_SCHEMA_VERSION);
    if (existingVersion === null) {
      await db.setItem(KEY_SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
    }
  } catch (error) {
    console.error('[Storage] Failed to initialize storage:', error);
    // eslint-disable-next-line preserve-caught-error
    throw new Error('Failed to initialize storage');
  }
}

/**
 * Get current schema version from storage
 */
export async function getSchemaVersion(): Promise<number> {
  try {
    const version = await db.getItem<number>(KEY_SCHEMA_VERSION);
    return version ?? 0;
  } catch (error) {
    console.error('[Storage] Failed to get schema version:', error);
    return 0;
  }
}

/**
 * Set schema version in storage
 */
export async function setSchemaVersion(version: number): Promise<void> {
  try {
    await db.setItem(KEY_SCHEMA_VERSION, version);
  } catch (error) {
    console.error('[Storage] Failed to set schema version:', error);
    // eslint-disable-next-line preserve-caught-error
    throw new Error('Failed to set schema version');
  }
}

// ============================================================================
// Generic CRUD Operations
// ============================================================================

/**
 * Get item by key
 */
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const item = await db.getItem<T>(key);
    return item;
  } catch (error) {
    console.error(`[Storage] Failed to get item '${key}':`, error);
    return null;
  }
}

/**
 * Set item by key
 */
export async function setItem<T>(key: string, value: T): Promise<T> {
  try {
    await db.setItem(key, value);
    return value;
  } catch (error) {
    console.error(`[Storage] Failed to set item '${key}':`, error);
    // eslint-disable-next-line preserve-caught-error
    throw new Error(`Failed to save ${key}`);
  }
}

/**
 * Remove item by key
 */
export async function removeItem(key: string): Promise<void> {
  try {
    await db.removeItem(key);
  } catch (error) {
    console.error(`[Storage] Failed to remove item '${key}':`, error);
    // eslint-disable-next-line preserve-caught-error
    throw new Error(`Failed to remove ${key}`);
  }
}

/**
 * Get all keys matching a prefix
 */
export async function getKeysByPrefix(prefix: string): Promise<string[]> {
  try {
    const keys: string[] = [];
    await db.iterate((_value, key) => {
      if (key.startsWith(prefix)) {
        keys.push(key);
      }
    });
    return keys;
  } catch (error) {
    console.error(`[Storage] Failed to get keys by prefix '${prefix}':`, error);
    return [];
  }
}

/**
 * Clear all items with tasker prefix
 */
export async function clearAll(): Promise<void> {
  try {
    await db.clear();
  } catch (error) {
    console.error('[Storage] Failed to clear storage:', error);
    // eslint-disable-next-line preserve-caught-error
    throw new Error('Failed to clear storage');
  }
}

// ============================================================================
// App State Operations
// ============================================================================

/**
 * Load full app state from itemized storage
 */
export async function loadAppState(): Promise<AppState | null> {
  try {
    const now = new Date().toISOString();
    const state: AppState = {
      schemaVersion: await getSchemaVersion(),
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

    let hasAnyData = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.iterate((value: any, key: string) => {
      if (!key.startsWith(KEY_PREFIX)) return;
      hasAnyData = true;
      const subKey = key.slice(KEY_PREFIX.length);

      if (subKey.startsWith('campaign:')) state.campaigns.push(value);
      else if (subKey.startsWith('region:')) state.regions.push(value);
      else if (subKey.startsWith('province:')) state.provinces.push(value);
      else if (subKey.startsWith('dailyMove:')) state.dailyMoves.push(value);
      else if (subKey.startsWith('checkIn:')) state.checkIns.push(value);
      else if (subKey.startsWith('siegeEvent:')) state.siegeEvents.push(value);
      else if (subKey.startsWith('season:')) state.seasons.push(value);
      else if (subKey.startsWith('seasonReview:')) state.seasonReviews.push(value);
      else if (subKey.startsWith('heroMoment:')) state.heroMoments.push(value);
      else if (subKey.startsWith('chronicleEntry:')) state.chronicleEntries.push(value);
      else if (subKey.startsWith('ifThenPlan:')) state.ifThenPlans.push(value);
      else if (subKey.startsWith('shareCard:')) state.shareCards.push(value);
      else if (subKey.startsWith('capitalState:')) state.capitalStates.push(value);
      else if (subKey.startsWith('archetypeStats:')) state.archetypeStats.push(value);
      else if (subKey === 'playerProfile') state.playerProfile = value;
    });

    if (!hasAnyData) {
      return null;
    }

    return state;
  } catch (error) {
    console.error('[Storage] Failed to load app state:', error);
    return null;
  }
}

/**
 * Save full app state to storage
 */
export async function saveAppState(state: AppState): Promise<void> {
  try {
    await clearAll();
    await setSchemaVersion(state.schemaVersion);

    for (const item of state.campaigns) await setItem(`${KEY_PREFIX}campaign:${item.id}`, item);
    for (const item of state.regions) await setItem(`${KEY_PREFIX}region:${item.id}`, item);
    for (const item of state.provinces) await setItem(`${KEY_PREFIX}province:${item.id}`, item);
    for (const item of state.dailyMoves) await setItem(`${KEY_PREFIX}dailyMove:${item.id}`, item);
    for (const item of state.checkIns) await setItem(`${KEY_PREFIX}checkIn:${item.id}`, item);
    for (const item of state.siegeEvents) await setItem(`${KEY_PREFIX}siegeEvent:${item.id}`, item);
    for (const item of state.seasons) await setItem(`${KEY_PREFIX}season:${item.id}`, item);
    for (const item of state.seasonReviews) await setItem(`${KEY_PREFIX}seasonReview:${item.id}`, item);
    for (const item of state.heroMoments) await setItem(`${KEY_PREFIX}heroMoment:${item.id}`, item);
    for (const item of state.chronicleEntries) await setItem(`${KEY_PREFIX}chronicleEntry:${item.id}`, item);
    for (const item of state.ifThenPlans) await setItem(`${KEY_PREFIX}ifThenPlan:${item.id}`, item);
    for (const item of state.shareCards) await setItem(`${KEY_PREFIX}shareCard:${item.id}`, item);
    for (const item of state.capitalStates) await setItem(`${KEY_PREFIX}capitalState:${item.campaignId}`, item);
    for (const item of state.archetypeStats) await setItem(`${KEY_PREFIX}archetypeStats:${item.seasonId}`, item);
    await setItem(`${KEY_PREFIX}playerProfile`, state.playerProfile);

  } catch (error) {
    console.error('[Storage] Failed to save app state:', error);
    // eslint-disable-next-line preserve-caught-error
    throw new Error('Failed to save app state');
  }
}

/**
 * Check if storage has any data
 */
export async function hasData(): Promise<boolean> {
  try {
    let found = false;
    await db.iterate((_value, key) => {
      if (key.startsWith(KEY_PREFIX) && key !== KEY_SCHEMA_VERSION) {
        found = true;
        return true; // Short-circuit iteration
      }
    });
    return found;
  } catch (error) {
    console.error('[Storage] Failed to check for data:', error);
    return false;
  }
}
