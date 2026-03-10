import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { campaignRepository, regionRepository } from '../storage/repositories'
import { Campaign, Region, RegionMapRole } from '../entities/types'
import { Dialog, DialogContent, DialogTrigger } from '../shared/ui/dialog'
import { Plus } from 'lucide-react'

export default function CampaignMapPage() {
    const { campaignId } = useParams<{ campaignId: string }>()
    const navigate = useNavigate()
    const [campaign, setCampaign] = useState<Campaign | null>(null)
    const [regions, setRegions] = useState<Region[]>([])
    const [svgContent, setSvgContent] = useState<string>('')
    const [loading, setLoading] = useState(true)

    // Form state
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [mapRole, setMapRole] = useState<RegionMapRole>('core')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const loadData = () => {
        if (campaignId) {
            campaignRepository.getById(campaignId).then(setCampaign)
            regionRepository.listByCampaign(campaignId).then(setRegions)
        }
    }

    useEffect(() => {
        if (campaignId) {
            loadData()
            fetch('/assets/maps/campaign_v1.svg')
                .then(res => res.text())
                .then(setSvgContent)
                .finally(() => setLoading(false))
        }
    }, [campaignId])

    useEffect(() => {
        if (!svgContent || regions.length === 0) return

        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
        const svgElement = svgDoc.documentElement

        regions.forEach(region => {
            const slotId = region.mapRole || 'r01' // fallback for MVP
            const slot = svgElement.querySelector(`[data-region-slot-id="${slotId}"]`)
            if (slot) {
                slot.classList.add('region-slot--active')
                slot.setAttribute('title', region.title)
                slot.addEventListener('click', () => {
                    navigate(`/map/${region.id}`)
                })

                // Add label if slot is found
                const label = svgElement.querySelector(`text[x="${slot.getAttribute('cx')}"][y="${slot.getAttribute('cy')}"]`)
                if (label) {
                    label.textContent = region.title.slice(0, 3).toUpperCase()
                }
            }
        })

        const container = document.getElementById('campaign-map-container')
        if (container) {
            container.innerHTML = ''
            container.appendChild(svgElement)
        }
    }, [svgContent, regions, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!campaignId || !title.trim()) return

        setIsSubmitting(true)
        try {
            await regionRepository.create({
                campaignId,
                title,
                description,
                order: regions.length + 1,
                status: 'active',
                mapTemplateId: 'region_v1', // Default for now
                mapRole,
                progressPercent: 0
            })
            setTitle('')
            setDescription('')
            setMapRole('core')
            setIsDialogOpen(false)
            loadData()
        } catch (error) {
            console.error('Failed to create region:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Campaign Map...</div>
    if (!campaign) return <div className="p-8 text-center">Campaign not found</div>

    return (
        <section className="page-shell">
            <header className="mb-6">
                <p className="eyebrow">Campaign Map</p>
                <h1 className="text-3xl font-bold">{campaign.title}</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <div
                        id="campaign-map-container"
                        className="bg-[#0b1218] border border-white/5 rounded-2xl overflow-hidden aspect-[4/3] shadow-inner"
                    />
                </div>

                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold">Regions</h3>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <button className="p-1 hover:bg-white/10 rounded-lg transition-colors text-[#f0b35f]">
                                        <Plus size={16} />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md bg-[#0b1218] border border-white/10 text-white p-8">
                                    <h2 className="text-2xl font-bold mb-4">Add Strategic Region</h2>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">Region Title</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#f0b35f]/50 transition-colors"
                                                placeholder="e.g. The Iron Pass"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">Map Role</label>
                                            <select
                                                value={mapRole}
                                                onChange={(e) => setMapRole(e.target.value as RegionMapRole)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#f0b35f]/50 transition-colors"
                                            >
                                                <option value="core">Core</option>
                                                <option value="frontier">Frontier</option>
                                                <option value="supply">Supply</option>
                                                <option value="neutral">Neutral</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">Description (optional)</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#f0b35f]/50 transition-colors min-h-[100px]"
                                                placeholder="What is the strategic value of this region?"
                                            />
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || !title.trim()}
                                                className="w-full bg-[#f0b35f] text-[#0b1218] font-bold py-3 rounded-xl hover:bg-[#f0c38f] disabled:opacity-50 transition-colors"
                                            >
                                                {isSubmitting ? 'Adding...' : 'Add Region'}
                                            </button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="space-y-2">
                            {regions.map(region => (
                                <button
                                    key={region.id}
                                    onClick={() => navigate(`/map/${region.id}`)}
                                    className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors flex justify-between items-center group"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{region.title}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase">{region.status}</p>
                                    </div>
                                    <span className="text-white/20 group-hover:text-white/40">→</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
