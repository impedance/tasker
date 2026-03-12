/**
 * Capital feature - loads and presents Capital state
 * 
 * Use case: Load all data needed to render the Capital hub page
 */

import {
  campaignRepository,
  provinceRepository,
  capitalStateRepository,
  playerProfileRepository,
  seasonRepository
} from '../storage/repositories';
import type { Campaign, Province, CapitalState, PlayerProfile, Season } from '../entities/types';
import { getStreakState } from '../game/rules/streak';
import { getSeasonPhase } from '../game/rules/season';
import { SeasonPhase } from '../shared/copy/season-hints';

export interface CapitalData {
  campaign: Campaign;
  stats: {
    fog: number;
    siege: number;
    fortified: number;
    captured: number;
  };
  capitalState: CapitalState | null;
  profile: PlayerProfile | null;
  season: Season | null;
  hotspots: Province[];
  streakState: ReturnType<typeof getStreakState>;
  seasonPhase: SeasonPhase;
}

export interface CapitalLoadError {
  type: 'no_campaign' | 'load_error';
  message: string;
}

/**
 * Load all data needed for Capital page
 * Returns null if no campaign exists
 */
export async function loadCapitalData(): Promise<{ data: CapitalData } | { error: CapitalLoadError }> {
  try {
    const campaigns = await campaignRepository.list();
    const activeCampaign = campaigns.find(c => c.status === 'active') || campaigns[0];

    if (!activeCampaign) {
      return {
        error: {
          type: 'no_campaign',
          message: 'No active campaign found. Start one to see your capital.'
        }
      };
    }

    const [provinces, cState, pProfile, seasons] = await Promise.all([
      provinceRepository.listByCampaign(activeCampaign.id),
      capitalStateRepository.getByCampaignId(activeCampaign.id),
      playerProfileRepository.get(),
      seasonRepository.list()
    ]);

    const activeSeason = seasons.find(s => s.id === activeCampaign.seasonId) || seasons[seasons.length - 1];

    const stats = { fog: 0, siege: 0, fortified: 0, captured: 0 };
    provinces.forEach(p => {
      if (p.state === 'fog') stats.fog++;
      else if (p.state === 'siege') stats.siege++;
      else if (p.state === 'fortified') stats.fortified++;
      else if (p.state === 'captured') stats.captured++;
    });

    const hotspots = provinces.filter(p => p.frontPressureLevel && p.frontPressureLevel >= 2).slice(0, 3);
    const streakState = pProfile ? getStreakState(pProfile) : { currentStreak: 0, longestStreak: 0, lastMeaningfulDate: null };
    const seasonPhase = activeSeason ? getSeasonPhase(activeSeason) as SeasonPhase : 'early';

    return {
      data: {
        campaign: activeCampaign,
        stats,
        capitalState: cState,
        profile: pProfile,
        season: activeSeason || null,
        hotspots,
        streakState,
        seasonPhase
      }
    };
  } catch (error) {
    return {
      error: {
        type: 'load_error',
        message: error instanceof Error ? error.message : 'Failed to load capital data'
      }
    };
  }
}

/**
 * Get capital tier display info
 */
export function getCapitalTierInfo(visualTier: number | undefined): { name: string; requirement: string } {
  const tiers: Record<number, { name: string; requirement: string }> = {
    1: { name: 'Outpost', requirement: 'start' },
    2: { name: 'Garrison', requirement: 'region_captured' },
    3: { name: 'Stronghold', requirement: '3_meaningful_days' },
    4: { name: 'Capital', requirement: 'season_completion' },
  };
  return tiers[visualTier || 1];
}
