import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/button';
import { Panel } from '../../shared/ui/panel';
import { Sparkles, Map, BookOpen, Trophy, Shield, Zap as ZapIcon } from 'lucide-react';
import { loadCapitalData, getCapitalTierInfo, type CapitalData } from '../../features/capital';
import type { Province } from '../../entities/types';
import { getStreakStatusMessage } from '../../game/rules/streak';
import { seasonHints } from '../../shared/copy/season-hints';

export default function CapitalPage() {
    const navigate = useNavigate();
    const [capitalData, setCapitalData] = useState<CapitalData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const result = await loadCapitalData();
            
            if ('error' in result) {
                setError(result.error.message);
            } else {
                setCapitalData(result.data);
            }
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="page-shell">Consulting the war mappers...</div>;
    if (error) return <div className="page-shell">{error}</div>;
    if (!capitalData) return <div className="page-shell">No active campaign found. Start one to see your capital.</div>;

    const { campaign, stats, capitalState, hotspots, streakState, seasonPhase } = capitalData;
    const tier = getCapitalTierInfo(capitalState?.visualTier);
    const streakMessage = getStreakStatusMessage(streakState);
    const hint = seasonHints[seasonPhase as keyof typeof seasonHints] || seasonHints.early;

    return (
        <section className="page-shell">
            <p className="eyebrow flex items-center gap-2">
                <Trophy size={14} />
                Campaign Foothold: {campaign.seasonFantasyName || 'Season 1'}
            </p>
            <h1>{campaign.title}</h1>
            <p className="lede mb-8">
                Your strategic hub. Review the front situation and plan your next campaign move.
            </p>

            {/* Weekly Focus Hint Banner */}
            <div className={`mb-8 p-6 rounded-2xl bg-white/5 border-l-4 ${hint.color.replace('text-', 'border-')} flex items-center justify-between group`}>
                <div className="flex items-center gap-4">
                    <Sparkles className={hint.color} size={24} />
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${hint.color}`}>{hint.title}</p>
                        <p className="text-white/80 italic text-sm">"{hint.text}"</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/season')}
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
                >
                    Details
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Situation Summary */}
                <Panel title="Front Situation" className="md:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold">{stats.fog}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Fog</p>
                        </div>
                        <div className="text-center border-l border-white/5">
                            <p className="text-3xl font-bold text-red-400">{stats.siege}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Sieges</p>
                        </div>
                        <div className="text-center border-l border-white/5">
                            <p className="text-3xl font-bold text-blue-400">{stats.fortified}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Fortified</p>
                        </div>
                        <div className="text-center border-l border-white/5">
                            <p className="text-3xl font-bold text-amber-400">{stats.captured}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Captured</p>
                        </div>
                    </div>
                </Panel>

                {/* Clan Identity & Streak */}
                <Panel title="Commander Overview">
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border-2 ${campaign.bannerStyle === 'solid' ? 'bg-white/5 border-white/20' : 'bg-[#f0b35f]/10 border-[#f0b35f]/30'}`}>
                            {campaign.bannerStyle === 'solid' ? <Shield className="text-white/20" size={32} /> : <Sparkles className="text-[#f0b35f]" size={32} />}
                        </div>
                        <h3 className="font-bold">{campaign.factionName || 'Unnamed Clan'}</h3>
                        <p className="text-xs text-muted-foreground mb-4 font-mono">Tier {capitalState?.visualTier || 1}: {tier.name}</p>

                        <div className="pt-4 border-t border-white/5 w-full">
                            <div className="flex items-center justify-center gap-2 text-[#f0b35f]">
                                <span className="text-2xl font-black">{streakState.currentStreak}</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Day Streak</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 px-4">{streakMessage}</p>
                        </div>
                    </div>
                </Panel>

                {/* Hotspots */}
                <Panel title="High Pressure Zones" className="md:col-span-2">
                    {hotspots.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground text-sm italic">
                            No provinces currently under extreme pressure.
                        </div>
                    ) : (
                        <div className="space-y-4 py-2">
                            {hotspots.map((p: Province) => (
                                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                    <span className="font-bold">{p.title}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className={`h-3 w-1.5 rounded-full ${i <= (p.frontPressureLevel || 0) ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-white/5'}`} />
                                            ))}
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/map/${p.regionId}`)}>Deploy</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>

                {/* Fast CTAs */}
                <Panel title="Commander's Intent">
                    <div className="space-y-3 py-2">
                        <Button onClick={() => navigate('/daily-orders')} className="w-full justify-start gap-3" variant="default">
                            <ZapIcon size={18} />
                            Make a Move
                        </Button>
                        <Button onClick={() => navigate('/map')} className="w-full justify-start gap-3" variant="outline">
                            <Map size={18} />
                            Open Map
                        </Button>
                        <Button onClick={() => navigate('/chronicle')} className="w-full justify-start gap-3" variant="outline">
                            <BookOpen size={18} />
                            Open Chronicle
                        </Button>
                    </div>
                </Panel>
            </div>
        </section>
    );
}

