import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { campaignRepository } from '../storage/repositories'
import { Campaign } from '../entities/types'
import { Dialog, DialogContent, DialogTrigger } from '../shared/ui/dialog'
import { Plus } from 'lucide-react'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadCampaigns = () => {
    campaignRepository.list().then(setCampaigns)
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await campaignRepository.create({
        title,
        description,
        status: 'active',
        seasonId: 'season-tutorial', // Default for now
        colorTheme: 'blue',
        archetype: 'foundation',
        chronicleEnabled: true
      })
      setTitle('')
      setDescription('')
      setIsDialogOpen(false)
      loadCampaigns()
    } catch (error) {
      console.error('Failed to create campaign:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-shell">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="eyebrow">Strategic Overview</p>
          <h1>Campaigns</h1>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#f0b35f] text-[#0b1218] font-bold rounded-xl hover:bg-[#f0c38f] transition-colors shadow-lg">
              <Plus size={18} />
              New Campaign
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-[#0b1218] border border-white/10 text-white p-8">
            <h2 className="text-2xl font-bold mb-4">Start New Campaign</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#f0b35f]/50 transition-colors"
                  placeholder="e.g. Operation Haze"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#f0b35f]/50 transition-colors min-h-[100px]"
                  placeholder="What is the objective of this campaign?"
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="w-full bg-[#f0b35f] text-[#0b1218] font-bold py-3 rounded-xl hover:bg-[#f0c38f] disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 mt-8">
        {campaigns.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/5">
            <p className="text-muted-foreground">No campaigns found. Start by creating your first campaign.</p>
          </div>
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

