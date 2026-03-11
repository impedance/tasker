/**
 * Event logger — EPIC-12-T2, T3
 * Append-only event logger in IndexedDB (via localStorage wrapper).
 * Supports logging, retrieval, and export.
 */

import { v4 as uuidv4 } from 'uuid';
import { getItem, setItem, getKeysByPrefix, removeItem } from '../../storage/storage';
import type { GameEvent, EventEnvelope } from './schema';
import { createEventEnvelope, EVENT_SCHEMA_VERSION } from './schema';

export type { EventEnvelope };

const EVENT_STORE_PREFIX = 'game_event:';
const SESSION_ID_KEY = 'game_session_id';
const MAX_EVENTS = 1000;

/**
 * Gets or creates the current session ID.
 */
function getSessionId(): string {
    const stored = localStorage.getItem(SESSION_ID_KEY);
    if (stored) {
        return stored;
    }
    const newId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, newId);
    return newId;
}

/**
 * Gets the user's timezone.
 */
function getTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

/**
 * Logs an event to the event store.
 * Non-blocking, fire-and-forget.
 */
export async function track(event: GameEvent): Promise<void> {
    try {
        const envelope = createEventEnvelope(event, getSessionId(), getTimezone());
        const eventWithId: EventEnvelope = {
            ...envelope,
            id: uuidv4(),
        };

        // Store event
        await setItem(`${EVENT_STORE_PREFIX}${eventWithId.id}`, eventWithId);

        // Rotate old events if needed
        await rotateEvents();
    } catch (error) {
        // Non-blocking: log error but don't throw
        console.error('[EventLogger] Failed to track event:', error);
    }
}

/**
 * Gets events from the store.
 */
export async function getEvents(limit?: number): Promise<EventEnvelope[]> {
    try {
        const keys = await getKeysByPrefix(EVENT_STORE_PREFIX);
        
        // Sort by occurredAt descending (newest first)
        const events: EventEnvelope[] = [];
        for (const key of keys) {
            const event = await getItem<EventEnvelope>(key);
            if (event) {
                events.push(event);
            }
        }
        
        events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
        
        if (limit) {
            return events.slice(0, limit);
        }
        
        return events;
    } catch (error) {
        console.error('[EventLogger] Failed to get events:', error);
        return [];
    }
}

/**
 * Gets events filtered by event name.
 */
export async function getEventsByName(eventName: string): Promise<EventEnvelope[]> {
    const events = await getEvents();
    return events.filter((e) => e.eventName === eventName);
}

/**
 * Gets events within a date range.
 */
export async function getEventsByDateRange(
    startDate: Date,
    endDate: Date
): Promise<EventEnvelope[]> {
    const events = await getEvents();
    const start = startDate.getTime();
    const end = endDate.getTime();
    
    return events.filter((e) => {
        const occurred = new Date(e.occurredAt).getTime();
        return occurred >= start && occurred <= end;
    });
}

/**
 * Rotates events to keep only the most recent MAX_EVENTS.
 */
async function rotateEvents(): Promise<void> {
    try {
        const keys = await getKeysByPrefix(EVENT_STORE_PREFIX);
        
        if (keys.length <= MAX_EVENTS) {
            return;
        }
        
        // Get events with timestamps
        const eventsWithTime: Array<{ key: string; occurredAt: number }> = [];
        for (const key of keys) {
            const event = await getItem<EventEnvelope>(key);
            if (event) {
                eventsWithTime.push({
                    key,
                    occurredAt: new Date(event.occurredAt).getTime(),
                });
            }
        }
        
        // Sort by occurredAt ascending (oldest first)
        eventsWithTime.sort((a, b) => a.occurredAt - b.occurredAt);
        
        // Delete oldest events
        const toDelete = eventsWithTime.slice(0, eventsWithTime.length - MAX_EVENTS);
        for (const item of toDelete) {
            await removeItem(item.key);
        }
    } catch (error) {
        console.error('[EventLogger] Failed to rotate events:', error);
    }
}

/**
 * Exports events as JSON string.
 */
export async function exportEventsJSON(): Promise<string> {
    const events = await getEvents();
    
    const exportData = {
        schemaVersion: EVENT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        timezone: getTimezone(),
        sessionId: getSessionId(),
        eventCount: events.length,
        events: events,
    };
    
    return JSON.stringify(exportData, null, 2);
}

/**
 * Exports events as CSV string.
 */
export async function exportEventsCSV(): Promise<string> {
    const events = await getEvents();
    
    // CSV header
    const headers = ['id', 'eventName', 'occurredAt', 'timezone', 'sessionId', 'payload'];
    const rows = [headers.join(',')];
    
    // CSV rows
    for (const event of events) {
        const row = [
            event.id,
            event.eventName,
            event.occurredAt,
            event.timezone,
            event.sessionId,
            JSON.stringify(event.payload).replace(/"/g, '""'), // Escape quotes
        ];
        rows.push(row.join(','));
    }
    
    return rows.join('\n');
}

/**
 * Clears all events from the store.
 */
export async function clearEvents(): Promise<void> {
    try {
        const keys = await getKeysByPrefix(EVENT_STORE_PREFIX);
        for (const key of keys) {
            await removeItem(key);
        }
    } catch (error) {
        console.error('[EventLogger] Failed to clear events:', error);
    }
}

/**
 * Downloads content as a file.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Gets event statistics.
 */
export async function getEventStats(): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    firstEventAt?: string;
    lastEventAt?: string;
}> {
    const events = await getEvents();
    
    const eventsByType: Record<string, number> = {};
    let firstEventAt: string | undefined;
    let lastEventAt: string | undefined;
    
    for (const event of events) {
        // Count by type
        eventsByType[event.eventName] = (eventsByType[event.eventName] || 0) + 1;
        
        // Track first and last
        if (!firstEventAt || event.occurredAt > firstEventAt) {
            firstEventAt = event.occurredAt;
        }
        if (!lastEventAt || event.occurredAt < lastEventAt) {
            lastEventAt = event.occurredAt;
        }
    }
    
    return {
        totalEvents: events.length,
        eventsByType,
        firstEventAt,
        lastEventAt,
    };
}
