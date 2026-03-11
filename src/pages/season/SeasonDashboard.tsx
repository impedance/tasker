import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { seasonRepository } from '../../storage/repositories';
import { Season } from '../../entities/types';
import {
    getSeasonDayNumber,
    getSeasonPhase,
    getSeasonProgress,
    SEASON_LENGTH_DAYS
} from '../../game/rules/season';
import {
    Calendar,
    Compass,
    Trophy,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { seasonHints, SeasonPhase } from '../../shared/copy/season-hints';

export default function SeasonDashboard() {
    const navigate = useNavigate();
    const [season, setSeason] = useState<Season | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const seasons = await seasonRepository.list();
            if (seasons.length > 0) {
                setSeason(seasons[seasons.length - 1]);
            }
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="page-shell flex items-center justify-center min-h-[400px]">Synchronizing celestial bodies...</div>;
    if (!season) return <div className="page-shell">No active season found.</div>;

    const dayNumber = getSeasonDayNumber(season);
    const phase = getSeasonPhase(season) as SeasonPhase;
    const progress = getSeasonProgress(season);

    const hint = seasonHints[phase];

    return (
        <section className="page-shell max-w-5xl mx-auto">
            <header className="mb-12">
                <p className="eyebrow">Strategic Overview</p>
                <h1 className="text-4xl font-bold flex items-center gap-4">
                    {season.title}
                    <span className="text-sm font-normal text-muted-foreground px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        Day {dayNumber} of {SEASON_LENGTH_DAYS}
                    </span>
                </h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 space-y-8">
                    {/* Phase Hint Card */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className={hint.color} size={24} />
                                <h2 className={`text-2xl font-black uppercase tracking-tighter ${hint.color}`}>{hint.title}</h2>
                            </div>
                            <p className="text-xl leading-relaxed text-[#f8f4ea]/80 max-w-2xl italic mb-8">
                                "{hint.text}"
                            </p>
                            <button
                                onClick={() => navigate('/map')}
                                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#f0b35f] hover:text-[#f0c38f] transition-all"
                            >
                                Go to the Front
                                <ArrowRight size={16} />
                            </button>
                        </div>

                        {/* Visual background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f0b35f]/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-[#f0b35f]/10 transition-all duration-700" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatCard
                            icon={<Compass size={20} />}
                            title="Current Phase"
                            value={phase.charAt(0).toUpperCase() + phase.slice(1)}
                            description="Determines priority hints"
                        />
                        <StatCard
                            icon={<Calendar size={20} />}
                            title="Time Remaining"
                            value={`${SEASON_LENGTH_DAYS - dayNumber} Days`}
                            description="Until season summary"
                        />
                    </div>
                </div>

                <div className="lg:col-span-1 border-l border-white/5 pl-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Season Progress</h3>

                    <div className="relative w-full aspect-square flex items-center justify-center mb-8">
                        <svg className="w-full h-full -rotate-90">
                            <circle
                                cx="50%" cy="50%" r="45%"
                                className="stroke-white/5 fill-none"
                                strokeWidth="8"
                            />
                            <circle
                                cx="50%" cy="50%" r="45%"
                                className="stroke-[#f0b35f] fill-none transition-all duration-1000 ease-out"
                                strokeWidth="8"
                                strokeDasharray={`${progress * 2.82} 282`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black">{progress}%</span>
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Captured</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/season-summary')}
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all group"
                    >
                        <Trophy size={18} className="text-[#f0b35f] group-hover:scale-110 transition-transform" />
                        <span className="font-bold">Season Summary</span>
                    </button>
                </div>
            </div>
        </section>
    );
}

function StatCard({
    icon,
    title,
    value,
    description
}: {
    icon: React.ReactNode,
    title: string,
    value: string,
    description: string
}) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#f0b35f]/10 text-[#f0b35f] flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
                <p className="text-xl font-bold mb-1">{value}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
