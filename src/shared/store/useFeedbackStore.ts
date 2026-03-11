import { create } from 'zustand';
import { FeedbackSignal } from '../../game/rules/feedback';

interface FeedbackState {
    currentSignal: FeedbackSignal | null;
    heroSignal: FeedbackSignal | null;
    triggerSignal: (signal: FeedbackSignal) => void;
    triggerHeroMoment: (signal: FeedbackSignal) => void;
    clearSignals: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
    currentSignal: null,
    heroSignal: null,
    triggerSignal: (signal) => set({ currentSignal: signal }),
    triggerHeroMoment: (signal) => set({ heroSignal: signal }),
    clearSignals: () => set({ currentSignal: null, heroSignal: null }),
}));
