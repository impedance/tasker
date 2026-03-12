/**
 * Repository implementations for domain entities
 * Provides CRUD operations and relationship queries
 *
 * This is a barrel export file that re-exports all repository modules
 * to preserve the existing import API: `from '../storage/repositories'`
 */

export { campaignRepository } from './campaign-repository';
export { regionRepository } from './region-repository';
export { provinceRepository } from './province-repository';
export { dailyMoveRepository } from './daily-move-repository';
export { playerCheckInRepository } from './player-check-in-repository';
export { playerProfileRepository } from './player-profile-repository';
export { seasonRepository } from './season-repository';
export { siegeEventRepository } from './siege-event-repository';
export { ifThenPlanRepository } from './if-then-plan-repository';
export { seasonReviewRepository } from './season-review-repository';
export { heroMomentRepository } from './hero-moment-repository';
export { chronicleEntryRepository } from './chronicle-entry-repository';
export { shareCardRepository } from './share-card-repository';
export { capitalStateRepository } from './capital-state-repository';
export { campaignArchetypeStatsRepository } from './campaign-archetype-stats-repository';
