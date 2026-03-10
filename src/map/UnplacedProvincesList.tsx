import { Province } from "../entities/types"
import { Panel } from "../shared/ui/panel"

interface UnplacedProvincesListProps {
    provinces: Province[]
    onSelect: (province: Province) => void
}

export function UnplacedProvincesList({ provinces, onSelect }: UnplacedProvincesListProps) {
    if (provinces.length === 0) return null

    return (
        <Panel className="bg-black/20 border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
                <p className="eyebrow text-[10px]">Logistics</p>
                <h3 className="text-sm font-bold">Unplaced Provinces</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                {provinces.map(province => (
                    <button
                        key={province.id}
                        onClick={() => onSelect(province)}
                        className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors group flex justify-between items-center"
                    >
                        <div>
                            <p className="text-sm font-medium text-[#f8f4ea] group-hover:text-[#f0b35f] transition-colors">
                                {province.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                {province.state}
                            </p>
                        </div>
                        <span className="text-white/20 group-hover:text-white/40">→</span>
                    </button>
                ))}
            </div>
        </Panel>
    )
}
