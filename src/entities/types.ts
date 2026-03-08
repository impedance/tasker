/**
 * Core domain types for Tasker MVP
 * Based on EPIC-01 foundation contracts (Appendix Z)
 */

// ============================================================================
// Enums
// ============================================================================

export type CampaignStatus = 'active' | 'paused' | 'completed' | 'archived';

export type CampaignArchetype = 'foundation' | 'drive' | 'joy' | 'neutral';

export type RegionStatus = 'active' | 'completed' | 'archived';

export type RegionMapRole = 'core' | 'frontier' | 'archive' | 'supply' | 'neutral';

export type ProvinceState = 'fog' | 'ready' | 'siege' | 'in_progress' | 'fortified' | 'captured' | 'retreated';

export type ProvinceProgressStage = 'scouted' | 'prepared' | 'entered' | 'held' | 'captured';

export type ProvinceRole = 'standard' | 'fortress' | 'watchtower' | 'archive' | 'depot';

export type EmotionalFrictionType = 'anxiety' | 'boredom' | 'fatigue' | 'irritation' | 'fear_of_outcome' | 'ambiguity';

export type MoveType = 'scout' | 'supply' | 'engineer' | 'raid' | 'assault' | 'retreat';

export type MoveResult = 'started' | 'progressed' | 'clarified' | 'prepared' | 'completed' | 'retreated' | 'skipped' | 'blocked';

export type EnergyLevel = 'low' | 'medium' | 'high';

export type EmotionType = EmotionalFrictionType;

export type SiegeReasonType = 'no_meaningful_action_3_days' | 'high_effort_no_decomposition' | 'manual' | 'other';

export type TacticType = 'scout' | 'supply' | 'engineer' | 'raid' | 'retreat';

export type HeroMomentType = 'first_fog_cleared' | 'first_started' | 'siege_resolved' | 'three_meaningful_days' | 'high_effort_captured';

export type ChronicleEntryType = 'fog_cleared' | 'siege_resolved' | 'region_captured' | 'meaningful_day_streak' | 'season_end' | 'campaign_created';

export type Importance = 'low' | 'medium' | 'high';

export type ShareCardType = 'weekly_map' | 'before_after_season' | 'siege_recovery' | 'campaign_style';

export type PrivacyMode = 'public_safe' | 'private';

export type InterventionType = 'daily_move' | 'siege' | 'codex' | 'season_review' | 'other';

export type MeaningfulActionType = 'clarify' | 'prepare' | 'start' | 'progress' | 'siege_resolve' | 'complete' | 'retreat';

// ============================================================================
// Core Entities
// ============================================================================

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  colorTheme?: string;
  createdAt: string;
  updatedAt: string;
  seasonId: string;
  status: CampaignStatus;
  regionIds: string[];
  archetype?: CampaignArchetype;
  factionId?: string;
  factionName?: string;
  bannerStyle?: string;
  seasonFantasyName?: string;
  chronicleEnabled: boolean;
  capitalProvinceId?: string;
}

export interface Region {
  id: string;
  campaignId: string;
  title: string;
  description?: string;
  order: number;
  provinceIds: string[];
  progressPercent: number;
  status: RegionStatus;
  mapTemplateId: string;
  mapRole?: RegionMapRole;
  pressureLevel?: number;
  adjacentRegionIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Province {
  id: string;
  regionId: string;
  title: string;
  description?: string;
  desiredOutcome?: string;
  firstStep?: string;
  estimatedEntryMinutes?: number;
  mapSlotId?: string;
  dueDate?: string;
  effortLevel?: number; // 1-5
  clarityLevel?: number; // 1-5
  emotionalFrictionType?: EmotionalFrictionType;
  state: ProvinceState;
  progressStage: ProvinceProgressStage;
  provinceRole?: ProvinceRole;
  decompositionCount: number;
  contextLinks?: string[];
  contextNotes?: string;
  adjacentProvinceIds?: string[];
  frontPressureLevel?: number; // 0-3
  lastMeaningfulActionAt?: string;
  heroMomentShownAt?: string;
  isHotspot?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Supporting Entities
// ============================================================================

export interface DailyMove {
  id: string;
  date: string;
  provinceId: string;
  moveType: MoveType;
  durationMinutes: number;
  result: MoveResult;
  createdAt: string;
}

export interface PlayerCheckIn {
  id: string;
  date: string;
  energyLevel: EnergyLevel;
  availableMinutes: number;
  emotionType: EmotionType;
  recommendedMoveIds?: string[];
  selectedMoveId?: string;
  createdAt: string;
}

export interface SiegeEvent {
  id: string;
  provinceId: string;
  triggeredAt: string;
  reasonType: SiegeReasonType;
  selectedTactic?: TacticType;
  resolvedAt?: string;
}

export interface Season {
  id: string;
  title: string;
  startedAt: string;
  endsAt: string;
  dayNumber: number;
  goals?: string[];
  score?: number;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeasonReview {
  id: string;
  seasonId: string;
  workedWell?: string[];
  mainObstacles?: string[];
  carryForward?: string[];
  dropList?: string[];
  createdAt: string;
}

export interface HeroMoment {
  id: string;
  type: HeroMomentType;
  seasonId: string;
  provinceId?: string;
  triggeredAt: string;
  shownAt?: string;
  shareCardId?: string;
}

export interface ChronicleEntry {
  id: string;
  campaignId: string;
  seasonId?: string;
  regionId?: string;
  provinceId?: string;
  entryType: ChronicleEntryType;
  title: string;
  body?: string;
  importance: Importance;
  createdAt: string;
}

export interface IfThenPlan {
  id: string;
  provinceId: string;
  triggerText: string;
  actionText: string;
  scheduledFor?: string;
  createdAt: string;
}

export interface ShareCard {
  id: string;
  type: ShareCardType;
  seasonId?: string;
  generatedAt: string;
  privacyMode: PrivacyMode;
  payload: Record<string, unknown>;
  sourceSurface?: string;
}

export interface PlayerProfile {
  id: string; // Always 'local'
  preferredWorkWindow?: string;
  frictionStats?: Record<string, number>;
  streaks?: Record<string, number>;
  totalCaptured: number;
  totalClarified: number;
  totalStarted: number;
  totalCompleted: number;
  currentSeasonId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CapitalState {
  campaignId: string;
  visualTier: number;
  unlockedDecor: string[];
  lastViewedAt: string;
}

export interface CampaignArchetypeStats {
  seasonId: string;
  foundationCount: number;
  driveCount: number;
  joyCount: number;
}

// ============================================================================
// Events (Appendix B)
// ============================================================================

export interface EventEnvelope {
  eventName: string;
  eventVersion: number;
  occurredAt: string;
  timezone: string;
  sessionId: string;
  payload: Record<string, unknown>;
}

export interface MeaningfulActionPayload {
  isMeaningfulAction: true;
  meaningfulActionType: MeaningfulActionType;
}

// ============================================================================
// App State (for import/export)
// ============================================================================

export interface AppState {
  schemaVersion: number;
  campaigns: Campaign[];
  regions: Region[];
  provinces: Province[];
  dailyMoves: DailyMove[];
  checkIns: PlayerCheckIn[];
  siegeEvents: SiegeEvent[];
  seasons: Season[];
  seasonReviews: SeasonReview[];
  heroMoments: HeroMoment[];
  chronicleEntries: ChronicleEntry[];
  ifThenPlans: IfThenPlan[];
  shareCards: ShareCard[];
  playerProfile: PlayerProfile;
  capitalStates: CapitalState[];
  archetypeStats: CampaignArchetypeStats[];
}
