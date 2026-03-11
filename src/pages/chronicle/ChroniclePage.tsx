import { useEffect, useState } from 'react';
import { Panel } from '../../shared/ui/panel';
import { BookOpen, Calendar } from 'lucide-react';
import { chronicleEntryRepository } from '../../storage/repositories';
import { ChronicleEntry } from '../../entities/types';

export default function ChroniclePage() {
    const [entries, setEntries] = useState<ChronicleEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await chronicleEntryRepository.list();
            // Sort by date newest first
            setEntries(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="page-shell">Unrolling the ancient scrolls...</div>;

    return (
        <section className="page-shell">
            <p className="eyebrow flex items-center gap-2">
                <BookOpen size={14} />
                Historical Record
            </p>
            <h1>Chronicle</h1>
            <p className="lede mb-8">
                Your campaign's history, recorded through actions and milestones.
            </p>

            <div className="max-w-4xl space-y-6">
                {entries.length === 0 ? (
                    <div className="py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                        <BookOpen size={48} className="mx-auto mb-4 text-white/10" />
                        <p className="text-muted-foreground italic">The chronicle is empty. Take your first step to record history.</p>
                    </div>
                ) : (
                    entries.map((entry) => (
                        <div key={entry.id} className="relative pl-8 before:absolute before:left-0 before:top-4 before:bottom-0 before:w-px before:bg-white/10">
                            <div className="absolute left-[-4px] top-4 w-2 h-2 rounded-full bg-[#f0b35f]" />

                            <Panel className="relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-[#f0b35f]/10 text-[#f0b35f] text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                                            {entry.entryType.replace('_', ' ')}
                                        </div>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(entry.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold mb-1">{entry.title}</h3>
                                {entry.body && <p className="text-sm text-muted-foreground">{entry.body}</p>}
                            </Panel>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
