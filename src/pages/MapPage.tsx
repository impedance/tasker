import * as React from "react"
import { useParams } from "react-router-dom"
import { provinceRepository, regionRepository } from "../storage/repositories"
import { Province, Region } from "../entities/types"
import { ProvinceDrawer } from "../map/ProvinceDrawer"
import { UnplacedProvincesList } from "../map/UnplacedProvincesList"

export default function MapPage() {
    const { regionId } = useParams<{ regionId: string }>()
    const [region, setRegion] = React.useState<Region | null>(null)
    const [provinces, setProvinces] = React.useState<Province[]>([])
    const [selectedProvince, setSelectedProvince] = React.useState<Province | null>(null)
    const [mapSvg, setMapSvg] = React.useState<string>("")
    const [loading, setLoading] = React.useState(true)

    // Load data
    React.useEffect(() => {
        const loadData = async () => {
            if (!regionId) return

            try {
                const [r, p] = await Promise.all([
                    regionRepository.getById(regionId),
                    provinceRepository.listByRegion(regionId)
                ])

                setRegion(r)
                setProvinces(p)

                // Load SVG template
                const templateId = r?.mapTemplateId || "region_v1"
                const response = await fetch(`/assets/maps/${templateId}.svg`)
                if (response.ok) {
                    const svgText = await response.text()
                    setMapSvg(svgText)
                }
            } catch (error) {
                console.error("Failed to load map data:", error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [regionId])

    // Bind provinces to SVG slots after SVG is loaded
    const mapRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (!mapRef.current || !mapSvg || provinces.length === 0) return

        // Find all data-slot-id elements and apply state classes
        const slots = mapRef.current.querySelectorAll('[data-slot-id]')
        slots.forEach(slot => {
            const slotId = slot.getAttribute('data-slot-id')
            const province = provinces.find(p => p.mapSlotId === slotId)

            // Reset classes
            slot.classList.remove(
                'province-path',
                'province--fog',
                'province--ready',
                'province--siege',
                'province--in-progress',
                'province--fortified',
                'province--captured',
                'province--retreated',
                'province--selected'
            )

            if (province) {
                slot.classList.add('province-path', `province--${province.state}`)
                if (selectedProvince?.id === province.id) {
                    slot.classList.add('province--selected')
                }

                // Add click listener
                const handleClick = (e: Event) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedProvince(province)
                }
                slot.addEventListener('click', handleClick)
                // Cleanup would be complex here, so we rely on re-rendering innerHTML
            } else {
                // Empty slot styling
                slot.classList.add('province-path')
                slot.setAttribute('fill', 'rgba(255,255,255,0.05)')
            }
        })
    }, [mapSvg, provinces, selectedProvince])

    if (loading) {
        return <div className="page-shell flex items-center justify-center min-h-[400px]">Loading Strategic Map...</div>
    }

    if (!region) {
        return <div className="page-shell">Region not found.</div>
    }

    const unplacedProvinces = provinces.filter(p => !p.mapSlotId)

    return (
        <section className="page-shell">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="eyebrow">{region.title}</p>
                    <h1>Strategic Map</h1>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold text-[#f0b35f]">{Math.round(region.progressPercent || 0)}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 relative bg-[#0f1420] rounded-2xl border border-white/10 overflow-hidden shadow-2xl aspect-[4/3] flex items-center justify-center">
                    <div
                        ref={mapRef}
                        className="w-full h-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: mapSvg }}
                        onClick={(e) => {
                            // If clicking background (not a province), deselect
                            if (e.target === e.currentTarget) setSelectedProvince(null)
                        }}
                    />
                </div>

                <div className="space-y-6">
                    <UnplacedProvincesList
                        provinces={unplacedProvinces}
                        onSelect={setSelectedProvince}
                    />

                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Map Legend</p>
                        <div className="space-y-2">
                            <LegendItem color="var(--province-fill-fog)" label="Fog of War" />
                            <LegendItem color="var(--province-fill-ready)" label="Ready" />
                            <LegendItem color="var(--province-fill-in-progress)" label="In Progress" />
                            <LegendItem color="var(--province-fill-siege)" label="Siege" />
                            <LegendItem color="var(--province-fill-captured)" label="Captured" />
                        </div>
                    </div>
                </div>
            </div>

            <ProvinceDrawer
                province={selectedProvince}
                onClose={() => setSelectedProvince(null)}
            />
        </section>
    )
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: color }} />
            <span className="text-white/70">{label}</span>
        </div>
    )
}
