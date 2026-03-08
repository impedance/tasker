import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function Home() {
  return (
    <div>
      <h1>Tasker MVP</h1>
      <p>A browser-based strategy game for personal project execution.</p>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/campaigns">Campaigns</Link></li>
          <li><Link to="/settings">Settings</Link></li>
        </ul>
      </nav>
    </div>
  )
}

function Campaigns() {
  return (
    <div>
      <h1>Campaigns</h1>
      <p>Your campaign map will appear here.</p>
    </div>
  )
}

function Settings() {
  return (
    <div>
      <h1>Settings</h1>
      <p>Import/Export and configuration.</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
