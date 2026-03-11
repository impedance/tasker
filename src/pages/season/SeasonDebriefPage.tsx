import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { seasonRepository, seasonReviewRepository } from '../../storage/repositories';
import { Season } from '../../entities/types';
import { Button } from '../../shared/ui/button';
import { Panel } from '../../shared/ui/panel';
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, AlertCircle, Plus, X } from 'lucide-react';

export default function SeasonDebriefPage() {
    const navigate = useNavigate();
    const [season, setSeason] = useState<Season | null>(null);
    const [step, setStep] = useState(1);

    // Form state
    const [workedWell, setWorkedWell] = useState<string[]>(['']);
    const [obstacles, setObstacles] = useState<string[]>(['']);
    const [carryForward, setCarryForward] = useState<string[]>(['']);
    const [dropList, setDropList] = useState<string[]>(['']);

    useEffect(() => {
        async function load() {
            const seasons = await seasonRepository.list();
            if (seasons.length > 0) {
                setSeason(seasons[seasons.length - 1]);
            }
        }
        load();
    }, []);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => [...prev, '']);
    };

    const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };

    const updateItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
        setter(prev => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const handleSubmit = async () => {
        if (!season) return;

        await seasonReviewRepository.create({
            seasonId: season.id,
            workedWell: workedWell.filter(i => i.trim()),
            mainObstacles: obstacles.filter(i => i.trim()),
            carryForward: carryForward.filter(i => i.trim()),
            dropList: dropList.filter(i => i.trim()),
        });

        // In a real app, we might start a new season here
        navigate('/capital');
    };

    if (!season) return <div className="page-shell">Loading season data...</div>;

    return (
        <section className="page-shell max-w-2xl mx-auto pb-20">
            <header className="mb-12 text-center">
                <p className="eyebrow">End of Campaign Ritual</p>
                <h1 className="text-4xl font-bold">{season.title}: Debrief</h1>
                <div className="flex justify-center gap-2 mt-6">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#f0b35f]' : 'bg-white/10'}`}
                        />
                    ))}
                </div>
            </header>

            <div className="min-h-[400px]">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Panel title="What worked well?" className="mb-8">
                            <p className="text-sm text-muted-foreground mb-6">
                                Reflect on your victories. What habits or tactics helped you gain ground this season?
                            </p>
                            <ItemList
                                items={workedWell}
                                onUpdate={(idx, val) => updateItem(setWorkedWell, idx, val)}
                                onAdd={() => addItem(setWorkedWell)}
                                onRemove={(idx) => removeItem(setWorkedWell, idx)}
                                placeholder="e.g., Morning 5-minute raids..."
                                icon={<CheckCircle2 className="text-green-500" size={18} />}
                            />
                        </Panel>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <Panel title="What obstacles appeared?" className="mb-8">
                            <p className="text-sm text-muted-foreground mb-6">
                                Be honest about the resistance. What stalled your advance or triggered sieges?
                            </p>
                            <ItemList
                                items={obstacles}
                                onUpdate={(idx, val) => updateItem(setObstacles, idx, val)}
                                onAdd={() => addItem(setObstacles)}
                                onRemove={(idx) => removeItem(setObstacles, idx)}
                                placeholder="e.g., Unclear environment setup..."
                                icon={<AlertCircle className="text-red-500" size={18} />}
                            />
                        </Panel>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 gap-6 mb-8">
                            <Panel title="Carry Forward">
                                <p className="text-xs text-muted-foreground mb-4">Strengthen these in the next season.</p>
                                <ItemList
                                    items={carryForward}
                                    onUpdate={(idx, val) => updateItem(setCarryForward, idx, val)}
                                    onAdd={() => addItem(setCarryForward)}
                                    onRemove={(idx) => removeItem(setCarryForward, idx)}
                                    placeholder="Keep doing..."
                                    icon={<Sparkles className="text-[#f0b35f]" size={18} />}
                                />
                            </Panel>
                            <Panel title="Drop">
                                <p className="text-xs text-muted-foreground mb-4">Leave these behind to lighten your load.</p>
                                <ItemList
                                    items={dropList}
                                    onUpdate={(idx, val) => updateItem(setDropList, idx, val)}
                                    onAdd={() => addItem(setDropList)}
                                    onRemove={(idx) => removeItem(setDropList, idx)}
                                    placeholder="Stop doing..."
                                    icon={<X className="text-muted-foreground" size={18} />}
                                />
                            </Panel>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center mt-12">
                {step > 1 ? (
                    <Button variant="outline" onClick={handleBack} className="gap-2">
                        <ArrowLeft size={18} />
                        Back
                    </Button>
                ) : <div />}

                {step < 3 ? (
                    <Button onClick={handleNext} className="gap-2">
                        Next
                        <ArrowRight size={18} />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} className="gap-2 bg-[#f0b35f] hover:bg-[#f0c38f] text-[#060a0d]">
                        Complete Ritual
                        <CheckCircle2 size={18} />
                    </Button>
                )}
            </div>
        </section>
    );
}

function ItemList({ items, onUpdate, onAdd, onRemove, placeholder, icon }: {
    items: string[];
    onUpdate: (idx: number, val: string) => void;
    onAdd: () => void;
    onRemove: (idx: number) => void;
    placeholder: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="space-y-4">
            {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 group">
                    <div className="mt-2.5 shrink-0">{icon}</div>
                    <input
                        type="text"
                        value={item}
                        onChange={(e) => onUpdate(idx, e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-[#f0b35f] transition-colors"
                    />
                    <button
                        onClick={() => onRemove(idx)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-400 transition-all"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
            <button
                onClick={onAdd}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#f0b35f] hover:text-[#f0c38f] transition-all mt-4 ml-8"
            >
                <Plus size={14} />
                Add Item
            </button>
        </div>
    );
}
