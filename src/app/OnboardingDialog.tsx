import * as React from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../shared/ui/dialog"
import { loadTutorialIfFirstRun } from "../storage/tutorial-seed"
import { hasData } from "../storage/storage"
import { BookOpen, Circle, Sparkles } from "lucide-react"

export function OnboardingDialog() {
    const [open, setOpen] = React.useState(false)
    const [isProcessing, setIsProcessing] = React.useState(false)

    React.useEffect(() => {
        const checkFirstRun = async () => {
            const dataExists = await hasData()
            if (!dataExists) {
                setOpen(true)
            }
        }
        checkFirstRun()
    }, [])

    const handleTutorial = async () => {
        setIsProcessing(true)
        try {
            await loadTutorialIfFirstRun({ force: true })
            setOpen(false)
            window.location.reload() // Reload to reflect seeded data
        } catch (error) {
            console.error("Failed to load tutorial:", error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleEmpty = () => {
        setOpen(false)
        // We might want to save a minimal state here to avoid showing this again,
        // but for MVP, skipping is enough if the user then creates something.
        // Actually, let's just close it. If they create a campaign, hasData will be true.
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg bg-[#0b1218] border border-white/10 text-white p-0 overflow-hidden">
                <div className="relative p-8 pb-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f0b35f] to-transparent" />
                    <p className="eyebrow mb-2 flex items-center gap-2">
                        <Sparkles size={14} />
                        Welcome to Tasker
                    </p>
                    <DialogTitle className="text-3xl font-bold mb-4">Choose Your Starting Point</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm mb-8">
                        It looks like this is your first time here. Would you like to start with a tutorial campaign or begin with a clean slate?
                    </DialogDescription>
                </div>

                <div className="p-4 bg-white/5 space-y-3">
                    <button
                        onClick={handleTutorial}
                        disabled={isProcessing}
                        className="w-full p-6 text-left rounded-xl border border-[#f0b35f]/20 bg-[#f0b35f]/5 hover:bg-[#f0b35f]/10 transition-all group flex items-start gap-4"
                    >
                        <div className="p-3 rounded-lg bg-[#f0b35f]/20 text-[#f0b35f]">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg group-hover:text-[#f0b35f] transition-colors">Start with Tutorial</h3>
                            <p className="text-sm text-muted-foreground">Load a demo campaign with guided provinces and sample data.</p>
                        </div>
                    </button>

                    <button
                        onClick={handleEmpty}
                        disabled={isProcessing}
                        className="w-full p-6 text-left rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group flex items-start gap-4"
                    >
                        <div className="p-3 rounded-lg bg-white/10 text-white/40">
                            <Circle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Start Empty</h3>
                            <p className="text-sm text-muted-foreground">Begin with a clean campaign map. Best for experienced users.</p>
                        </div>
                    </button>
                </div>

                <div className="p-4 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        Tasker MVP &bull; Version 0.1.0
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
