import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { provinceRepository, siegeEventRepository } from '../../storage/repositories';
import { Province, SiegeEvent, TacticType } from '../../entities/types';
import { useApplyAction } from '../../shared/hooks/useApplyAction';
import {
    Search,
    Package,
    Layers,
    Flashlight,
    ArrowLeft,
    ShieldAlert,
    Undo2
} from 'lucide-react';

export default function SiegePage() {
    const { provinceId } = useParams<{ provinceId: string }>();
    const navigate = useNavigate();
    const [province, setProvince] = useState<Province | null>(null);
    const [siegeEvent, setSiegeEvent] = useState<SiegeEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const { execute } = useApplyAction();

    useEffect(() => {
        async function load() {
            if (!provinceId) return;
            const [p, events] = await Promise.all([
                provinceRepository.getById(provinceId),
                siegeEventRepository.list()
            ]);
            setProvince(p);
            // Find active siege for this province
            const activeSiege = events.find(e => e.provinceId === provinceId && !e.resolvedAt);
            setSiegeEvent(activeSiege || null);
            setLoading(false);
        }
        load();
    }, [provinceId]);

    const handleTactic = async (tacticType: TacticType) => {
        if (!province || !siegeEvent) return;

        try {
            // For MVP, we use default tactic data. Real implementation would show modal for data entry.
            // E.g. for 'raid', it defaults to 5 minutes.
            const tacticData: any = { tacticType };
            if (tacticType === 'raid') tacticData.durationMinutes = 5;
            if (tacticType === 'engineer') tacticData.subProvinceIds = ['temp-id']; // Placeholder

            await execute(province, {
                type: 'apply_tactic',
                payload: {
                    tacticType,
                    siegeEventId: siegeEvent.id,
                    data: tacticData
                }
            });
            navigate(-1);
        } catch (error) {
            console.error('Failed to resolve siege:', error);
            alert('Failed to resolve siege. See console.');
        }
    };

    if (loading) return <div className="page-shell flex items-center justify-center min-h-[400px]">Negotiating terms...</div>;
    if (!province || !siegeEvent) return <div className="page-shell">No active siege found for this province.</div>;

    return (
        <section className="page-shell max-w-4xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8"
            >
                <ArrowLeft size={16} />
                Back to Map
            </button>

            <div className="flex items-center gap-4 mb-2">
                <ShieldAlert className="text-[#ff4444]" size={32} />
                <h1 className="text-4xl font-bold tracking-tight">Siege of {province.title}</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-12">
                Resistance has hardened. Choose a tactic to break the stalemate.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TacticCard
                    icon={<Search size={24} />}
                    title="Scout"
                    description="Clarify what needs to be done. Rewrite the desired outcome or first step."
                    onClick={() => handleTactic('scout')}
                />
                <TacticCard
                    icon={<Package size={24} />}
                    title="Supply"
                    description="Prepare the environment. Add links, files, or more detailed context."
                    onClick={() => handleTactic('supply')}
                />
                <TacticCard
                    icon={<Layers size={24} />}
                    title="Engineer"
                    description="Split the task into 3-5 micro-steps. Attack from multiple angles."
                    onClick={() => handleTactic('engineer')}
                />
                <TacticCard
                    icon={<Flashlight size={24} />}
                    title="5-minute Raid"
                    description="Commit to a minimum entry step. Perform a quick 5-minute assault."
                    onClick={() => handleTactic('raid')}
                />
                <TacticCard
                    icon={<Undo2 size={24} />}
                    title="Strategic Retreat"
                    description="Change expectations. Reschedule the province or archive it for now."
                    className="border-white/10 opacity-70"
                    onClick={() => handleTactic('retreat')}
                />
            </div>
        </section>
    );
}

function TacticCard({
    icon,
    title,
    description,
    onClick,
    className = ""
}: {
    icon: React.ReactNode,
    title: string,
    description: string,
    onClick: () => void,
    className?: string
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col text-left p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#f0b35f]/50 hover:bg-white/10 transition-all group ${className}`}
        >
            <div className="w-12 h-12 rounded-xl bg-[#f0b35f]/10 text-[#f0b35f] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        </button>
    );
}
