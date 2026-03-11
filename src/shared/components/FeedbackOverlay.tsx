import { useEffect, useState } from 'react';
import { useFeedbackStore } from '../store/useFeedbackStore';
import { Trophy, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { WarningToast } from '../ui/WarningToast';

export function FeedbackOverlay() {
    const { currentSignal, heroSignal, warningSignal, clearSignals, clearWarning } = useFeedbackStore();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (currentSignal || heroSignal) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(clearSignals, 500); // Wait for fade out
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [currentSignal, heroSignal, clearSignals]);

    if (!visible && !currentSignal && !heroSignal) return null;

    return (
        <div className={`fixed inset-0 z-[100] pointer-events-none flex flex-col items-center justify-center p-8 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0 scale-95'}`}>
            {/* Hero Moment Overlay */}
            {heroSignal && (
                <div className="absolute inset-0 bg-[#f0b35f]/10 backdrop-blur-[2px] animate-pulse" />
            )}

            {/* Main Signal Card */}
            {(currentSignal || heroSignal) && (
                <div className={`relative bg-[#0b1218] border-2 ${heroSignal ? 'border-[#f0b35f] shadow-[0_0_50px_rgba(240,179,95,0.3)]' : 'border-white/10 shadow-2xl'} p-8 rounded-[2.5rem] max-w-md text-center transform transition-transform duration-500 ${visible ? 'translate-y-0' : 'translate-y-10'}`}>
                    <div className="flex justify-center mb-6">
                        <FeedbackIcon type={(heroSignal || currentSignal)!.type} isHero={!!heroSignal} />
                    </div>

                    <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-3 ${heroSignal ? 'text-[#f0b35f]' : 'text-muted-foreground'}`}>
                        {heroSignal ? 'Heroic Achievement' : 'Strategic Progress'}
                    </h2>

                    <p className="text-2xl font-bold text-[#f8f4ea] leading-tight mb-2">
                        {heroSignal ? heroSignal.message : currentSignal?.message}
                    </p>

                    {heroSignal && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            {[1, 2, 3].map(i => (
                                <Sparkles key={i} className="text-[#f0b35f] animate-bounce" style={{ animationDelay: `${i * 150}ms` }} size={16} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {warningSignal && (
                <WarningToast message={warningSignal} onClose={clearWarning} />
            )}
        </div>
    );
}

function FeedbackIcon({ type, isHero }: { type: string, isHero: boolean }) {
    const baseClass = "w-16 h-16 rounded-2xl flex items-center justify-center";

    if (isHero) {
        return (
            <div className={`${baseClass} bg-[#f0b35f] text-[#0b1218] rotate-3 shadow-[0_0_30px_rgba(240,179,95,0.4)]`}>
                <Trophy size={32} />
            </div>
        );
    }

    switch (type) {
        case 'milestone':
            return (
                <div className={`${baseClass} bg-amber-400/20 text-amber-400`}>
                    <ShieldCheck size={32} />
                </div>
            );
        case 'strong':
            return (
                <div className={`${baseClass} bg-blue-400/20 text-blue-400`}>
                    <Zap size={32} />
                </div>
            );
        default:
            return (
                <div className={`${baseClass} bg-white/5 text-white/50`}>
                    <Sparkles size={32} />
                </div>
            );
    }
}
