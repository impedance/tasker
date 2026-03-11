import { useState } from "react"
import { Province } from "../entities/types"
import { Panel } from "../shared/ui/panel"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "../shared/ui/dialog"

interface UnplacedProvincesListProps {
    provinces: Province[]
    freeSlots: string[]
    onSelect: (province: Province) => void
    onAssignSlot: (provinceId: string, slotId: string) => Promise<void>
}

export function UnplacedProvincesList({ provinces, freeSlots, onSelect, onAssignSlot }: UnplacedProvincesListProps) {
    if (provinces.length === 0) return null

    return (
        <Panel className="bg-black/20 border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
                <p className="eyebrow text-[10px]">Logistics</p>
                <h3 className="text-sm font-bold">Unplaced Provinces</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                {provinces.map(province => (
                    <div key={province.id} className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors group flex justify-between items-center">
                        <button
                            onClick={() => onSelect(province)}
                            className="flex-1 text-left"
                        >
                            <p className="text-sm font-medium text-[#f8f4ea] group-hover:text-[#f0b35f] transition-colors">
                                {province.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                {province.state}
                            </p>
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-white/20 group-hover:text-white/40 opacity-0 group-hover:opacity-100 transition-opacity pr-2">→</span>
                            {freeSlots.length > 0 && (
                                <AssignSlotDialog
                                    province={province}
                                    freeSlots={freeSlots}
                                    onAssign={onAssignSlot}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Panel>
    )
}

function AssignSlotDialog({
    province,
    freeSlots,
    onAssign
}: {
    province: Province,
    freeSlots: string[],
    onAssign: (pId: string, sId: string) => Promise<void>
}) {
    const [open, setOpen] = useState(false)
    const [slotId, setSlotId] = useState(freeSlots[0] || '')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Ensure slotId is syncing if freeSlots change
    if (!freeSlots.includes(slotId) && freeSlots.length > 0) {
        setSlotId(freeSlots[0])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!slotId) return
        setIsSubmitting(true)
        try {
            await onAssign(province.id, slotId)
            setOpen(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-white/70 hover:text-white transition-colors">
                    Assign
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-[#0b1218] border border-white/10 text-white p-6">
                <DialogTitle className="text-xl font-bold mb-2">Assign to Slot</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mb-4">
                    Choose a tactical map slot for <span className="text-[#f0b35f]">{province.title}</span>.
                </DialogDescription>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <select
                            value={slotId}
                            onChange={(e) => setSlotId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#f0b35f]/50 transition-colors"
                        >
                            {freeSlots.map(s => (
                                <option key={s} value={s} className="bg-[#0b1218] text-white">
                                    Slot {s}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-sm font-medium py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !slotId}
                            className="bg-[#f0b35f] text-[#0b1218] font-bold py-2 px-4 rounded-lg hover:bg-[#f0c38f] disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? 'Assigning...' : 'Assign Slot'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
