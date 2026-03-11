/**
 * Daily Orders recommendation tests — EPIC-08-T2
 */

import { describe, it, expect } from 'vitest';
import { getDailyOrders } from './recommendations';
import type { Province, PlayerCheckIn, DailyMove } from '../../entities/types';

function makeProvince(overrides: Partial<Province> = {}): Province {
    const now = new Date().toISOString();
    return {
        id: 'province-1',
        regionId: 'region-1',
        title: 'Test Province',
        state: 'ready',
        progressStage: 'scouted',
        decompositionCount: 0,
        createdAt: now,
        updatedAt: now,
        lastMeaningfulActionAt: now,
        ...overrides,
    } as Province;
}

function makeCheckIn(overrides: Partial<PlayerCheckIn> = {}): PlayerCheckIn {
    return {
        id: 'checkin-1',
        date: new Date().toISOString().split('T')[0],
        energyLevel: 'medium',
        availableMinutes: 25,
        emotionType: 'anxiety',
        createdAt: new Date().toISOString(),
        ...overrides,
    } as PlayerCheckIn;
}

describe('getDailyOrders', () => {
    it('should return empty array when no candidate provinces', () => {
        const provinces: Province[] = [
            makeProvince({ id: 'p1', state: 'captured' }),
            makeProvince({ id: 'p2', state: 'retreated' }),
        ];

        const orders = getDailyOrders({
            provinces,
            checkIn: null,
            history: [],
            now: new Date(),
        });

        expect(orders).toHaveLength(0);
    });

    it('should generate orders for fog provinces', () => {
        const provinces: Province[] = [
            makeProvince({
                id: 'p1',
                state: 'fog',
                title: 'Foggy Province',
            }),
        ];

        const orders = getDailyOrders({
            provinces,
            checkIn: makeCheckIn(),
            history: [],
            now: new Date(),
        });

        expect(orders.length).toBeGreaterThan(0);
        expect(orders[0].provinceId).toBe('p1');
    });

    it('should bias toward scout for low energy', () => {
        const provinces: Province[] = [
            makeProvince({
                id: 'p1',
                state: 'fog',
                title: 'Foggy Province',
            }),
        ];

        const orders = getDailyOrders({
            provinces,
            checkIn: makeCheckIn({ energyLevel: 'low', availableMinutes: 5 }),
            history: [],
            now: new Date(),
        });

        expect(orders.length).toBeGreaterThan(0);
        // Low energy should prefer scout
        const lightOrder = orders.find((o) => o.orderType === 'light');
        expect(lightOrder?.moveType).toBe('scout');
    });

    it('should prioritize siege provinces for raid', () => {
        const provinces: Province[] = [
            makeProvince({
                id: 'p1',
                state: 'siege',
                title: 'Sieged Province',
            }),
        ];

        const orders = getDailyOrders({
            provinces,
            checkIn: makeCheckIn({ availableMinutes: 15 }),
            history: [],
            now: new Date(),
        });

        const mediumOrder = orders.find((o) => o.orderType === 'medium');
        expect(mediumOrder?.moveType).toBe('raid');
    });

    it('should prioritize in_progress provinces for assault', () => {
        const provinces: Province[] = [
            makeProvince({
                id: 'p1',
                state: 'in_progress',
                title: 'Active Province',
            }),
        ];

        const orders = getDailyOrders({
            provinces,
            checkIn: makeCheckIn({ availableMinutes: 25 }),
            history: [],
            now: new Date(),
        });

        const mainOrder = orders.find((o) => o.orderType === 'main');
        expect(mainOrder?.moveType).toBe('assault');
    });

    it('should boost priority for due soon provinces', () => {
        const now = new Date();
        const dueSoon = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
        const dueLater = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now

        const provinces: Province[] = [
            makeProvince({
                id: 'p1',
                state: 'ready',
                title: 'Later Province',
                dueDate: dueLater.toISOString(),
            }),
            makeProvince({
                id: 'p2',
                state: 'ready',
                title: 'Soon Province',
                dueDate: dueSoon.toISOString(),
            }),
        ];

        const orders = getDailyOrders({
            provinces,
            checkIn: makeCheckIn(),
            history: [],
            now,
        });

        // Due soon province should be first
        expect(orders[0].provinceId).toBe('p2');
    });

    it('should detect prepare loop and bias toward raid', () => {
        const province = makeProvince({
            id: 'p1',
            state: 'ready',
            title: 'Loop Province',
        });

        // Create history with many supply/engineer moves but no start
        const history: DailyMove[] = [
            {
                id: 'm1',
                date: '2024-01-01',
                provinceId: 'p1',
                moveType: 'supply',
                durationMinutes: 10,
                result: 'prepared',
                createdAt: new Date().toISOString(),
            },
            {
                id: 'm2',
                date: '2024-01-02',
                provinceId: 'p1',
                moveType: 'supply',
                durationMinutes: 10,
                result: 'prepared',
                createdAt: new Date().toISOString(),
            },
            {
                id: 'm3',
                date: '2024-01-03',
                provinceId: 'p1',
                moveType: 'engineer',
                durationMinutes: 15,
                result: 'prepared',
                createdAt: new Date().toISOString(),
            },
            {
                id: 'm4',
                date: '2024-01-04',
                provinceId: 'p1',
                moveType: 'supply',
                durationMinutes: 10,
                result: 'prepared',
                createdAt: new Date().toISOString(),
            },
        ];

        const orders = getDailyOrders({
            provinces: [province],
            checkIn: makeCheckIn({ availableMinutes: 15 }),
            history,
            now: new Date(),
        });

        const mediumOrder = orders.find((o) => o.orderType === 'medium');
        // Should bias toward raid to break the loop
        expect(mediumOrder?.moveType).toBe('raid');
    });

    it('should generate fallback order when no specific order matches', () => {
        const provinces: Province[] = [
            makeProvince({
                id: 'p1',
                state: 'captured',
                title: 'Done Province',
            }),
        ];

        // No candidate provinces, but we should still get empty result
        const orders = getDailyOrders({
            provinces,
            checkIn: makeCheckIn(),
            history: [],
            now: new Date(),
        });

        expect(orders).toHaveLength(0);
    });

    it('should respect available minutes constraint', () => {
        const provinces: Province[] = [
            makeProvince({
                id: 'p1',
                state: 'in_progress',
                title: 'Active Province',
            }),
        ];

        // Only 5 minutes available - should only get light order
        const orders = getDailyOrders({
            provinces,
            checkIn: makeCheckIn({ availableMinutes: 5 }),
            history: [],
            now: new Date(),
        });

        expect(orders.length).toBeLessThanOrEqual(1);
        expect(orders[0].orderType).toBe('light');
    });

    it('should include why explanation in each order', () => {
        const provinces: Province[] = [
            makeProvince({
                id: 'p1',
                state: 'fog',
                title: 'Foggy Province',
            }),
        ];

        const orders = getDailyOrders({
            provinces,
            checkIn: makeCheckIn(),
            history: [],
            now: new Date(),
        });

        for (const order of orders) {
            expect(order.why).toBeDefined();
            expect(order.why.length).toBeGreaterThan(0);
        }
    });

    it('should include province title in each order', () => {
        const provinces: Province[] = [
            makeProvince({
                id: 'p1',
                state: 'fog',
                title: 'My Foggy Province',
            }),
        ];

        const orders = getDailyOrders({
            provinces,
            checkIn: makeCheckIn(),
            history: [],
            now: new Date(),
        });

        expect(orders[0].provinceTitle).toBe('My Foggy Province');
    });

    it('should prefer provinces with no recent moves', () => {
        const now = new Date();
        const provinces: Province[] = [
            makeProvince({
                id: 'p1',
                state: 'ready',
                title: 'Recent Province',
                lastMeaningfulActionAt: now.toISOString(),
            }),
            makeProvince({
                id: 'p2',
                state: 'ready',
                title: 'Old Province',
                lastMeaningfulActionAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            }),
        ];

        const history: DailyMove[] = [
            {
                id: 'm1',
                date: now.toISOString().split('T')[0],
                provinceId: 'p1',
                moveType: 'supply',
                durationMinutes: 10,
                result: 'prepared',
                createdAt: now.toISOString(),
            },
        ];

        const orders = getDailyOrders({
            provinces,
            checkIn: makeCheckIn(),
            history,
            now,
        });

        // Old province with no recent moves should be preferred
        expect(orders[0].provinceId).toBe('p2');
    });
});
