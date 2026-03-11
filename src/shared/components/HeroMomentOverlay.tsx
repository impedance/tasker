import { useEffect, useState } from 'react';
import { useFeedbackStore } from '../store/useFeedbackStore';
import { Trophy, Sparkles } from 'lucide-react';
import { cn } from '../utils';

export function HeroMomentOverlay() {
    const { heroSignal, clearSignals } = useFeedbackStore();
    const [visible, setVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (heroSignal) {
            // Check session cap (Max 1 strong hero moment per session)
            const sessionTriggered = sessionStorage.getItem('hero_moment_triggered');
            if (sessionTriggered) {
                // We still want to clear the signal even if we don't show it
                // because of the session cap rule.
                clearSignals();
                return;
            }

            setShouldRender(true);
            // Small delay to trigger animation
            const timer = setTimeout(() => setVisible(true), 10);

            // Auto-dismiss after 4 seconds
            const dismissTimer = setTimeout(() => {
                setVisible(false);
                sessionStorage.setItem('hero_moment_triggered', 'true');
                setTimeout(() => {
                    setShouldRender(false);
                    clearSignals();
                }, 500);
            }, 4000);

            return () => {
                clearTimeout(timer);
                clearTimeout(dismissTimer);
            };
        }
    }, [heroSignal, clearSignals]);

    if (!shouldRender || !heroSignal) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[200] flex items-center justify-center pointer-events-none transition-all duration-700",
            visible ? "bg-black/60 backdrop-blur-sm opacity-100" : "bg-transparent backdrop-blur-none opacity-0"
        )}>
            <div className={cn(
                "relative flex flex-col items-center text-center p-12 transition-all duration-700 transform",
                visible ? "scale-100 translate-y-0 opacity-100" : "scale-90 translate-y-12 opacity-0"
            )}>
                {/* Visual Flair */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 bg-[#f0b35f]/20 rounded-full blur-[100px] animate-pulse" />
                </div>

                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-[#f0b35f] text-[#0b1218] flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(240,179,95,0.5)] animate-bounce">
                        <Trophy size={48} />
                    </div>

                    <div className="absolute -top-4 -left-4 text-[#f0b35f] animate-spin-slow">
                        <Sparkles size={32} />
                    </div>
                    <div className="absolute -bottom-4 -right-4 text-[#f0b35f] animate-spin-slow-reverse">
                        <Sparkles size={24} />
                    </div>
                </div>

                <h2 className="text-5xl font-black tracking-tighter text-[#f0b35f] mb-4 drop-shadow-2xl">
                    HEROIC DEED
                </h2>

                <p className="text-2xl font-bold text-white max-w-md leading-tight">
                    {heroSignal.message}
                </p>

                <p className="mt-6 text-sm uppercase tracking-[0.3em] text-[#f0b35f]/60 font-black">
                    History honors your progress
                </p>
            </div>
        </div>
    );
}

// Add these to your index.css if not present
// @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
// @keyframes spin-slow-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
// .animate-spin-slow { animation: spin-slow 8s linear infinite; }
// .animate-spin-slow-reverse { animation: spin-slow-reverse 6s linear infinite; }
