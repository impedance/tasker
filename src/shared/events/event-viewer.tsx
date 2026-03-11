/**
 * Debug event viewer — EPIC-12-T4
 * Dev-only component to view last 50 events.
 * Only visible when VITE_DEV_MODE=true.
 */

import { useState, useEffect } from 'react';
import { getEvents, getEventStats, type EventEnvelope } from './event-logger';

interface EventViewerProps {
    /** Max events to show (default 50) */
    limit?: number;
}

export function EventViewer({ limit = 50 }: EventViewerProps) {
    const [events, setEvents] = useState<EventEnvelope[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [stats, setStats] = useState<{ totalEvents: number; eventsByType: Record<string, number> } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
        loadStats();
    }, []);

    async function loadEvents() {
        const allEvents = await getEvents(limit);
        setEvents(allEvents);
        setLoading(false);
    }

    async function loadStats() {
        const statsData = await getEventStats();
        setStats({
            totalEvents: statsData.totalEvents,
            eventsByType: statsData.eventsByType,
        });
    }

    function getUniqueEventNames(): string[] {
        const names = new Set(events.map((e) => e.eventName));
        return Array.from(names).sort();
    }

    function getFilteredEvents(): EventEnvelope[] {
        if (filter === 'all') {
            return events;
        }
        return events.filter((e) => e.eventName === filter);
    }

    function formatPayload(payload: Record<string, unknown>): string {
        try {
            return JSON.stringify(payload, null, 2);
        } catch {
            return String(payload);
        }
    }

    if (loading) {
        return <div className="p-4">Loading events...</div>;
    }

    const filteredEvents = getFilteredEvents();
    const uniqueNames = getUniqueEventNames();

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Event Debug Viewer</h1>
            
            {/* Stats */}
            {stats && (
                <div className="mb-4 p-4 bg-gray-100 rounded">
                    <p className="font-semibold">Total Events: {stats.totalEvents}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(stats.eventsByType).map(([name, count]) => (
                            <span
                                key={name}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                            >
                                {name}: {count}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Filter by event type:</label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border rounded px-3 py-2"
                >
                    <option value="all">All ({events.length})</option>
                    {uniqueNames.map((name) => (
                        <option key={name} value={name}>
                            {name} ({events.filter((e) => e.eventName === name).length})
                        </option>
                    ))}
                </select>
            </div>

            {/* Events list */}
            <div className="space-y-2">
                {filteredEvents.length === 0 ? (
                    <p className="text-gray-500">No events found.</p>
                ) : (
                    filteredEvents.map((event) => (
                        <div
                            key={event.id}
                            className="border rounded p-3 bg-white shadow-sm"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-mono text-sm font-bold text-blue-600">
                                        {event.eventName}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-2">
                                        {new Date(event.occurredAt).toLocaleString()}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-400">
                                    Session: {event.sessionId.slice(0, 8)}...
                                </span>
                            </div>
                            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                                {formatPayload(event.payload)}
                            </pre>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default EventViewer;
