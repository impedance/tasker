import { useNavigate } from "react-router-dom"
import { Drawer, DrawerContent } from "../shared/ui/drawer"
import { Province } from "../entities/types"
import { Badge } from "../shared/ui/badge"
import { Search, Info, ShieldAlert } from "lucide-react"
import { useApplyAction } from "../shared/hooks/useApplyAction"

interface ProvinceDrawerProps {
    province: Province | null
    onClose: () => void
}

export function ProvinceDrawer({ province, onClose }: ProvinceDrawerProps) {
    const navigate = useNavigate()
    const { execute } = useApplyAction()

    if (!province) return null

    const handleScout = async () => {
        if (!province) return

        try {
            if (province.state === 'fog') {
                onClose()
                navigate(`/province/${province.id}/clarify`)
            } else if (province.state === 'ready' || province.state === 'in_progress') {
                await execute(province, {
                    type: 'log_move',
                    payload: {
                        durationMinutes: 15,
                        moveType: 'scout'
                    }
                })
                onClose()
            }
        } catch (error) {
            console.error('Failed to scout:', error)
        }
    }

    const handleDetails = async () => {
        if (!province) return
        onClose()
        navigate(`/province/${province.id}`)
    }


    return (
        <Drawer open={!!province} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="p-6 bg-[#0b1218] border-t border-[rgba(248,244,234,0.12)] shadow-[0_-20px_60px_rgba(0,0,0,0.4)]">
                <div className="mx-auto w-12 h-1.5 rounded-full bg-muted mb-6" />

                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="eyebrow mb-1">Province Status</p>
                            <h2 className="text-2xl font-bold text-[#f8f4ea]">{province.title}</h2>
                        </div>
                        <Badge variant="outline" className={`province--${province.state} px-3 py-1`}>
                            {province.state.replace('_', ' ')}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Clarity</p>
                            <p className="font-medium text-[#f0b35f]">{province.clarityLevel || 0}/5</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Effort</p>
                            <p className="font-medium text-[#f0b35f]">{province.effortLevel || 0}/5</p>
                        </div>
                    </div>

                    {province.description && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Description</p>
                            <p className="text-[#f8f4ea]/80 text-sm leading-relaxed">{province.description}</p>
                        </div>
                    )}

                    {province.state === 'siege' && (
                        <div className="p-4 rounded-xl bg-[#ff4444]/10 border border-[#ff4444]/20">
                            <div className="flex items-center gap-3 mb-2 text-[#ff4444]">
                                <ShieldAlert size={20} />
                                <p className="font-bold">Province Under Siege</p>
                            </div>
                            <p className="text-sm text-white/70 mb-4">
                                Strategic momentum has stalled. Resolve the siege to resume progress.
                            </p>
                            <button
                                onClick={() => {
                                    onClose()
                                    navigate(`/province/${province.id}/siege`)
                                }}
                                className="w-full py-3 bg-[#ff4444] text-white font-bold rounded-xl hover:bg-[#ff5555] transition-colors"
                            >
                                Break Siege
                            </button>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={handleScout}
                            className="flex-1 min-h-[48px] bg-[#f0b35f] text-[#0b1218] font-bold rounded-xl hover:bg-[#f0c38f] transition-colors flex items-center justify-center gap-2"
                        >
                            {province.state === 'fog' ? (
                                <>
                                    <Search size={18} />
                                    Scout
                                </>
                            ) : (
                                <>
                                    <Search size={18} />
                                    Log progress
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleDetails}
                            className="flex-1 min-h-[48px] bg-white/10 text-white font-bold rounded-xl border border-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <Info size={18} />
                            Details
                        </button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
