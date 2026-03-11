import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    dailyMoveRepository,
    provinceRepository
} from '../../storage/repositories';
import { DailyMove, Province } from '../../entities/types';
import {
    ArrowLeft,
    History,
    Clock,
    Search,
    Package,
    Layers,
    Flashlight,
    Sword,
    ArrowRight,
    Calendar
} from 'lucide-react';

export default function DailyOrdersHistory() {
    const navigate = useNavigate();
    const [history, setHistory] = useState<DailyMove[]>([]);
    const [provinces, setProvinces] = useState<Record<string, Province>>({});
    const [loading, setLoading] = useState(true);

    async function loadData() {
        try {
            const [h, p] = await Promise.all([
                dailyMoveRepository.list(),
                provinceRepository.list()
            ]);

            const provinceMap: Record<string, Province> = {};
            p.forEach(province => { provinceMap[province.id] = province; });

            setProvinces(provinceMap);
            setHistory(h.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const icons: Record<string, React.ReactNode> = {
        scout: <Search size={16} />,
        supply: <Package size={16} />,
        engineer: <Layers size={16} />,
        raid: <Flashlight size={16} />,
        assault: <Sword size={16} />,
        retreat: <ArrowRight size={16} />
    };

    if (loading) return <div className="page-shell flex items-center justify-center min-h-[400px]">Reviewing the chronicles...</div>;

    return (
        <section className="page-shell max-w-4xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8"
            >
                <ArrowLeft size={16} />
                Back
            </button>

            <div className="flex items-center gap-4 mb-12">
                <History className="text-[#f0b35f]" size={36} />
                <div>
                    <h1 className="text-4xl font-bold">Campaign Logs</h1>
                    <p className="text-muted-foreground">Every step recorded, every milestone preserved.</p>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="p-20 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
                    <p className="text-muted-foreground">Yesterday is unwritten. Start your first move to begin the log.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((move) => (
                        <div key={move.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#f0b35f]">
                                    {icons[move.moveType] || <History size={16} />}
                                </div>
                                <div>
                                    <h3 className="font-bold">{provinces[move.provinceId]?.title || 'Unknown Province'}</h3>
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} />
                                            {move.durationMinutes} min
                                        </span>
                                        <span>•</span>
                                        <span>{move.moveType}</span>
                                        <span>•</span>
                                        <span className="text-[#f0b35f]">{move.result}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground font-mono">
                                    <Calendar size={10} />
                                    {new Date(move.createdAt).toLocaleDateString()}
                                </div>
                                <div className="text-[10px] text-muted-foreground/60">{new Date(move.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
