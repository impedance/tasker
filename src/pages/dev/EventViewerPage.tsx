import { EventViewer } from '../../shared/events/event-viewer';

export default function EventViewerPage() {
    return (
        <section className="page-shell">
            <p className="eyebrow">Developer Tools</p>
            <h1>Event Stream</h1>
            <p className="lede mb-8">
                Last 50 events logged in the current session. Use this to verify instrumentation and rules.
            </p>

            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                <EventViewer limit={50} />
            </div>
        </section>
    );
}
