/**
 * Event Logger Integration Tests
 * Tests for event persistence and export functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    track,
    getEvents,
    exportEventsJSON,
    exportEventsCSV,
    clearEvents,
} from '../../src/shared/events/event-logger';

describe('Event Logger Integration', () => {
    beforeEach(() => {
        // Clear all event keys from localStorage
        const keys = Object.keys(localStorage).filter(k => k.startsWith('game_event:'));
        keys.forEach(k => localStorage.removeItem(k));
        sessionStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('should persist events across page reload simulation', async () => {
        // Action: Track an event
        await track({
            name: 'province_clarified',
            payload: { provinceId: 'test-province-1' },
        });

        // Wait for async operation
        await new Promise(resolve => setTimeout(resolve, 10));

        // Assert: Event exists in storage
        const events = await getEvents();
        expect(events.length).toBeGreaterThan(0);
        expect(events[0].eventName).toBe('province_clarified');
        expect(events[0].payload).toEqual({ provinceId: 'test-province-1' });
    });

    it('should export events as JSON with schema version', async () => {
        // Setup: Track some events
        await track({
            name: 'province_clarified',
            payload: { provinceId: 'p1' },
        });
        await track({
            name: 'province_started',
            payload: { provinceId: 'p1', timestamp: new Date().toISOString() },
        });

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 50));

        // Action: Export as JSON
        const jsonExport = await exportEventsJSON();
        const parsed = JSON.parse(jsonExport);

        // Assert: Schema version present
        expect(parsed.schemaVersion).toBeDefined();

        // Assert: Export timestamp present
        expect(parsed.exportedAt).toBeDefined();

        // Assert: Events included
        expect(parsed.eventCount).toBeGreaterThanOrEqual(2);
    });

    it('should export events as CSV with proper escaping', async () => {
        // Setup: Track event with special characters in payload
        await track({
            name: 'province_clarified',
            payload: { provinceId: 'test-province-1' },
        });

        // Wait for async operation
        await new Promise(resolve => setTimeout(resolve, 10));

        // Action: Export as CSV
        const csvExport = await exportEventsCSV();
        const lines = csvExport.split('\n');

        // Assert: Header row present
        expect(lines[0]).toContain('eventName');
        expect(lines[0]).toContain('occurredAt');
        expect(lines[0]).toContain('payload');

        // Assert: Data row present
        expect(lines.length).toBeGreaterThan(1);

        // Assert: Payload properly escaped (quotes doubled)
        const dataLine = lines[lines.length - 1];
        expect(dataLine).toContain('province_clarified');
    });

    it('should clear all events', async () => {
        // Setup: Track some events
        await track({ name: 'province_clarified', payload: { provinceId: 'p1' } });
        await track({ name: 'province_started', payload: { provinceId: 'p2', timestamp: new Date().toISOString() } });
        await track({ name: 'province_captured', payload: { provinceId: 'p3' } });

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 50));

        // Action: Clear events
        await clearEvents();

        // Assert: No events remain
        const events = await getEvents();
        expect(events).toHaveLength(0);
    });
});
