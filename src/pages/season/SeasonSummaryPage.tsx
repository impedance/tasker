import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    provinceRepository,
    siegeEventRepository
} from '../../storage/repositories';
import { computeSeasonSummary, SeasonSummary } from '../../game/rules/season-stats';
import { ArrowLeft, Trophy, Target, Zap, ShieldAlert, PieChart } from 'lucide-react';

export default function SeasonSummaryPage() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState<SeasonSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [provinces, sieges] = await Promise.all([
                provinceRepository.list(),
                siegeEventRepository.list(),
            ]);

            if (provinces.length > 0) {
                // In a real app, we'd filter provinces by seasonId
                const stats = computeSeasonSummary(provinces, sieges, null);
                setSummary(stats);
            }
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="page-shell flex items-center justify-center min-h-[400px]">Auditing the chronicles...</div>;
    if (!summary) return <div className="page-shell">No summary data available. Capture some provinces first!</div>;

    return (
        <section className="page-shell max-w-4xl mx-auto pb-20">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8"
            >
                <ArrowLeft size={16} />
                Back
            </button>

            <header className="text-center mb-16">
                <div className="w-20 h-20 rounded-full bg-[#f0b35f]/10 text-[#f0b35f] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#f0b35f]/20">
                    <Trophy size={40} />
                </div>
                <h1 className="text-5xl font-black tracking-tighter mb-2">Season Debrief</h1>
                <p className="text-xl text-muted-foreground">Tactical performance audit and strategic milestones.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                <SummaryStat label="Clarified" value={summary.clarified} icon={<Zap size={16} />} color="text-blue-400" />
                <SummaryStat label="Captured" value={summary.completed} icon={<Trophy size={16} />} color="text-amber-400" />
                <SummaryStat label="Sieges Broken" value={summary.siegesResolved} icon={<ShieldAlert size={16} />} color="text-red-400" />
                <SummaryStat label="Days Active" value={summary.meaningfulDays} icon={<PieChart size={16} />} color="text-purple-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <section className="p-8 rounded-3xl bg-white/5 border border-white/10">
                        <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <Target className="text-[#f0b35f]" />
                            Front Line Status
                        </h2>

                        <div className="space-y-6">
                            <ProgressBar label="Campaign Progress" progress={(summary.completed / summary.totalProvinces) * 100} color="bg-[#f0b35f]" />
                            <ProgressBar label="Front Momentum" progress={(summary.inProgress / summary.totalProvinces) * 100} color="bg-blue-400" />
                            <ProgressBar label="Strategic Depth" progress={(summary.clarified / summary.totalProvinces) * 100} color="bg-purple-400" />
                        </div>
                    </section>

                    <section className="p-8 rounded-3xl bg-white/5 border border-white/10">
                        <h3 className="text-lg font-bold mb-4">Commander's Commentary</h3>
                        <p className="text-muted-foreground italic leading-relaxed">
                            "The campaign has seen significant movement in the northern regions. {summary.siegesResolved} successful siege resolutions indicate strong tactical flexibility. Future operations should focus on consolidating in-progress territories before the next seasonal shift."
                        </p>
                    </section>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <section className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center h-full flex flex-col justify-center">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Archetype Balance</h3>
                        <div className="flex flex-col gap-8">
                            <ArchetypeScore label="Foundation" score={summary.archetypeBalance.foundation} color="bg-blue-500" />
                            <ArchetypeScore label="Drive" score={summary.archetypeBalance.drive} color="bg-amber-500" />
                            <ArchetypeScore label="Joy" score={summary.archetypeBalance.joy} color="bg-red-500" />
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
}

function SummaryStat({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 ${color}`}>
                {icon}
                {label}
            </div>
            <div className="text-3xl font-black">{value}</div>
        </div>
    );
}

function ProgressBar({ label, progress, color }: { label: string, progress: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span>{label}</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-1000`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

function ArchetypeScore({ label, score, color }: { label: string, score: number, color: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full ${color} mb-2 shadow-lg opacity-80 flex items-center justify-center font-black text-white`}>
                {score}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        </div>
    );
}
