import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { campaignRepository } from '../storage/repositories'
import { Campaign } from '../entities/types'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    campaignRepository.list().then(setCampaigns)
  }, [])

  return (
    <section className="page-shell">
      <p className="eyebrow">Strategic Overview</p>
      <h1>Campaigns</h1>

      <div className="grid gap-4 mt-8">
        {campaigns.length === 0 ? (
          <p className="text-muted-foreground">No campaigns found. Start by creating one (coming soon in Epic 5).</p>
        ) : (
          campaigns.map(campaign => (
            <Link
              key={campaign.id}
              to={`/campaign/${campaign.id}`}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#f0b35f]/50 transition-all group shadow-sm hover:shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-[#f0b35f] font-bold uppercase tracking-widest mb-1">
                    {campaign.status}
                  </p>
                  <h3 className="text-xl font-bold">{campaign.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Started: {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}

