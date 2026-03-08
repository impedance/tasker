import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CapitalPage from '../pages/CapitalPage';
import MapPage from '../pages/MapPage';
import ChroniclePage from '../pages/ChroniclePage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 p-4">
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="text-blue-600 hover:underline font-medium">Capital</Link>
            </li>
            <li>
              <Link to="/map" className="text-blue-600 hover:underline font-medium">Region Map</Link>
            </li>
            <li>
              <Link to="/chronicle" className="text-blue-600 hover:underline font-medium">Chronicle</Link>
            </li>
          </ul>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<CapitalPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/chronicle" element={<ChroniclePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
