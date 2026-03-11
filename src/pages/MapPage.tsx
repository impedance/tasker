import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { provinceRepository, regionRepository, campaignRepository } from "../storage/repositories"
import { Province, Region } from "../entities/types"
import { ProvinceDrawer } from "../map/ProvinceDrawer"
import { UnplacedProvincesList } from "../map/UnplacedProvincesList"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "../shared/ui/dialog"
import { Plus, ListPlus, Wand2 } from "lucide-react"

export default function MapPage() {
    const { regionId } = useParams<{ regionId: string }>()
    const navigate = useNavigate()
    const [region, setRegion] = React.useState<Region | null>(null)
    const [provinces, setProvinces] = React.useState<Province[]>([])
    const [selectedProvince, setSelectedProvince] = React.useState<Province | null>(null)
    const [mapSvg, setMapSvg] = React.useState<string>("")
    const [loading, setLoading] = React.useState(true)

    // Form state
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
    const [isBulkDialogOpen, setIsBulkDialogOpen] = React.useState(false)
    const [title, setTitle] = React.useState('')
    const [bulkText, setBulkText] = React.useState('')
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    // Load data
    const loadData = React.useCallback(async () => {
        let activeRegionId = regionId

        if (!activeRegionId) {
            try {
                const campaigns = await campaignRepository.list()
                const activeCampaign = campaigns.find(c => c.status === 'active') || campaigns[0]

                if (activeCampaign) {
                    const regions = await regionRepository.listByCampaign(activeCampaign.id)
                    if (regions.length > 0) {
                        activeRegionId = regions[0].id
                        navigate(`/map/${activeRegionId}`, { replace: true })
                    }
                }
            } catch (err) {
                console.error("Failed to find default region:", err)
            }
        }

        if (!activeRegionId) {
            setLoading(false)
            return
        }

        try {
            const [r, p] = await Promise.all([
                regionRepository.getById(activeRegionId),
                provinceRepository.listByRegion(activeRegionId)
            ])

            if (r) {
                setRegion(r)
                setProvinces(p)

                // Load SVG template if not already loaded
                const templateId = r.mapTemplateId || "region_v1"
                const response = await fetch(`/assets/maps/${templateId}.svg`)
                if (response.ok) {
                    const svgText = await response.text()
                    setMapSvg(svgText)
                }
            }
        } catch (error) {
            console.error("Failed to load map data:", error)
        } finally {
            setLoading(false)
        }
    }, [regionId, navigate])

    React.useEffect(() => {
        loadData()
    }, [loadData])

    const mapRef = React.useRef<HTMLDivElement>(null)
    const [capitalPos, setCapitalPos] = React.useState<{ x: number, y: number } | null>(null)
    const [selectedPos, setSelectedPos] = React.useState<{ x: number, y: number } | null>(null)

    // Bind provinces to SVG slots
    React.useEffect(() => {
        if (!mapRef.current || !mapSvg || provinces.length === 0) return

        const slots = mapRef.current.querySelectorAll('[data-slot-id]')
        slots.forEach(slot => {
            const slotId = slot.getAttribute('data-slot-id')
            const province = provinces.find(p => p.mapSlotId === slotId)

            slot.classList.remove(
                'province-path',
                'province--fog',
                'province--ready',
                'province--siege',
                'province--in-progress',
                'province--fortified',
                'province--captured',
                'province--retreated',
                'province--selected',
                'province--hotspot',
                'province--pressure-1',
                'province--pressure-2',
                'province--pressure-3'
            )

            if (province) {
                slot.classList.add('province-path', `province--${province.state}`)

                // Pressure level highlights (06-T9)
                const pressure = province.frontPressureLevel || 0
                if (pressure > 0) {
                    slot.classList.add(`province--pressure-${Math.min(pressure, 3)}`)
                    slot.classList.add('province--hotspot')
                }

                if (selectedProvince?.id === province.id) {
                    slot.classList.add('province--selected')

                    // Track position for route drawing (T7)
                    if (slot instanceof SVGGraphicsElement) {
                        const bbox = slot.getBBox()
                        setSelectedPos({ x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 })
                    }
                }

                // Capital detection (T9)
                if (slotId === 'p01') {
                    if (slot instanceof SVGGraphicsElement) {
                        const bbox = slot.getBBox()
                        setCapitalPos({ x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 })
                    }
                }

                const handleClick = (e: Event) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedProvince(province)
                }
                slot.addEventListener('click', handleClick)
            } else {
                slot.classList.add('province-path')
                slot.setAttribute('fill', 'rgba(255,255,255,0.05)')
            }
        })
    }, [mapSvg, provinces, selectedProvince])

    const handleAddProvince = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!regionId || !title.trim()) return

        setIsSubmitting(true)
        try {
            const mapSlotId = await provinceRepository.findFirstFreeMapSlotId(regionId)
            await provinceRepository.create({
                regionId,
                title,
                state: 'fog', // Default to fog for minimal creation
                progressStage: 'scouted',
                decompositionCount: 0,
                mapSlotId: mapSlotId || undefined
            })
            setTitle('')
            setIsAddDialogOpen(false)
            loadData()
        } catch (error) {
            console.error('Failed to create province:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBulkAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!regionId || !bulkText.trim()) return

        const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean)
        if (lines.length === 0) return

        setIsSubmitting(true)
        try {
            for (const line of lines) {
                const mapSlotId = await provinceRepository.findFirstFreeMapSlotId(regionId)
                await provinceRepository.create({
                    regionId,
                    title: line,
                    state: 'fog',
                    progressStage: 'scouted',
                    decompositionCount: 0,
                    mapSlotId: mapSlotId || undefined
                })
            }
            setBulkText('')
            setIsBulkDialogOpen(false)
            loadData()
        } catch (error) {
            console.error('Failed to bulk create provinces:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return <div className="page-shell flex items-center justify-center min-h-[400px]">Loading Strategic Map...</div>
    if (!region) return <div className="page-shell">Region not found.</div>

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
                <div className="lg:col-span-3 relative bg-[#0f1420] rounded-2xl border border-white/10 overflow-hidden shadow-2xl aspect-[4/3]">
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.5}
                        maxScale={4}
                        centerOnInit={true}
                    >
                        <TransformComponent wrapperClass="map-surface-container" contentClass="w-full h-full">
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div
                                    ref={mapRef}
                                    className="w-full h-full"
                                    dangerouslySetInnerHTML={{ __html: mapSvg }}
                                    onClick={(e) => {
                                        if (e.target === e.currentTarget) setSelectedProvince(null)
                                    }}
                                />

                                {/* Overlay SVG for Routes and Markers */}
                                <svg
                                    className="absolute inset-0 pointer-events-none w-full h-full"
                                    viewBox="0 0 800 600" // Should match original SVG viewBox
                                >
                                    {/* Route Line (T7) */}
                                    {capitalPos && selectedPos && selectedProvince?.id !== provinces.find(p => p.mapSlotId === 'p01')?.id && (
                                        <line
                                            x1={capitalPos.x} y1={capitalPos.y}
                                            x2={selectedPos.x} y2={selectedPos.y}
                                            className="map-route-line"
                                        />
                                    )}

                                    {/* Capital Marker (T9) */}
                                    {capitalPos && (
                                        <g transform={`translate(${capitalPos.x}, ${capitalPos.y - 15})`} className="map-marker--capital">
                                            <path d="M0 0 L-5 -10 L5 -10 Z" fill="#f0b35f" />
                                            <circle r="3" fill="#0b1218" />
                                        </g>
                                    )}
                                </svg>
                            </div>
                        </TransformComponent>
                    </TransformWrapper>
                </div>

                <div className="space-y-6">
                    <div className="flex gap-2">
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#f0b35f] text-[#0b1218] font-bold rounded-xl hover:bg-[#f0c38f] transition-colors shadow-lg">
                                    <Plus size={18} />
                                    Add
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md bg-[#0b1218] border border-white/10 text-white p-8">
                                <DialogTitle className="text-2xl font-bold mb-4">Acknowledge Province</DialogTitle>
                                <DialogDescription className="sr-only">Form to add a new province to the map.</DialogDescription>
                                <form onSubmit={handleAddProvince} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">Province Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#f0b35f]/50 transition-colors"
                                            placeholder="e.g. Gather Intel"
                                            autoFocus
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground italic">
                                        Provinces added here are automatically assigned to the first free tactical slot.
                                    </p>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !title.trim()}
                                            className="w-full bg-[#f0b35f] text-[#0b1218] font-bold py-3 rounded-xl hover:bg-[#f0c38f] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Wand2 size={18} />
                                            {isSubmitting ? 'Summoning...' : 'Deploy Province'}
                                        </button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                            <DialogTrigger asChild>
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors shadow-lg">
                                    <ListPlus size={18} />
                                    Bulk
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md bg-[#0b1218] border border-white/10 text-white p-8">
                                <DialogTitle className="text-2xl font-bold mb-4">Mass Mobilization</DialogTitle>
                                <DialogDescription className="sr-only">Form to bulk add multiple provinces at once.</DialogDescription>
                                <form onSubmit={handleBulkAdd} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">Province Names (one per line)</label>
                                        <textarea
                                            value={bulkText}
                                            onChange={(e) => setBulkText(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#f0b35f]/50 transition-colors min-h-[200px] font-mono text-sm"
                                            placeholder="Province Alpha&#10;Province Beta&#10;Province Gamma"
                                            required
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !bulkText.trim()}
                                            className="w-full bg-[#f0b35f] text-[#0b1218] font-bold py-3 rounded-xl hover:bg-[#f0c38f] disabled:opacity-50 transition-colors"
                                        >
                                            {isSubmitting ? 'Mobilizing...' : 'Create All'}
                                        </button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <UnplacedProvincesList
                        provinces={unplacedProvinces}
                        onSelect={setSelectedProvince}
                    />

                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Map Legend</p>
                        <div className="space-y-2">
                            <LegendItem color="var(--province-fill-fog)" label="Fog of War" />
                            <LegendItem color="var(--province-fill-ready)" label="Ready" />
                            <LegendItem color="var(--province-fill-siege)" label="Siege" />
                            <LegendItem color="var(--province-fill-captured)" label="Captured" />
                            <div className="flex items-center gap-2 text-[10px] mt-2 pt-2 border-t border-white/5">
                                <div className="w-2 h-2 rounded-full shadow-[0_0_5px_#f0b35f] bg-[#f0b35f]/20" />
                                <span className="text-muted-foreground">Strategic Hotspot</span>
                            </div>
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

