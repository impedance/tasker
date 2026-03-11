export const feedbackCopy = {
    clarify: "Fog cleared. The path is visible.",
    start: "First step taken. The campaign advances.",
    progress: "Ground gained. Hold the line.",
    capture: "Province secured. Your realm grows.",
    siege_resolve: "Siege broken. Resistance fades.",
    retreat: "Strategic withdrawal. Fight another day.",
};

export const siegeCopy = {
    title: "The province is under siege",
    reason: (days: number) => `No meaningful action for ${days} days`,
    encouragement: "Choose a tactic. Break the siege.",
};
