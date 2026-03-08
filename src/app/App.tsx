import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import CampaignsPage from '../pages/CampaignsPage'
import HomePage from '../pages/HomePage'
import SettingsPage from '../pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <div>
            <p className="brand-kicker">Tasker</p>
            <p className="brand-title">Bootstrap shell</p>
          </div>
          <nav aria-label="Primary">
            <ul className="nav-list">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/campaigns">Campaigns</Link>
              </li>
              <li>
                <Link to="/settings">Settings</Link>
              </li>
            </ul>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
