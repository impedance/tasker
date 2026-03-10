import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { campaignRepository, regionRepository } from '../storage/repositories'
import { Campaign, Region } from '../entities/types'

export default function CampaignMapPage() {
    const { campaignId } = useParams<{ campaignId: string }>()
    const navigate = useNavigate()
    const [campaign, setCampaign] = useState<Campaign | null>(null)
    const [regions, setRegions] = useState<Region[]>([])
    const [svgContent, setSvgContent] = useState<string>('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (campaignId) {
            campaignRepository.getById(campaignId).then(setCampaign)
            regionRepository.listByCampaign(campaignId).then(setRegions)
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
                        <h3 className="text-sm font-bold mb-3">Regions</h3>
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
