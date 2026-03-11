import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CampaignsPage from '../pages/CampaignsPage'
import CampaignMapPage from '../pages/CampaignMapPage'
import HomePage from '../pages/HomePage'
import MapPage from '../pages/MapPage'
import SettingsPage from '../pages/SettingsPage'
import SiegePage from '../pages/siege/SiegePage'
import CommanderCheckIn from '../pages/daily-orders/CommanderCheckIn'
import DailyOrdersPage from '../pages/daily-orders/DailyOrdersPage'
import DailyOrdersHistory from '../pages/daily-orders/DailyOrdersHistory'
import WarCouncilPage from '../pages/war-council/WarCouncilPage'
import SeasonDashboard from '../pages/season/SeasonDashboard'
import SeasonSummaryPage from '../pages/season/SeasonSummaryPage'
import SeasonDebriefPage from '../pages/season/SeasonDebriefPage'
import EventViewerPage from '../pages/dev/EventViewerPage'
import CapitalPage from '../pages/capital/CapitalPage'
import ChroniclePage from '../pages/chronicle/ChroniclePage'
import { Sidebar } from '../shared/components/Sidebar'
import { FeedbackOverlay } from '../shared/components/FeedbackOverlay'
import { HeroMomentOverlay } from '../shared/components/HeroMomentOverlay'
import { OnboardingDialog } from './OnboardingDialog'
import { checkAndCreateSieges } from '../game/services/siege-service'
import { checkAndStartNewSeason } from '../game/services/season-service'

function App() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    async function initialize() {
      try {
        // Auto-trigger siege detection for all provinces
        const siegeCount = await checkAndCreateSieges(new Date())
        if (siegeCount > 0) {
          console.log(`[App] Created ${siegeCount} siege event(s)`)
        }

        // Auto-start new season if current season ended
        const newSeason = await checkAndStartNewSeason(new Date())
        if (newSeason) {
          console.log(`[App] Started new season: ${newSeason.title}`)
        }
      } catch (error) {
        console.error('[App] Initialization error:', error)
      } finally {
        setInitialized(true)
      }
    }

    void initialize()
  }, [])

  if (!initialized) {
    return (
      <div className="flex h-screen bg-[#060a0d] text-[#f8f4ea] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold mb-2">Loading...</p>
          <p className="text-sm text-muted-foreground">Preparing your campaign</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#060a0d] text-[#f8f4ea] overflow-hidden selection:bg-[#f0b35f]/30">
        <Sidebar />
        <main className="flex-1 relative overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaign/:campaignId" element={<CampaignMapPage />} />
            <Route path="/map/:regionId?" element={<MapPage />} />
            <Route path="/province/:provinceId/siege" element={<SiegePage />} />
            <Route path="/check-in" element={<CommanderCheckIn />} />
            <Route path="/daily-orders" element={<DailyOrdersPage />} />
            <Route path="/daily-history" element={<DailyOrdersHistory />} />
            <Route path="/war-council" element={<WarCouncilPage />} />
            <Route path="/season" element={<SeasonDashboard />} />
            <Route path="/season-summary" element={<SeasonSummaryPage />} />
            <Route path="/season-debrief" element={<SeasonDebriefPage />} />
            <Route path="/capital" element={<CapitalPage />} />
            <Route path="/chronicle" element={<ChroniclePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/dev/events" element={<EventViewerPage />} />
          </Routes>
        </main>
      </div>
      <FeedbackOverlay />
      <HeroMomentOverlay />
      <OnboardingDialog />
    </BrowserRouter>
  )
}

export default App
