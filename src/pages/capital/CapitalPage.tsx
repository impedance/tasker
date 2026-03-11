import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/button';
import { Panel } from '../../shared/ui/panel';
import { Sparkles, Map, BookOpen, Trophy } from 'lucide-react';

export default function CapitalPage() {
    const navigate = useNavigate();

    return (
        <section className="page-shell">
            <p className="eyebrow flex items-center gap-2">
                <Trophy size={14} />
                Campaign Foothold
            </p>
            <h1>The Capital</h1>
            <p className="lede mb-8">
                Your strategic hub. Review the front situation and plan your next campaign move.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Situation Summary */}
                <Panel title="Front Situation" className="md:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold">--</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Fog</p>
                        </div>
                        <div className="text-center border-l border-white/5">
                            <p className="text-3xl font-bold">--</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Sieges</p>
                        </div>
                        <div className="text-center border-l border-white/5">
                            <p className="text-3xl font-bold">--</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Fortified</p>
                        </div>
                        <div className="text-center border-l border-white/5">
                            <p className="text-3xl font-bold">--</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Captured</p>
                        </div>
                    </div>
                </Panel>

                {/* Clan Identity */}
                <Panel title="Clan Identity">
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                            <Sparkles className="text-white/20" size={32} />
                        </div>
                        <h3 className="font-bold">Unnamed Clan</h3>
                        <p className="text-xs text-muted-foreground">Tier 1: Outpost</p>
                    </div>
                </Panel>

                {/* Hotspots */}
                <Panel title="High Pressure Zones" className="md:col-span-2">
                    <div className="py-8 text-center text-muted-foreground text-sm italic">
                        No provinces currently under extreme pressure.
                    </div>
                </Panel>

                {/* Fast CTAs */}
                <Panel title="Commander's Intent">
                    <div className="space-y-3 py-2">
                        <Button onClick={() => navigate('/daily-orders')} className="w-full justify-start gap-3" variant="default">
                            <Zap size={18} />
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

function Zap(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 14.71 12 2.29l1 10.42h7l-8 12.42-1-10.42H4z" />
        </svg>
    );
}
