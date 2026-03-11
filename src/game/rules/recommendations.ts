/**
 * Daily Orders recommendation algorithm — EPIC-08-T2
 * Rule-based algorithm to pick 3 daily moves (light/medium/main).
 *
 * Candidate pool: fog/ready/sieged/in_progress provinces
 * Rules:
 *   - One light (~5 min): scout/supply
 *   - One medium (~15 min): engineer/raid
 *   - One main (25+ min): assault
 *
 * Adjust by check-in:
 *   - low energy → bias toward scout/supply
 *   - 5 min available → only light moves
 *
 * Tie-breakers:
 *   - recency (prefer untouched provinces)
 *   - dueDate (if any)
 *   - history (prefer provinces with past success)
 *
 * Soft anti-exploit:
 *   - If province in "prepare loop" (supply/decompose >3 times without start), bias toward raid or retreat
 */

import type { Province, PlayerCheckIn, DailyMove, EnergyLevel } from '../../entities/types';
import type { MoveType } from '../../entities/types';
import { getPreferredActionsForRole } from './roles';
import { isFog } from './fog';

export interface DailyOrder {
    /** Province to act on */
    provinceId: string;
    /** Recommended move type */
    moveType: MoveType;
    /** Estimated duration in minutes */
    durationMinutes: number;
    /** Order category */
    orderType: 'light' | 'medium' | 'main';
    /** Human-readable explanation of why this move is recommended */
    why: string;
    /** Province title for display */
    provinceTitle: string;
}

export interface RecommendationContext {
    provinces: Province[];
    checkIn: PlayerCheckIn | null;
    history: DailyMove[];
    now: Date;
}

/**
 * Generates 3 daily orders (light, medium, main) based on province state and check-in.
 */
export function getDailyOrders(context: RecommendationContext): DailyOrder[] {
    const { provinces, checkIn, history, now } = context;

    // Filter candidate provinces (fog/ready/sieged/in_progress)
    const candidates = provinces.filter((p) =>
        ['fog', 'ready', 'siege', 'in_progress'].includes(p.state)
    );

    if (candidates.length === 0) {
        return [];
    }

    // Determine available minutes and energy
    const availableMinutes = checkIn?.availableMinutes ?? 25;
    const energyLevel = checkIn?.energyLevel ?? 'medium';

    // Generate orders based on available time
    const orders: DailyOrder[] = [];

    // Light order (~5 min): scout/supply
    const lightOrder = generateLightOrder(candidates, history, energyLevel, now);
    if (lightOrder && availableMinutes >= 5) {
        orders.push(lightOrder);
    }

    // Medium order (~15 min): engineer/raid
    const mediumOrder = generateMediumOrder(candidates, history, energyLevel, now);
    if (mediumOrder && availableMinutes >= 15) {
        orders.push(mediumOrder);
    }

    // Main order (25+ min): assault
    const mainOrder = generateMainOrder(candidates, history, now);
    if (mainOrder && availableMinutes >= 25) {
        orders.push(mainOrder);
    }

    // If we couldn't generate enough orders, fill with what we can
    if (orders.length === 0 && candidates.length > 0) {
        // At minimum, suggest something
        const fallback = generateFallbackOrder(candidates[0], energyLevel);
        orders.push(fallback);
    }

    return orders.slice(0, 3);
}

/**
 * Generates a light order (~5 min): scout or supply.
 */
function generateLightOrder(
    candidates: Province[],
    history: DailyMove[],
    energyLevel: EnergyLevel,
    now: Date
): DailyOrder | null {
    // Bias toward scout for low energy
    const preferredMoveType: MoveType = energyLevel === 'low' ? 'scout' : 'supply';

    // Score provinces for light move
    const scored = candidates
        .map((p) => scoreProvinceForLightMove(p, history, now))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
        return null;
    }

    const top = scored[0];
    const moveType = top.preferredMoveType || preferredMoveType;

    return {
        provinceId: top.province.id,
        moveType,
        durationMinutes: 5,
        orderType: 'light',
        why: generateWhyExplanation(top.province, moveType, 'light'),
        provinceTitle: top.province.title,
    };
}

/**
 * Generates a medium order (~15 min): engineer or raid.
 */
function generateMediumOrder(
    candidates: Province[],
    history: DailyMove[],
    energyLevel: EnergyLevel,
    now: Date
): DailyOrder | null {
    // For low energy, prefer engineer over raid
    const preferredMoveType: MoveType = energyLevel === 'low' ? 'engineer' : 'raid';

    // Score provinces for medium move
    const scored = candidates
        .map((p) => scoreProvinceForMediumMove(p, history, now))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
        return null;
    }

    const top = scored[0];
    const moveType = top.preferredMoveType || preferredMoveType;

    return {
        provinceId: top.province.id,
        moveType,
        durationMinutes: 15,
        orderType: 'medium',
        why: generateWhyExplanation(top.province, moveType, 'medium'),
        provinceTitle: top.province.title,
    };
}

/**
 * Generates a main order (25+ min): assault.
 */
function generateMainOrder(
    candidates: Province[],
    history: DailyMove[],
    now: Date
): DailyOrder | null {
    // Score provinces for main move
    const scored = candidates
        .map((p) => scoreProvinceForMainMove(p, history, now))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
        return null;
    }

    const top = scored[0];

    return {
        provinceId: top.province.id,
        moveType: 'assault',
        durationMinutes: 25,
        orderType: 'main',
        why: generateWhyExplanation(top.province, 'assault', 'main'),
        provinceTitle: top.province.title,
    };
}

/**
 * Generates a fallback order when no specific order can be generated.
 */
function generateFallbackOrder(province: Province, energyLevel: EnergyLevel): DailyOrder {
    const moveType: MoveType = energyLevel === 'low' ? 'scout' : 'supply';
    return {
        provinceId: province.id,
        moveType,
        durationMinutes: 5,
        orderType: 'light',
        why: `Start with a quick ${moveType} action to build momentum.`,
        provinceTitle: province.title,
    };
}

interface ScoredProvince {
    province: Province;
    score: number;
    preferredMoveType?: MoveType;
}

/**
 * Scores a province for a light move (scout/supply).
 */
function scoreProvinceForLightMove(
    province: Province,
    history: DailyMove[],
    now: Date
): ScoredProvince {
    let score = 0;
    let preferredMoveType: MoveType | undefined;

    // Fog provinces need clarification (scout)
    if (isFog(province)) {
        score += 10;
        preferredMoveType = 'scout';
    }

    // Siege provinces can use supply
    if (province.state === 'siege') {
        score += 8;
        preferredMoveType = 'supply';
    }

    // Ready provinces can use supply
    if (province.state === 'ready') {
        score += 5;
        preferredMoveType = 'supply';
    }

    // Recency bonus (no recent moves)
    const recentMoves = getProvinceMovesLastDays(province.id, history, now, 3);
    if (recentMoves === 0) {
        score += 5;
    }

    // Due date urgency
    if (province.dueDate) {
        const daysUntilDue = daysUntil(new Date(province.dueDate), now);
        if (daysUntilDue <= 3) {
            score += 10;
        }
    }

    // Role preference
    const roleActions = getPreferredActionsForRole(province.provinceRole);
    if (roleActions.includes('clarify') || roleActions.includes('supply')) {
        score += 3;
    }

    // Anti-exploit: prepare loop detection
    if (isInPrepareLoop(province, history)) {
        score -= 5; // Deprioritize
    }

    return { province, score, preferredMoveType };
}

/**
 * Scores a province for a medium move (engineer/raid).
 */
function scoreProvinceForMediumMove(
    province: Province,
    history: DailyMove[],
    now: Date
): ScoredProvince {
    let score = 0;
    let preferredMoveType: MoveType | undefined;

    // Siege provinces are good for raid (break siege)
    if (province.state === 'siege') {
        score += 12;
        preferredMoveType = 'raid';
    }

    // Ready provinces with high effort need decomposition
    if (province.state === 'ready' && (province.effortLevel ?? 0) >= 4) {
        score += 10;
        preferredMoveType = 'engineer';
    }

    // Recency bonus
    const recentMoves = getProvinceMovesLastDays(province.id, history, now, 5);
    if (recentMoves === 0) {
        score += 5;
    }

    // Due date urgency
    if (province.dueDate) {
        const daysUntilDue = daysUntil(new Date(province.dueDate), now);
        if (daysUntilDue <= 5) {
            score += 8;
        }
    }

    // Anti-exploit: prepare loop detection
    if (isInPrepareLoop(province, history)) {
        // Bias toward raid or retreat
        preferredMoveType = 'raid';
        score += 5;
    }

    return { province, score, preferredMoveType };
}

/**
 * Scores a province for a main move (assault).
 */
function scoreProvinceForMainMove(
    province: Province,
    history: DailyMove[],
    now: Date
): ScoredProvince {
    let score = 0;

    // In-progress provinces are ready for assault
    if (province.state === 'in_progress') {
        score += 15;
    }

    // Ready provinces with low effort can be assaulted
    if (province.state === 'ready' && (province.effortLevel ?? 0) <= 2) {
        score += 10;
    }

    // Recency bonus
    const recentMoves = getProvinceMovesLastDays(province.id, history, now, 7);
    if (recentMoves === 0) {
        score += 5;
    }

    // Due date urgency
    if (province.dueDate) {
        const daysUntilDue = daysUntil(new Date(province.dueDate), now);
        if (daysUntilDue <= 7) {
            score += 10;
        }
    }

    // History bonus (past success with this province)
    const pastSuccesses = getProvinceSuccessCount(province.id, history);
    if (pastSuccesses > 0) {
        score += 5;
    }

    return { province, score };
}

/**
 * Generates a human-readable explanation for why a move is recommended.
 */
function generateWhyExplanation(
    province: Province,
    moveType: MoveType,
    _orderType: string
): string {
    const reasons: string[] = [];

    // State-based reasons
    if (isFog(province)) {
        reasons.push('needs clarification');
    } else if (province.state === 'siege') {
        reasons.push('under siege');
    } else if (province.state === 'in_progress') {
        reasons.push('already in progress');
    } else if (province.state === 'ready') {
        reasons.push('ready for action');
    }

    // Effort-based reasons
    if ((province.effortLevel ?? 0) >= 4) {
        reasons.push('high effort required');
    }

    // Due date reasons
    if (province.dueDate) {
        const days = daysUntil(new Date(province.dueDate), new Date());
        if (days <= 3) {
            reasons.push('due soon');
        }
    }

    // Move type description
    const moveDescriptions: Record<MoveType, string> = {
        scout: 'Clarify the target and define next steps',
        supply: 'Gather resources and context',
        engineer: 'Break down into smaller pieces',
        raid: 'Take a quick action to build momentum',
        assault: 'Commit to completing the task',
        retreat: 'Defer to a better time',
    };

    const baseReason = reasons.length > 0 ? reasons.join(', ') : 'good candidate';
    return `${province.title}: ${baseReason}. ${moveDescriptions[moveType]}`;
}

/**
 * Gets the number of moves for a province in the last N days.
 */
function getProvinceMovesLastDays(
    provinceId: string,
    history: DailyMove[],
    now: Date,
    days: number
): number {
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return history.filter(
        (m) => m.provinceId === provinceId && new Date(m.createdAt) >= cutoff
    ).length;
}

/**
 * Checks if a province is in a "prepare loop" (supply/decompose >3 times without start).
 */
function isInPrepareLoop(province: Province, history: DailyMove[]): boolean {
    const provinceMoves = history.filter((m) => m.provinceId === province.id);
    const prepareMoves = provinceMoves.filter(
        (m) => m.moveType === 'supply' || m.moveType === 'engineer'
    );
    const startMoves = provinceMoves.filter(
        (m) => m.moveType === 'raid' || m.moveType === 'assault'
    );

    return prepareMoves.length > 3 && startMoves.length === 0;
}

/**
 * Gets the count of successful completions for a province.
 */
function getProvinceSuccessCount(provinceId: string, history: DailyMove[]): number {
    return history.filter(
        (m) => m.provinceId === provinceId && m.result === 'completed'
    ).length;
}

/**
 * Computes days until a target date.
 */
function daysUntil(target: Date, from: Date): number {
    const diffMs = target.getTime() - from.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
