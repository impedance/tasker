export const seasonHints = {
    early: {
        title: 'Foundation Week',
        text: 'The map is vast and mostly unknown. Focus on clarification (scout) and gathering context (supply) to build a stable front line.',
        color: 'text-blue-400'
    },
    mid: {
        title: 'Drive Week',
        text: 'Momentum is building. It is time to decompose large provinces (engineer) and break through sieges with decisive raids.',
        color: 'text-amber-400'
    },
    late: {
        title: 'Joy Week',
        text: 'The climax approaches. Focus all resources on capturing in-progress provinces. Savor the victories and prepare for history.',
        color: 'text-red-400'
    },
    ended: {
        title: 'Season Ended',
        text: 'The campaign has concluded. Review your achievements and prepare for the next chapter.',
        color: 'text-purple-400'
    }
} as const;

export type SeasonPhase = keyof typeof seasonHints;
