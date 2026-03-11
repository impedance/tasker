import { useEffect, useState } from 'react';
import {
    provinceRepository,
    ifThenPlanRepository
} from '../../storage/repositories';
import { Province, IfThenPlan } from '../../entities/types';
import {
    Sword,
    Calendar,
    Plus,
    Trash2,
    AlertCircle
} from 'lucide-react';

export default function WarCouncilPage() {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [plans, setPlans] = useState<IfThenPlan[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [triggerText, setTriggerText] = useState('');
    const [actionText, setActionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function loadData() {
        try {
            const [p, l] = await Promise.all([
                provinceRepository.list(),
                ifThenPlanRepository.list()
            ]);
            setProvinces(p.filter(province => ['ready', 'in_progress', 'siege'].includes(province.state)));
            setPlans(l.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error('Failed to load war council data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProvinceId || !triggerText || !actionText) return;

        setIsSubmitting(true);
        try {
            await ifThenPlanRepository.create({
                provinceId: selectedProvinceId,
                triggerText,
                actionText,
            });
            setTriggerText('');
            setActionText('');
            setSelectedProvinceId('');
            loadData();
        } catch (error) {
            console.error('Failed to create plan:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const deletePlan = async (id: string) => {
        if (!confirm('Are you sure you want to abandon this plan?')) return;
        try {
            await ifThenPlanRepository.delete(id);
            loadData();
        } catch (error) {
            console.error('Failed to delete plan:', error);
        }
    };

    if (loading) return <div className="page-shell flex items-center justify-center min-h-[400px]">Assembling the council...</div>;

    return (
        <section className="page-shell max-w-4xl mx-auto">
            <header className="mb-12">
                <p className="eyebrow">Strategic Preparation</p>
                <h1 className="text-4xl font-bold mb-4">War Council</h1>
                <p className="text-muted-foreground">Define your intent for the coming hours. If-Then plans reduce decision fatigue when the fog of war thickens.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-8">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Plus size={20} className="text-[#f0b35f]" />
                            Formulate Plan
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Target Province</label>
                                <select
                                    value={selectedProvinceId}
                                    onChange={(e) => setSelectedProvinceId(e.target.value)}
                                    className="w-full bg-[#0b1218] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#f0b35f] outline-none"
                                    required
                                >
                                    <option value="">Select a province...</option>
                                    {provinces.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Trigger (If...)</label>
                                <input
                                    type="text"
                                    value={triggerText}
                                    onChange={(e) => setTriggerText(e.target.value)}
                                    placeholder="e.g. coffee is ready"
                                    className="w-full bg-[#0b1218] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#f0b35f] outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Action (Then I will...)</label>
                                <input
                                    type="text"
                                    value={actionText}
                                    onChange={(e) => setActionText(e.target.value)}
                                    placeholder="e.g. raid the Fortress"
                                    className="w-full bg-[#0b1218] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#f0b35f] outline-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !selectedProvinceId}
                                className="w-full bg-[#f0b35f] text-[#0b1218] font-bold py-3 rounded-xl hover:bg-[#f0c38f] disabled:opacity-50 transition-colors mt-4"
                            >
                                {isSubmitting ? 'Recording...' : 'Record Plan'}
                            </button>
                        </form>
                    </section>
                </div>

                <div className="lg:col-span-2">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Sword size={20} className="text-[#f0b35f]" />
                        Active Plans
                    </h2>

                    {plans.length === 0 ? (
                        <div className="p-12 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                            <AlertCircle className="mx-auto text-muted-foreground mb-4" size={32} />
                            <p className="text-muted-foreground">No active plans. Preparation is half the victory.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {plans.map((plan) => (
                                <div key={plan.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-start group">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-[#f0b35f] uppercase tracking-widest mb-1">
                                            Target: {provinces.find(p => p.id === plan.provinceId)?.title || 'Unknown Province'}
                                        </p>
                                        <p className="text-lg leading-snug">
                                            <span className="text-muted-foreground">If</span> {plan.triggerText},
                                            <span className="text-muted-foreground ml-1">then I will</span> <span className="font-bold text-[#f8f4ea]">{plan.actionText}</span>.
                                        </p>
                                        <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground font-mono">
                                            <Calendar size={10} />
                                            {new Date(plan.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deletePlan(plan.id)}
                                        className="p-2 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
