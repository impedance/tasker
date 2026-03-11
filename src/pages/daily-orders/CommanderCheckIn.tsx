import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playerCheckInRepository } from '../../storage/repositories';
import { EmotionType, EnergyLevel } from '../../entities/types';
import {
    Smile,
    Meh,
    Frown,
    Clock,
    CheckCircle2
} from 'lucide-react';

const EMOTIONS: { value: EmotionType; label: string; icon: string }[] = [
    { value: 'anxiety', label: 'Anxious', icon: '😟' },
    { value: 'boredom', label: 'Bored', icon: '😑' },
    { value: 'fatigue', label: 'Tired', icon: '😴' },
    { value: 'irritation', label: 'Irritated', icon: '💢' },
    { value: 'fear_of_outcome', label: 'Afraid', icon: '😨' },
    { value: 'ambiguity', label: 'Unclear', icon: '🌫️' },
];

const ENERGIES: { value: EnergyLevel; label: string; icon: React.ReactNode }[] = [
    { value: 'low', label: 'Low', icon: <Frown size={20} /> },
    { value: 'medium', label: 'Medium', icon: <Meh size={20} /> },
    { value: 'high', label: 'High', icon: <Smile size={20} /> },
];

const TIMES = [
    { value: 5, label: '5 min' },
    { value: 15, label: '15 min' },
    { value: 25, label: '25+ min' },
];

export default function CommanderCheckIn() {
    const navigate = useNavigate();
    const [emotion, setEmotion] = useState<EmotionType>('ambiguity');
    const [energy, setEnergy] = useState<EnergyLevel>('medium');
    const [time, setTime] = useState<number>(15);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await playerCheckInRepository.create({
                date: new Date().toISOString().split('T')[0],
                emotionType: emotion,
                energyLevel: energy,
                availableMinutes: time,
            });
            navigate('/daily-orders');
        } catch (error) {
            console.error('Check-in failed:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <section className="page-shell max-w-xl mx-auto">
            <header className="text-center mb-12">
                <p className="eyebrow">Daily Ritual</p>
                <h1 className="text-4xl font-bold mb-2">Commander’s Check-in</h1>
                <p className="text-muted-foreground italic">Prepare your mind for the campaign ahead.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10">
                <section>
                    <label className="block text-sm font-bold uppercase tracking-widest text-[#f0b35f] mb-4">
                        How do you feel about your work right now?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {EMOTIONS.map((emp) => (
                            <button
                                key={emp.value}
                                type="button"
                                onClick={() => setEmotion(emp.value)}
                                className={`p-4 rounded-xl border transition-all text-center ${emotion === emp.value
                                    ? 'bg-[#f0b35f]/10 border-[#f0b35f] text-white'
                                    : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                    }`}
                            >
                                <div className="text-2xl mb-1">{emp.icon}</div>
                                <div className="text-xs font-bold">{emp.label}</div>
                            </button>
                        ))}
                    </div>
                </section>

                <section>
                    <label className="block text-sm font-bold uppercase tracking-widest text-[#f0b35f] mb-4">
                        What is your current energy level?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {ENERGIES.map((eng) => (
                            <button
                                key={eng.value}
                                type="button"
                                onClick={() => setEnergy(eng.value)}
                                className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${energy === eng.value
                                    ? 'bg-[#f0b35f]/10 border-[#f0b35f] text-white'
                                    : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                    }`}
                            >
                                {eng.icon}
                                <span className="text-sm font-bold">{eng.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section>
                    <label className="block text-sm font-bold uppercase tracking-widest text-[#f0b35f] mb-4">
                        Available focus time?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {TIMES.map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setTime(t.value)}
                                className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${time === t.value
                                    ? 'bg-[#f0b35f]/10 border-[#f0b35f] text-white'
                                    : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                    }`}
                            >
                                <Clock size={16} />
                                <span className="text-sm font-bold">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-[#f0b35f] text-[#0b1218] font-black py-5 rounded-2xl hover:bg-[#f0c38f] disabled:opacity-50 transition-all shadow-xl shadow-[#f0b35f]/10"
                    >
                        {isSubmitting ? (
                            'Preparing Orders...'
                        ) : (
                            <>
                                <CheckCircle2 size={24} />
                                Receive Daily Orders
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/daily-orders')}
                        className="w-full mt-4 text-xs text-muted-foreground hover:text-white transition-colors"
                    >
                        Skip and go to orders (defaults will be used)
                    </button>
                </div>
            </form>
        </section>
    );
}
