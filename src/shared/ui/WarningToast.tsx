import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '../utils';

interface WarningToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export function WarningToast({ message, onClose, duration = 5000 }: WarningToastProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 500);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={cn(
            "fixed bottom-8 right-8 z-[110] flex items-center gap-3 bg-[#1a1c1e] border border-amber-500/50 text-amber-200 p-4 rounded-xl shadow-2xl transition-all duration-500 transform",
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
            <AlertCircle className="text-amber-500" size={20} />
            <p className="text-sm font-medium">{message}</p>
            <button
                onClick={() => {
                    setVisible(false);
                    setTimeout(onClose, 500);
                }}
                className="ml-2 p-1 hover:bg-white/5 rounded-lg transition-colors"
            >
                <X size={14} className="text-white/40" />
            </button>
        </div>
    );
}

// Global hook/store could be added here if multiple toasts are needed, 
// but for MVP a single toast managed by a store is simpler.
