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
import EventViewerPage from '../pages/dev/EventViewerPage'
import CapitalPage from '../pages/capital/CapitalPage'
import ChroniclePage from '../pages/chronicle/ChroniclePage'
import { Sidebar } from '../shared/components/Sidebar'
import { FeedbackOverlay } from '../shared/components/FeedbackOverlay'
import { OnboardingDialog } from './OnboardingDialog'

function App() {
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
            <Route path="/capital" element={<CapitalPage />} />
            <Route path="/chronicle" element={<ChroniclePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/dev/events" element={<EventViewerPage />} />
          </Routes>
        </main>
      </div>
      <FeedbackOverlay />
      <OnboardingDialog />
    </BrowserRouter>
  )
}

export default App
