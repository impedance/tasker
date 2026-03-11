import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/button';
import { Panel } from '../../shared/ui/panel';
import { Sparkles, Map, BookOpen, Trophy, Shield, Zap as ZapIcon } from 'lucide-react';
import {
    campaignRepository,
    provinceRepository,
    capitalStateRepository
} from '../../storage/repositories';
import { Campaign, Province, CapitalState } from '../../entities/types';

export default function CapitalPage() {
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [stats, setStats] = useState({ fog: 0, siege: 0, fortified: 0, captured: 0 });
    const [capitalState, setCapitalState] = useState<CapitalState | null>(null);
    const [hotspots, setHotspots] = useState<Province[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const campaigns = await campaignRepository.list();
            const activeCampaign = campaigns.find(c => c.status === 'active') || campaigns[0];

            if (activeCampaign) {
                setCampaign(activeCampaign);

                const [provinces, cState] = await Promise.all([
                    provinceRepository.listByCampaign(activeCampaign.id),
                    capitalStateRepository.getByCampaignId(activeCampaign.id)
                ]);

                const s = { fog: 0, siege: 0, fortified: 0, captured: 0 };
                provinces.forEach(p => {
                    if (p.state === 'fog') s.fog++;
                    else if (p.state === 'siege') s.siege++;
                    else if (p.state === 'fortified') s.fortified++;
                    else if (p.state === 'captured') s.captured++;
                });
                setStats(s);
                setCapitalState(cState);
                setHotspots(provinces.filter(p => p.frontPressureLevel && p.frontPressureLevel >= 2).slice(0, 3));
            }
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="page-shell">Consulting the war mappers...</div>;
    if (!campaign) return <div className="page-shell">No active campaign found. Start one to see your capital.</div>;

    const tiers = {
        1: { name: 'Outpost', requirement: 'start' },
        2: { name: 'Garrison', requirement: 'region_captured' },
        3: { name: 'Stronghold', requirement: '3_meaningful_days' },
        4: { name: 'Capital', requirement: 'season_completion' },
    };
    const tier = tiers[(capitalState?.visualTier as keyof typeof tiers) || 1];

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

                {/* Clan Identity */}
                <Panel title="Clan Identity">
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border-2 ${campaign.bannerStyle === 'solid' ? 'bg-white/5 border-white/20' : 'bg-[#f0b35f]/10 border-[#f0b35f]/30'}`}>
                            {campaign.bannerStyle === 'solid' ? <Shield className="text-white/20" size={32} /> : <Sparkles className="text-[#f0b35f]" size={32} />}
                        </div>
                        <h3 className="font-bold">{campaign.factionName || 'Unnamed Clan'}</h3>
                        <p className="text-xs text-muted-foreground">Tier {capitalState?.visualTier || 1}: {tier.name}</p>
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
                            {hotspots.map(p => (
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

