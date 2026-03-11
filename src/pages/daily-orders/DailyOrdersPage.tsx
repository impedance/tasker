import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    provinceRepository,
    playerCheckInRepository,
    dailyMoveRepository,
    campaignRepository,
    seasonRepository
} from '../../storage/repositories';
import { getSeasonPhase } from '../../game/rules/season';
import { seasonHints, SeasonPhase } from '../../shared/copy/season-hints';
import { Season } from '../../entities/types';
import { getDailyOrders, DailyOrder } from '../../game/rules/recommendations';
import { useApplyAction } from '../../shared/hooks/useApplyAction';
import {
    Search,
    Package,
    Layers,
    Flashlight,
    Sword,
    ArrowRight,
    RefreshCw,
    Sparkles
} from 'lucide-react';

export default function DailyOrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<DailyOrder[]>([]);
    const [season, setSeason] = useState<Season | null>(null);
    const [loading, setLoading] = useState(true);
    const { execute } = useApplyAction();

    async function loadOrders() {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const [provinces, checkIns, history, campaigns, seasons] = await Promise.all([
                provinceRepository.list(),
                playerCheckInRepository.listByDate(today),
                dailyMoveRepository.list(),
                campaignRepository.list(),
                seasonRepository.list()
            ]);

            const activeCampaign = campaigns.find(c => c.status === 'active') || campaigns[0];
            const activeSeason = seasons.find(s => s.id === activeCampaign?.seasonId) || seasons[seasons.length - 1];
            setSeason(activeSeason || null);

            const checkIn = checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;

            const generated = getDailyOrders({
                provinces,
                checkIn,
                history,
                now: new Date()
            });

            setOrders(generated);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    const handleExecute = async (order: DailyOrder) => {
        const province = await provinceRepository.getById(order.provinceId);
        if (!province) return;

        try {
            // Map recommended moveType to domain action
            // For simplicity, we default some payloads
            let actionType: any = order.moveType;
            let payload: any = {};

            if (order.moveType === 'raid' || order.moveType === 'assault') {
                actionType = order.moveType === 'raid' ? 'start_move' : 'log_move';
                payload = { durationMinutes: order.durationMinutes, moveType: order.moveType };
            }

            await execute(province, {
                type: actionType,
                payload
            });

            // Show feedback (EPIC-11) - for now just reload
            loadOrders();
        } catch (error) {
            console.error('Action failed:', error);
        }
    };

    const skipOrder = (provinceId: string) => {
        setOrders(prev => prev.filter(o => o.provinceId !== provinceId));
    };

    if (loading) return <div className="page-shell flex items-center justify-center min-h-[400px]">Consulting with generals...</div>;

    return (
        <section className="page-shell max-w-5xl mx-auto">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <p className="eyebrow">Strategic Recommendations</p>
                    <h1 className="text-4xl font-bold">Daily Orders</h1>
                </div>
                <button
                    onClick={loadOrders}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-[#f0b35f] transition-colors"
                >
                    <RefreshCw size={14} />
                    Refresh Recommendations
                </button>
            </header>

            {/* Weekly Focus Hint Banner */}
            {season && (
                <div className={`mb-12 p-6 rounded-3xl bg-white/5 border-l-4 ${seasonHints[getSeasonPhase(season) as SeasonPhase].color.replace('text-', 'border-')} flex items-center justify-between group animate-in fade-in slide-in-from-top-4 duration-700`}>
                    <div className="flex items-center gap-4">
                        <Sparkles className={seasonHints[getSeasonPhase(season) as SeasonPhase].color} size={28} />
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${seasonHints[getSeasonPhase(season) as SeasonPhase].color}`}>{seasonHints[getSeasonPhase(season) as SeasonPhase].title}</p>
                            <p className="text-xl font-bold tracking-tight">"{seasonHints[getSeasonPhase(season) as SeasonPhase].text}"</p>
                        </div>
                    </div>
                </div>
            )}

            {orders.length === 0 ? (
                <div className="text-center p-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-muted-foreground mb-4">No specific orders for now. All fronts are stable or in fog.</p>
                    <button
                        onClick={() => navigate('/map')}
                        className="text-[#f0b35f] font-bold underline"
                    >
                        Explore the Map
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <OrderCard
                            key={`${order.provinceId}-${order.orderType}`}
                            order={order}
                            onDoIt={() => handleExecute(order)}
                            onSkip={() => skipOrder(order.provinceId)}
                        />
                    ))}
                </div>
            )}

            <footer className="mt-12 p-6 rounded-2xl bg-[#f0b35f]/10 border border-[#f0b35f]/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Sparkles className="text-[#f0b35f]" size={24} />
                    <p className="text-sm">
                        <span className="font-bold text-[#f0b35f]">Generals Advice:</span> Pick one move that matches your current energy and commit to it.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/daily-history')}
                    className="text-xs font-bold uppercase tracking-widest hover:text-[#f0b35f] transition-colors"
                >
                    View History
                </button>
            </footer>
        </section>
    );
}

function OrderCard({
    order,
    onDoIt,
    onSkip
}: {
    order: DailyOrder,
    onDoIt: () => void,
    onSkip: () => void
}) {
    const icons = {
        scout: <Search size={20} />,
        supply: <Package size={20} />,
        engineer: <Layers size={20} />,
        raid: <Flashlight size={20} />,
        assault: <Sword size={20} />,
        retreat: <ArrowRight size={20} />
    };

    const typeLabels = {
        light: 'Light Move',
        medium: 'Medium Move',
        main: 'Main Move'
    };

    const typeColors = {
        light: 'text-blue-400 bg-blue-400/10',
        medium: 'text-amber-400 bg-amber-400/10',
        main: 'text-red-400 bg-red-400/10'
    };

    return (
        <div className="flex flex-col h-full bg-[#0b1218] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-white/20 transition-all">
            <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${typeColors[order.orderType]}`}>
                        {typeLabels[order.orderType]}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">~{order.durationMinutes}m</span>
                </div>

                <h3 className="text-xl font-bold mb-1 leading-tight">{order.provinceTitle}</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1">
                    {icons[order.moveType as keyof typeof icons]}
                    {order.moveType}
                </p>

                <p className="text-sm text-white/70 leading-relaxed italic">
                    "{order.why}"
                </p>
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
                <button
                    onClick={onDoIt}
                    className="flex-1 bg-[#f0b35f] text-[#0b1218] font-bold py-3 rounded-xl hover:bg-[#f0c38f] transition-colors flex items-center justify-center gap-2"
                >
                    Do it
                    <ArrowRight size={16} />
                </button>
                <button
                    onClick={onSkip}
                    className="px-4 py-3 text-xs text-muted-foreground hover:text-white transition-colors"
                >
                    Skip
                </button>
            </div>
        </div>
    );
}
