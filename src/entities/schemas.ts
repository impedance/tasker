/**
 * Zod schemas for runtime validation of domain entities
 * Mirrors types.ts for import/export and boundary validation
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const CampaignStatusSchema = z.enum(['active', 'paused', 'completed', 'archived']);

export const CampaignArchetypeSchema = z.enum(['foundation', 'drive', 'joy', 'neutral']);

export const RegionStatusSchema = z.enum(['active', 'completed', 'archived']);

export const RegionMapRoleSchema = z.enum(['core', 'frontier', 'archive', 'supply', 'neutral']);

export const ProvinceStateSchema = z.enum(['fog', 'ready', 'siege', 'in_progress', 'fortified', 'captured', 'retreated']);

export const ProvinceProgressStageSchema = z.enum(['scouted', 'prepared', 'entered', 'held', 'captured']);

export const ProvinceRoleSchema = z.enum(['standard', 'fortress', 'watchtower', 'archive', 'depot']);

export const EmotionalFrictionTypeSchema = z.enum([
  'anxiety',
  'boredom',
  'fatigue',
  'irritation',
  'fear_of_outcome',
  'ambiguity'
]);

export const MoveTypeSchema = z.enum(['scout', 'supply', 'engineer', 'raid', 'assault', 'retreat']);

export const MoveResultSchema = z.enum([
  'started',
  'progressed',
  'clarified',
  'prepared',
  'completed',
  'retreated',
  'skipped',
  'blocked'
]);

export const EnergyLevelSchema = z.enum(['low', 'medium', 'high']);

export const EmotionTypeSchema = EmotionalFrictionTypeSchema;

export const SiegeReasonTypeSchema = z.enum([
  'no_meaningful_action_3_days',
  'high_effort_no_decomposition',
  'manual',
  'other'
]);

export const TacticTypeSchema = z.enum(['scout', 'supply', 'engineer', 'raid', 'retreat']);

export const HeroMomentTypeSchema = z.enum([
  'first_fog_cleared',
  'first_started',
  'siege_resolved',
  'three_meaningful_days',
  'high_effort_captured'
]);

export const ChronicleEntryTypeSchema = z.enum([
    'fog_cleared',
    'province_started',
    'province_move_logged',
    'province_captured',
    'siege_resolved',
    'region_captured',
    'meaningful_day_streak',
    'season_end',
    'campaign_created'
]);

export const ImportanceSchema = z.enum(['low', 'medium', 'high']);

export const ShareCardTypeSchema = z.enum(['weekly_map', 'before_after_season', 'siege_recovery', 'campaign_style']);

export const PrivacyModeSchema = z.enum(['public_safe', 'private']);

export const InterventionTypeSchema = z.enum(['daily_move', 'siege', 'codex', 'season_review', 'other']);

export const MeaningfulActionTypeSchema = z.enum([
  'clarify',
  'prepare',
  'start',
  'progress',
  'siege_resolve',
  'complete',
  'retreat'
]);

// ============================================================================
// Core Entities
// ============================================================================

export const CampaignSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  colorTheme: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  seasonId: z.string(),
  status: CampaignStatusSchema,
  regionIds: z.array(z.string()),
  archetype: CampaignArchetypeSchema.optional(),
  factionId: z.string().optional(),
  factionName: z.string().optional(),
  bannerStyle: z.string().optional(),
  seasonFantasyName: z.string().optional(),
  chronicleEnabled: z.boolean(),
  capitalProvinceId: z.string().optional()
});

export const RegionSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  order: z.number(),
  provinceIds: z.array(z.string()),
  progressPercent: z.number(),
  status: RegionStatusSchema,
  mapTemplateId: z.string(),
  mapRole: RegionMapRoleSchema.optional(),
  pressureLevel: z.number().optional(),
  adjacentRegionIds: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const ProvinceSchema = z.object({
  id: z.string(),
  regionId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  desiredOutcome: z.string().optional(),
  firstStep: z.string().optional(),
  estimatedEntryMinutes: z.number().optional(),
  mapSlotId: z.string().optional(),
  dueDate: z.string().optional(),
  effortLevel: z.number().optional(),
  clarityLevel: z.number().optional(),
  emotionalFrictionType: EmotionalFrictionTypeSchema.optional(),
  state: ProvinceStateSchema,
  progressStage: ProvinceProgressStageSchema,
  provinceRole: ProvinceRoleSchema.optional(),
  decompositionCount: z.number(),
  contextLinks: z.array(z.string()).optional(),
  contextNotes: z.string().optional(),
  adjacentProvinceIds: z.array(z.string()).optional(),
  frontPressureLevel: z.number().optional(),
  lastMeaningfulActionAt: z.string().optional(),
  heroMomentShownAt: z.string().optional(),
  isHotspot: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// ============================================================================
// Supporting Entities
// ============================================================================

export const DailyMoveSchema = z.object({
  id: z.string(),
  date: z.string(),
  provinceId: z.string(),
  moveType: MoveTypeSchema,
  durationMinutes: z.number(),
  result: MoveResultSchema,
  createdAt: z.string()
});

export const PlayerCheckInSchema = z.object({
  id: z.string(),
  date: z.string(),
  energyLevel: EnergyLevelSchema,
  availableMinutes: z.number(),
  emotionType: EmotionTypeSchema,
  recommendedMoveIds: z.array(z.string()).optional(),
  selectedMoveId: z.string().optional(),
  createdAt: z.string()
});

export const SiegeEventSchema = z.object({
  id: z.string(),
  provinceId: z.string(),
  triggeredAt: z.string(),
  reasonType: SiegeReasonTypeSchema,
  selectedTactic: TacticTypeSchema.optional(),
  resolvedAt: z.string().optional()
});

export const SeasonSchema = z.object({
  id: z.string(),
  title: z.string(),
  startedAt: z.string(),
  endsAt: z.string(),
  dayNumber: z.number(),
  goals: z.array(z.string()).optional(),
  score: z.number().optional(),
  timezone: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const SeasonReviewSchema = z.object({
  id: z.string(),
  seasonId: z.string(),
  workedWell: z.array(z.string()).optional(),
  mainObstacles: z.array(z.string()).optional(),
  carryForward: z.array(z.string()).optional(),
  dropList: z.array(z.string()).optional(),
  createdAt: z.string()
});

export const HeroMomentSchema = z.object({
  id: z.string(),
  type: HeroMomentTypeSchema,
  seasonId: z.string(),
  provinceId: z.string().optional(),
  triggeredAt: z.string(),
  shownAt: z.string().optional(),
  shareCardId: z.string().optional()
});

export const ChronicleEntrySchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  seasonId: z.string().optional(),
  regionId: z.string().optional(),
  provinceId: z.string().optional(),
  entryType: ChronicleEntryTypeSchema,
  title: z.string(),
  body: z.string().optional(),
  importance: ImportanceSchema,
  createdAt: z.string()
});

export const IfThenPlanSchema = z.object({
  id: z.string(),
  provinceId: z.string(),
  triggerText: z.string(),
  actionText: z.string(),
  scheduledFor: z.string().optional(),
  createdAt: z.string()
});

export const ShareCardSchema = z.object({
  id: z.string(),
  type: ShareCardTypeSchema,
  seasonId: z.string().optional(),
  generatedAt: z.string(),
  privacyMode: PrivacyModeSchema,
  payload: z.record(z.string(), z.unknown()),
  sourceSurface: z.string().optional()
});

export const PlayerProfileSchema = z.object({
  id: z.string(),
  preferredWorkWindow: z.string().optional(),
  frictionStats: z.record(z.string(), z.number()).optional(),
  streaks: z.record(z.string(), z.number()).optional(),
  totalCaptured: z.number(),
  totalClarified: z.number(),
  totalStarted: z.number(),
  totalCompleted: z.number(),
  currentSeasonId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const CapitalStateSchema = z.object({
  campaignId: z.string(),
  visualTier: z.number(),
  unlockedDecor: z.array(z.string()),
  lastViewedAt: z.string()
});

export const CampaignArchetypeStatsSchema = z.object({
  seasonId: z.string(),
  foundationCount: z.number(),
  driveCount: z.number(),
  joyCount: z.number()
});

// ============================================================================
// Events
// ============================================================================

export const EventEnvelopeSchema = z.object({
  eventName: z.string(),
  eventVersion: z.number(),
  occurredAt: z.string(),
  timezone: z.string(),
  sessionId: z.string(),
  payload: z.record(z.string(), z.unknown())
});

export const MeaningfulActionPayloadSchema = z.object({
  isMeaningfulAction: z.literal(true),
  meaningfulActionType: MeaningfulActionTypeSchema
});

// ============================================================================
// App State (for import/export)
// ============================================================================

export const AppStateSchema = z.object({
  schemaVersion: z.number(),
  campaigns: z.array(CampaignSchema),
  regions: z.array(RegionSchema),
  provinces: z.array(ProvinceSchema),
  dailyMoves: z.array(DailyMoveSchema),
  checkIns: z.array(PlayerCheckInSchema),
  siegeEvents: z.array(SiegeEventSchema),
  seasons: z.array(SeasonSchema),
  seasonReviews: z.array(SeasonReviewSchema),
  heroMoments: z.array(HeroMomentSchema),
  chronicleEntries: z.array(ChronicleEntrySchema),
  ifThenPlans: z.array(IfThenPlanSchema),
  shareCards: z.array(ShareCardSchema),
  playerProfile: PlayerProfileSchema,
  capitalStates: z.array(CapitalStateSchema),
  archetypeStats: z.array(CampaignArchetypeStatsSchema)
});

// ============================================================================
// Type exports (inferred from schemas)
// ============================================================================

export type Campaign = z.infer<typeof CampaignSchema>;
export type Region = z.infer<typeof RegionSchema>;
export type Province = z.infer<typeof ProvinceSchema>;
export type DailyMove = z.infer<typeof DailyMoveSchema>;
export type PlayerCheckIn = z.infer<typeof PlayerCheckInSchema>;
export type SiegeEvent = z.infer<typeof SiegeEventSchema>;
export type Season = z.infer<typeof SeasonSchema>;
export type SeasonReview = z.infer<typeof SeasonReviewSchema>;
export type HeroMoment = z.infer<typeof HeroMomentSchema>;
export type ChronicleEntry = z.infer<typeof ChronicleEntrySchema>;
export type IfThenPlan = z.infer<typeof IfThenPlanSchema>;
export type ShareCard = z.infer<typeof ShareCardSchema>;
export type PlayerProfile = z.infer<typeof PlayerProfileSchema>;
export type CapitalState = z.infer<typeof CapitalStateSchema>;
export type CampaignArchetypeStats = z.infer<typeof CampaignArchetypeStatsSchema>;
export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;
export type MeaningfulActionPayload = z.infer<typeof MeaningfulActionPayloadSchema>;
export type AppState = z.infer<typeof AppStateSchema>;
