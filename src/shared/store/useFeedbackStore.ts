import { create } from 'zustand';
import { FeedbackSignal } from '../../game/rules/feedback';

interface FeedbackState {
    currentSignal: FeedbackSignal | null;
    heroSignal: FeedbackSignal | null;
    warningSignal: string | null;
    triggerSignal: (signal: FeedbackSignal) => void;
    triggerHeroMoment: (signal: FeedbackSignal) => void;
    triggerWarning: (message: string) => void;
    clearSignals: () => void;
    clearWarning: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
    currentSignal: null,
    heroSignal: null,
    warningSignal: null,
    triggerSignal: (signal) => set({ currentSignal: signal }),
    triggerHeroMoment: (signal) => set({ heroSignal: signal }),
    triggerWarning: (message) => set({ warningSignal: message }),
    clearSignals: () => set({ currentSignal: null, heroSignal: null }),
    clearWarning: () => set({ warningSignal: null }),
}));
